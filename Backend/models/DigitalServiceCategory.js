const mongoose = require('mongoose');

const digitalServiceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, lowercase: true, unique: true },
  description: { type: String },
  icon: { type: String, default: null },
  color: { type: String, default: '#0D8A72' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook for slug
digitalServiceCategorySchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('DigitalServiceCategory', digitalServiceCategorySchema);
