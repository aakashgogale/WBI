const mongoose = require('mongoose');

const digitalTaskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String, // 'UI/UX Design', 'API Integration', 'Bug Fixing', etc.
    required: true
  },
  projectType: {
    type: String // 'E-commerce Platform', 'Mobile App', etc.
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'],
    default: 'To Do'
  },
  assignee: {
    name: String,
    avatar: String
  },
  dueDate: Date
}, { timestamps: true });

module.exports = mongoose.model('DigitalTask', digitalTaskSchema);
