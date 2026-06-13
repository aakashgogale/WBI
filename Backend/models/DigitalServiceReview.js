const mongoose = require('mongoose');

const digitalServiceReviewSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalService', required: true, index: true },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DigitalServiceReview', digitalServiceReviewSchema);
