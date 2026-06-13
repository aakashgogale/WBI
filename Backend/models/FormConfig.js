const mongoose = require('mongoose');

const formConfigSchema = new mongoose.Schema({
  role: { type: String, enum: ['worker', 'engineer', 'both'], required: true },
  formType: { type: String, enum: ['registration', 'profile', 'skills'], default: 'registration' },
  step: { type: Number, default: 1 }, // Used for multi-step forms
  fieldKey: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'password', 'email', 'tel', 'number', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'date', 'location'],
    required: true 
  },
  required: { type: Boolean, default: false },
  options: [{
    label: String,
    value: String
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    errorMessage: String
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

formConfigSchema.index({ role: 1, formType: 1, fieldKey: 1 }, { unique: true });

module.exports = mongoose.model('FormConfig', formConfigSchema);
