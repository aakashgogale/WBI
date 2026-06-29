const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  deliverables: [String],
  estimatedHours: Number,
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  attachments: [{
    fileUrl: String,
    title: String,
    type: { type: String }
  }],
  notes: String,
  reviewComments: String,
  workDescription: String,
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  assignedDate: Date,
  dueDate: Date,
  submittedAt: Date,
  completedAt: Date
});

const documentSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  type: String, // e.g., 'Requirement Document', 'Figma Design', 'PDF', 'Image'
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const paymentSchema = new mongoose.Schema({
  amount: Number,
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending'
  }
});

const timelineSchema = new mongoose.Schema({
  event: String,
  description: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const workerProjectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'Project title is required']
  },
  projectType: String,
  description: {
    type: String,
    trim: true
  },
  scopeOfWork: [String],
  requirementsSummary: [String],
  
  // References
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  adminSupervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  projectManagerName: String,

  // Status & Progress
  status: {
    type: String,
    enum: ['Assigned', 'In Progress', 'Under Review', 'Client Review', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Assigned',
    index: true
  },
  progress: {
    type: Number,
    default: 0
  },

  // Dates
  startDate: Date,
  dueDate: Date,
  estimatedDeliveryDate: Date,

  // Financials
  totalAmount: {
    type: Number,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },

  // Arrays
  milestones: [milestoneSchema],
  documents: [documentSchema],
  payments: [paymentSchema],
  timeline: [timelineSchema],

  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate progress automatically
workerProjectSchema.pre('save', function(next) {
  if (this.milestones && this.milestones.length > 0) {
    const completed = this.milestones.filter(m => m.status === 'Completed').length;
    this.progress = Math.round((completed / this.milestones.length) * 100);
  } else {
    this.progress = 0;
  }
  next();
});

workerProjectSchema.index({ workerId: 1, status: 1 });

module.exports = mongoose.model('WorkerProject', workerProjectSchema);
