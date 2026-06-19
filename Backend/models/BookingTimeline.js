const mongoose = require('mongoose');

const bookingTimelineSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  status: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  actorRole: { type: String, enum: ['user', 'worker', 'admin', 'vendor', 'system'], default: 'system' },
  actorId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, {
  timestamps: true
});

module.exports = mongoose.model('BookingTimeline', bookingTimelineSchema);
