const mongoose = require('mongoose');

const paymentLogSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  
  action: { type: String, required: true }, // e.g. 'captured', 'escrow_released', 'refund_issued'
  performedBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // User/Admin ID
  performedByRole: { type: String, enum: ['user', 'admin', 'vendor', 'system'], required: true },
  
  oldStatus: { type: String },
  newStatus: { type: String },
  
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
