const mongoose = require('mongoose');

const digitalTaskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DigitalProject',
    required: true
  },
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DigitalMilestone',
    default: null
  },
  assignedEngineer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer',
    default: null
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'In Review', 'Done'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  deadline: {
    type: Date
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

digitalTaskSchema.index({ projectId: 1, status: 1 });
digitalTaskSchema.index({ assignedEngineer: 1, status: 1 });

module.exports = mongoose.model('DigitalTask', digitalTaskSchema);
