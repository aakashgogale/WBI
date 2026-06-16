const mongoose = require('mongoose');

const workerResponseLogSchema = new mongoose.Schema({
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
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserService',
    required: true
  },
  status: {
    type: String,
    enum: ['notified', 'accepted', 'rejected', 'timeout'],
    default: 'notified'
  },
  notifiedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date,
    default: null
  },
  reason: {
    type: String, // Reason if rejected
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkerResponseLog', workerResponseLogSchema);
