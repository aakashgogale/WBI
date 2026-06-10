const mongoose = require('mongoose');

const AcPowerServiceSchema = new mongoose.Schema({
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
  totalConnectedLoad: { type: String, required: true },
  numberOfFloors: { type: Number },
  isSiteCritical: { type: String, required: true },
  powerSupplyType: { type: String, required: true },

  // Section 3 - AC Power System Details
  equipmentType: [{ type: String }],
  equipmentBrand: { type: String, required: true },
  equipmentCapacity: { type: String },
  equipmentAge: { type: String, required: true },

  // Section 4 - Service Type Required
  serviceRequired: [{ type: String }],
  currentStatus: { type: String, required: true },
  faultDescription: { type: String, required: true },
  errorShown: { type: String },
  issueStartTime: { type: String, required: true },

  // Section 5 - Safety & Compliance
  trippingOccurred: { type: String, required: true },
  burningSmellNoticed: { type: String, required: true },
  visibleDamage: { type: String, required: true },
  lastInspectionDate: { type: String },
  needComplianceCert: { type: String, required: true },

  // Section 6 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  electricalRoomAccess: { type: String, required: true },

  // Section 7 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  needThermographyReport: { type: String, required: true },
  needEnergyAudit: { type: String, required: true },
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

module.exports = mongoose.model('AcPowerService', AcPowerServiceSchema);
