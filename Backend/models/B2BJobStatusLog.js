const mongoose = require('mongoose');

const b2bJobStatusLogSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'B2BJob', 
    required: true 
  },
  status: { 
    type: String, 
    required: true 
  },
  updatedBy: { 
    type: String, 
    default: 'System' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

b2bJobStatusLogSchema.index({ jobId: 1 });

module.exports = mongoose.model('B2BJobStatusLog', b2bJobStatusLogSchema);
