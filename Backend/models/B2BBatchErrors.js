const mongoose = require('mongoose');

const b2bBatchErrorsSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'B2BBatch',
    required: true,
    index: true
  },
  rowNumber: {
    type: Number,
    required: true
  },
  rowData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  errorList: {
    type: [String],
    required: true
  }
}, {
  timestamps: true
});

b2bBatchErrorsSchema.index({ batchId: 1, rowNumber: 1 });

module.exports = mongoose.model('B2BBatchErrors', b2bBatchErrorsSchema);
