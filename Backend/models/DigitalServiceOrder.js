const mongoose = require('mongoose');

const digitalServiceOrderSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalService', required: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  customerName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['New', 'Assigned', 'In Progress', 'Completed', 'Cancelled'], default: 'New', index: true },
  dueDate: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('DigitalServiceOrder', digitalServiceOrderSchema);
