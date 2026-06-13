const mongoose = require('mongoose');

const digitalAssignmentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DigitalProject',
    required: true
  },
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  role: {
    type: String,
    default: 'Developer'
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed', 'Removed'],
    default: 'Pending'
  },
  earnings: {
    type: Number,
    default: 0
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  removedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

digitalAssignmentSchema.index({ engineerId: 1, projectId: 1 }, { unique: true });
digitalAssignmentSchema.index({ engineerId: 1, status: 1 });

module.exports = mongoose.model('DigitalAssignment', digitalAssignmentSchema);
