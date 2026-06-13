const mongoose = require('mongoose');

const digitalMilestoneSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DigitalProject',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  amount: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'In Review', 'Approved', 'Paid'],
    default: 'Pending'
  },
  submissionLink: {
    type: String,
    default: null
  },
  submissionNotes: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

digitalMilestoneSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model('DigitalMilestone', digitalMilestoneSchema);
