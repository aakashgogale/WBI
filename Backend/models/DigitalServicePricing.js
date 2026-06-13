const mongoose = require('mongoose');

const digitalServicePricingSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalService', required: true, index: true },
  planName: { type: String, required: true, trim: true }, // Basic, Standard, Premium
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
  deliveryDays: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DigitalServicePricing', digitalServicePricingSchema);
