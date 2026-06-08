const mongoose = require('mongoose');

const SiteTestingEnquirySchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  companyName: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  designation: { type: String },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - Site Details
  siteType: { type: String, required: true },
  siteSize: { type: String, required: true },
  numberOfFloors: { type: Number, required: true },
  siteOperational: { type: String, required: true }, // Yes / No
  installationType: { type: String, required: true }, // New / Existing / Both

  // Section 3 - Testing Requirements
  testingType: [{ type: String }],
  totalPointsToTest: { type: Number, required: true },
  equipmentBrand: { type: String, required: true },
  purposeOfTesting: { type: String, required: true },

  // Section 4 - Testing Scope
  installedBy: { type: String, required: true },
  systemWorkingStatus: { type: String, required: true },
  focusArea: { type: String },
  needBlindSpotAnalysis: { type: String, required: true },
  needNetworkTesting: { type: String, required: true },
  needRemoteAccessTesting: { type: String, required: true },
  needNightVisionTesting: { type: String, required: true },

  // Section 5 - Report Requirements
  needWrittenReport: { type: String, required: true },
  reportFormat: { type: String },
  needPhotoEvidence: { type: String },
  needPassFailStatus: { type: String },
  needRecommendations: { type: String },
  reportForCompliance: { type: String },

  // Section 6 - Visit & Timeline
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  siteContactName: { type: String },
  siteContactNumber: { type: String },
  accessRestrictions: { type: String, required: true },
  someoneAvailable: { type: String, required: true },
  projectUrgency: { type: String, required: true },

  // Section 7 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  interestedInAmc: { type: String, required: true },
  source: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 8 - Attachments
  attachments: [{
    url: String,
    filename: String
  }],

  // Meta
  status: {
    type: String,
    enum: ['New', 'Testing Scheduled', 'Testing In Progress', 'Report Generating', 'Report Sent', 'Closed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteTestingEnquiry', SiteTestingEnquirySchema);
