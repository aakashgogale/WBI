const mongoose = require('mongoose');

const homeSectionItemSchema = new mongoose.Schema({
  iconName: {
    type: String,
    default: ''
  },
  iconUrl: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  stepNumber: {
    type: Number,
    default: 0
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const homeSectionSchema = new mongoose.Schema({
  sectionKey: {
    type: String,
    required: true,
    unique: true,
    enum: ['care_plan', 'why_choose', 'how_it_works'],
    index: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  highlightedText: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  badgeText: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  mobileImageUrl: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: ''
  },
  buttonRedirect: {
    type: String,
    default: ''
  },
  discountText: {
    type: String,
    default: ''
  },
  items: [homeSectionItemSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HomeSection', homeSectionSchema);
