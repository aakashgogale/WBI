const mongoose = require('mongoose');

const digitalServiceAnalyticsSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalService', required: true, index: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  month: { type: String, required: true }, // e.g. "2024-06"
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure one analytics record per service per month
digitalServiceAnalyticsSchema.index({ serviceId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('DigitalServiceAnalytics', digitalServiceAnalyticsSchema);
