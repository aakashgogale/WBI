const mongoose = require('mongoose');

const CdmServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  branchNameCode: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternateContact: { type: String },
  city: { type: String, required: true },
  branchAddress: { type: String, required: true },

  // Section 2 - CDM Details
  cdmBrand: { type: String, required: true },
  cdmModelNumber: { type: String },
  terminalId: { type: String, required: true },
  cdmType: { type: String, required: true },
  numberOfMachines: { type: Number, required: true },

  // Section 3 - Service Type Required
  serviceRequired: { type: String, required: true },
  machineStatus: { type: String, required: true },
  errorCode: { type: String },
  issueDescription: { type: String, required: true },
  issueStartTime: { type: String, required: true },

  // Section 4 - Machine Status
  cashStuck: { type: String, required: true },
  cashAmountStuck: { type: String },
  lastReconciliation: { type: String },
  lastMaintenance: { type: String },
  existingAmc: { type: String, required: true },
  amcProviderDetails: { type: String },
  underWarranty: { type: String, required: true },

  // Section 5 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  securityAvailable: { type: String, required: true },

  // Section 6 - Additional Info
  needCompletionReport: { type: String, required: true },
  needReconciliationDoc: { type: String, required: true },
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

module.exports = mongoose.model('CdmService', CdmServiceSchema);
