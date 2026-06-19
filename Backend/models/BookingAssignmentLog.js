const mongoose = require('mongoose');

const bookingAssignmentLogSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    index: true
  },
  action: {
    type: String,
    required: true, // e.g., 'Workers Fetched', 'Worker Filtered', 'Request Sent', 'Worker Joined Room', 'Worker Received Event'
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'ACCEPTED', 'REJECTED', 'TIMEOUT', 'INFO'],
    default: 'INFO'
  },
  reason: {
    type: String // e.g., 'Service mismatch', 'Offline', 'Outside radius'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Any additional data like distance, payload etc.
  }
}, { timestamps: true });

module.exports = mongoose.model('BookingAssignmentLog', bookingAssignmentLogSchema);
