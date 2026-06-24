const mongoose = require('mongoose');

const verificationConfigSchema = new mongoose.Schema({
  roleType: { 
    type: String, 
    enum: ['worker', 'engineer'], 
    required: true, 
    unique: true 
  },
  requiredDocuments: [{ 
    type: String 
  }], // e.g. ['aadhaar', 'pan', 'selfie', 'bank_details', 'address_proof']
  optionalDocuments: [{ 
    type: String 
  }], // e.g. ['skill_certificate', 'experience_proof', 'police_verification', 'resume']
  autoVerificationEnabled: { 
    type: Boolean, 
    default: true 
  },
  manualReviewRequired: { 
    type: Boolean, 
    default: true 
  },
  minMatchScore: { 
    type: Number, 
    default: 70 
  },
  reuploadRules: {
    maxAttempts: { type: Number, default: 3 },
    coolDownHours: { type: Number, default: 24 }
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('VerificationConfig', verificationConfigSchema);
