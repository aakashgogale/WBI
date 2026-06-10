const mongoose = require('mongoose');

const formConfigSchema = new mongoose.Schema({
  role: { type: String, enum: ['worker', 'engineer'], required: true },
  formType: { type: String, enum: ['registration', 'profile'], required: true },
  stepName: { type: String, required: true },
  stepTitle: { type: String, required: true },
  fields: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProfileField' }],
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

formConfigSchema.index({ role: 1, formType: 1, stepName: 1 }, { unique: true });

module.exports = mongoose.model('FormConfig', formConfigSchema);
