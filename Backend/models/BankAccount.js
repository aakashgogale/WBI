const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerType: { type: String, enum: ['vendor', 'engineer', 'worker'], required: true },
  
  accountHolderName: { type: String, required: true },
  accountNumberEncrypted: { type: String, required: true }, // Should be encrypted
  ifsc: { type: String, required: true },
  upiId: { type: String },
  bankName: { type: String },
  branchName: { type: String },
  
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
