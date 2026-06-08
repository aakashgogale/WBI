const mongoose = require('mongoose');

const marketingEnquirySchema = new mongoose.Schema({
  // Client Info
  fullName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },

  // Business & Marketing Details
  businessType: { type: String, required: true },
  industry: { type: String, required: true },
  currentOnlinePresence: [{ type: String }],
  currentMonthlyMarketingBudget: { type: String, required: true },
  primaryGoal: { type: String, required: true },

  // Services Required
  servicesNeeded: [{ type: String }],
  targetLocation: { type: String, required: true },
  specificCities: { type: String },
  targetAudience: { type: String, required: true },

  // Content & Branding
  hasExistingCreatives: { type: String, enum: ['Yes', 'No'], required: true },
  hasBrandGuidelines: { type: String, enum: ['Yes', 'No'], required: true },
  contentLanguage: [{ type: String }],
  postingFrequency: { type: String, required: true },

  // Timeline & Budget
  urgency: { type: String, required: true },
  contractDuration: { type: String, required: true },
  budgetRange: { type: String, required: true },
  source: { type: String, required: true },

  // Attachments
  attachments: [{ url: String, filename: String }],

  // Admin/System fields
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('MarketingEnquiry', marketingEnquirySchema);
