const mongoose = require('mongoose');

const b2bDeductionRuleSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BCompany', 
    required: true 
  },
  perJobCharge: { 
    type: Number, 
    required: true,
    default: 12.00
  },
  gstPercent: { 
    type: Number, 
    required: true,
    default: 18
  },
  deductionTiming: { 
    type: String, 
    enum: ['after_job_completion'], 
    default: 'after_job_completion' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: String, 
    default: 'System' 
  },
  updatedBy: { 
    type: String, 
    default: 'System' 
  }
}, { 
  timestamps: true 
});

b2bDeductionRuleSchema.index({ companyId: 1, isActive: 1 });

module.exports = mongoose.model('B2BDeductionRule', b2bDeductionRuleSchema);
