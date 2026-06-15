const mongoose = require('mongoose');

const subServiceSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: [true, 'Please provide a category ID'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a sub-service name'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  icon: {
    type: String, // FiIcon name or URL
    default: null
  },
  image: {
    type: String, // Thumbnail URL
    default: null
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: 0
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 128,
    min: 0
  },
  displayOrder: {
    type: Number,
    default: 0,
    index: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  suggestedTools: [{
    type: String,
    trim: true
  }],
  slaTargets: {
    responseTimeMins: { type: Number, default: 30 },
    assignmentTimeMins: { type: Number, default: 60 },
    arrivalTimeMins: { type: Number, default: 120 },
    completionTimeMins: { type: Number, default: 240 }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Generate slug from name before validation if not provided
subServiceSchema.pre('validate', function(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Compound index for category and active status
subServiceSchema.index({ categoryId: 1, isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('SubService', subServiceSchema);
