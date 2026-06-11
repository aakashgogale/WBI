const mongoose = require('mongoose');

const vendorDocumentSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // In bytes
    default: 0
  },
  status: {
    type: String,
    enum: ['Verified', 'Pending', 'Rejected'],
    default: 'Pending'
  },
  type: {
    type: String,
    enum: ['Vault', 'Certificate'],
    default: 'Vault'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorDocument', vendorDocumentSchema);
