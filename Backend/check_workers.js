require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('./models/Worker');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const workers = await Worker.find({});
    console.log(`Found ${workers.length} workers.`);
    workers.forEach(w => {
      console.log(`- ID: ${w._id}`);
      console.log(`  Name: ${w.name}`);
      console.log(`  Status: ${w.status}`);
      console.log(`  Location:`, w.location);
      console.log(`  Approved Services:`, w.approvedOneTimeServices);
      console.log('---');
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
