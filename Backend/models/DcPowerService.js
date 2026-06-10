const mongoose = require('mongoose');

const DcPowerServiceSchema = new mongoose.Schema({
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
  isSiteRemote: { type: String, required: true },
  isSiteCritical: { type: String, required: true },

  // Section 3 - DC Power System Details
  dcSystemType: [{ type: String }],
  equipmentBrand: { type: String, required: true },
  dcVoltageSystem: { type: String, required: true },
  systemCapacity: { type: String },
  numberOfRectifiers: { type: Number, required: true },
  equipmentAge: { type: String, required: true },
  batteryBankConnected: { type: String, required: true },
  batteryTypeAndCapacity: { type: String },

  // Section 4 - Service Type Required
  serviceRequired: [{ type: String }],
  currentStatus: { type: String, required: true },
  faultDescription: { type: String, required: true },
  alarmCode: { type: String },
  issueStartTime: { type: String, required: true },

  // Section 5 - Impact Assessment
  isNetworkDown: { type: String, required: true },
  sitesAffectedCount: { type: Number },
  estimatedDowntime: { type: String },
  isBatteryBackupRunning: { type: String, required: true },
  estimatedBatteryRemaining: { type: String },

  // Section 6 - Visit & Urgency
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  siteAccessAvailable: { type: String, required: true },

  // Section 7 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  needServiceReport: { type: String, required: true },
  needRemoteMonitoring: { type: String, required: true },
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

module.exports = mongoose.model('DcPowerService', DcPowerServiceSchema);
