const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ServiceCategory = require('../models/ServiceCategory');
const SubService = require('../models/SubService');

// Load env vars
dotenv.config({ path: '../.env' });

const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/homestr';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected for Seeding');
}).catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

const categories = [
  {
    name: 'Digital Solutions',
    slug: 'digital-solutions',
    description: 'We provide end-to-end digital solutions to help your business grow online.',
    icon: 'FiMonitor',
    trustPoints: ['Expert Team', 'On-time Delivery', 'Quality Service'],
    displayOrder: 1,
    subServices: [
      { name: 'Web Development', description: 'Custom websites built with modern technologies for your business.', startingPrice: 4999, icon: 'FiCode', rating: 4.8, reviewCount: 128 },
      { name: 'App Development', description: 'High-performance mobile apps for iOS and Android platforms.', startingPrice: 7999, icon: 'FiSmartphone', rating: 4.7, reviewCount: 96 },
      { name: 'Web Design', description: 'Creative and responsive designs that make your brand stand out.', startingPrice: 3499, icon: 'FiPenTool', rating: 4.8, reviewCount: 74 },
      { name: 'Digital Marketing', description: 'Boost your online presence and reach your target audience effectively.', startingPrice: 2999, icon: 'FiSpeaker', rating: 4.6, reviewCount: 112 },
      { name: 'CRM', description: 'Streamline your customer relationships and grow your business.', startingPrice: 5999, icon: 'FiMonitor', rating: 4.7, reviewCount: 61 }
    ]
  },
  {
    name: 'Banking Solutions',
    slug: 'banking-solutions',
    description: 'Secure ATM, cash management & banking infrastructure services',
    icon: 'FiCreditCard',
    trustPoints: ['Certified Experts', '24/7 Support', 'PAN India Service'],
    displayOrder: 2,
    subServices: [
      { name: 'ATM Service', description: 'ATM installation & maintenance support', startingPrice: 4999, icon: 'FiServer', rating: 4.8, reviewCount: 128 },
      { name: 'ATM Cassette Service', description: 'Cash cassette repair & replacement service', startingPrice: 2999, icon: 'FiArchive', rating: 4.7, reviewCount: 96 },
      { name: 'Passbook Printer Service', description: 'Passbook kiosk setup & repair service', startingPrice: 3499, icon: 'FiPrinter', rating: 4.8, reviewCount: 74 },
      { name: 'Cash Deposit Machine Service', description: 'CDM installation & support service', startingPrice: 5999, icon: 'FiDollarSign', rating: 4.9, reviewCount: 61 },
      { name: 'POS Service', description: 'POS machine deployment & support', startingPrice: 1999, icon: 'FiCreditCard', rating: 4.7, reviewCount: 53 },
      { name: 'VSAT Service', description: 'Banking network connectivity & VSAT support', startingPrice: 6999, icon: 'FiWifi', rating: 4.8, reviewCount: 46 }
    ]
  },
  {
    name: 'Energy Solutions',
    slug: 'energy-solutions',
    description: 'Reliable power & energy infrastructure services for every need',
    icon: 'FiZap',
    trustPoints: ['Energy Experts', 'Fast Response', 'Industry Certified'],
    displayOrder: 3,
    subServices: [
      { name: 'Diesel Generator Service', description: 'DG installation, repair & maintenance', startingPrice: 7999, icon: 'FiSettings', rating: 4.9, reviewCount: 128 },
      { name: 'Battery Service', description: 'Industrial battery maintenance & replacement', startingPrice: 2999, icon: 'FiBatteryCharging', rating: 4.8, reviewCount: 112 },
      { name: 'UPS Battery Service', description: 'UPS maintenance & battery replacement', startingPrice: 3999, icon: 'FiBattery', rating: 4.8, reviewCount: 76 },
      { name: 'EV Service', description: 'EV charging installation & maintenance', startingPrice: 4999, icon: 'FiZap', rating: 4.7, reviewCount: 64 },
      { name: 'AC Power System Service', description: 'AC power system installation & maintenance', startingPrice: 5999, icon: 'FiActivity', rating: 4.8, reviewCount: 58 },
      { name: 'DC Power System Service', description: 'DC power system installation & maintenance', startingPrice: 5499, icon: 'FiCpu', rating: 4.8, reviewCount: 45 }
    ]
  },
  {
    name: 'Healthcare Solutions',
    slug: 'healthcare-solutions',
    description: 'Medical equipment & healthcare infrastructure support services',
    icon: 'FiHeart',
    trustPoints: ['Certified Technicians', 'Healthcare Compliance', 'Fast Resolution'],
    displayOrder: 4,
    subServices: [
      { name: 'Medical Equipment Services', description: 'Equipment installation & repair service', startingPrice: 6999, icon: 'FiActivity', rating: 4.9, reviewCount: 128 },
      { name: 'Quality Control Test', description: 'Equipment quality & performance testing', startingPrice: 3999, icon: 'FiCheckSquare', rating: 4.8, reviewCount: 96 },
      { name: 'Electrical Safety Test', description: 'Electrical safety & compliance testing', startingPrice: 2999, icon: 'FiShield', rating: 4.8, reviewCount: 74 },
      { name: 'Preventive Maintenance', description: 'Regular preventive maintenance service', startingPrice: 4999, icon: 'FiTool', rating: 4.9, reviewCount: 64 },
      { name: 'Annual Maintenance Contract', description: 'Comprehensive AMC for healthcare equipment', startingPrice: 9999, icon: 'FiFileText', rating: 4.9, reviewCount: 53 }
    ]
  },
  {
    name: 'Security Solutions',
    slug: 'security-solutions',
    description: 'Advanced security & surveillance systems you can trust',
    icon: 'FiShield',
    trustPoints: ['Security Experts', '24/7 Monitoring', 'Trusted Service'],
    displayOrder: 5,
    subServices: [
      { name: 'CCTV Installation', description: 'CCTV camera installation & configuration', startingPrice: 4999, icon: 'FiVideo', rating: 4.8, reviewCount: 128 },
      { name: 'Access Control System', description: 'Access control installation & management', startingPrice: 3999, icon: 'FiLock', rating: 4.7, reviewCount: 96 },
      { name: 'Biometric Attendance', description: 'Biometric system installation & support', startingPrice: 2599, icon: 'FiUserCheck', rating: 4.8, reviewCount: 74 },
      { name: 'Alarm System', description: 'Security alarm installation & maintenance', startingPrice: 2499, icon: 'FiBell', rating: 4.8, reviewCount: 64 },
      { name: 'Video Monitoring', description: 'Remote video monitoring & management', startingPrice: 3499, icon: 'FiMonitor', rating: 4.7, reviewCount: 53 },
      { name: 'Security Audit', description: 'Security assessment & audit service', startingPrice: 4999, icon: 'FiFileText', rating: 4.8, reviewCount: 45 }
    ]
  },
  {
    name: 'Automation Solutions',
    slug: 'automation-solutions',
    description: 'Smart automation for homes & industries to simplify operations',
    icon: 'FiCpu',
    trustPoints: ['Smart Technology', 'Expert Team', 'Reliable Support'],
    displayOrder: 6,
    subServices: [
      { name: 'Smart Home Automation', description: 'Smart home automation solutions', startingPrice: 6999, icon: 'FiHome', rating: 4.8, reviewCount: 128 },
      { name: 'Industrial Automation', description: 'Industrial automation systems & solutions', startingPrice: 12999, icon: 'FiSettings', rating: 4.9, reviewCount: 96 },
      { name: 'IoT Solutions', description: 'IoT integration & custom solutions', startingPrice: 5999, icon: 'FiWifi', rating: 4.8, reviewCount: 76 },
      { name: 'Control Panels', description: 'Control panel design & installation', startingPrice: 4999, icon: 'FiGrid', rating: 4.7, reviewCount: 64 },
      { name: 'Monitoring Systems', description: 'Automation monitoring & management', startingPrice: 3999, icon: 'FiMonitor', rating: 4.8, reviewCount: 58 },
      { name: 'Integration Services', description: 'System integration & automation support', startingPrice: 6999, icon: 'FiLink', rating: 4.8, reviewCount: 45 }
    ]
  },
  {
    name: 'Fire and Safety',
    slug: 'fire-and-safety',
    description: 'Complete fire safety solutions for protection & compliance',
    icon: 'FiAlertTriangle',
    trustPoints: ['Safety First', 'Certified Experts', 'Quick Support'],
    displayOrder: 7,
    subServices: [
      { name: 'Fire Alarm System', description: 'Fire alarm installation & maintenance', startingPrice: 4999, icon: 'FiBell', rating: 4.8, reviewCount: 128 },
      { name: 'Fire Extinguisher Service', description: 'Fire extinguisher installation & servicing', startingPrice: 1999, icon: 'FiCrosshair', rating: 4.9, reviewCount: 96 },
      { name: 'Safety Audit', description: 'Fire & safety audit & assessment', startingPrice: 3999, icon: 'FiFileText', rating: 4.9, reviewCount: 76 },
      { name: 'Emergency Systems', description: 'Emergency system installation & maintenance', startingPrice: 4999, icon: 'FiAlertCircle', rating: 4.7, reviewCount: 64 },
      { name: 'Evacuation Plan', description: 'Evacuation planning & safety training', startingPrice: 2999, icon: 'FiMap', rating: 4.8, reviewCount: 58 },
      { name: 'Fire Training', description: 'Fire safety training & awareness programs', startingPrice: 2499, icon: 'FiUsers', rating: 4.8, reviewCount: 45 }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Clearing existing SubServices...');
    await SubService.deleteMany({});
    
    // We only update/create the specific categories here, we don't delete other categories that might exist
    
    for (const catData of categories) {
      const { subServices, ...catFields } = catData;
      
      console.log(`Processing Category: ${catFields.name}...`);
      
      // Upsert Category
      let category = await ServiceCategory.findOne({ slug: catFields.slug });
      
      if (category) {
        // Update existing
        Object.assign(category, catFields);
        await category.save();
      } else {
        // Create new
        category = await ServiceCategory.create(catFields);
      }
      
      // Create SubServices for this category
      if (subServices && subServices.length > 0) {
        for (let i = 0; i < subServices.length; i++) {
          const sub = subServices[i];
          await SubService.create({
            categoryId: category._id,
            name: sub.name,
            slug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: sub.description,
            icon: sub.icon,
            startingPrice: sub.startingPrice,
            rating: sub.rating,
            reviewCount: sub.reviewCount,
            displayOrder: i + 1,
            isActive: true
          });
        }
        console.log(`Added ${subServices.length} sub-services for ${catFields.name}`);
      }
    }
    
    console.log('✅ Premium Services Data Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
