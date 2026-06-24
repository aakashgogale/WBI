const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  badge: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL for the banner'],
  },
  mobileImageUrl: {
    type: String,
    default: null
  },
  ctaText: {
    type: String,
    trim: true,
    default: 'Book Now'
  },
  redirectType: {
    type: String,
    enum: ['service', 'category', 'offer', 'external', 'none'],
    default: 'none'
  },
  redirectValue: {
    type: String,
    default: ''
  },
  bannerType: {
    type: String,
    enum: ['home_banner', 'offer_banner', 'promo_banner'],
    default: 'home_banner'
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
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
