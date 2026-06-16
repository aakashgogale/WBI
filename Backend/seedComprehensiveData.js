const mongoose = require('mongoose');
require('dotenv').config();

const OneTimeService = require('./models/OneTimeService');
const ServiceBrand = require('./models/ServiceBrand');
const ServiceIssue = require('./models/ServiceIssue');
const ServicePackage = require('./models/ServicePackage');

// Specific issues and packages for each major category
const serviceDataMap = {
  'AC': {
    issues: ['Not cooling', 'Water leakage', 'Unusual noise', 'Bad smell', 'AC not turning ON', 'Gas leakage'],
    packages: [
      { name: 'General Service', price: 399, req: false, desc: 'Cleaning, filter check, general inspection' },
      { name: 'Deep Cleaning (Foam Wash)', price: 699, req: false, desc: 'Advanced foam jet wash for indoor and outdoor units' },
      { name: 'Gas Refilling', price: 2499, req: false, desc: 'Complete gas leak fix and refill for optimal cooling' },
      { name: 'PCB Repair/Inspection', price: 799, req: false, desc: 'PCB & electronic component check and repair' },
      { name: 'Installation', price: 1199, req: false, desc: 'Complete AC installation service' }
    ]
  },
  'Cooler': {
    issues: ['Not cooling properly', 'Pump not working', 'Water leakage', 'Fan not working', 'Bad smell', 'Rust/Body damage'],
    packages: [
      { name: 'General Cooler Service', price: 299, req: false, desc: 'Basic cleaning and grass pad check' },
      { name: 'Pump Replacement', price: 450, req: false, desc: 'New water pump installation' },
      { name: 'Deep Cleaning & Painting', price: 899, req: false, desc: 'Rust removal, deep cleaning and fresh paint' },
      { name: 'Motor Repair/Winding', price: 999, req: false, desc: 'Cooler main fan motor repair' }
    ]
  },
  'Microwave': {
    issues: ['Not heating', 'Buttons not working', 'Turntable not rotating', 'Sparks inside', 'Display dead', 'Door not closing'],
    packages: [
      { name: 'Magnetron Replacement', price: 1899, req: false, desc: 'Replace faulty magnetron (heating element)' },
      { name: 'Keypad/Touchpad Repair', price: 699, req: false, desc: 'Fix unresponsive buttons and membrane' },
      { name: 'Turntable Motor Fix', price: 499, req: false, desc: 'Repair or replace rotating plate motor' },
      { name: 'Deep Oven Cleaning', price: 349, req: false, desc: 'Grease and stain removal inside microwave' }
    ]
  },
  'Geyser': {
    issues: ['Water not heating', 'Water leakage', 'Shock coming', 'Auto-cut not working', 'Taking too long to heat'],
    packages: [
      { name: 'Heating Element Repair', price: 899, req: false, desc: 'Fix or replace internal heating coil' },
      { name: 'Thermostat Replacement', price: 599, req: false, desc: 'Fix auto-cut heating issue' },
      { name: 'Tank Descaling & Cleaning', price: 449, req: false, desc: 'Hard water scale removal from tank' },
      { name: 'Installation / Uninstallation', price: 399, req: false, desc: 'Safe mounting or dismounting of Geyser' }
    ]
  },
  'Washing Machine': {
    issues: ['Drum not spinning', 'Water not draining', 'Making loud noise', 'Not taking water', 'Clothes tearing', 'Door locked'],
    packages: [
      { name: 'Drain Pump Replacement', price: 799, req: false, desc: 'Fix water draining issues' },
      { name: 'Drum Deep Cleaning', price: 599, req: false, desc: 'Chemical wash for inner tub scale and lint removal' },
      { name: 'Motor/Belt Repair', price: 1299, req: false, desc: 'Main driving motor or belt fix' },
      { name: 'Inlet Valve Fix', price: 499, req: false, desc: 'Fix water filling issues' }
    ]
  },
  'RO': {
    issues: ['Filter change needed', 'Water tastes bad', 'Machine making noise', 'Not turning ON', 'Water leaking', 'Slow purification'],
    packages: [
      { name: 'Filter Change (Basic)', price: 599, req: false, desc: 'Pre-filter and sediment filter replacement' },
      { name: 'Complete Kit Replacement', price: 2499, req: false, desc: 'RO membrane, UV, UF and carbon filter change' },
      { name: 'General RO Service', price: 399, req: false, desc: 'TDS check, tank cleaning and flow check' },
      { name: 'Motor / Pump Repair', price: 1199, req: false, desc: 'Pressure booster pump repair' }
    ]
  },
  'Electrician': {
    issues: ['Short circuit', 'Wiring issue', 'Switch/Socket installation', 'Fan fixing', 'Inverter setup', 'MCB tripping repeatedly'],
    packages: [
      { name: 'Switch/Socket Fix', price: 149, req: false, desc: 'Replace or install new switches (up to 3)' },
      { name: 'Fan Installation', price: 299, req: false, desc: 'Ceiling or exhaust fan setup' },
      { name: 'MCB Replacement', price: 399, req: false, desc: 'Main circuit breaker diagnosis and fix' },
      { name: 'Inverter Installation', price: 699, req: false, desc: 'Complete wiring setup for new inverter' }
    ]
  },
  'Plumber': {
    issues: ['Tap leaking', 'Pipe burst', 'Drain blocked', 'Toilet tank issue', 'Washbasin installation', 'Motor pump repair'],
    packages: [
      { name: 'Tap/Mixer Fix', price: 199, req: false, desc: 'Spindle change or new tap installation' },
      { name: 'Drain Unblocking', price: 349, req: false, desc: 'Clear blockage in kitchen/bathroom drain' },
      { name: 'Toilet Flush Repair', price: 450, req: false, desc: 'Fix running toilet or broken flush system' },
      { name: 'Jet Pump Service', price: 249, req: false, desc: 'Water jet pump checking' }
    ]
  },
  'CCTV': {
    issues: ['Camera not showing', 'DVR beeping', 'Recording not saving', 'Night vision issue', 'Network offline', 'New installation'],
    packages: [
      { name: 'DVR/NVR Diagnosis', price: 499, req: false, desc: 'Check hard drive, recording, and network' },
      { name: 'Camera Focus/Wiring Fix', price: 299, req: false, desc: 'Fix blurry vision or broken BNC connectors' },
      { name: 'Hard Drive Replacement', price: 399, req: false, desc: 'Install new storage drive (drive cost extra)' },
      { name: 'New Camera Setup', price: 599, req: false, desc: 'Install and configure new CCTV camera' }
    ]
  }
};

