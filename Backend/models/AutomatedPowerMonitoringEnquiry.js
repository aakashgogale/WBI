const mongoose = require('mongoose');

const AutomatedPowerMonitoringEnquirySchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  companyName: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  designation: { type: String, required: true },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - Site & Facility Details
  facilityType: { type: String, required: true },
  siteSize: { type: String, required: true },
  numberOfFloors: { type: Number, required: true },
  numberOfLocations: { type: String, required: true },

  // Section 3 - Current Power Setup
  totalConnectedLoad: { type: String, required: true },
  powerSupplyType: [{ type: String }],
  existingMeteringSystem: { type: String, required: true },
  existingBMS: { type: String, required: true },
  existingMonitoringSoftware: { type: String, required: true },
  currentMajorIssues: [{ type: String }],

  // Section 4 - Monitoring Requirements
  typeOfMonitoringNeeded: [{ type: String }],
  alertPreference: [{ type: String }],
  alertRecipients: { type: String, required: true },
  reportingFrequency: { type: String, required: true },

  // Section 5 - Integration & Automation
  integrationNeeded: [{ type: String }],
  needLoadShedding: { type: String, required: true },
  needPredictiveMaintenance: { type: String, required: true },
  needEnergyAudit: { type: String, required: true },
  cloudOrOnPremise: { type: String, required: true },

  // Section 6 - Visit & Timeline
  preferredSiteVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  siteContactName: { type: String },
  siteContactNumber: { type: String },
  expectedProjectStartDate: { type: Date },
  projectUrgency: { type: String, required: true },

  // Section 7 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  needAmcAfterInstall: { type: String, required: true },
  needStaffTraining: { type: String, required: true },
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
    enum: ['New', 'Site Visit Scheduled', 'Proposal Sent', 'Implementation', 'Completed', 'Closed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('AutomatedPowerMonitoringEnquiry', AutomatedPowerMonitoringEnquirySchema);
