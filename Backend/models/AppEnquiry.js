const mongoose = require('mongoose');

const appEnquirySchema = new mongoose.Schema({
  // Section 1: Client Basic Info
  fullName: { type: String, required: [true, 'Full name is required'], trim: true },
  companyName: { type: String, trim: true },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  phone: { type: String, required: [true, 'Phone number is required'], trim: true },
  city: { type: String, required: [true, 'City/Location is required'], trim: true },

  // Section 2: App Project Details
  appType: {
    type: String,
    required: [true, 'App type is required'],
    enum: [
      'Android App', 'iOS App', 'Both (Android + iOS)', 
      'Cross-Platform App', 'Progressive Web App (PWA)', 'Hybrid App'
    ],
  },
  appCategory: {
    type: String,
    required: [true, 'App category is required'],
    enum: [
      'E-Commerce / Shopping', 'Food Delivery / Restaurant', 'Healthcare / Medical',
      'Education / E-Learning', 'Travel & Booking', 'Social Networking',
      'Business / Productivity', 'Service-Based App', 'Fitness & Wellness',
      'Finance / Payments', 'Entertainment / Media', 'Other'
    ],
  },
  appName: { type: String, trim: true },
  description: { type: String, required: [true, 'App description is required'], trim: true },
  problemSolved: { type: String, trim: true },
  targetAudience: { type: String, trim: true },

  // Section 3: Features & Functionality
  coreFeatures: [{ type: String }],
  needBackend: { type: String, enum: ['Yes', 'No', 'Not Sure'], default: 'Not Sure' },
  needAdminPanel: { type: String, enum: ['Yes', 'No'], default: 'No' },
  existingSystemIntegration: { type: String, trim: true },

  // Section 4: Design & Branding
  hasDesignReady: { type: String, enum: ['Yes', 'No', 'Need help with design'], default: 'No' },
  hasBrandingReady: { type: String, enum: ['Yes', 'No'], default: 'No' },
  designStylePreference: { type: String, trim: true },
  referenceApps: { type: String, trim: true },

  // Section 5: Technical Preferences
  preferredTech: { type: String, trim: true },
  preferredBackend: { type: String, trim: true },
  needPublishingHelp: { type: String, enum: ['Yes', 'No'], default: 'No' },

  // Section 6: Timeline & Budget
  expectedLaunchDate: { type: Date },
  projectUrgency: { type: String, trim: true },
  budgetRange: { type: String, trim: true },
  source: { type: String, trim: true },

  // Section 7: Attachments
  attachments: [{
    url: String,
    filename: String,
  }],

  // Admin/System fields
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('AppEnquiry', appEnquirySchema);
