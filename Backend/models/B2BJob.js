const mongoose = require('mongoose');

const b2bJobSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BCompany', 
    required: true 
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'B2BBatch',
    default: null,
    index: true
  },
  jobId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  service: { 
    type: String, 
    required: true 
  },
  subService: { 
    type: String, 
    default: '' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    default: 'Anytime'
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer',
    default: null 
  },
  assignedToName: {
    type: String,
    default: null
  },
  status: { 
    type: String, 
    enum: ['pending', 'searching_engineer', 'assigned', 'in_progress', 'completed', 'cancelled', 'failed'], 
    default: 'pending' 
  },
  charge: { 
    type: Number, 
    default: 0 
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'deducted', 'pending_deduction'],
    default: 'unpaid'
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

b2bJobSchema.index({ companyId: 1 });
b2bJobSchema.index({ companyId: 1, date: 1 });
b2bJobSchema.index({ 'coordinates.coordinates': '2d' }); // 2d index for standard coordinates querying if 2dsphere is too strict
b2bJobSchema.index({ status: 1 });
b2bJobSchema.index({ phone: 1 });
b2bJobSchema.index({ address: 1 });

module.exports = mongoose.model('B2BJob', b2bJobSchema);
