const mongoose = require('mongoose');

const servicePackageSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OneTimeService',
    required: true,
    index: true
  },
  issueIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceIssue'
  }],
  brandIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceBrand'
  }],
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDuration: {
    type: String, // e.g., '45 - 60 mins'
    default: ''
  },
  warranty: {
    type: String, // e.g., '30 days warranty'
    default: ''
  },
  isRequired: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model('ServicePackage', servicePackageSchema);
