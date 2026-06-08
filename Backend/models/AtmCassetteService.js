const mongoose = require('mongoose');

const AtmCassetteServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String },
  employeeId: { type: String },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternateContact: { type: String },
  city: { type: String, required: true },
  branchAddress: { type: String, required: true },

  // Section 2 - ATM & Cassette Details
  atmBrand: { type: String, required: true },
  atmModelNumber: { type: String },
  atmTerminalId: { type: String, required: true },
  numberOfCassettes: { type: String, required: true },
  cassetteDenominations: [{ type: String }],

  // Section 3 - Service Type Required
  serviceRequired: { type: String, required: true },
  cassetteStatus: { type: String, required: true },
  errorCode: { type: String },
  issueDescription: { type: String },

  // Section 4 - Cash Details
  cashLoadingRequired: { type: String },
  cashAmount: { type: String },
  cashProvider: { type: String },
  craAgencyName: { type: String },
  verificationNeeded: { type: String },

  // Section 5 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String },
  siteContactNumber: { type: String },
  securityAvailable: { type: String, required: true },

  // Section 6 - Additional Info
  needBalancingReport: { type: String, required: true },
  needReconciliation: { type: String, required: true },
  interestedInContract: { type: String, required: true },
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

module.exports = mongoose.model('AtmCassetteService', AtmCassetteServiceSchema);
