const mongoose = require('mongoose');

const designEnquirySchema = new mongoose.Schema({
  // Client Info
  fullName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },

  // Design Project Details
  designType: { type: String, required: true },
  projectTitle: { type: String, required: true },
  projectDescription: { type: String, required: true },
  targetAudience: { type: String, required: true },
  pagesCount: { type: String, required: true },

  // Branding & Style
  hasLogo: { type: String, required: true },
  hasBrandColors: { type: String, required: true },
  designStyle: { type: String, required: true },
  colorTheme: { type: String },
  referenceWebsites: { type: String },
  excludeDesignElements: { type: String },

  // Content & Assets
  provideContent: { type: String, required: true },
  provideImages: { type: String, required: true },
  hasDesignFiles: { type: String, required: true },
  needIcons: { type: String, required: true },

  // Deliverables
  requiredFormat: [{ type: String }],
  responsiveDesign: { type: String, required: true },
  interactivePrototype: { type: String, required: true },
  developerHandoff: { type: String, required: true },

  // Timeline & Budget
  expectedDeliveryDate: { type: Date },
  urgency: { type: String, required: true },
  budgetRange: { type: String, required: true },
  source: { type: String, required: true },

  // Attachments
  attachments: [{
    url: String,
    filename: String
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Contacted', 'Proposal Sent', 'Closed'],
    default: 'New'
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DesignEnquiry', designEnquirySchema);
