const mongoose = require('mongoose');

const documentRequirementSchema = new mongoose.Schema({
  role: { type: String, enum: ['worker', 'engineer', 'both'], required: true },
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  description: { type: String, default: '' },
  isRequired: { type: Boolean, default: true },
  requiresBackSide: { type: Boolean, default: false },
  acceptedFormats: [{ type: String }], // e.g., ['pdf', 'jpg', 'png']
  maxSizeMB: { type: Number, default: 5 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DocumentRequirement', documentRequirementSchema);
