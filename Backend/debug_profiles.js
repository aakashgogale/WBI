const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Worker = require('./models/Worker');
const Engineer = require('./models/Engineer');
const ServiceCategory = require('./models/ServiceCategory');

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to URI:', uri);
    await mongoose.connect(uri);
    console.log('Connected.');

    const categories = await ServiceCategory.find({});
    console.log('\n--- SERVICE CATEGORIES ---');
    categories.forEach(c => {
      console.log(`- Name: "${c.name}", ID: ${c._id}, Roles: ${JSON.stringify(c.roles)}`);
    });

    const workers = await Worker.find({});
    console.log('\n--- WORKERS ---');
    workers.forEach(w => {
      console.log(`Worker: "${w.name}", Phone: "${w.phone}", ServiceCategories: ${JSON.stringify(w.serviceCategories)}, SubServices count: ${w.subServices?.length}`);
    });

    const engineers = await Engineer.find({});
    console.log('\n--- ENGINEERS ---');
    engineers.forEach(e => {
      console.log(`Engineer: "${e.name}", Phone: "${e.phone}", ServiceCategories: ${JSON.stringify(e.serviceCategories)}, SubServices count: ${e.subServices?.length}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
