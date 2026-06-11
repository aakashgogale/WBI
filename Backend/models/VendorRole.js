const mongoose = require('mongoose');

const vendorRoleSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorDepartment'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  permissions: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('VendorRole', vendorRoleSchema);
