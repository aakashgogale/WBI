const mongoose = require('mongoose');

const dynamicFormConfigSchema = new mongoose.Schema({
  subServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubService',
    required: true,
    index: true
  },
  fields: [{
    name: { type: String, required: true }, // machine readable
    label: { type: String, required: true }, // human readable
    type: { 
      type: String, 
      enum: ['text', 'textarea', 'number', 'select', 'multiselect', 'file', 'location', 'date', 'time'],
      required: true
    },
    options: [{ type: String }], // for select/multiselect
    isRequired: { type: Boolean, default: false },
    placeholder: { type: String },
    displayOrder: { type: Number, default: 0 }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DynamicFormConfig', dynamicFormConfigSchema);
