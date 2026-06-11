const mongoose = require('mongoose');

const vendorTeamMemberSchema = new mongoose.Schema({
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
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String, // Cloudinary URL
    default: null
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorRole'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorDepartment'
  },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorTeamSkill'
  }],
  experience: {
    type: String, // e.g. "6+ Years", "4.6 Years"
    default: '0 Years'
  },
  availabilityStatus: {
    type: String,
    enum: ['Available', 'On Project', 'On Leave', 'Bench'],
    default: 'Available'
  },
  currentProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorTeamMember', vendorTeamMemberSchema);
