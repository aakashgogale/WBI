const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerType: { type: String, enum: ['vendor', 'engineer', 'worker'], required: true },
  
  transactionType: { 
    type: String, 
    enum: ['credit', 'debit', 'hold', 'release', 'withdrawal', 'refund', 'adjustment'], 
    required: true 
  },
  
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  
  sourceType: { type: String, enum: ['job', 'project', 'milestone', 'contract', 'withdrawal'] },
  sourceId: { type: mongoose.Schema.Types.ObjectId },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  
  description: { type: String },
  idempotencyKey: { type: String, unique: true, sparse: true }
}, { timestamps: true });

walletTransactionSchema.index({ ownerId: 1, createdAt: -1 });
walletTransactionSchema.index({ walletId: 1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
