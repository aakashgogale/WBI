const mongoose = require('mongoose');

const BatteryServiceSchema = new mongoose.Schema({
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
  numberOfBatteryBanks: { type: Number, required: true },
  isSiteCritical: { type: String, required: true },

  // Section 3 - Battery Details
  batteryType: { type: String, required: true },
  batteryBrand: { type: String, required: true },
  batteryCapacity: { type: String, required: true },
  batteryVoltage: { type: String, required: true },
  numberOfUnits: { type: Number, required: true },
  batteryAge: { type: String, required: true },
  connectedTo: { type: String, required: true },

  // Section 4 - Service Type Required
  serviceRequired: [{ type: String }],
  currentStatus: { type: String, required: true },
  issueDescription: { type: String, required: true },
  issueStartTime: { type: String, required: true },

  // Section 5 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },

  // Section 6 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  needHealthReport: { type: String, required: true },
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

module.exports = mongoose.model('BatteryService', BatteryServiceSchema);
