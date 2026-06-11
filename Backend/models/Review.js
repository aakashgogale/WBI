const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    index: true
  },
  rating: {
    overall: { type: Number, required: true, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 }
  },
  wouldRecommend: { type: Boolean, default: true },
  review: {
    type: String,
    trim: true
  },
  vendorReply: {
    type: String,
    trim: true
  },
  images: [{
    type: String // Cloudinary URLs
  }],
  isVerified: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'hidden', 'deleted'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for faster aggregation
reviewSchema.index({ vendorId: 1, rating: -1 });
reviewSchema.index({ serviceId: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
