const mongoose = require('mongoose');
require('dotenv').config();

const OneTimeService = require('./models/OneTimeService');

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const services = await OneTimeService.find();
    
    for (const service of services) {
      const name = service.name.toLowerCase();
      
      // AC Service requires everything
      if (name.includes('ac')) {
        service.isBrandRequired = true;
        service.isIssueRequired = true;
      } 
      // Electrician, Plumber, CCTV might skip brand but need issues
      else if (name.includes('plumb') || name.includes('electric') || name.includes('cctv')) {
        service.isBrandRequired = false;
        service.isIssueRequired = true;
      }
      // Appliances like Microwave, TV usually need brand and issue
      else if (name.includes('tv') || name.includes('microwave') || name.includes('washing') || name.includes('refrigerator')) {
        service.isBrandRequired = true;
        service.isIssueRequired = true;
      }
      else {
        // Safe default
        service.isBrandRequired = false;
        service.isIssueRequired = false;
      }

      service.isPackageRequired = true;
      service.allowSchedule = true;
      service.allowBookNow = true;
      service.requiresOTP = true;
      service.requiresLiveTracking = true;
      service.defaultRadiusKm = 10;
      service.assignmentMode = 'auto_wave';
      
      await service.save();
      console.log(`Updated ${service.name} configs. (Brand: ${service.isBrandRequired}, Issue: ${service.isIssueRequired})`);
    }

    console.log('Migration Complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
