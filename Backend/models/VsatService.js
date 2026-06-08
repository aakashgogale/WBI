const mongoose = require('mongoose');

const VsatServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  branchNameCode: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternateContact: { type: String },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - VSAT Details
  vsatProvider: { type: String, required: true },
  vsatBrand: { type: String, required: true },
  terminalId: { type: String, required: true },
  dishSize: { type: String, required: true },
  installationDate: { type: String },

  // Section 3 - Service Type Required
  serviceRequired: { type: String, required: true },
  currentStatus: { type: String, required: true },
  errorShown: { type: String },
  issueDescription: { type: String, required: true },
  issueStartTime: { type: String, required: true },
  weatherCondition: { type: String, required: true },

  // Section 4 - Network Impact
  networkDown: { type: String, required: true },
  usersAffected: { type: Number, required: true },
  atmAffected: { type: String, required: true },
  coreBankingAffected: { type: String, required: true },

  // Section 5 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  rooftopAccess: { type: String, required: true },
  heightRestriction: { type: String, required: true },

  // Section 6 - Additional Info
  existingAmc: { type: String, required: true },
  amcProviderDetails: { type: String },
  underWarranty: { type: String, required: true },
  needSignalReport: { type: String, required: true },
  interestedInAmc: { type: String, required: true },
  budgetRange: { type: String, required: true },
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

module.exports = mongoose.model('VsatService', VsatServiceSchema);
