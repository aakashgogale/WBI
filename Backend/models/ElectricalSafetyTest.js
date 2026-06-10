const mongoose = require('mongoose');

const electricalSafetyTestSchema = new mongoose.Schema({
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
  testingRequiredFor: { type: String, required: true },

  // Section 3 - Equipment to be Tested
  equipmentCategory: { type: [String], required: true },
  equipmentNameBrand: { type: String, required: true },
  numberOfUnits: { type: Number, required: true },
  equipmentAgeLastTested: { type: String },

  // Section 4 - Electrical Safety Testing Requirements
  typeOfTestsRequired: { type: [String], required: true },
  applicableStandard: { type: String, required: true },
  needTestCertificates: { type: String, required: true },
  needNablTraceable: { type: String, required: true },
  needPassFailStatus: { type: String, required: true },
  reportFormat: { type: String, required: true },
  isReportForNabh: { type: String, required: true },

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
  interestedInAnnualContract: { type: String, required: true },
  interestedInAmc: { type: String, required: true },
  howDidYouHear: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 7 - Attachments
  equipmentList: { type: String },
  previousTestReports: { type: String },
  nabhChecklist: { type: String },
  incidentReport: { type: String },

  // System Fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Completed', 'Cancelled'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('ElectricalSafetyTest', electricalSafetyTestSchema);
