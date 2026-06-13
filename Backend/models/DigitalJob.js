const mongoose = require('mongoose');

const digitalJobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  clientName: {
    type: String,
    trim: true,
    default: ''
  },
  serviceType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    type: { type: String, enum: ['Fixed', 'Hourly'], default: 'Fixed' }
  },
  duration: {
    value: { type: Number, required: true },
    unit: { type: String, enum: ['Hours', 'Days', 'Weeks', 'Months'], default: 'Days' }
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  workType: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid'],
    default: 'Remote'
  },
  requiredSkills: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Draft', 'Open', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  assignedEngineer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer',
    default: null
  },
  assignmentStatus: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'None'],
    default: 'None'
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster dashboard queries
digitalJobSchema.index({ vendorId: 1, status: 1 });
digitalJobSchema.index({ assignedEngineer: 1, status: 1 });
digitalJobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DigitalJob', digitalJobSchema);
