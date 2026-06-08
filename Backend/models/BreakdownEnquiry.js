const mongoose = require('mongoose');

const breakdownEnquirySchema = new mongoose.Schema({
  // Section 1 — Client Info
  fullName: { type: String, required: true, trim: true },
  companyName: { type: String, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  designation: { type: String, required: true },
  alternateContact: { type: String, required: true },
  city: { type: String, required: true, trim: true },
  siteAddress: { type: String, required: true, trim: true },

  // Section 2 — Site Details
  siteType: { type: String, required: true },
  siteOperational: { type: String, required: true },
  highSecurity: { type: String, required: true },
  floorsAffected: { type: Number, required: true },

  // Section 3 — Breakdown / Fault Details
  equipmentType: [{ type: String }],
  equipmentBrand: { type: String, required: true },
  devicesAffectedCount: { type: Number, required: true },
  faultDescription: { type: String, required: true },
  typeOfIssue: { type: String, required: true },
  breakdownTime: { type: String, required: true },
  beforeBreakdown: { type: String, required: true },
  visibleDamage: { type: String, required: true },
  powerSupplyStatus: { type: String, required: true },

  // Section 4 — Impact Assessment
  devicesAffectedCategory: { type: String, required: true },
  systemDownStatus: { type: String, required: true },
  affectingBusiness: { type: String, required: true },
  securityRisk: { type: String, required: true },
  riskDescription: { type: String },
  happenedBefore: { type: String, required: true },

  // Section 5 — Existing Service Details
  existingAmc: { type: String, required: true },
  amcProviderName: { type: String },
  amcContractNumber: { type: String },
  whyNotContactingAmc: { type: String },
  installedByWbi: { type: String, required: true },
  underWarranty: { type: String, required: true },
  lastServiceDate: { type: Date },

  // Section 6 — Urgency & Visit Details
  urgency: { type: String, required: true },
  preferredVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  siteContactName: { type: String },
  siteContactNumber: { type: String },
  accessRestrictions: { type: String, required: true },
  someoneAvailable: { type: String, required: true },

  // Section 7 — Repair Expectations
  expectedOutcome: { type: String, required: true },
  okayWithSpareCost: { type: String, required: true },
  needJobReport: { type: String, required: true },
  needPhotographs: { type: String, required: true },

  // Section 8 — Budget & Additional Info
  expectedBudget: { type: String, required: true },
  interestedInAmc: { type: String, required: true },
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
    enum: ['New', 'Engineer Assigned', 'In Progress', 'Parts Pending', 'Resolved', 'Closed'],
    default: 'New'
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BreakdownEnquiry', breakdownEnquirySchema);
