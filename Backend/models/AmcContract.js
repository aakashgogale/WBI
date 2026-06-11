const mongoose = require('mongoose');

const amcContractSchema = new mongoose.Schema({
  contractId: {
    type: String,
    unique: true,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  equipmentDetails: [{
    name: String,
    model: String,
    serialNumber: String,
    location: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Cancelled', 'Pending'],
    default: 'Pending',
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  visitsScheduled: [{
    visitDate: Date,
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Engineer'
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Missed'],
      default: 'Scheduled'
    },
    notes: String
  }],
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  documents: [String]
}, { timestamps: true });

amcContractSchema.pre('validate', function(next) {
  if (!this.contractId) {
    const prefix = 'AMC';
    const year = new Date().getFullYear();
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    this.contractId = `${prefix}-${year}-${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('AmcContract', amcContractSchema);
