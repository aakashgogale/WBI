const B2BWallet = require('../../models/B2BWallet');
const B2BWalletTransaction = require('../../models/B2BWalletTransaction');
const B2BDeductionRule = require('../../models/B2BDeductionRule');
const B2BPaymentMethod = require('../../models/B2BPaymentMethod');
const B2BInvoice = require('../../models/B2BInvoice');
const B2BCompany = require('../../models/B2BCompany');
const { createOrder, verifyPayment } = require('../../services/razorpayService');

// Socket notification helper
const emitWalletEvent = (req, eventName, roomName, data) => {
  try {
    const io = req.app.get('socketio');
    if (io) {
      io.to(roomName).emit(eventName, data);
      console.log(`[Socket.io] Emitted ${eventName} to ${roomName}`);
    }
  } catch (err) {
    console.error('[Socket.io] Emit error:', err.message);
  }
};

/**
 * GET B2B Wallet Summary
 */
const getWalletSummary = async (req, res) => {
  try {
    const companyId = req.user.id;
    let wallet = await B2BWallet.findOne({ companyId });
    if (!wallet) {
      wallet = await B2BWallet.create({ companyId, balance: 0 });
    }

    let rule = await B2BDeductionRule.findOne({ companyId, isActive: true });
    if (!rule) {
      rule = await B2BDeductionRule.create({ companyId, perJobCharge: 12, gstPercent: 18, isActive: true });
    }

    res.status(200).json({
      success: true,
      data: {
        walletId: wallet._id,
        balance: wallet.balance,
        totalTopup: wallet.totalTopup,
        totalSpent: wallet.totalSpent,
        pendingDeductions: wallet.pendingDeductions,
        currency: wallet.currency,
        autoDeductionEnabled: wallet.autoDeductionEnabled,
        deductionRule: {
          perJobCharge: rule.perJobCharge,
          gstPercent: rule.gstPercent,
          totalPerJob: parseFloat((rule.perJobCharge * (1 + rule.gstPercent / 100)).toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error('B2B Wallet Summary Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve wallet summary' });
  }
};

/**
 * GET B2B Wallet Transactions
 */
const getWalletTransactions = async (req, res) => {
  try {
    const companyId = req.user.id;
    const transactions = await B2BWalletTransaction.find({ companyId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('B2B Wallet Transactions Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve ledger logs' });
  }
};

/**
 * POST Create Razorpay Top Up Order
 */
const createTopupOrder = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { amount, paymentMethod } = req.body;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount entered' });
    }

    const company = await B2BCompany.findById(companyId);
    if (!company || company.verificationStatus !== 'approved') {
      return res.status(403).json({ success: false, message: 'Only approved partner profiles can execute top ups' });
    }

    let wallet = await B2BWallet.findOne({ companyId });
    if (!wallet) {
      wallet = await B2BWallet.create({ companyId, balance: 0 });
    }

    // 1. Create order on Razorpay
    const receipt = `txn_b2b_${Date.now()}`;
    const orderResult = await createOrder(amountNum, 'INR', receipt);
    if (!orderResult.success) {
      return res.status(500).json({ success: false, message: orderResult.error });
    }

    // 2. Insert pending transaction record
    const transactionId = `TXN-TOPUP-${Date.now()}`;
    const newTxn = await B2BWalletTransaction.create({
      companyId,
      walletId: wallet._id,
      transactionId,
      razorpayOrderId: orderResult.orderId,
      type: 'topup',
      amount: amountNum,
      totalAmount: amountNum,
      status: 'pending',
      paymentMethod: paymentMethod || 'razorpay',
      remark: 'B2B Corporate Wallet Top Up'
    });

    // 3. Return keys to frontend checkout
    res.status(200).json({
      success: true,
      razorpayOrderId: orderResult.orderId,
      amount: amountNum,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      transactionId: newTxn.transactionId,
      company: {
        name: company.companyName,
        email: company.email,
        phone: company.phone
      }
    });
  } catch (error) {
    console.error('B2B Create Topup Order Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create topup request' });
  }
};

/**
 * POST Verify Razorpay Payment Signature
 */
const verifyTopupPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, transactionId } = req.body;

    // 1. Find transaction and check status (Idempotency Check)
    const txn = await B2BWalletTransaction.findOne({ transactionId });
    if (!txn) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    if (txn.status !== 'pending') {
      // Already processed (success or failed) - prevent duplicate double-crediting
      const wallet = await B2BWallet.findOne({ companyId: txn.companyId });
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and credited previously',
        wallet
      });
    }

    // 2. Validate cryptographic signature
    const isValid = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      txn.status = 'failed';
      txn.remark = 'Cryptographic signature verification failed';
      await txn.save();
      
      // Emit websocket alert
      emitWalletEvent(req, 'b2b:topupFailed', `b2b:${txn.companyId}`, {
        transactionId,
        message: 'Payment verification signature mismatches'
      });

      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // 3. Complete payment status and update balance
    txn.status = 'success';
    txn.razorpayPaymentId = razorpayPaymentId;
    txn.razorpaySignature = razorpaySignature;
    txn.remark = 'Successful Wallet Top Up via Razorpay Gateway';
    await txn.save();

    let wallet = await B2BWallet.findOne({ companyId: txn.companyId });
    wallet.balance += txn.amount;
    wallet.totalTopup += txn.amount;
    wallet.lastUpdatedAt = new Date();
    await wallet.save();

    // 4. Update parent company schema balance block
    await B2BCompany.findByIdAndUpdate(txn.companyId, { walletBalance: wallet.balance });

    // 5. Generate B2BInvoice record
    const invoiceId = `INV-${Date.now()}`;
    const invoiceNumber = `WBI-B2B-INV-${Date.now().toString().substring(5)}`;
    await B2BInvoice.create({
      companyId: txn.companyId,
      invoiceId,
      invoiceNumber,
      invoiceType: 'topup',
      billingPeriod: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      amount: txn.amount,
      totalAmount: txn.amount,
      status: 'Settled',
      fileUrl: `https://wbi-invoices.s3.amazonaws.com/${invoiceNumber}.pdf` // Mock PDF file url
    });

    // 6. Emit real-time websockets updates
    emitWalletEvent(req, 'b2b:walletUpdated', `b2b:${txn.companyId}`, {
      balance: wallet.balance,
      totalTopup: wallet.totalTopup
    });
    emitWalletEvent(req, 'b2b:topupSuccess', `b2b:${txn.companyId}`, {
      transactionId,
      amount: txn.amount
    });
    emitWalletEvent(req, 'admin:b2bWalletUpdated', 'admin', {
      companyId: txn.companyId,
      balance: wallet.balance
    });

    res.status(200).json({
      success: true,
      message: 'Wallet balance successfully credited',
      wallet
    });
  } catch (error) {
    console.error('B2B Verify Topup Error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify transaction payment' });
  }
};

