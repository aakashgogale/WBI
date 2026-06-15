const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { WORKER_STATUS } = require('../utils/constants');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple undefined values
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false,
    sparse: true,
    unique: true,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  appleId: {
    type: String,
    sparse: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['worker'],
    default: 'worker'
  },
  roleType: {
    type: String,
    enum: ['Worker', 'Engineer', 'Both'],
    default: 'Worker'
  },
  dob: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  workType: {
    type: String,
    enum: ['One-time Jobs', 'Project Work', 'Both', ''],
    default: ''
  },
  password: {
    type: String,
    select: false
  },
  aadhar: {
    number: {
      type: String,
      trim: true
    },
    document: {
      type: String, // Cloudinary URL (Front)
    },
    backDocument: {
      type: String, // Cloudinary URL (Back)
    }
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  serviceCategories: [{
    type: String
  }],
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  availability: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Weekends', 'Emergency Support'],
    default: 'Full Time'
  },
  workingDays: [{
    type: String
  }],
  workingHours: {
    start: { type: String, default: '09:00 AM' },
    end: { type: String, default: '06:00 PM' }
  },
  emergencyService: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: Object.values(WORKER_STATUS),
    default: WORKER_STATUS.OFFLINE
  },
  profilePhoto: {
    type: String,
    default: null
  },
  address: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    fullAddress: String
  },
  rating: {
    type: Number,
    default: 0
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Wallet
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    pendingBalance: {
      type: Number,
      default: 0
    },
    withdrawnAmount: {
      type: Number,
      default: 0
    }
  },
  // Settings
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    soundAlerts: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  // Real-time Location
  location: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  // Bank Details
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    upiId: String
  },
  documents: {
    aadhaar: String,
    pan: String,
    certificates: [String],
    aadhaarFrontUrl: String,
    aadhaarBackUrl: String,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  },
  // Dynamic Documents from Config
  uploadedDocuments: [{
    key: String,
    url: String,
    backUrl: String,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  }],
  // Work Locations
  workLocations: {
    primaryArea: String,
    secondaryAreas: [String],
    availableCities: [String],
    serviceRadius: {
      type: Number,
      default: 10
    }
  },
  // Work Tools
  workTools: {
    ownTools: { type: Boolean, default: false },
    vehicleAvailable: { type: Boolean, default: false },
    vehicleType: { type: String, default: '' },
    drivingLicense: { type: String, default: '' }
  },
  // Engineer Specific Details
  engineerDetails: {
    qualification: { type: String, default: '' },
    degree: { type: String, default: '' },
    specialization: { type: String, default: '' },
    projectExperience: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    certifications: [{ type: String }],
    previousCompany: { type: String, default: '' },
    canHandleMilestones: { type: Boolean, default: false }
  },
  // Dynamic Admin Configured Fields
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Additional Stats
  cancelledJobs: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  // FCM Push Notification Tokens
  fcmTokens: {
    type: [String],
    default: []
  },
  fcmTokenMobile: {
    type: [String],
    default: []
  },
  loginSessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
workerSchema.index({ status: 1 });
workerSchema.index({ serviceCategories: 1 });
workerSchema.index({ vendorId: 1 });

// Hash password before saving
workerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
workerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);

