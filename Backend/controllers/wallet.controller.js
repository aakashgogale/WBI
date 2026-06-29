const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Withdrawal = require('../models/Withdrawal');
const AuditLog = require('../models/AuditLog');
const { encrypt, decrypt, maskAccountNumber } = require('../utils/encryption');

exports.getWalletSummary = async (req, res) => {
  const startTime = Date.now();
  console.log('[API_START] GET /api/wallet/summary');
  try {
    const ownerId = req.user._id;
    const ownerType = req.user.role;

    let wallet = await Wallet.findOne({ ownerId, ownerType }).lean();
    if (!wallet) {
      wallet = await Wallet.create({ ownerId, ownerType, availableBalance: 0, pendingBalance: 0, totalEarned: 0 });
      wallet = wallet.toObject();
    }
    
    console.log(`[API_SUCCESS] GET /api/wallet/summary - ${Date.now() - startTime}ms`);
    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error(`[API_ERROR] GET /api/wallet/summary - ${Date.now() - startTime}ms :`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWalletTransactions = async (req, res) => {
  const startTime = Date.now();
  console.log('[API_START] GET /api/wallet/transactions');
  try {
    const ownerId = req.user._id;
    const transactions = await WalletTransaction.find({ ownerId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
      
    console.log(`[API_SUCCESS] GET /api/wallet/transactions - ${Date.now() - startTime}ms`);
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error(`[API_ERROR] GET /api/wallet/transactions - ${Date.now() - startTime}ms :`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankAccountId } = req.body;
    const ownerId = req.user._id;
    const ownerType = req.user.role;

    const wallet = await Wallet.findOneAndUpdate(
      { ownerId, ownerType, availableBalance: { $gte: amount } },
      { 
        $inc: { 
          availableBalance: -amount,
          withdrawnBalance: amount 
        } 
      },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({ success: false, message: 'Insufficient balance or concurrent transaction lock' });
    }

    const withdrawal = new Withdrawal({
      ownerId,
      ownerType,
      walletId: wallet._id,
      amount,
      bankAccountId,
      status: 'requested'
    });
    await withdrawal.save();

    const tx = new WalletTransaction({
      walletId: wallet._id,
      ownerId,
      ownerType,
      transactionType: 'withdrawal',
      amount,
      status: 'pending',
      sourceType: 'withdrawal',
      sourceId: withdrawal._id,
      description: `Withdrawal Request #${withdrawal._id.toString().slice(-4)}`
    });
    await tx.save();

    await AuditLog.create({
      actionType: 'WITHDRAWAL_REQUEST',
      actorId: ownerId,
      actorRole: ownerType,
      targetId: withdrawal._id,
      targetType: 'Withdrawal',
      changes: { amount, bankAccountId },
      ipAddress: req.ip
    });

    res.json({ success: true, data: withdrawal, message: 'Withdrawal requested successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWithdrawals = async (req, res) => {
  const startTime = Date.now();
  try {
    const ownerId = req.user._id;
    const withdrawals = await Withdrawal.find({ ownerId }).sort({ createdAt: -1 }).lean();
    console.log(`[API_SUCCESS] GET /api/wallet/withdrawals - ${Date.now() - startTime}ms`);
    res.json({ success: true, data: withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssignedServices = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: { 
        categoryName: 'Digital Solutions', 
        vendorName: 'TechNova Solutions', 
        activeJobsCount: 3, 
        paymentMode: 'Milestone-based' 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPayments = async (req, res) => {
  const startTime = Date.now();
  try {
    const Payment = require('../models/Payment');
    const ownerId = req.user._id;
    const ownerType = req.user.role;
    
    let query = {};
    if (ownerType === 'engineer') query.engineerId = ownerId;
    if (ownerType === 'worker') query.workerId = ownerId;
    
    const payments = await Payment.find(query).sort({ createdAt: -1 }).limit(20).lean();
    console.log(`[API_SUCCESS] GET /api/wallet/payments - ${Date.now() - startTime}ms`);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBankDetails = async (req, res) => {
  const startTime = Date.now();
  try {
    const BankAccount = require('../models/BankAccount');
    const ownerId = req.user._id;
    
    let account = await BankAccount.findOne({ ownerId, isPrimary: true }).lean();
    if (!account) {
      account = await BankAccount.findOne({ ownerId }).lean();
    }
    
    if (account) {
      const plainAccountNumber = decrypt(account.accountNumberEncrypted);
      const maskedNumber = maskAccountNumber(plainAccountNumber);
      
      account.accountNumberEncrypted = maskedNumber;
      console.log(`[API_SUCCESS] GET /api/wallet/bank - ${Date.now() - startTime}ms`);
      return res.json({ success: true, data: account });
    }
    
    console.log(`[API_SUCCESS] GET /api/wallet/bank - ${Date.now() - startTime}ms`);
    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBankDetails = async (req, res) => {
  try {
    const BankAccount = require('../models/BankAccount');
    const ownerId = req.user._id;
    const ownerType = req.user.role;
    const { accountHolderName, accountNumber, ifsc, bankName } = req.body;
    
    const encryptedAccountNumber = encrypt(accountNumber);
    
    let account = await BankAccount.findOne({ ownerId });
    
    if (account) {
      account.accountHolderName = accountHolderName;
      account.accountNumberEncrypted = encryptedAccountNumber;
      account.ifsc = ifsc;
      account.bankName = bankName;
      account.verificationStatus = 'pending';
      await account.save();
    } else {
      account = await BankAccount.create({
        ownerId,
        ownerType,
        accountHolderName,
        accountNumberEncrypted: encryptedAccountNumber,
        ifsc,
        bankName,
        isPrimary: true
      });
    }

    await AuditLog.create({
      actionType: 'BANK_DETAILS_UPDATE',
      actorId: ownerId,
      actorRole: ownerType,
      targetId: account._id,
      targetType: 'BankAccount',
      changes: { bankName, ifsc }, 
      ipAddress: req.ip
    });
    
    const safeAccount = account.toObject();
    safeAccount.accountNumberEncrypted = maskAccountNumber(accountNumber);
    
    res.json({ success: true, data: safeAccount, message: 'Bank details updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
