const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  ownerType: { 
    type: String, 
    required: true 
  },
  documentType: { 
    type: String, 
    required: true 
  },
  apiType: { 
    type: String, 
    required: true 
  }, // e.g. 'aadhaar_verify', 'pan_verify', 'bank_verify', 'selfie_verify'
  requestPayload: { 
    type: mongoose.Schema.Types.Mixed 
  },
  responsePayload: { 
    type: mongoose.Schema.Types.Mixed 
  },
  status: { 
    type: String, 
    enum: ['success', 'failed'], 
    required: true 
  },
  errorMessage: { 
    type: String 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
