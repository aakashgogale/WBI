const mongoose = require('mongoose');

const installationEnquirySchema = new mongoose.Schema({
  // Client Info
  fullName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  designation: { type: String, required: true },
  city: { type: String, required: true, trim: true },
  siteAddress: { type: String, required: true, trim: true },

  // Site Details
  siteType: { type: String, required: true },
  siteSize: { type: String, required: true },
  numberOfFloors: { type: Number, required: true },
  isSiteOccupied: { type: String, required: true },
  accessRestrictions: { type: String, required: true },

  // Equipment Details
  equipmentType: [{ type: String }],
  totalDevices: { type: Number, required: true },
  equipmentBrand: { type: String },
  equipmentPurchased: { type: String, required: true },
  equipmentCondition: { type: String },

  // Installation Requirements
  typeOfWork: [{ type: String }],
  cablingDone: { type: String, required: true },
  powerSupplyAvailable: { type: String, required: true },
  networkAvailable: { type: String, required: true },
  civilWorkNeeded: { type: String, required: true },
  installationHeight: { type: String },
  installationLocation: { type: String, required: true },

  // Dismantling Requirements (if applicable)
  removeOldEquipment: { type: String },
  disposalPlan: { type: String },
  multipleSites: { type: String },

  // Visit & Timeline
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  siteContactName: { type: String },
  siteContactNumber: { type: String },
  expectedStartDate: { type: String, required: true },
  urgency: { type: String, required: true },

  // Budget & Additional Info
  budgetRange: { type: String, required: true },
  needAmc: { type: String, required: true },
  brandPreference: { type: String },
  source: { type: String, required: true },
  additionalNotes: { type: String },

  // Attachments
  attachments: [{
    url: String,
    filename: String
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['New', 'Site Visit Scheduled', 'Quote Sent', 'In Progress', 'Completed', 'Closed'],
    default: 'New'
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('InstallationEnquiry', installationEnquirySchema);
