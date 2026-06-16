const Payment = require('../models/Payment');
const PaymentApproval = require('../models/PaymentApproval');

exports.getVendorPayments = async (req, res) => {
  try {
    const vendorId = req.user._id; // from auth
    const payments = await Payment.find({ vendorId }).sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user._id;

    const approval = await PaymentApproval.findOne({ paymentId: id });
    if (!approval) return res.status(404).json({ success: false, message: 'Approval record not found' });
    
    const payment = await Payment.findById(id);
    if (!payment || payment.vendorId.toString() !== vendorId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    approval.vendorApproved = true;
    approval.approvedBy.push({
      userId: vendorId,
      role: 'vendor',
      date: new Date()
    });
    approval.approvalStatus = 'vendor_approved';
    await approval.save();

    res.json({ success: true, message: 'Payment approved by vendor' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const vendorId = req.user._id;

    const approval = await PaymentApproval.findOne({ paymentId: id });
    if (!approval) return res.status(404).json({ success: false, message: 'Approval record not found' });

    approval.approvalStatus = 'rejected';
    approval.rejectionReason = reason;
    await approval.save();

    res.json({ success: true, message: 'Payment rejected by vendor' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
