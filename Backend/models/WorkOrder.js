const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  workOrderId: {
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
  enquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DynamicEnquiry',
    index: true
  },
  subServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubService',
    index: true
  },
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer',
    default: null,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'confirmed', 'engineer_assigned', 'engineer_accepted', 'en_route', 'arrived', 'otp_verified', 'in_progress', 'completed', 'invoice_sent', 'payment_pending', 'payment_received', 'closed', 'disputed'],
    default: 'Pending',
    index: true
  },
  type: {
    type: String,
    required: false
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  completedDate: {
    type: Date
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  },
  amount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  notes: String,
  documents: [String], // Array of Cloudinary URLs
  eta: { type: Date },
  otp: {
    code: String,
    attempts: { type: Number, default: 0 },
    expiresAt: Date
  },
  checklistProgress: [{
    taskId: String,
    taskName: String,
    status: { type: String, enum: ['pending', 'done'], default: 'pending' },
    notes: String,
    photos: [String]
  }],
  sparePartsRequests: [{
    description: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: Date
  }],
  completionData: {
    photos: [String],
    notes: String,
    materialsUsed: [{
      name: String,
      quantity: Number,
      rate: Number
    }]
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Pre-save hook to generate workOrderId
workOrderSchema.pre('validate', function(next) {
  if (!this.workOrderId) {
    const prefix = 'WO';
    const year = new Date().getFullYear();
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    this.workOrderId = `${prefix}-${year}-${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
