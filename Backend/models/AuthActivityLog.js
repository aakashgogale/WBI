const mongoose = require('mongoose');

const authActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'roleModel',
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'worker', 'engineer', 'vendor', 'admin', 'unknown'],
    default: 'unknown'
  },
  roleModel: {
    type: String,
    enum: ['User', 'Worker', 'Engineer', 'Vendor', 'Admin']
  },
  action: {
    type: String,
    required: true,
    enum: ['FORGOT_PASSWORD_REQUEST', 'OTP_VERIFIED', 'OTP_FAILED', 'PASSWORD_RESET', 'ACCOUNT_LOCKED']
  },
  identifier: {
    type: String, // The email or mobile number used during the request
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    required: true
  },
  details: {
    type: String
  }
}, {
  timestamps: true
});

// Index for tracking suspicious activity per identifier/IP
authActivityLogSchema.index({ identifier: 1, createdAt: -1 });
authActivityLogSchema.index({ ipAddress: 1, createdAt: -1 });

module.exports = mongoose.model('AuthActivityLog', authActivityLogSchema);
