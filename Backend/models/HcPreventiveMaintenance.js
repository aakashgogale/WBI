const mongoose = require('mongoose');

const hcPreventiveMaintenanceSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - Facility Details
  facilityType: { type: String, required: true },
  facilitySize: { type: String, required: true },
  departmentsCount: { type: Number, required: true },
  locationsCount: { type: String, required: true },
  isAccredited: { type: String, required: true },

  // Section 3 - Equipment Details
  equipmentCategory: { type: [String], required: true },
  totalUnits: { type: Number, required: true },
  equipmentBrands: { type: String, required: true },
  equipmentAgeRange: { type: String, required: true },
  equipmentListAvailable: { type: String, required: true },

  // Section 4 - Maintenance History
  isPmCurrentlyDone: { type: String, required: true },
  whoIsDoingPm: { type: String },
  lastPmDoneDate: { type: String },
  anyExistingAmc: { type: String, required: true },
  providerExpiryDate: { type: String },
  currentIssues: { type: String },
  breakdownCallsPerMonth: { type: String },

  // Section 5 - Maintenance Requirements
  maintenanceActivitiesNeeded: { type: [String], required: true },
  maintenanceFrequency: { type: String, required: true },
  needPmReportAfterVisit: { type: String, required: true },
  needEquipmentHistory: { type: String, required: true },

  // Section 6 - Visit & Timeline
  preferredFirstVisitDate: { type: String, required: true },
  preferredTimeSlot: { type: String, required: true },
  workingHoursMaintenance: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  accessRestriction: { type: String, required: true },
  urgency: { type: String, required: true },

  // Section 7 - Budget & Additional Info
  budgetPerVisit: { type: String, required: true },
  interestedInFullAmc: { type: String, required: true },
  howDidYouHear: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 8 - Attachments
  equipmentList: { type: String },
  existingAmcContract: { type: String },
  previousPmReports: { type: String },
  nabhChecklist: { type: String },

  // System Fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Completed', 'Cancelled'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('HcPreventiveMaintenance', hcPreventiveMaintenanceSchema);
