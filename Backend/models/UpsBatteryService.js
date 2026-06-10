const mongoose = require('mongoose');

const UpsBatteryServiceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - UPS Details
  upsBrand: { type: String, required: true },
  upsModelNumber: { type: String },
  upsCapacity: { type: String, required: true },
  upsType: { type: String, required: true },
  upsAge: { type: String, required: true },
  numberOfUpsUnits: { type: Number, required: true },
  connectedEquipment: { type: String, required: true },

  // Section 3 - Battery Details
  batteryBrand: { type: String, required: true },
  batteryType: { type: String, required: true },
  numberOfBatteries: { type: String, required: true },
  batteryAge: { type: String, required: true },
  lastBatteryReplacement: { type: String },

  // Section 4 - Service Type Required
  serviceRequired: [{ type: String }],
  currentStatus: { type: String, required: true },
  errorDescription: { type: String, required: true },
  issueStartTime: { type: String, required: true },

  // Section 5 - Impact Assessment
  affectedEquipment: { type: String, required: true },
  isBusinessAffected: { type: String, required: true },
  isDataAtRisk: { type: String, required: true },

  // Section 6 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  upsRoomAccess: { type: String, required: true },

  // Section 7 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  needHealthReport: { type: String, required: true },
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

module.exports = mongoose.model('UpsBatteryService', UpsBatteryServiceSchema);
