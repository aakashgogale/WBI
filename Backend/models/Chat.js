const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderModel: {
    type: String,
    enum: ['User', 'Worker'],
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    enum: ['image', 'document', 'none'],
    default: 'none'
  },
  fileName: {
    type: String,
    default: null
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId
  }]
}, {
  timestamps: true
});

// Indexes for faster retrieval of chat history for a booking
chatSchema.index({ bookingId: 1, createdAt: 1 });

module.exports = mongoose.model('Chat', chatSchema);
