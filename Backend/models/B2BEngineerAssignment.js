const mongoose = require('mongoose');

const b2bEngineerAssignmentSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BCompany', 
    required: true 
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'B2BJob',
    required: true
  },
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Engineer',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { 
  timestamps: true 
});

b2bEngineerAssignmentSchema.index({ companyId: 1 });
b2bEngineerAssignmentSchema.index({ engineerId: 1 });
b2bEngineerAssignmentSchema.index({ jobId: 1 });
b2bEngineerAssignmentSchema.index({ companyId: 1, engineerId: 1 });

module.exports = mongoose.model('B2BEngineerAssignment', b2bEngineerAssignmentSchema);
