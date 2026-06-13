const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { WORKER_STATUS } = require('../utils/constants');

const engineerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls/missing
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
    trim: true
  },
  emergencyContactNumber: {
    type: String,
    trim: true,
    default: null
  },
  role: {
    type: String,
    enum: ['engineer'],
    default: 'engineer'
  },
  roleType: {
    type: String,
    enum: ['Engineer', 'Engineer', 'Both'],
    default: 'Engineer'
  },
  registrationType: {
    type: String,
    enum: ['Individual Engineer / Technician', 'Company / Firm Employee', 'Freelancer'],
    default: 'Individual Engineer / Technician'
  },
  companyDetails: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    companyName: String,
    companyRegNumber: String,
    employeeId: String,
    designation: String,
    reportingManager: String,
    companyContact: String,
    companyEmailDomain: String
  },
  whatsappNumber: {
    type: String,
    trim: true,
    default: null
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
  totalExperienceYears: {
    type: Number,
    default: 0
  },
  experienceLevel: {
    type: String,
    enum: ['Fresher (0–1 year)', 'Junior (1–3 years)', 'Mid-level (3–6 years)', 'Senior (6–10 years)', 'Expert (10+ years)', ''],
    default: ''
  },
  canWorkIndependently: {
    type: Boolean,
    default: true
  },
  willingToTravel: {
    type: Boolean,
    default: true
  },
  preferredWorkType: {
    type: String,
    enum: ['On-site', 'Remote', 'Both', ''],
    default: 'Both'
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
  policeVerification: {
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Not Submitted'],
      default: 'Not Submitted'
    },
    document: { type: String, default: null },
    verifiedAt: { type: Date, default: null }
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
  subServices: [{
    type: String
  }],
  primaryCategory: {
    type: String,
    default: null
  },
  primarySkill: {
    type: String,
    default: ''
  },
  secondarySkills: [{
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
  // GeoJSON for ultra-fast $near queries (Emergency matching)
  geoLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
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
  pan: {
    number: { type: String, trim: true },
    document: { type: String }
  },
  highestEducation: {
    type: String,
    enum: ['10th Pass', '12th Pass', 'ITI / Diploma', 'B.Tech / B.E.', 'B.Sc / B.Com / B.A.', 'M.Tech / M.E.', 'MBA / MCA', 'Other', ''],
    default: ''
  },
  fieldOfStudy: {
    type: String,
    default: ''
  },
  skillCertificates: [{
    name: String,
    issuingAuthority: String,
    issueDate: Date,
    expiryDate: Date,
    documentUrl: String
  }],
  governmentCertifications: [{
    type: String
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
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  preferredLoginMethod: {
    type: String,
    enum: ['Phone OTP', 'Password', 'Both'],
    default: 'Both'
  },
  referralCode: {
    type: String,
    default: ''
  },
  heardAboutWbi: {
    type: String,
    enum: ['Social Media', 'Company / Employer referred', 'Friend / Colleague', 'Google Search', 'Other', ''],
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for faster queries
engineerSchema.index({ status: 1 });
engineerSchema.index({ serviceCategories: 1 });
engineerSchema.index({ vendorId: 1 });
engineerSchema.index({ geoLocation: '2dsphere' });

// Hash password before saving
engineerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
engineerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Engineer', engineerSchema);

