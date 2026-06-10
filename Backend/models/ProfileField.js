const mongoose = require('mongoose');

const profileFieldSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'number', 'email', 'phone', 'dropdown', 'multiselect', 'checkbox', 'radio', 'date', 'file', 'image', 'address', 'map', 'time'],
    required: true
  },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: [{ label: String, value: String }], // For dropdowns, multiselect, radio
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    errorMessage: String
  },
  editable: { type: Boolean, default: true },
  visible: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  defaultValue: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ProfileField', profileFieldSchema);
