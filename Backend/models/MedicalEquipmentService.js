const mongoose = require('mongoose');

const medicalEquipmentServiceSchema = new mongoose.Schema({
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
  isOperational24x7: { type: String, required: true },

  // Section 3 - Equipment Details
  equipmentCategory: { type: [String], required: true },
  equipmentName: { type: String, required: true },
  equipmentBrand: { type: String, required: true },
  equipmentModel: { type: String },
  equipmentSerial: { type: String },
  numberOfUnits: { type: Number, required: true },
  equipmentAge: { type: String, required: true },
  purchasedFrom: { type: String, required: true },

  // Section 4 - Service Type Required
  serviceRequired: { type: [String], required: true },
  currentStatus: { type: String, required: true },
  faultDescription: { type: String },
  errorCode: { type: String },
  issueStartDate: { type: String },

  // Section 5 - Installation Details
  isRoomReady: { type: String },
  isPowerReady: { type: String },
  specialPowerNeeded: { type: String },
  plumbingGasNeeded: { type: String },
  civilPreparationNeeded: { type: String },
  itConnectivityNeeded: { type: String },

  // Section 6 - Compliance & Certification
  needInstallationCertificate: { type: String },
  needNabhDocumentation: { type: String },
  needUserTraining: { type: String },
  needOperatorManual: { type: String },

  // Section 7 - Visit & Urgency
  preferredVisitDate: { type: String, required: true },
  preferredTimeSlot: { type: String, required: true },
  urgency: { type: String, required: true },
  siteContactName: { type: String, required: true },
  siteContactNumber: { type: String, required: true },
  departmentLocation: { type: String, required: true },
  accessRestriction: { type: String, required: true },

  // Section 8 - Budget & Additional Info
  budgetRange: { type: String, required: true },
  sparePartsReplacement: { type: String },
  interestedInAmc: { type: String, required: true },
  howDidYouHear: { type: String, required: true },
  additionalNotes: { type: String },

  // Section 9 - Attachments
  equipmentPhotos: { type: String },
  errorScreenshots: { type: String },
  equipmentManual: { type: String },
  previousServiceReport: { type: String },
  purchaseInvoice: { type: String },

  // System Fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Completed', 'Cancelled'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicalEquipmentService', medicalEquipmentServiceSchema);
