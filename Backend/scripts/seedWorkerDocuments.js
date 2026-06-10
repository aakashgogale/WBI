const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const WorkerDocumentConfig = require('../models/WorkerDocumentConfig');
const WorkerRegistrationConfig = require('../models/WorkerRegistrationConfig');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const documentConfigs = [
  { title: 'Profile Photo', description: 'Clear photograph of your face', key: 'profile_photo', isRequired: true, acceptedFormats: ['image/jpeg', 'image/png'], requiresFrontAndBack: false, order: 1 },
  { title: 'Aadhaar Card', description: 'Clear picture of your Aadhaar card', key: 'aadhaar', isRequired: true, acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'], requiresFrontAndBack: true, order: 2 },
  { title: 'PAN Card', description: 'Clear picture of your PAN card', key: 'pan', isRequired: true, acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'], requiresFrontAndBack: false, order: 3 },
  { title: 'Address Proof', description: 'Voter ID, Driving License, or Utility Bill', key: 'address_proof', isRequired: true, acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'], requiresFrontAndBack: false, order: 4 },
  { title: 'Experience Certificate', description: 'Letter from previous employer or client references', key: 'experience_cert', isRequired: false, acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'], requiresFrontAndBack: false, order: 5 },
  { title: 'Skill Certificate', description: 'Any degree, diploma or skill certification', key: 'skill_cert', isRequired: false, acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'], requiresFrontAndBack: false, order: 6 },
  { title: 'Police Verification', description: 'Recent police verification certificate (Optional)', key: 'police_verification', isRequired: false, acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'], requiresFrontAndBack: false, order: 7 }
];

const stepsConfig = {
  isRegistrationEnabled: true,
  autoApproveWorkers: false,
  steps: [
    { stepNumber: 1, title: 'Personal Info', isActive: true },
    { stepNumber: 2, title: 'Professional Details', isActive: true },
    { stepNumber: 3, title: 'Documents & Banking', isActive: true },
    { stepNumber: 4, title: 'Review & Submit', isActive: true }
  ]
};

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WBI');
    console.log('Connected to MongoDB');

    // 1. Seed Documents
    console.log('Clearing existing document configs...');
    await WorkerDocumentConfig.deleteMany({});
    console.log('Seeding new document configs...');
    await WorkerDocumentConfig.insertMany(documentConfigs);
    console.log(`Successfully seeded ${documentConfigs.length} document configurations.`);

    // 2. Seed Registration Config (Steps)
    console.log('Clearing existing registration config...');
    await WorkerRegistrationConfig.deleteMany({});
    console.log('Seeding new registration config...');
    await WorkerRegistrationConfig.create(stepsConfig);
    console.log('Successfully seeded registration steps configuration.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
