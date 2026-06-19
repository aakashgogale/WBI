const mongoose = require('mongoose');

const bookingDraftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OneTimeService',
    required: true
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceBrand',
    default: null
  },
  issueIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceIssue'
  }],
  packageIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServicePackage'
  }],
  quantities: {
    type: Map,
    of: Number,
    default: {}
  },
  priceSnapshot: {
    packageTotal: { type: Number, default: 0 },
    visitCharge: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    surgeCharge: { type: Number, default: 0 },
    emergencyCharge: { type: Number, default: 0 },
    convenienceFee: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0 }
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  },
  specialInstructions: { type: String, default: '' },
  gatePassInfo: { type: String, default: '' },
  parkingInfo: { type: String, default: '' },
  societyRules: { type: String, default: '' },
  petInfo: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'converted'],
    default: 'draft'
  },
  bookingType: {
    type: String,
    enum: ['instant', 'scheduled'],
    default: 'instant'
  },
  scheduledDate: {
    type: Date
  },
  scheduledTime: {
    type: String // e.g. "10:00 AM - 11:00 AM"
  },
  estimatedDuration: {
    type: String // e.g. "45-60 mins"
  },
  expectedArrivalWindow: {
    type: String // e.g. "09:45 - 10:15"
  },
  address: {
    type: Object
  },
  vendorInfo: {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
    name: { type: String },
    rating: { type: Number },
    jobsCompleted: { type: Number },
    verified: { type: Boolean },
    supportNumber: { type: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookingDraft', bookingDraftSchema);
