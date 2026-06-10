const mongoose = require('mongoose');

const workerRegistrationConfigSchema = new mongoose.Schema({
  // Steps configuration
  steps: [{
    stepNumber: Number,
    title: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Global settings
  isRegistrationEnabled: {
    type: Boolean,
    default: true
  },
  autoApproveWorkers: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkerRegistrationConfig', workerRegistrationConfigSchema);
