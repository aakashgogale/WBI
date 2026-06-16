const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  engineerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer' },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  
  serviceCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  subServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubService' },
  
  jobId: { type: mongoose.Schema.Types.ObjectId }, // Reference to WorkOrder/Job
  projectId: { type: mongoose.Schema.Types.ObjectId }, // Reference to Project
  milestoneId: { type: mongoose.Schema.Types.ObjectId }, // Reference to Milestone
  contractId: { type: mongoose.Schema.Types.ObjectId }, // Reference to AMC
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  gateway: { type: String, enum: ['razorpay', 'offline'], default: 'razorpay' },
  gatewayOrderId: { type: String },
  gatewayPaymentId: { type: String },
  gatewaySignature: { type: String },
  
  paymentStatus: { type: String, enum: ['pending', 'captured', 'failed', 'refunded'], default: 'pending' },
  escrowStatus: { type: String, enum: ['held', 'released', 'refunded', 'disputed'], default: 'held' },
  paymentType: { type: String, enum: ['one_time', 'project_milestone', 'amc_contract', 'visit_based'] },
  
  paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
