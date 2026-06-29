const mongoose = require('mongoose');

const b2bInvoiceSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BCompany', 
    required: true 
  },
  invoiceId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  invoiceNumber: { 
    type: String 
  },
  invoiceType: { 
    type: String,
    enum: ['topup', 'deduction', 'monthly'],
    default: 'monthly'
  },
  billingPeriod: { 
    type: String 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  gstAmount: { 
    type: Number,
    default: 0
  },
  totalAmount: { 
    type: Number,
    default: 0
  },
  fileUrl: { 
    type: String 
  },
  status: { 
    type: String, 
    default: 'Pending' 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

b2bInvoiceSchema.index({ companyId: 1 });

module.exports = mongoose.model('B2BInvoice', b2bInvoiceSchema);
