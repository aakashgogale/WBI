const mongoose = require('mongoose');

const digitalServiceSubcategorySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalServiceCategory', required: true, index: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

digitalServiceSubcategorySchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('DigitalServiceSubcategory', digitalServiceSubcategorySchema);
