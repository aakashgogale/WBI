const mongoose = require('mongoose');

const workerDocumentConfigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  key: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  acceptedFormats: {
    type: [String],
    default: ['image/jpeg', 'image/png', 'application/pdf']
  },
  requiresFrontAndBack: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkerDocumentConfig', workerDocumentConfigSchema);
