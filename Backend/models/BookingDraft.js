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
    subtotal: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0 }
  },
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
    type: String
  },
  address: {
    type: Object
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookingDraft', bookingDraftSchema);
