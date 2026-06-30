const mongoose = require('mongoose');

const oneTimeServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  categoryType: {
    type: String,
    enum: ['one_time', 'project'],
    default: 'one_time'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // --- Dynamic Configuration Flags ---
  isBrandRequired: { type: Boolean, default: false },
  isIssueRequired: { type: Boolean, default: false },
  isPackageRequired: { type: Boolean, default: true },
  allowSchedule: { type: Boolean, default: true },
  allowBookNow: { type: Boolean, default: true },
  allowPayAtHome: { type: Boolean, default: true },
  allowOnlinePayment: { type: Boolean, default: true },
  requiresOTP: { type: Boolean, default: true },
  requiresProofUpload: { type: Boolean, default: true },
  requiresLiveTracking: { type: Boolean, default: true },
  estimatedDuration: { type: String, default: '60 mins' },
  defaultRadiusKm: { type: Number, default: 10 },
  assignmentMode: { type: String, enum: ['auto_wave', 'manual'], default: 'auto_wave' }
}, {
  timestamps: true
});

oneTimeServiceSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes for faster public querying
oneTimeServiceSchema.index({ isActive: 1, categoryType: 1, sortOrder: 1 });
oneTimeServiceSchema.index({ isActive: 1, categoryType: 1, rating: -1, totalReviews: -1 });

module.exports = mongoose.model('OneTimeService', oneTimeServiceSchema);
