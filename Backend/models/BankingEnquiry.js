const mongoose = require('mongoose');

const bankingEnquirySchema = new mongoose.Schema({
  // Basic Info
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  companyName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  city: {
    type: String,
    required: [true, 'City/Location is required'],
  },
  branchCode: {
    type: String,
    trim: true,
  },

  // Service Details
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'ATM Service',
      'ATM Cassette Service',
      'Passbook Printer Service',
      'Cash Deposit Machine Service',
      'POS Service',
      'VSAT Service',
      'Barcode Readers',
      'Other'
    ],
  },
  machineModels: {
    type: String,
    trim: true,
  },
  numberOfUnits: {
    type: String,
    default: '1-5',
  },
  
  // Request Info
  description: {
    type: String,
    required: [true, 'Brief description is required'],
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  deadline: {
    type: Date,
  },

  // Tracking and Attachments
  source: {
    type: String,
    default: 'Direct',
  },
  attachments: [{
    url: String,
    filename: String,
  }],
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'],
    default: 'Pending',
  }
}, { timestamps: true });

module.exports = mongoose.model('BankingEnquiry', bankingEnquirySchema);
