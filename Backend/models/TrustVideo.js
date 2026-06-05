const mongoose = require('mongoose');

const trustVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  },
  serviceCategory: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true // Cloudinary URL
  },
  videoUrl: {
    type: String,
    required: true // Cloudinary or external URL
  },
  videoType: {
    type: String,
    enum: ['upload', 'url', 'youtube'],
    default: 'url'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.8
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient public queries
trustVideoSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('TrustVideo', trustVideoSchema);
