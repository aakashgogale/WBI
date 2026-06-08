const mongoose = require('mongoose');

const maintenanceEnquirySchema = new mongoose.Schema({
  // Section 1 — Client Info
  fullName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  designation: { type: String, required: true },
  city: { type: String, required: true, trim: true },
  siteAddress: { type: String, required: true, trim: true },

  // Section 2 — Site Details
  siteType: { type: String, required: true },
  siteSize: { type: String, required: true },
  numberOfFloors: { type: Number, required: true },
  numberOfLocations: { type: String, required: true },

  // Section 3 — Equipment Details
  equipmentType: [{ type: String }],
  totalDevices: { type: Number, required: true },
  equipmentBrand: { type: String },
  equipmentAge: { type: String, required: true },
  equipmentWorkingStatus: { type: String, required: true },
  installedByUs: { type: String, required: true },

  // Section 4 — Maintenance History
  maintenanceDoneBefore: { type: String, required: true },
  lastMaintenanceDate: { type: Date },
  lastMaintenanceBy: { type: String },
  existingAmc: { type: String, required: true },
  amcExpiryDate: { type: Date },
  currentAmcProvider: { type: String },
  pendingIssues: { type: String },

  // Section 5 — Maintenance Requirements
  maintenanceNeeded: [{ type: String }],
  maintenanceFrequency: { type: String, required: true },
  detailedReportNeeded: { type: String, required: true },
  sparePartsReplacement: { type: String, required: true },

  // Section 6 — AMC Requirement
  lookingForAmc: { type: String, required: true },
  amcTypePreferred: { type: String },
  amcDurationPreferred: { type: String },
  expectedVisits: { type: String },

  // Section 7 — Visit & Timeline
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  siteContactName: { type: String },
  siteContactNumber: { type: String },
  accessRestrictions: { type: String, required: true },
  bestDayForVisits: { type: String, required: true },

  // Section 8 — Budget & Additional Info
  budgetOneTime: { type: String, required: true },
  budgetAnnualAmc: { type: String, required: true },
  source: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 9 — Attachments
  attachments: [{
    url: String,
    filename: String
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['New', 'Site Visit Scheduled', 'Quote Sent', 'AMC Signed', 'In Progress', 'Completed', 'Closed'],
    default: 'New'
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceEnquiry', maintenanceEnquirySchema);
