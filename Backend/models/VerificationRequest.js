const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    unique: true 
  },
  ownerType: { 
    type: String, 
    enum: ['worker', 'engineer'], 
    required: true 
  },
  overallStatus: { 
    type: String, 
    enum: ['not_submitted', 'pending_verification', 'partially_verified', 'verified', 'rejected'],
    default: 'not_submitted'
  },
  requiredDocuments: [{ 
    type: String 
  }],
  submittedDocuments: [{ 
    type: String 
  }], // documentType list
  verifiedDocuments: [{ 
    type: String 
  }], // documentType list
  rejectedDocuments: [{ 
    type: String 
  }], // documentType list
  adminReviewStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  finalApprovedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  finalApprovedAt: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
