const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed
const ServiceCategory = require('../models/ServiceCategory');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WBI';

const seedData = [
  // --- ENGINEER CATEGORIES ---
  {
    name: 'Digital Solutions',
    description: 'IT services, computer repair, networking & more',
    icon: 'FiMonitor',
    displayOrder: 1,
    isActive: true,
    showOnApp: true,
    roles: ['engineer']
  },
  {
    name: 'Security Solutions',
    description: 'CCTV installation, access control, security systems',
    icon: 'FiShield',
    displayOrder: 2,
    isActive: true,
    showOnApp: true,
    roles: ['engineer']
  },
  {
    name: 'Banking Solutions',
    description: 'ATM installation, maintenance, cash handling',
    icon: 'FiBriefcase',
    displayOrder: 3,
    isActive: true,
    showOnApp: true,
    roles: ['engineer']
  },
  {
    name: 'Energy Solutions',
    description: 'Solar installation, power backup, energy audit',
    icon: 'FiZap',
    displayOrder: 4,
    isActive: true,
    showOnApp: true,
    roles: ['engineer']
  },
  {
    name: 'Healthcare Solutions',
    description: 'Medical equipment, maintenance, support',
    icon: 'FiHeart',
    displayOrder: 5,
    isActive: true,
    showOnApp: true,
    roles: ['engineer']
  },
  {
    name: 'Appliance Solutions',
    description: 'Home appliance repair, installation & service',
    icon: 'FiSettings',
    displayOrder: 6,
    isActive: true,
    showOnApp: true,
    roles: ['engineer']
  },
  {
    name: 'Automation Solutions',
    description: 'Smart home, industrial automation, IoT',
    icon: 'FiCpu',
    displayOrder: 7,
    isActive: true,
    showOnApp: true,
    roles: ['engineer']
  },
  {
    name: 'Fire and Safety',
    description: 'Fire extinguisher, alarm systems, safety audits',
    icon: 'FiAlertCircle',
    displayOrder: 8,
    isActive: true,
    showOnApp: true,
    roles: ['engineer']
  },
  
  // --- WORKER CATEGORIES ---
  {
    name: 'AC Service / Repair',
    description: 'Installation, uninstallation, repair and gas filling',
    icon: 'FiWind',
    displayOrder: 9,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'Washing Machine Repair',
    description: 'Fully automatic, semi-automatic repair and installation',
    icon: 'FiSettings',
    displayOrder: 10,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'Geyser Repair',
    description: 'Water heater installation, service and repair',
    icon: 'FiThermometer',
    displayOrder: 11,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'RO Purifier Service',
    description: 'Installation, filter replacement and repair',
    icon: 'FiDroplet',
    displayOrder: 12,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'Microwave Repair',
    description: 'Diagnosis, spare parts and fixing issues',
    icon: 'FiClock',
    displayOrder: 13,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'Dishwasher Repair',
    description: 'Service and repair for all dishwashers',
    icon: 'FiTool',
    displayOrder: 14,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'LED / TV Repair',
    description: 'Wall mount, panel repair, component level service',
    icon: 'FiMonitor',
    displayOrder: 15,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'Kitchen Chimney Service',
    description: 'Deep cleaning, motor repair and installation',
    icon: 'FiWind',
    displayOrder: 16,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'Refrigerator Repair',
    description: 'Gas charging, compressor replacement, service',
    icon: 'FiBox',
    displayOrder: 17,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  },
  {
    name: 'Cooler Repair',
    description: 'Motor repair, pump replacement and pad change',
    icon: 'FiCloudSnow',
    displayOrder: 18,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected...');
    
    await ServiceCategory.deleteMany({});
    console.log('Old ServiceCategories cleared.');
    
    await ServiceCategory.insertMany(seedData);
    console.log('New ServiceCategories seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
