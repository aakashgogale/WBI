const mongoose = require('mongoose');

const dynamicEnquirySchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubService',
    required: true,
    index: true
  },
  formData: {
    type: mongoose.Schema.Types.Mixed, // Stores the dynamically filled form data as JSON/Map
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['new', 'quoted', 'accepted', 'rejected', 'converted'],
    default: 'new',
    index: true
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  matchingScore: {
    type: Number,
    default: 0
  },
  quotes: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    amount: { type: Number, required: true },
    timeline: { type: String, required: true }, // e.g., "2 days"
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Create a 2dsphere index for location-based vendor matching
dynamicEnquirySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('DynamicEnquiry', dynamicEnquirySchema);
