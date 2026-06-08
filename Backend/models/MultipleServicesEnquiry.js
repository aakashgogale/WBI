const mongoose = require('mongoose');

const MultipleServicesEnquirySchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  companyName: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  designation: { type: String, required: true },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - Services Required
  servicesNeeded: [{ type: String }],
  priorityService: { type: String, required: true },
  servicesDescription: { type: String },

  // Section 3 - Site Details
  siteType: { type: String, required: true },
  numberOfSites: { type: String, required: true },
  siteSize: { type: String, required: true },
  numberOfFloors: { type: Number, required: true },
  siteOperational: { type: String, required: true },

  // Section 4 - Equipment Overview
  equipmentInvolved: [{ type: String }],
  approximateTotalDevices: { type: Number, required: true },
  equipmentBrand: { type: String },

  // Section 5 - Visit & Timeline
  preferredSiteVisitDate: { type: Date },
  preferredTimeSlot: { type: String, required: true },
  siteContactName: { type: String },
  siteContactNumber: { type: String },
  projectUrgency: { type: String, required: true },

  // Section 6 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  needCombinedAmc: { type: String, required: true },
  needSinglePointOfContact: { type: String, required: true },
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
    enum: ['New', 'Site Visit Scheduled', 'Proposal Sent', 'Under Negotiation', 'Implementation', 'Completed', 'Closed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('MultipleServicesEnquiry', MultipleServicesEnquirySchema);
