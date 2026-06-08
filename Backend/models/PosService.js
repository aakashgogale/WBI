const mongoose = require('mongoose');

const PosServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - POS Machine Details
  posType: { type: String, required: true },
  posBrand: { type: String, required: true },
  posModelNumber: { type: String },
  terminalId: { type: String, required: true },
  numberOfMachines: { type: Number, required: true },
  linkedBank: { type: String, required: true },

  // Section 3 - Service Type Required
  serviceRequired: { type: String, required: true },
  posStatus: { type: String, required: true },
  errorShown: { type: String },
  issueDescription: { type: String, required: true },
  issueStartTime: { type: String, required: true },

  // Section 4 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },

  // Section 5 - Additional Info
  needServiceReport: { type: String, required: true },
  interestedInAmc: { type: String, required: true },
  budgetRange: { type: String, required: true },
  source: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 6 - Attachments
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

module.exports = mongoose.model('PosService', PosServiceSchema);
