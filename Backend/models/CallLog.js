const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  callerRole: {
    type: String,
    enum: ['user', 'worker'],
    default: 'user'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
callLogSchema.index({ bookingId: 1 });
callLogSchema.index({ customerId: 1 });
callLogSchema.index({ workerId: 1 });

module.exports = mongoose.model('CallLog', callLogSchema);
