const mongoose = require('mongoose');

const serviceIssueSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OneTimeService',
    required: true,
    index: true
  },
  brandIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceBrand'
  }],
  title: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: null
  },
  allowMultiple: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceIssue', serviceIssueSchema);
