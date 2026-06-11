const WorkOrder = require('../../models/WorkOrder');
const Invoice = require('../../models/Invoice');
const Vendor = require('../../models/Vendor');
const ServiceCategory = require('../../models/ServiceCategory');
const Review = require('../../models/Review');
const { verifyPayment } = require('../../services/razorpayService');
const { getIO } = require('../../sockets');

// Verify Razorpay Payment
exports.verifyInvoicePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const invoice = await Invoice.findOne({ razorpayPaymentId: razorpay_order_id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.status = 'Paid';
    invoice.paidAt = new Date();
    await invoice.save();

    const workOrder = await WorkOrder.findById(invoice.workOrderId).populate('subServiceId');
    workOrder.status = 'paid';
    workOrder.paymentStatus = 'success';
    workOrder.timeline.push({ status: 'paid', timestamp: new Date() });
    await workOrder.save();

    // Calculate Commission
    const category = await ServiceCategory.findById(workOrder.subServiceId.categoryId);
    const commissionPercentage = category ? category.baseCommissionPercentage : 10;
    
    // Vendor Earnings
    const platformFee = invoice.total * (commissionPercentage / 100);
    const vendorEarning = invoice.total - platformFee;

    // Credit Vendor Wallet
    await Vendor.findByIdAndUpdate(invoice.vendorId, {
      $inc: { 'wallet.earnings': vendorEarning }
    });

    const io = getIO();
    io.to(`vendor:${invoice.vendorId}`).emit('payment:received', { invoiceId: invoice._id, amount: vendorEarning });
    io.to(`client:${invoice.userId}`).emit('payment:success', { invoiceId: invoice._id });

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('[verifyInvoicePayment Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Review
exports.submitReview = async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const workOrder = await WorkOrder.findOne({ _id: workOrderId, userId });
    if (!workOrder) return res.status(404).json({ success: false, message: 'Work order not found' });
    
    if (workOrder.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Job must be paid before reviewing' });
    }

    const existingReview = await Review.findOne({ workOrderId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already exists' });
    }

    const review = new Review({
      workOrderId,
      vendorId: workOrder.vendorId,
      engineerId: workOrder.engineerId,
      userId,
      rating,
      comment
    });

    await review.save();

    workOrder.status = 'closed';
    workOrder.timeline.push({ status: 'closed', timestamp: new Date() });
    await workOrder.save();

    // Update Vendor/Engineer averages (In a real app, use an aggregation pipeline or hooks)
    
    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
