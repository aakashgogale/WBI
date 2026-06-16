const mongoose = require('mongoose');
require('dotenv').config();

const OneTimeService = require('./models/OneTimeService');
const ServiceBrand = require('./models/ServiceBrand');
const ServiceIssue = require('./models/ServiceIssue');
const ServicePackage = require('./models/ServicePackage');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://developeranurag12:1N8yD1Z6H7cK0oWp@cluster0.hfglaed.mongodb.net/Appzeto_test?retryWrites=true&w=majority&appName=Cluster0";

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const servicesToSeed = [
      {
        name: 'Microwave Repair',
        slug: 'microwave',
        subtitle: 'Expert microwave repair & service',
        image: 'https://cdn-icons-png.flaticon.com/512/3254/3254098.png',
        brands: ['LG', 'Samsung', 'IFB', 'Panasonic', 'Whirlpool'],
        issues: ['Not heating', 'Plate not rotating', 'Buttons not working', 'Sparking inside', 'Dead/No power']
      },
      {
        name: 'Washing Machine',
        slug: 'washing-machine',
        subtitle: 'Top load & front load washing machine repair',
        image: 'https://cdn-icons-png.flaticon.com/512/8268/8268297.png',
        brands: ['LG', 'Samsung', 'IFB', 'Whirlpool', 'Bosch'],
        issues: ['Water leakage', 'Not draining', 'Making noise', 'Drum not spinning', 'Not turning ON']
      },
      {
        name: 'Geyser Repair',
        slug: 'geyser-repair',
        subtitle: 'Quick and safe water heater repair',
        image: 'https://cdn-icons-png.flaticon.com/512/10006/10006841.png',
        brands: ['Bajaj', 'AO Smith', 'Havells', 'Crompton', 'V-Guard'],
        issues: ['Water not heating', 'Water leakage', 'Shock/Sparking', 'Taking too long to heat']
      },
      {
        name: 'RO Service',
        slug: 'ro-service',
        subtitle: 'Water purifier service & filter change',
        image: 'https://cdn-icons-png.flaticon.com/512/3930/3930491.png',
        brands: ['Kent', 'Aquaguard', 'Pureit', 'Livpure', 'Blue Star'],
        issues: ['Regular service (filter change)', 'Water leakage', 'Bad taste/smell', 'Motor not working']
      },
      {
        name: 'Electrician',
        slug: 'electrician',
        subtitle: 'Professional electrical services at your doorstep',
        image: 'https://cdn-icons-png.flaticon.com/512/8828/8828271.png',
        brands: [],
        issues: ['Switch/Socket repair', 'Fan installation/repair', 'MCB/Fuse issue', 'Wiring problem']
      },
      {
        name: 'Plumber',
        slug: 'plumber',
        subtitle: 'Expert plumbing solutions',
        image: 'https://cdn-icons-png.flaticon.com/512/3030/3030467.png',
        brands: [],
        issues: ['Tap/Faucet leakage', 'Blockage in pipe/drain', 'Flush tank repair', 'Motor/Pump issue']
      },
      {
        name: 'CCTV Repair',
        slug: 'cctv-repair',
        subtitle: 'CCTV installation and maintenance',
        image: 'https://cdn-icons-png.flaticon.com/512/2983/2983792.png',
        brands: ['CP Plus', 'Hikvision', 'Dahua', 'Godrej'],
        issues: ['Camera not working', 'DVR/NVR issue', 'Recording problem', 'New Installation required']
      }
    ];

    for (const svc of servicesToSeed) {
      // Check if service already exists
      let service = await OneTimeService.findOne({ slug: svc.slug });
      
      if (!service) {
        console.log(`Creating service: ${svc.name}`);
        service = await OneTimeService.create({
          name: svc.name,
          slug: svc.slug,
          subtitle: svc.subtitle,
          image: svc.image,
          isActive: true
        });
      }

      const allBrandIds = [];

      // Add Brands
      for (const brandName of svc.brands) {
        let brand = await ServiceBrand.findOne({ serviceId: service._id, brandName });
        if (!brand) {
          brand = await ServiceBrand.create({
            serviceId: service._id,
            brandName,
            isActive: true
          });
        }
        allBrandIds.push(brand._id);
      }

      // Add Issues
      for (const issueTitle of svc.issues) {
        let issue = await ServiceIssue.findOne({ serviceId: service._id, title: issueTitle });
        if (!issue) {
          issue = await ServiceIssue.create({
            serviceId: service._id,
            title: issueTitle,
            brandIds: allBrandIds, // Apply to all brands
            allowMultiple: true,
            isActive: true
          });
        }
      }

      // Create a default package
      const pkgName = 'Basic Visit & Diagnosis';
      let pkg = await ServicePackage.findOne({ serviceId: service._id, name: pkgName });
      if (!pkg) {
        await ServicePackage.create({
          serviceId: service._id,
          name: pkgName,
          description: 'Technician visit charges. Final repair cost will be provided after inspection.',
          price: 299,
          estimatedDuration: '45 mins',
          warranty: '30 Days',
          isRequired: true,
          brandIds: [], // All brands
          issueIds: [] // All issues
        });
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
