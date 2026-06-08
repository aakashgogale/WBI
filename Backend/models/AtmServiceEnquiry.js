const mongoose = require('mongoose');

const AtmServiceEnquirySchema = new mongoose.Schema({
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

  // Section 2 - ATM Details
  atmType: { type: String, required: true },
  atmBrand: { type: String, required: true },
  atmModelNumber: { type: String },
  atmTerminalId: { type: String, required: true },
  atmSerialNumber: { type: String },
  numberOfAtms: { type: Number, required: true },

  // Section 3 - Service Type Required
  serviceRequired: { type: String, required: true },
  isAtmWorking: { type: String, required: true },
  issueDescription: { type: String, required: true },
  errorCode: { type: String },
  typeOfFault: { type: String, required: true },

  // Section 4 - ATM Status & History
  issueStartTime: { type: String, required: true },
  atmServiceStatus: { type: String, required: true },
  isCashLoaded: { type: String, required: true },
  lastMaintenanceDone: { type: String },
  existingAmc: { type: String, required: true },
  contractProviderName: { type: String },
  contractExpiryDate: { type: Date },
  underWarranty: { type: String, required: true },

  // Section 5 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String },
  siteContactNumber: { type: String },
  siteSecurityAvailable: { type: String, required: true },
  specialEntryRequirement: { type: String, required: true },

  // Section 6 - Additional Info
  needCompletionReport: { type: String, required: true },
  needSpareParts: { type: String, required: true },
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

module.exports = mongoose.model('AtmServiceEnquiry', AtmServiceEnquirySchema);
