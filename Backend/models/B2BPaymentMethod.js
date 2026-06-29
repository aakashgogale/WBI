const mongoose = require('mongoose');

const b2bPaymentMethodSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BCompany', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['card', 'upi', 'netbanking', 'wallet'], 
    required: true 
  },
  label: { 
    type: String, 
    required: true 
  },
  maskedDetails: { 
    type: String, 
    required: true 
  },
  isPrimary: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

b2bPaymentMethodSchema.index({ companyId: 1 });

module.exports = mongoose.model('B2BPaymentMethod', b2bPaymentMethodSchema);
