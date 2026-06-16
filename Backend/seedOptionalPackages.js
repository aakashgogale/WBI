const mongoose = require('mongoose');
require('dotenv').config();

const ServicePackage = require('./models/ServicePackage');
const OneTimeService = require('./models/OneTimeService');

const seedPackages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const services = await OneTimeService.find({});
    console.log(`Found ${services.length} services to seed packages for.`);

    // Keep existing packages? Let's just delete all and recreate so it's clean.
    await ServicePackage.deleteMany({});
    console.log('Cleared existing packages');

    let packageCount = 0;

    for (let service of services) {
      // 1. Required Base Package
      await ServicePackage.create({
        serviceId: service._id,
        name: 'Basic Visit & Diagnosis',
        description: 'Technician visit charges. Final repair cost will be provided after inspection.',
        price: 299,
        estimatedDuration: '45 mins',
        warranty: '30 Days',
        isRequired: true,
        isActive: true,
        sortOrder: 1
      });
      packageCount++;

      // 2. Optional Package 1
      await ServicePackage.create({
        serviceId: service._id,
        name: 'General Service',
        description: 'Cleaning, filter check, general inspection',
        price: 399,
        estimatedDuration: '45 mins',
        warranty: '15 Days',
        isRequired: false,
        isActive: true,
        sortOrder: 2
      });
      packageCount++;

      // 3. Optional Package 2
      await ServicePackage.create({
        serviceId: service._id,
        name: 'Gas Refilling / Top up',
        description: 'Top up gas for better performance and cooling',
        price: 899,
        estimatedDuration: '60 mins',
        warranty: '60 Days',
        isRequired: false,
        isActive: true,
        sortOrder: 3
      });
      packageCount++;

      // 4. Optional Package 3
      await ServicePackage.create({
        serviceId: service._id,
        name: 'Deep Cleaning',
        description: 'Indoor & outdoor deep cleaning with jet wash',
        price: 499,
        estimatedDuration: '60 mins',
        warranty: '30 Days',
        isRequired: false,
        isActive: true,
        sortOrder: 4
      });
      packageCount++;

      // 5. Optional Package 4
      await ServicePackage.create({
        serviceId: service._id,
        name: 'PCB Inspection',
        description: 'PCB & electronic component check',
        price: 399,
        estimatedDuration: '45 mins',
        warranty: '15 Days',
        isRequired: false,
        isActive: true,
        sortOrder: 5
      });
      packageCount++;

      // 6. Optional Package 5
      await ServicePackage.create({
        serviceId: service._id,
        name: 'Installation / Uninstall',
        description: 'Complete install or uninstall service',
        price: 799,
        estimatedDuration: '90 mins',
        warranty: '30 Days',
        isRequired: false,
        isActive: true,
        sortOrder: 6
      });
      packageCount++;
      
      // 7. Optional Package 6
      await ServicePackage.create({
        serviceId: service._id,
        name: 'Motor / Pump Service',
        description: 'Motor and pump checking and basic repair',
        price: 249,
        estimatedDuration: '30 mins',
        warranty: '15 Days',
        isRequired: false,
        isActive: true,
        sortOrder: 7
      });
      packageCount++;
    }

    console.log(`Successfully seeded ${packageCount} packages!`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedPackages();
