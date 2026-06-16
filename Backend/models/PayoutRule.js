const mongoose = require('mongoose');

const payoutRuleSchema = new mongoose.Schema({
  serviceCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
  subServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubService' }, // Optional, rule can be at category level
  
  paymentType: { type: String, enum: ['one_time', 'project_milestone', 'amc_contract', 'visit_based'], required: true },
  payoutType: { type: String, enum: ['fixed', 'percentage', 'milestone_based', 'visit_based'], required: true },
  
  platformCommissionType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  platformCommissionValue: { type: Number, default: 0 },
  
  vendorShareType: { type: String, enum: ['percentage', 'fixed', 'remainder'], default: 'remainder' },
  vendorShareValue: { type: Number, default: 0 },
  
  engineerShareType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  engineerShareValue: { type: Number, default: 0 },
  
  workerShareType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  workerShareValue: { type: Number, default: 0 },
  
  gstEnabled: { type: Boolean, default: false },
  tdsEnabled: { type: Boolean, default: false },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PayoutRule', payoutRuleSchema);
