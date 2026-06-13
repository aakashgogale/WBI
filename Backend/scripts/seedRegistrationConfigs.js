const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const FormConfig = require('../models/FormConfig');
const DocumentRequirement = require('../models/DocumentRequirement');

dotenv.config({ path: path.join(__dirname, '../.env') });

const workerFields = [
  { role: 'worker', formType: 'registration', step: 1, fieldKey: 'name', label: 'Full Name', type: 'text', required: true, order: 1 },
  { role: 'worker', formType: 'registration', step: 1, fieldKey: 'phone', label: 'Mobile Number', type: 'tel', required: true, validation: { pattern: '^[0-9]{10}$', errorMessage: 'Please enter a valid 10-digit phone number' }, order: 2 },
  { role: 'worker', formType: 'registration', step: 1, fieldKey: 'password', label: 'Password', type: 'password', required: true, validation: { min: 6, errorMessage: 'Password must be at least 6 characters' }, order: 3 },
  { role: 'worker', formType: 'registration', step: 1, fieldKey: 'city', label: 'Current City', type: 'text', required: true, order: 4 },
];

const engineerFields = [
  { role: 'engineer', formType: 'registration', step: 1, fieldKey: 'name', label: 'Full Name', type: 'text', required: true, order: 1 },
  { role: 'engineer', formType: 'registration', step: 1, fieldKey: 'phone', label: 'Mobile Number', type: 'tel', required: true, validation: { pattern: '^[0-9]{10}$', errorMessage: 'Please enter a valid 10-digit phone number' }, order: 2 },
  { role: 'engineer', formType: 'registration', step: 1, fieldKey: 'email', label: 'Email Address', type: 'email', required: false, order: 3 },
  { role: 'engineer', formType: 'registration', step: 1, fieldKey: 'password', label: 'Password', type: 'password', required: true, validation: { min: 6, errorMessage: 'Password must be at least 6 characters' }, order: 4 },
  { role: 'engineer', formType: 'registration', step: 2, fieldKey: 'city', label: 'Current City', type: 'text', required: true, order: 5 },
  { role: 'engineer', formType: 'registration', step: 2, fieldKey: 'pincode', label: 'Pin Code', type: 'text', required: true, order: 6 },
  { role: 'engineer', formType: 'registration', step: 3, fieldKey: 'experience', label: 'Years of Experience', type: 'number', required: false, order: 7 },
  { role: 'engineer', formType: 'registration', step: 3, fieldKey: 'qualification', label: 'Highest Qualification', type: 'select', options: [{label:'ITI', value:'ITI'}, {label:'Diploma', value:'Diploma'}, {label:'B.Tech', value:'B.Tech'}, {label:'Other', value:'Other'}], required: false, order: 8 },
  { role: 'engineer', formType: 'registration', step: 3, fieldKey: 'specialization', label: 'Specialization', type: 'text', required: false, order: 9 }
];

async function seedConfigs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await FormConfig.deleteMany({ formType: 'registration' });
    console.log('Cleared existing registration FormConfigs');

    // Drop old indexes
    try {
      await FormConfig.collection.dropIndexes();
      console.log('Dropped old indexes');
    } catch(e) {
      console.log('No indexes to drop or index drop failed', e.message);
    }

    await FormConfig.insertMany([...workerFields, ...engineerFields]);
    console.log('Successfully seeded FormConfigs');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedConfigs();
