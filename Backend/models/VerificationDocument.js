const mongoose = require('mongoose');

const verificationDocumentSchema = new mongoose.Schema({
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  ownerType: { 
    type: String, 
    enum: ['worker', 'engineer'], 
    required: true 
  },
  documentType: { 
    type: String, 
    required: true 
  }, // e.g. 'aadhaar', 'pan', 'selfie', 'bank_details', 'education_certificate', etc.
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileKey: { 
    type: String, 
    required: true 
  }, // Cloudinary public ID
  documentNumberMasked: { 
    type: String 
  }, // Masked version of document number (e.g. XXXX-XXXX-1234)
  status: { 
    type: String, 
    enum: ['pending', 'uploaded', 'under_review', 'verified', 'rejected', 'expired'], 
    default: 'uploaded' 
  },
  cgpeRequestId: { 
    type: String 
  },
  cgpeResponse: { 
    type: mongoose.Schema.Types.Mixed 
  },
  matchScore: { 
    type: Number 
  },
  rejectionReason: { 
    type: String 
  },
  verifiedAt: { 
    type: Date 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  }
}, { 
  timestamps: true 
});

// Compound index for fast lookup of a specific doc type for an owner
verificationDocumentSchema.index({ ownerId: 1, documentType: 1 }, { unique: true });

module.exports = mongoose.model('VerificationDocument', verificationDocumentSchema);
