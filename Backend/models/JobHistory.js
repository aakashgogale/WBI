const mongoose = require('mongoose');

const jobHistorySchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'B2BJob',
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  role: {
    type: String,
    enum: ['system', 'admin', 'company', 'engineer'],
    default: 'system'
  },
  remark: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

jobHistorySchema.index({ jobId: 1, createdAt: -1 });

module.exports = mongoose.model('JobHistory', jobHistorySchema);
