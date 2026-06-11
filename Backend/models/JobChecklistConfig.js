const mongoose = require('mongoose');

const jobChecklistConfigSchema = new mongoose.Schema({
  subServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubService',
    required: true,
    index: true
  },
  items: [{
    task: { type: String, required: true },
    isMandatory: { type: Boolean, default: true },
    requiresPhoto: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('JobChecklistConfig', jobChecklistConfigSchema);
