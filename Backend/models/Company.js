const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema({
  // Company Basic Info
  companyName: {
    type: String,
    required: [true, 'Please provide the company name'],
    trim: true
  },
  companyType: {
    type: String,
    enum: ['Pvt Ltd', 'LLP', 'Partnership', 'Proprietorship', 'Other'],
    required: true
  },
  gstNumber: {
    type: String,
    trim: true,
    default: null
  },
  registrationNumber: {
    type: String,
    trim: true,
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  website: {
    type: String,
    trim: true,
    default: null
  },
  logo: {
    type: String,
    default: null
  },
  primaryContact: {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false }
  },
  
  // Company Admin Account
  admin: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['Company Owner', 'HR Manager', 'Operations Head'],
      required: true
    },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false }
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Hash admin password before saving
companySchema.pre('save', async function (next) {
  if (!this.isModified('admin.password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.admin.password = await bcrypt.hash(this.admin.password, salt);
  next();
});

// Compare password method
companySchema.methods.compareAdminPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.admin.password);
};

module.exports = mongoose.model('Company', companySchema);
