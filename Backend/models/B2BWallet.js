const mongoose = require('mongoose');

const b2bWalletSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BCompany', 
    required: true, 
    unique: true 
  },
  balance: { 
    type: Number, 
    default: 0 
  },
  totalTopup: { 
    type: Number, 
    default: 0 
  },
  totalSpent: { 
    type: Number, 
    default: 0 
  },
  pendingDeductions: { 
    type: Number, 
    default: 0 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  autoDeductionEnabled: { 
    type: Boolean, 
    default: true 
  },
  deductionRuleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BDeductionRule' 
  },
  lastUpdatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('B2BWallet', b2bWalletSchema);
