const mongoose = require('mongoose');

const vendorPerformanceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorTeamMember',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  productivityPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  activeTasks: {
    type: Number,
    default: 0
  },
  delayedTasks: {
    type: Number,
    default: 0
  },
  clientFeedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorPerformance', vendorPerformanceSchema);
