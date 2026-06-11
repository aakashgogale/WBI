const mongoose = require('mongoose');

const vendorTeamSkillSchema = new mongoose.Schema({
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
  category: {
    type: String, // e.g. Frontend, Backend, Design
    default: 'General'
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorTeamSkill', vendorTeamSkillSchema);