const seedDynamicData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for Comprehensive Seeding');

    // Fetch all existing OneTimeServices
    const services = await OneTimeService.find({});
    console.log(`Found ${services.length} services.`);

    // Clear old issues and packages to avoid duplicates
    await ServiceIssue.deleteMany({});
    await ServicePackage.deleteMany({});
    console.log('Cleared old Issues and Packages completely.');

    let issueCount = 0;
    let packageCount = 0;

    for (let service of services) {
      // Find matching category data based on name keyword
      let categoryData = null;
      for (const [key, data] of Object.entries(serviceDataMap)) {
        if (service.name.toLowerCase().includes(key.toLowerCase())) {
          categoryData = data;
          break;
        }
      }

      // If no match found, use a fallback
      if (!categoryData) {
        categoryData = {
          issues: ['Not working properly', 'Making noise', 'Needs servicing', 'Broken parts'],
          packages: [
            { name: 'General Service', price: 399, req: false, desc: 'Standard diagnosis and minor fixes' },
            { name: 'Deep Repair', price: 999, req: false, desc: 'Major component replacement or repair' }
          ]
        };
      }

      // 1. Create Issues
      for (let issueName of categoryData.issues) {
        await ServiceIssue.create({
          serviceId: service._id,
          title: issueName,
          isActive: true
        });
        issueCount++;
      }

      // 2. Create Base Required Package (Visit Charge)
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

      // 3. Create Specific Optional Packages
      let sortIndex = 2;
      for (let pkg of categoryData.packages) {
        await ServicePackage.create({
          serviceId: service._id,
          name: pkg.name,
          description: pkg.desc,
          price: pkg.price,
          estimatedDuration: '60 mins',
          warranty: '30 Days',
          isRequired: false,
          isActive: true,
          sortOrder: sortIndex
        });
        packageCount++;
        sortIndex++;
      }
    }

    console.log(`Successfully seeded ${issueCount} unique Issues and ${packageCount} unique Packages!`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDynamicData();
