const mongoose = require('mongoose');

const digitalProposalSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DigitalJob',
    required: true
  },
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  bidAmount: {
    type: Number,
    required: true
  },
  estimatedDuration: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['Hours', 'Days', 'Weeks', 'Months'], default: 'Days' }
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected', 'Withdrawn'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

digitalProposalSchema.index({ engineerId: 1, status: 1 });
digitalProposalSchema.index({ jobId: 1, status: 1 });

module.exports = mongoose.model('DigitalProposal', digitalProposalSchema);
