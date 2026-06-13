const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'roleModel'
  },
  role: {
    type: String,
    enum: ['user', 'worker', 'engineer', 'vendor', 'admin'],
    required: true
  },
  roleModel: {
    type: String,
    required: true,
    enum: ['User', 'Worker', 'Engineer', 'Vendor', 'Admin']
  },
  hashedOtp: {
    type: String,
    required: true
  },
  resetToken: {
    type: String,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastResendAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// TTL index to auto-delete expired documents (after 5 minutes)
// We set it to expire based on the expiresAt field, plus a small buffer if needed.
// By default, MongoDB TTL index deletes when the current time is > the indexed field value.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for quick lookups
passwordResetTokenSchema.index({ userId: 1, role: 1 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
