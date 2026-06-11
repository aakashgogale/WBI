const mongoose = require('mongoose');

const digitalCampaignSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  name: {
    type: String, // 'E-commerce Platform', 'Mobile Banking App'
    required: true
  },
  platform: {
    type: String, // 'Google Ads - Brand', 'Facebook Campaign', 'LinkedIn Ads'
    required: true
  },
  impressions: {
    type: Number,
    default: 0
  },
  impressionsTrend: {
    type: Number, // percentage change e.g. 10
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  clicksTrend: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  conversionsTrend: {
    type: Number,
    default: 0
  },
  ctr: {
    type: Number, // Percentage 0-100
    default: 0
  },
  ctrTrend: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('DigitalCampaign', digitalCampaignSchema);
