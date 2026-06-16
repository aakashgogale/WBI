const mongoose = require('mongoose');

const paymentApprovalSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  sourceType: { type: String, enum: ['job', 'project', 'milestone', 'contract'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  vendorApproved: { type: Boolean, default: false },
  clientApproved: { type: Boolean, default: false },
  adminApproved: { type: Boolean, default: false },
  
  approvedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId },
    role: { type: String },
    date: { type: Date }
  }],
  
  approvalStatus: { type: String, enum: ['pending', 'vendor_approved', 'client_approved', 'admin_approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  approvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PaymentApproval', paymentApprovalSchema);
