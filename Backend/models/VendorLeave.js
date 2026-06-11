const mongoose = require('mongoose');

const vendorLeaveSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorTeamMember',
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Approved' // Usually approved by default for vendors managing their own teams
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorLeave', vendorLeaveSchema);
