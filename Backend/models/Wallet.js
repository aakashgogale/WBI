const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerType: { type: String, enum: ['vendor', 'engineer', 'worker'], required: true },
  
  availableBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  underReviewBalance: { type: Number, default: 0 },
  withdrawnBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  
  currency: { type: String, default: 'INR' }
}, { timestamps: true });

walletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);
