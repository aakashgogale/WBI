const mongoose = require('mongoose');

const digitalServiceSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalServiceCategory', required: true, index: true },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalServiceSubcategory' },
  
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, index: true },
  shortDescription: { type: String, required: true, maxLength: 250 },
  description: { type: String },
  
  iconUrl: { type: String },
  basePrice: { type: Number, required: true, min: 0 },
  isCustomPricing: { type: Boolean, default: false },
  
  status: { type: String, enum: ['Active', 'Inactive', 'Draft', 'Featured'], default: 'Draft', index: true },
  
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

digitalServiceSchema.pre('validate', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('DigitalService', digitalServiceSchema);
