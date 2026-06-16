const mongoose = require('mongoose');

const escrowLedgerSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  sourceType: { type: String, enum: ['job', 'project', 'milestone', 'contract'], required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  grossAmount: { type: Number, required: true },
  heldAmount: { type: Number, required: true },
  releasedAmount: { type: Number, default: 0 },
  refundedAmount: { type: Number, default: 0 },
  
  status: { type: String, enum: ['held', 'partial_release', 'released', 'refunded', 'disputed'], default: 'held' },
  releaseReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('EscrowLedger', escrowLedgerSchema);
