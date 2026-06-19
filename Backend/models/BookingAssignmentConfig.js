const mongoose = require('mongoose');

const bookingAssignmentConfigSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null },
  initialRadiusKm: { type: Number, default: 5 },
  maxRadiusKm: { type: Number, default: 15 },
  radiusStepKm: { type: Number, default: 5 },
  workerResponseTimeoutSec: { type: Number, default: 30 },
  totalSearchTimeoutSec: { type: Number, default: 60 },
  maxWorkersPerRound: { type: Number, default: 3 },
  assignmentMode: { type: String, enum: ['sequential', 'broadcast'], default: 'sequential' },
  autoAssignEnabled: { type: Boolean, default: true },
  vendorApprovalRequired: { type: Boolean, default: false },
  adminFallbackEnabled: { type: Boolean, default: true },
  manualSelectionAllowed: { type: Boolean, default: false },
  retryLimit: { type: Number, default: 3 }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookingAssignmentConfig', bookingAssignmentConfigSchema);
