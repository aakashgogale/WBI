const mongoose = require('mongoose');

const hcAmcSchema = new mongoose.Schema({
  // Section 1 - Client Info
  fullName: { type: String, required: true },
  organizationName: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  alternateContact: { type: String },
  city: { type: String, required: true },
  siteAddress: { type: String, required: true },

  // Section 2 - Facility Details
  facilityType: { type: String, required: true },
  facilitySize: { type: String, required: true },
  departmentsCount: { type: Number, required: true },
  branchesCount: { type: String, required: true },
  isAccredited: { type: String, required: true },
  totalEquipmentCount: { type: Number, required: true },

  // Section 3 - Equipment to be Covered Under AMC
  equipmentCategory: { type: [String], required: true },
  equipmentBrands: { type: String, required: true },
  equipmentAgeRange: { type: String, required: true },
  inventoryAvailable: { type: String, required: true },
  equipmentNotWorking: { type: String, required: true },

  // Section 4 - AMC Type & Coverage
  amcTypeRequired: { type: String, required: true },
  coverageRequired: { type: [String], required: true },
  responseTimeExpected: { type: String, required: true },
  pmVisitsPerYear: { type: String, required: true },

  // Section 5 - Current AMC Status
  haveExistingAmc: { type: String, required: true },
  currentAmcProvider: { type: String },
  amcExpiryDate: { type: String },
  whySwitching: { type: String },
  maintainedByOem: { type: String, required: true },
  pendingBreakdowns: { type: String, required: true },
  breakdownCallsLastYear: { type: String, required: true },

  // Section 6 - Compliance & Documentation
  needNabhRecords: { type: String, required: true },
  needCalibrationCertificates: { type: String, required: true },
  needSafetyTestCertificates: { type: String, required: true },
  needEquipmentHistory: { type: String, required: true },
  needMisReports: { type: String, required: true },
  needDedicatedEngineer: { type: String, required: true },

  // Section 7 - AMC Duration & Start Date
  preferredAmcStartDate: { type: String, required: true },
  amcDurationRequired: { type: String, required: true },
  preAmcInspectionNeeded: { type: String, required: true },

  // Section 8 - Budget & Additional Info
  annualAmcBudget: { type: String, required: true },
  paymentPreference: { type: String, required: true },
  howDidYouHear: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 9 - Attachments
  equipmentInventoryList: { type: String },
  existingAmcContract: { type: String },
  nabhChecklist: { type: String },
  equipmentPhotos: { type: String },
  previousServiceReports: { type: String },

  // System Fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Completed', 'Cancelled'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('HcAmc', hcAmcSchema);
