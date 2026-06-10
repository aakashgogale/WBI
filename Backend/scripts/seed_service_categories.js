const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed
const ServiceCategory = require('../models/ServiceCategory');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WBI';

const seedData = [
  {
    name: 'Digital Solutions',
    description: 'IT services, computer repair, networking & more',
    icon: 'FiMonitor',
    displayOrder: 1,
    isActive: true,
    showOnApp: true
  },
  {
    name: 'Security Solutions',
    description: 'CCTV installation, access control, security systems',
    icon: 'FiShield',
    displayOrder: 2,
    isActive: true,
    showOnApp: true
  },
  {
    name: 'Banking Solutions',
    description: 'ATM installation, maintenance, cash handling',
    icon: 'FiBriefcase',
    displayOrder: 3,
    isActive: true,
    showOnApp: true
  },
  {
    name: 'Energy Solutions',
    description: 'Solar installation, power backup, energy audit',
    icon: 'FiZap',
    displayOrder: 4,
    isActive: true,
    showOnApp: true
  },
  {
    name: 'Healthcare Solutions',
    description: 'Medical equipment, maintenance, support',
    icon: 'FiHeart',
    displayOrder: 5,
    isActive: true,
    showOnApp: true
  },
  {
    name: 'Appliance Solutions',
    description: 'Home appliance repair, installation & service',
    icon: 'FiSettings',
    displayOrder: 6,
    isActive: true,
    showOnApp: true
  },
  {
    name: 'Automation Solutions',
    description: 'Smart home, industrial automation, IoT',
    icon: 'FiCpu',
    displayOrder: 7,
    isActive: true,
    showOnApp: true
  },
  {
    name: 'Fire and Safety',
    description: 'Fire extinguisher, alarm systems, safety audits',
    icon: 'FiAlertCircle',
    displayOrder: 8,
    isActive: true,
    showOnApp: true
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
