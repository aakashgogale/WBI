const crypto = require('crypto');
const Payment = require('../models/Payment');
const EscrowLedger = require('../models/EscrowLedger');
const PaymentLog = require('../models/PaymentLog');
const socketService = require('../services/socket.service');
// Assume razorpay is configured elsewhere, mock for this file
const Razorpay = require('razorpay');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

exports.createOrder = async (req, res) => {
  try {
    const { amount, serviceCategoryId, subServiceId, paymentType, sourceId, sourceType } = req.body;
    
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay not configured' });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `rcptid_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      userId: req.user._id, // Assume user from auth middleware
      serviceCategoryId,
      subServiceId,
      amount,
      gatewayOrderId: order.id,
      paymentType,
      jobId: sourceType === 'job' ? sourceId : undefined,
      projectId: sourceType === 'project' ? sourceId : undefined,
      milestoneId: sourceType === 'milestone' ? sourceId : undefined,
      contractId: sourceType === 'contract' ? sourceId : undefined,
    });
    
    await payment.save();

    res.json({ success: true, order, paymentId: payment._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

      payment.gatewayPaymentId = razorpay_payment_id;
      payment.gatewaySignature = razorpay_signature;
      payment.paymentStatus = 'captured';
      payment.escrowStatus = 'held';
      payment.paidAt = new Date();
      await payment.save();

      // Create Escrow Ledger
      const sourceType = payment.jobId ? 'job' : payment.projectId ? 'project' : payment.milestoneId ? 'milestone' : payment.contractId ? 'contract' : 'job';
      const sourceId = payment.jobId || payment.projectId || payment.milestoneId || payment.contractId;
      
      const escrow = new EscrowLedger({
        paymentId: payment._id,
        sourceType,
        sourceId,
        grossAmount: payment.amount,
        heldAmount: payment.amount
      });
      await escrow.save();

      // Audit Log
      await PaymentLog.create({
        paymentId: payment._id,
        action: 'captured',
        performedBy: req.user._id,
        performedByRole: 'user',
        oldStatus: 'pending',
        newStatus: 'captured',
        remarks: 'Payment verified successfully and moved to escrow'
      });

      socketService.emitToRoom(`user:${req.user._id}`, 'payment:captured', { paymentId: payment._id });
      socketService.emitToRoom('admin', 'payment:captured', { paymentId: payment._id });

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.razorpayWebhook = async (req, res) => {
  try {
    // Basic Webhook implementation
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      // process webhook event (e.g., payment.captured)
      // Implementation omitted for brevity as verifyPayment handles the main flow,
      // but in production this handles offline captures or delayed failures.
      console.log('Webhook verified', req.body.event);
      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
