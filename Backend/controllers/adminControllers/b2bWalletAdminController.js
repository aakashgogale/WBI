const B2BWallet = require('../../models/B2BWallet');
const B2BWalletTransaction = require('../../models/B2BWalletTransaction');
const B2BDeductionRule = require('../../models/B2BDeductionRule');
const B2BCompany = require('../../models/B2BCompany');

/**
 * GET list of B2B wallets (Admin)
 */
const getB2BWalletsList = async (req, res) => {
  try {
    const wallets = await B2BWallet.find().populate('companyId', 'companyName email phone verificationStatus');
    res.status(200).json({ success: true, data: wallets });
  } catch (error) {
    console.error('Admin Get Wallets Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch B2B wallets list' });
  }
};

/**
 * GET B2B wallet by company ID (Admin)
 */
const getB2BWalletByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const wallet = await B2BWallet.findOne({ companyId }).populate('companyId', 'companyName email phone verificationStatus');
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    const transactions = await B2BWalletTransaction.find({ companyId })
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: { wallet, transactions } });
  } catch (error) {
    console.error('Admin Get Wallet By Company Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve wallet details' });
  }
};

/**
 * PATCH update deduction rules (Admin)
 */
const updateDeductionRule = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { perJobCharge, gstPercent, autoDeductionEnabled } = req.body;

    // 1. Update deduction rule
    let rule = await B2BDeductionRule.findOne({ companyId, isActive: true });
    if (!rule) {
      rule = new B2BDeductionRule({ companyId, isActive: true });
    }
    if (perJobCharge !== undefined) rule.perJobCharge = perJobCharge;
    if (gstPercent !== undefined) rule.gstPercent = gstPercent;
    rule.updatedBy = 'Admin';
    await rule.save();

    // 2. Update wallet properties
    let wallet = await B2BWallet.findOne({ companyId });
    if (!wallet) {
      wallet = await B2BWallet.create({ companyId, balance: 0 });
    }
    if (autoDeductionEnabled !== undefined) {
      wallet.autoDeductionEnabled = autoDeductionEnabled;
    }
    wallet.deductionRuleId = rule._id;
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Deduction rules updated successfully',
      rule,
      wallet
    });
  } catch (error) {
    console.error('Admin Update Deduction Rule Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update deduction rules' });
  }
};

/**
 * POST insert adjustments (Admin)
 */
const createAdjustment = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { amount, remark } = req.body;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum === 0) {
      return res.status(400).json({ success: false, message: 'Invalid adjustment amount' });
    }

    let wallet = await B2BWallet.findOne({ companyId });
    if (!wallet) {
      wallet = await B2BWallet.create({ companyId, balance: 0 });
    }

    wallet.balance += amountNum;
    wallet.lastUpdatedAt = new Date();
    await wallet.save();

    // Sync company profile
    await B2BCompany.findByIdAndUpdate(companyId, { walletBalance: wallet.balance });

    // Create adjustment transaction log
    const transactionId = `TXN-ADJ-${Date.now()}`;
    const txn = await B2BWalletTransaction.create({
      companyId,
      walletId: wallet._id,
      transactionId,
      type: 'adjustment',
      amount: amountNum,
      totalAmount: amountNum,
      status: 'success',
      paymentMethod: 'system',
      remark: remark || 'Admin Balance Adjustment'
    });

    res.status(200).json({ success: true, message: 'Balance adjustment completed', wallet, txn });
  } catch (error) {
    console.error('Admin Create Adjustment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create adjustment log' });
  }
};

/**
 * POST Process Refund (Admin)
 */
const processRefund = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { amount, remark } = req.body;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid refund amount' });
    }

    let wallet = await B2BWallet.findOne({ companyId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Company wallet does not exist' });
    }

    wallet.balance += amountNum;
    wallet.lastUpdatedAt = new Date();
    await wallet.save();

    // Sync company profile
    await B2BCompany.findByIdAndUpdate(companyId, { walletBalance: wallet.balance });

    // Create transaction log
    const transactionId = `TXN-RFD-${Date.now()}`;
    const txn = await B2BWalletTransaction.create({
      companyId,
      walletId: wallet._id,
      transactionId,
      type: 'refund',
      amount: amountNum,
      totalAmount: amountNum,
      status: 'success',
      paymentMethod: 'system',
      remark: remark || 'B2B Partner Wallet Refund Credit'
    });

    res.status(200).json({ success: true, message: 'Refund successfully credited to wallet', wallet, txn });
  } catch (error) {
    console.error('Admin Process Refund Error:', error);
    res.status(500).json({ success: false, message: 'Failed to execute refund transaction' });
  }
};

module.exports = {
  getB2BWalletsList,
  getB2BWalletByCompany,
  updateDeductionRule,
  createAdjustment,
  processRefund
};
