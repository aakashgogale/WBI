const mongoose = require('mongoose');

const webEnquirySchema = new mongoose.Schema({
  // Section 1: Client Basic Info
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
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City/Location is required'],
    trim: true,
  },

  // Section 2: Project Details
  websiteType: {
    type: String,
    required: [true, 'Website type is required'],
    enum: [
      'Business Website',
      'E-Commerce Store',
      'Portfolio',
      'Booking / Appointment App',
      'Service-Based App',
      'Custom Web App',
      'Other',
    ],
  },
  projectTitle: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Brief description is required'],
    trim: true,
  },
  targetAudience: {
    type: String,
    trim: true,
  },

  // Section 3: Features Required
  pagesNeeded: {
    type: String,
    enum: ['1-5', '5-10', '10+'],
  },
  featuresRequired: [{
    type: String,
  }],
  techPreference: {
    type: String,
    trim: true,
  },

  // Section 4: Design Preferences
  hasExistingWebsite: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No',
  },
  existingWebsiteUrl: {
    type: String,
    trim: true,
  },
  hasBrandingReady: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No',
  },
  designStylePreference: {
    type: String,
  },
  referenceWebsites: {
    type: String,
    trim: true,
  },

  // Section 5: Timeline & Budget
  deadline: {
    type: Date,
  },
  budgetRange: {
    type: String,
  },
  source: {
    type: String,
  },

  // Section 6: Attachments
  attachments: [{
    url: String,
    public_id: String,
    filename: String,
  }],

  // Admin/System fields
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WebEnquiry', webEnquirySchema);
