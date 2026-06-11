const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    unique: true,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  engineers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer'
  }],
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  progress: {
    type: Number,
    default: 0, // 0 to 100
    min: 0,
    max: 100
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  budget: {
    type: Number,
    default: 0
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  phases: [{
    title: String,
    description: String,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    },
    dueDate: Date
  }],
  documents: [String]
}, { timestamps: true });

projectSchema.pre('validate', function(next) {
  if (!this.projectId) {
    const prefix = 'PRJ';
    const year = new Date().getFullYear();
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    this.projectId = `${prefix}-${year}-${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