/**
 * GET B2B Wallet Usage breakdown (For Donut charts)
 */
const getWalletUsageSummary = async (req, res) => {
  try {
    const companyId = req.user.id;
    const txns = await B2BWalletTransaction.find({ companyId, status: 'success' });

    let jobDeductions = 0;
    let refunds = 0;
    let adjustments = 0;

    txns.forEach(t => {
      if (t.type === 'job_deduction') jobDeductions += t.amount;
      else if (t.type === 'refund') refunds += t.amount;
      else if (t.type === 'adjustment') adjustments += t.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsage: jobDeductions + refunds + adjustments,
        usage: [
          { name: 'Job Deductions', value: Math.abs(jobDeductions), color: '#10AFA5' },
          { name: 'Refunds', value: Math.abs(refunds), color: '#3B82F6' },
          { name: 'Adjustments', value: Math.abs(adjustments), color: '#F59E0B' }
        ]
      }
    });
  } catch (error) {
    console.error('B2B Usage Summary Error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve usage stats' });
  }
};

/**
 * GET active Deduction Rule
 */
const getDeductionRule = async (req, res) => {
  try {
    const companyId = req.user.id;
    let rule = await B2BDeductionRule.findOne({ companyId, isActive: true });
    if (!rule) {
      rule = await B2BDeductionRule.create({ companyId, perJobCharge: 12, gstPercent: 18, isActive: true });
    }
    res.status(200).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET Saved Payment Methods
 */
const getPaymentMethods = async (req, res) => {
  try {
    const companyId = req.user.id;
    const methods = await B2BPaymentMethod.find({ companyId, isActive: true });
    res.status(200).json({ success: true, data: methods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST Saved Payment Method
 */
const addPaymentMethod = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { type, label, maskedDetails } = req.body;

    const newMethod = await B2BPaymentMethod.create({
      companyId,
      type,
      label,
      maskedDetails,
      isPrimary: false
    });

    res.status(200).json({ success: true, data: newMethod });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE Saved Payment Method
 */
const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    await B2BPaymentMethod.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Payment method profile removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWalletSummary,
  getWalletTransactions,
  createTopupOrder,
  verifyTopupPayment,
  getWalletUsageSummary,
  getDeductionRule,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod
};
