const mongoose = require('mongoose');

const PowerTestingServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - Site Details
  siteType: { type: String, required: true },
  totalPowerCapacity: { type: String, required: true },
  numberOfFloors: { type: Number },
  numberOfLocations: { type: Number, required: true },
  isSiteOperational: { type: String, required: true },

  // Section 3 - Testing Requirements
  testingRequired: [{ type: String }],
  equipmentToTest: [{ type: String }],

  // Section 4 - Purpose of Testing
  reasonForTesting: { type: String, required: true },
  needDetailedReport: { type: String, required: true },
  reportFormat: { type: String, required: true },
  neededForAuthority: { type: String, required: true },
  needRecommendations: { type: String, required: true },

  // Section 5 - Visit & Timeline
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  canTestDuringWorkingHours: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  panelAccessAvailable: { type: String, required: true },
  safetyRestrictions: { type: String },
  projectUrgency: { type: String, required: true },

  // Section 6 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  interestedInAmcAfter: { type: String, required: true },
  source: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 7 - Attachments
  attachments: [{
    url: String,
    filename: String
  }],

  // Meta
  status: {
    type: String,
    enum: ['New', 'Technician Assigned', 'In Progress', 'Completed', 'Closed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('PowerTestingService', PowerTestingServiceSchema);
