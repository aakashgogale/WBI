const mongoose = require('mongoose');

const digitalServiceFeatureSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalService', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  isIncluded: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DigitalServiceFeature', digitalServiceFeatureSchema);
