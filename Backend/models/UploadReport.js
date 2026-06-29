const mongoose = require('mongoose');

const uploadReportsSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'B2BBatch',
    required: true,
    index: true
  },
  reportType: {
    type: String,
    enum: ['error_report', 'completion_report', 'audit_report'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileKey: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

uploadReportsSchema.index({ batchId: 1 });

module.exports = mongoose.model('UploadReport', uploadReportsSchema);
