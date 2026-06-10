const mongoose = require('mongoose');

const qualityControlTestSchema = new mongoose.Schema({
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
  isAccredited: { type: String, required: true },
  qualityTestingRequiredFor: { type: String, required: true },

  // Section 3 - Equipment to be Tested
  equipmentCategory: { type: [String], required: true },
  equipmentNameBrand: { type: String, required: true },
  equipmentModelSerial: { type: String },
  numberOfUnits: { type: Number, required: true },
  equipmentAge: { type: String, required: true },

  // Section 4 - Testing Requirements
  typeOfTestsRequired: { type: [String], required: true },
  needCalibrationCertificates: { type: String, required: true },
  needNablTraceable: { type: String, required: true },
  needDetailedReport: { type: String, required: true },
  reportFormat: { type: String, required: true },
  isReportForAccreditation: { type: String, required: true },

  // Section 5 - Visit & Timeline
  preferredVisitDate: { type: String, required: true },
  preferredTimeSlot: { type: String, required: true },
  workingHoursTesting: { type: String, required: true },
  departmentLocation: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  urgency: { type: String, required: true },

  // Section 6 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  interestedInQcContract: { type: String, required: true },
  interestedInAmc: { type: String, required: true },
  howDidYouHear: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 7 - Attachments
  equipmentList: { type: String },
  previousQcReports: { type: String },
  accreditationRequirements: { type: String },
  equipmentManuals: { type: String },

  // System Fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Completed', 'Cancelled'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('QualityControlTest', qualityControlTestSchema);
