const mongoose = require('mongoose');

const b2bWalletTransactionSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BCompany', 
    required: true 
  },
  walletId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BWallet' 
  },
  transactionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  razorpayOrderId: { 
    type: String 
  },
  razorpayPaymentId: { 
    type: String 
  },
  razorpaySignature: { 
    type: String 
  },
  type: { 
    type: String, 
    enum: ['topup', 'job_deduction', 'refund', 'adjustment', 'failed'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  gstAmount: { 
    type: Number, 
    default: 0 
  },
  platformFee: { 
    type: Number, 
    default: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String 
  },
  remark: { 
    type: String 
  },
  relatedJobIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BJob' 
  }],
  invoiceId: { 
    type: String 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

b2bWalletTransactionSchema.index({ companyId: 1 });
b2bWalletTransactionSchema.index({ companyId: 1, date: 1 });
b2bWalletTransactionSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('B2BWalletTransaction', b2bWalletTransactionSchema);
