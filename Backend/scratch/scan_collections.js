const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin');
const Vendor = require('../models/Vendor');
const Worker = require('../models/Worker');
const Engineer = require('../models/Engineer');
const User = require('../models/User');

const collections = [
  { name: 'Admin', model: Admin },
  { name: 'Vendor', model: Vendor },
  { name: 'Worker', model: Worker },
  { name: 'Engineer', model: Engineer },
  { name: 'User', model: User }
];

async function scan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const col of collections) {
      // Skip Admin phone check if phone doesn't exist
      const query = col.name === 'Admin' ? { email: '6261745842' } : { phone: '6261745842' };
      const count = await col.model.countDocuments(query);
      console.log(`Collection ${col.name} has ${count} match(es) for 6261745842`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

scan();
