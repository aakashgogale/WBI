const mongoose = require('mongoose');

const PassbookPrinterServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  branchNameCode: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  branchAddress: { type: String, required: true },

  // Section 2 - Printer Details
  printerBrand: { type: String, required: true },
  printerModelNumber: { type: String },
  printerSerialNumber: { type: String },
  numberOfPrinters: { type: Number, required: true },
  printerAge: { type: String, required: true },

  // Section 3 - Service Type Required
  serviceRequired: { type: String, required: true },
  printerStatus: { type: String, required: true },
  errorShown: { type: String },
  issueDescription: { type: String, required: true },

  // Section 4 - Maintenance History
  lastServiced: { type: String, required: true },
  existingAmc: { type: String, required: true },
  amcProviderDetails: { type: String }, // if Yes
  underWarranty: { type: String, required: true },
  sparePartsNeeded: { type: String, required: true },
  sparePartsDetails: { type: String }, // if Yes

  // Section 5 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },

  // Section 6 - Additional Info
  needServiceReport: { type: String, required: true },
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

module.exports = mongoose.model('PassbookPrinterService', PassbookPrinterServiceSchema);
