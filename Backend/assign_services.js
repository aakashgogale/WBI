require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('./models/Worker');
const OneTimeService = require('./models/OneTimeService');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const services = await OneTimeService.find({}, '_id');
    const serviceIds = services.map(s => s._id);
    
    // Assign to all workers to ensure they can receive jobs for testing
    const result = await Worker.updateMany({}, {
      $set: { approvedOneTimeServices: serviceIds }
    });
    
    console.log(`Updated ${result.modifiedCount} workers with all ${serviceIds.length} one-time services.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
