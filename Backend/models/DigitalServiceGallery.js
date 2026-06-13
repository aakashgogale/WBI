const mongoose = require('mongoose');

const digitalServiceGallerySchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalService', required: true, index: true },
  imageUrl: { type: String, required: true },
  title: { type: String, trim: true },
  isPrimary: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DigitalServiceGallery', digitalServiceGallerySchema);
