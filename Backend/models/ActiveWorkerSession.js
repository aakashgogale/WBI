const mongoose = require('mongoose');

const activeWorkerSessionSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    unique: true
  },
  userId: {
    type: String
  },
  role: {
    type: String
  },
  device: {
    type: String
  },
  socketId: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  deviceType: {
    type: String,
    enum: ['android', 'ios', 'web', 'unknown'],
    default: 'unknown'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for fast online worker lookups and socket mappings
activeWorkerSessionSchema.index({ isOnline: 1, lastSeen: -1 });
activeWorkerSessionSchema.index({ socketId: 1 });
activeWorkerSessionSchema.index({ isOnline: 1 });

module.exports = mongoose.model('ActiveWorkerSession', activeWorkerSessionSchema);
