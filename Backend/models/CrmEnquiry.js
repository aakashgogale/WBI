const mongoose = require('mongoose');

const crmEnquirySchema = new mongoose.Schema({
  // Section 1: Client Basic Info
  fullName: { type: String, required: [true, 'Full name is required'], trim: true },
  companyName: { type: String, trim: true },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
  },
  phone: { type: String, required: [true, 'Phone number is required'], trim: true },
  city: { type: String, required: [true, 'City/Location is required'], trim: true },

  // Section 2: CRM Project Details
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: [
      'Retail / E-Commerce', 'Real Estate', 'Healthcare / Clinic', 
      'Education / Coaching', 'Manufacturing', 'Service-Based Business', 
      'Finance / Insurance', 'Hospitality / Hotel', 'Other'
    ],
  },
  currentCrm: {
    type: String,
    required: [true, 'Current CRM is required'],
    enum: [
      'None / Managing manually', 'Excel / Google Sheets', 'Salesforce', 
      'Zoho CRM', 'HubSpot', 'Custom Software', 'Other'
    ],
  },
  reasonForCrm: { type: String, required: [true, 'Reason for CRM is required'], trim: true },
  teamSize: {
    type: String,
    required: [true, 'Team size is required'],
    enum: ['Just Me (1)', '2–5', '6–15', '16–50', '50+'],
  },

  // Section 3: Features Required
  coreModules: [{ type: String }],
  customModulesNeeded: { type: String, enum: ['Yes', 'No', 'Not Sure'], default: 'Not Sure' },
  thirdPartyIntegration: { type: String, trim: true },

  // Section 4: Technical Preferences
  deploymentType: {
    type: String,
    required: [true, 'Deployment type is required'],
    enum: ['Cloud / Online (SaaS)', 'On-Premise / Self-Hosted', 'No Preference'],
  },
  needMobileApp: { type: String, enum: ['Yes', 'No'], default: 'No' },
  needDataMigration: { type: String, enum: ['Yes', 'No'], default: 'No' },
  needStaffTraining: { type: String, enum: ['Yes', 'No'], default: 'No' },

  // Section 5: Timeline & Budget
  expectedLaunchDate: { type: Date },
  projectUrgency: { 
    type: String, 
    required: [true, 'Project urgency is required'],
    enum: ['ASAP', 'Within 1 Month', '1–3 Months', 'Flexible'] 
  },
  budgetRange: { 
    type: String, 
    required: [true, 'Budget range is required'],
    enum: [
      'Below ₹25,000', '₹25,000 – ₹75,000', '₹75,000 – ₹1,50,000', 
      '₹1,50,000 – ₹3,00,000', 'Above ₹3,00,000', 'To be discussed'
    ] 
  },
  source: { 
    type: String, 
    required: [true, 'Source is required'],
    enum: ['Social Media', 'Referral', 'Google', 'Other'] 
  },

  // Section 6: Attachments
  attachments: [{
    url: String,
    filename: String,
  }],

  // Admin/System fields
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Contacted', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('CrmEnquiry', crmEnquirySchema);
