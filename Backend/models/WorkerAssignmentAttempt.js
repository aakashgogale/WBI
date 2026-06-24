const mongoose = require('mongoose');

const workerAssignmentAttemptSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  roundNumber: { type: Number, default: 1 },
  radiusKm: { type: Number, default: 5 },
  status: {
    type: String,
    enum: ['sent', 'accepted', 'rejected', 'timeout', 'expired'],
    default: 'sent'
  },
  distanceKm: { type: Number, default: null },
  expiresAt: { type: Date, default: null },
  reason: { type: String, default: null },
  sentAt: { type: Date, default: Date.now },
  respondedAt: { type: Date, default: null },
  responseTimeSec: { type: Number, default: null }
}, {
  timestamps: true
});

workerAssignmentAttemptSchema.index({ bookingId: 1, workerId: 1 });
workerAssignmentAttemptSchema.index({ status: 1 });

module.exports = mongoose.model('WorkerAssignmentAttempt', workerAssignmentAttemptSchema);
