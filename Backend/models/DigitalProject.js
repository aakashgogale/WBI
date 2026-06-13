const mongoose = require('mongoose');

const digitalProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  clientName: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  deadline: {
    type: Date,
    required: true
  },
  totalBudget: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending'
  },
  currentMilestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DigitalMilestone',
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

digitalProjectSchema.index({ vendorId: 1, status: 1 });
digitalProjectSchema.index({ deadline: 1 });

module.exports = mongoose.model('DigitalProject', digitalProjectSchema);
