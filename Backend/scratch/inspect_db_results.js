const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DynamicFormConfig = require('../models/DynamicFormConfig');
const SubService = require('../models/SubService');

async function inspectDb() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB using URI:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Count SubServices and DynamicFormConfigs
    const subServicesCount = await SubService.countDocuments();
    const configsCount = await DynamicFormConfig.countDocuments();
    console.log(`Found ${subServicesCount} SubServices and ${configsCount} DynamicFormConfigs.`);

    // Find all configs
    const configs = await DynamicFormConfig.find().populate('subServiceId');
    console.log('\n--- Dynamic Form Configurations ---');
    for (const config of configs) {
      console.log(`SubService ID: ${config.subServiceId?._id} | Name: ${config.subServiceId?.name}`);
      console.log(`Is Active: ${config.isActive} | Fields Count: ${config.fields?.length}`);
      console.log('Fields:', config.fields?.map(f => `${f.name} (${f.type}${f.isRequired ? '*' : ''})`));
      console.log('-----------------------------------');
    }

    if (configs.length === 0) {
      console.log('No configs found. Printing some subservices so we know their IDs:');
      const subServices = await SubService.find().limit(10);
      for (const ss of subServices) {
        console.log(`ID: ${ss._id} | Name: ${ss.name}`);
      }
    }

  } catch (error) {
    console.error('Inspection failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

inspectDb();
