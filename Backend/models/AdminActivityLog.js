const mongoose = require('mongoose');

const adminActivityLogSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true 
  },
  action: { 
    type: String, 
    required: true 
  }, // e.g. 'CONFIG_UPDATE', 'DOCUMENT_APPROVE', 'DOCUMENT_REJECT', 'DOCUMENT_REUPLOAD_REQUEST'
  targetId: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  targetType: { 
    type: String 
  }, // e.g. 'VerificationDocument', 'VerificationRequest', 'VerificationConfig'
  details: { 
    type: mongoose.Schema.Types.Mixed 
  },
  ipAddress: { 
    type: String 
  },
  userAgent: { 
    type: String 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AdminActivityLog', adminActivityLogSchema);
