const mongoose = require('mongoose');

const vendorDepartmentSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String, // Hex color for UI representation (Donut chart)
    default: '#10B981'
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorDepartment', vendorDepartmentSchema);
