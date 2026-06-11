const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  workOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder',
    default: null
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft',
    index: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  notes: String,
  razorpayLink: String,
  razorpayPaymentId: String,
  pdfUrl: String
}, { timestamps: true });

invoiceSchema.pre('validate', function(next) {
  if (!this.invoiceId) {
    const prefix = 'INV';
    const year = new Date().getFullYear();
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    this.invoiceId = `${prefix}-${year}-${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
