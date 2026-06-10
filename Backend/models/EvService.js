const mongoose = require('mongoose');

const EvServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - EV Details
  evType: { type: String, required: true },
  evBrand: { type: String, required: true },
  evModelAndYear: { type: String, required: true },
  registrationNumber: { type: String },
  numberOfEvs: { type: String },
  batteryCapacity: { type: String },
  approxTotalKm: { type: String },

  // Section 3 - Charging Infrastructure Details
  hasChargerInstalled: { type: String, required: true },
  chargerType: { type: String, required: true },
  chargerBrand: { type: String, required: true },
  numberOfChargingPoints: { type: Number, required: true },

  // Section 4 - Service Type Required
  serviceRequired: [{ type: String }],
  currentIssue: { type: String, required: true },
  faultDescription: { type: String, required: true },
  issueStartTime: { type: String, required: true },

  // Section 5 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  powerSupplyAvailable: { type: String, required: true },
  threePhaseAvailable: { type: String, required: true },

  // Section 6 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  needServiceReport: { type: String, required: true },
  interestedInAmc: { type: String, required: true },
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

module.exports = mongoose.model('EvService', EvServiceSchema);
