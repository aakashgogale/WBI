const mongoose = require('mongoose');

const digitalTimeEntrySchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  totalHours: {
    type: Number,
    default: 0
  },
  billableHours: {
    type: Number,
    default: 0
  },
  nonBillableHours: {
    type: Number,
    default: 0
  },
  breakTimeHours: {
    type: Number,
    default: 0
  },
  billableRate: {
    type: Number, // hourly rate
    default: 0
  },
  utilization: {
    type: Number, // percentage
    default: 0
  },
  weekStartDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DigitalTimeEntry', digitalTimeEntrySchema);
