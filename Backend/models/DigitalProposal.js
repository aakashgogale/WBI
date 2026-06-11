const mongoose = require('mongoose');

const digitalProposalSchema = new mongoose.Schema({
  proposalId: {
    type: String, // e.g. PRO-2024-105
    required: true,
    unique: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  clientName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Sent', 'Accepted', 'Pending', 'Draft'],
    default: 'Draft'
  },
  date: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DigitalProposal', digitalProposalSchema);
