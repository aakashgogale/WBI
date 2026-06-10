const mongoose = require('mongoose');

const DgServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - Site Details
  siteType: { type: String, required: true },
  numberOfDgSets: { type: Number, required: true },
  isSiteCritical: { type: String, required: true },

  // Section 3 - DG Set Details
  dgBrand: { type: String, required: true },
  dgModelNumber: { type: String },
  dgCapacity: { type: String, required: true },
  dgAge: { type: String, required: true },
  lastServiceDate: { type: String },
  currentRunningHours: { type: String },
  fuelType: { type: String },

  // Section 4 - Service Type Required
  serviceRequired: [{ type: String }],
  currentStatus: { type: String, required: true },
  issueDescription: { type: String, required: true },
  errorShown: { type: String },
  issueStartTime: { type: String, required: true },

  // Section 5 - Maintenance History
  existingAmc: { type: String, required: true },
  amcProviderDetails: { type: String },
  underWarranty: { type: String, required: true },
  lastOilChangeDate: { type: String },
  pendingIssues: { type: String },

  // Section 6 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  dgRoomAccess: { type: String, required: true },
  safetyRestriction: { type: String },

  // Section 7 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  needServiceReport: { type: String, required: true },
  needLoadTestReport: { type: String, required: true },
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
    enum: ['New', 'Technician Assigned', 'In Progress', 'Completed', 'Closed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('DgService', DgServiceSchema);
