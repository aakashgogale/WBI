const mongoose = require('mongoose');

const vendorPortfolioSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  clientName: {
    type: String
  },
  serviceType: {
    type: String, // e.g. 'Web Development', 'Mobile App'
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  liveUrl: {
    type: String
  },
  caseStudyUrl: {
    type: String // PDF or external link
  },
  status: {
    type: String,
    enum: ['Published', 'Draft'],
    default: 'Published'
  }
}, { timestamps: true });

module.exports = mongoose.model('VendorPortfolio', vendorPortfolioSchema);
