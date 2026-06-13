const mongoose = require('mongoose');

const digitalServiceFaqSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalService', required: true, index: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DigitalServiceFaq', digitalServiceFaqSchema);
