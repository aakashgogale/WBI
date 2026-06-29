const mongoose = require('mongoose');

const b2bBatchSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'B2BCompany',
    required: true,
    index: true
  },
  batchId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'validating', 'validated', 'processing', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'draft',
    index: true
  },
  totalRows: {
    type: Number,
    default: 0
  },
  processedRows: {
    type: Number,
    default: 0
  },
  validRows: {
    type: Number,
    default: 0
  },
  invalidRows: {
    type: Number,
    default: 0
  },
  duplicates: {
    type: Number,
    default: 0
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  perJobCharge: {
    type: Number,
    default: 0
  },
  walletBalanceAtUpload: {
    type: Number,
    default: 0
  },
  pausedAt: {
    type: Date,
    default: null
  },
  resumedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  failedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'B2BCompany'
  },
  serviceSummary: {
    type: [String],
    default: []
  },
  createdJobsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

b2bBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('B2BBatch', b2bBatchSchema);
