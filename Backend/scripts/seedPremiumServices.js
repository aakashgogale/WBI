const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const ServiceCategory = require('../models/ServiceCategory');
const SubService = require('../models/SubService');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.MONGODB_URI;

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
    roles: ['engineer'],
    subServices: [
      { name: 'Web Development', description: 'Custom websites built with modern technologies for your business.', startingPrice: 4999, icon: 'FiCode', rating: 4.8, reviewCount: 128, requiredSkills: ['JavaScript', 'React.js', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'SQL', 'REST APIs', 'Git'], suggestedTools: ['VS Code', 'Git', 'GitHub', 'Postman', 'Docker', 'npm', 'Webpack'] },
      { name: 'App Development', description: 'High-performance mobile apps for iOS and Android platforms.', startingPrice: 7999, icon: 'FiSmartphone', rating: 4.7, reviewCount: 96, requiredSkills: ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Java', 'iOS', 'Android', 'Dart', 'Firebase'], suggestedTools: ['Android Studio', 'Xcode', 'VS Code', 'Flutter SDK', 'Cocoapods'] },
      { name: 'Web Design', description: 'Creative and responsive designs that make your brand stand out.', startingPrice: 3499, icon: 'FiPenTool', rating: 4.8, reviewCount: 74, requiredSkills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'HTML5', 'CSS3', 'TailwindCSS'], suggestedTools: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch'] },
      { name: 'Digital Marketing', description: 'Boost your online presence and reach your target audience effectively.', startingPrice: 2999, icon: 'FiSpeaker', rating: 4.6, reviewCount: 112, requiredSkills: ['SEO', 'Google Ads', 'Facebook Ads', 'Google Analytics', 'Content Writing', 'Copywriting'], suggestedTools: ['Google Analytics', 'Google Ads Manager', 'SEMrush', 'Ahrefs', 'Buffer', 'Mailchimp'] },
      { name: 'CRM', description: 'Streamline your customer relationships and grow your business.', startingPrice: 5999, icon: 'FiMonitor', rating: 4.7, reviewCount: 61, requiredSkills: ['Salesforce', 'HubSpot', 'Zoho CRM', 'API Integration', 'Zapier'], suggestedTools: ['Salesforce Sandbox', 'Data Loader', 'VS Code', 'HubSpot CLI'] }
    ]
  },
  {
    name: 'Banking Solutions',
    slug: 'banking-solutions',
    description: 'Secure ATM, cash management & banking infrastructure services',
    icon: 'FiCreditCard',
    trustPoints: ['Certified Experts', '24/7 Support', 'PAN India Service'],
    displayOrder: 2,
    roles: ['worker', 'engineer'],
    subServices: [
      { name: 'ATM Service', description: 'ATM installation & maintenance support', startingPrice: 4999, icon: 'FiServer', rating: 4.8, reviewCount: 128, requiredSkills: ['ATM Hardware', 'NCR Maintenance', 'Wincor Maintenance', 'Diebold Maintenance', 'Troubleshooting'], suggestedTools: ['NCR Toolkit', 'Multimeter', 'Diebold Diagnostic Key', 'Screwdriver Set', 'Wrench Set'] },
      { name: 'ATM Cassette Service', description: 'Cash cassette repair & replacement service', startingPrice: 2999, icon: 'FiArchive', rating: 4.7, reviewCount: 96, requiredSkills: ['Cassette Calibration', 'Cassette Repair', 'NCR Cassettes', 'Wincor Cassettes'], suggestedTools: ['Cassette Key', 'Calibration Template', 'Precision Screwdriver', 'Cleaning Cloth'] },
      { name: 'Passbook Printer Service', description: 'Passbook kiosk setup & repair service', startingPrice: 3499, icon: 'FiPrinter', rating: 4.8, reviewCount: 74, requiredSkills: ['Thermal Printers', 'Passbook Printers', 'Epson Maintenance', 'PLQ-20 / PLQ-30'], suggestedTools: ['Printer Diagnostic Tool', 'Thermal Head Cleaner', 'Serial Cable', 'Multimeter'] },
      { name: 'Cash Deposit Machine Service', description: 'CDM installation & support service', startingPrice: 5999, icon: 'FiDollarSign', rating: 4.9, reviewCount: 61, requiredSkills: ['CDM Hardware', 'Validator Maintenance', 'Bunch Note Acceptor (BNA)', 'Escrow Repair'], suggestedTools: ['Validator Tester', 'Screwdriver Set', 'Sensor Cleaning Kit', 'Multimeter'] },
      { name: 'POS Service', description: 'POS machine deployment & support', startingPrice: 1999, icon: 'FiCreditCard', rating: 4.7, reviewCount: 53, requiredSkills: ['POS Hardware', 'Pax Terminal', 'Verifone Terminal', 'Ingenico Terminal', 'POS Software'], suggestedTools: ['POS Tester App', 'Cleaning Card', 'Power Adapter', 'Screwdriver'] },
      { name: 'VSAT Service', description: 'Banking network connectivity & VSAT support', startingPrice: 6999, icon: 'FiWifi', rating: 4.8, reviewCount: 46, requiredSkills: ['VSAT Installation', 'RF Alignment', 'Hughes Modem', 'iDirect Modem', 'Network Cabling'], suggestedTools: ['Satellite Finder Meter', 'Coaxial Crimping Tool', 'RG6/RG11 Cable Stripper', 'Compass', 'Inclinometer'] }
    ]
  },
  {
    name: 'Energy Solutions',
    slug: 'energy-solutions',
    description: 'Reliable power & energy infrastructure services for every need',
    icon: 'FiZap',
    trustPoints: ['Energy Experts', 'Fast Response', 'Industry Certified'],
    displayOrder: 3,
    roles: ['worker', 'engineer'],
    subServices: [
      { name: 'Diesel Generator Service', description: 'DG installation, repair & maintenance', startingPrice: 7999, icon: 'FiSettings', rating: 4.9, reviewCount: 128, requiredSkills: ['DG Maintenance', 'Cummins Engines', 'Kirloskar Engines', 'Alternator Repair', 'Control Panel Panel'], suggestedTools: ['Load Bank Tester', 'Engine Diagnostic Tool', 'Oil Filter Wrench', 'Multimeter', 'Pressure Gauge'] },
      { name: 'Battery Service', description: 'Industrial battery maintenance & replacement', startingPrice: 2999, icon: 'FiBatteryCharging', rating: 4.8, reviewCount: 112, requiredSkills: ['Lead Acid Batteries', 'SMF Batteries', 'Lithium-ion Batteries', 'Battery Testing'], suggestedTools: ['Battery Hydrometer', 'Battery Load Tester', 'Digital Multimeter', 'Terminal Cleaning Brush', 'Insulated Wrench'] },
      { name: 'UPS Battery Service', description: 'UPS maintenance & battery replacement', startingPrice: 3999, icon: 'FiBattery', rating: 4.8, reviewCount: 76, requiredSkills: ['UPS System Maintenance', 'APC UPS', 'Emerson UPS', 'Microtek UPS', 'Inverter Repair'], suggestedTools: ['UPS Diagnostic Software', 'Battery Analyzer', 'Multimeter', 'Insulated Screwdrivers', 'Socket Set'] },
      { name: 'EV Service', description: 'EV charging installation & maintenance', startingPrice: 4999, icon: 'FiZap', rating: 4.7, reviewCount: 64, requiredSkills: ['EV Charger Installation', 'DC Fast Charger', 'AC Charger', 'EV Charging Protocol (OCPP)'], suggestedTools: ['EVSE Tester', 'Insulated Gloves', 'Digital Multimeter', 'Torque Wrench', 'Cable Stripper'] },
      { name: 'AC Power System Service', description: 'AC power system installation & maintenance', startingPrice: 5999, icon: 'FiActivity', rating: 4.8, reviewCount: 58, requiredSkills: ['Electrical Wiring', 'AC DB Panel', 'Three Phase Power', 'Circuit Breakers (MCB/MCCB)'], suggestedTools: ['Clamp Meter', 'Wire Stripper', 'Screwdriver Set', 'Insulation Tester (Megger)', 'Line Tester'] },
      { name: 'DC Power System Service', description: 'DC power system installation & maintenance', startingPrice: 5499, icon: 'FiCpu', rating: 4.8, reviewCount: 45, requiredSkills: ['SMPS Rectifier', 'DC DB Panel', 'Busbar Installation', 'Telecom Power Systems'], suggestedTools: ['DC Clamp Meter', 'SMPS Controller Interface', 'Insulated Socket Wrench', 'Multimeter'] }
    ]
  },
  {
    name: 'Healthcare Solutions',
    slug: 'healthcare-solutions',
    description: 'Medical equipment & healthcare infrastructure support services',
    icon: 'FiHeart',
    trustPoints: ['Certified Technicians', 'Healthcare Compliance', 'Fast Resolution'],
    displayOrder: 4,
    roles: ['engineer'],
    subServices: [
      { name: 'Medical Equipment Services', description: 'Equipment installation & repair service', startingPrice: 6999, icon: 'FiActivity', rating: 4.9, reviewCount: 128, requiredSkills: ['X-Ray Machine', 'ECG Monitor', 'Ultrasound Scanner', 'Ventilator Repair', 'Defibrillator'], suggestedTools: ['Patient Simulator', 'Electrical Safety Analyzer', 'Oscilloscope', 'Multimeter', 'Calibration Phantoms'] },
      { name: 'Quality Control Test', description: 'Equipment quality & performance testing', startingPrice: 3999, icon: 'FiCheckSquare', rating: 4.8, reviewCount: 96, requiredSkills: ['Calibration', 'Performance Testing', 'Accuracy Testing', 'Compliance Checks'], suggestedTools: ['Calibration Software', 'Digital Vernier Caliper', 'Reference Standards', 'Stopwatch'] },
      { name: 'Electrical Safety Test', description: 'Electrical safety & compliance testing', startingPrice: 2999, icon: 'FiShield', rating: 4.8, reviewCount: 74, requiredSkills: ['Earth Leakage Test', 'Insulation Resistance', 'Patient Leakage Current', 'EST Analyzer'], suggestedTools: ['EST Analyzer (Electrical Safety Tester)', 'Ground Bond Tester', 'Insulation Tester'] },
      { name: 'Preventive Maintenance', description: 'Regular preventive maintenance service', startingPrice: 4999, icon: 'FiTool', rating: 4.9, reviewCount: 64, requiredSkills: ['Sensor Calibration', 'Filter Replacement', 'Lubrication', 'Diagnostic Run'], suggestedTools: ['Cleaning Brushes', 'Lubricants', 'Vacuum Cleaner', 'Screwdriver Set', 'Filter Kit'] },
      { name: 'Annual Maintenance Contract', description: 'Comprehensive AMC for healthcare equipment', startingPrice: 9999, icon: 'FiFileText', rating: 4.9, reviewCount: 53, requiredSkills: ['AMC Management', 'SLA Tracking', 'Vendor Management', 'Service Logs'], suggestedTools: ['Service Checklist App', 'Laptop', 'Console Cable'] }
    ]
  },
  {
    name: 'Security Solutions',
    slug: 'security-solutions',
    description: 'Advanced security & surveillance systems you can trust',
    icon: 'FiShield',
    trustPoints: ['Security Experts', '24/7 Monitoring', 'Trusted Service'],
    displayOrder: 5,
    roles: ['worker', 'engineer'],
    subServices: [
      { name: 'CCTV Installation', description: 'CCTV camera installation & configuration', startingPrice: 4999, icon: 'FiVideo', rating: 4.8, reviewCount: 128, requiredSkills: ['IP Camera', 'Analog Camera', 'NVR Configuration', 'DVR Configuration', 'Cabling (Cat6/Coaxial)'], suggestedTools: ['BNC/RJ45 Crimping Tool', 'CCTV Tester', 'Ladder', 'Drill Machine', 'Cable Puller'] },
      { name: 'Access Control System', description: 'Access control installation & management', startingPrice: 3999, icon: 'FiLock', rating: 4.7, reviewCount: 96, requiredSkills: ['EM Lock', 'Biometric Lock', 'RFID Reader', 'Access Controller', 'Matrix System'], suggestedTools: ['Multimeter', 'Wire Stripper', 'Figma (for layouts)', 'Door Punch Tool'] },
      { name: 'Biometric Attendance', description: 'Biometric system installation & support', startingPrice: 2599, icon: 'FiUserCheck', rating: 4.8, reviewCount: 74, requiredSkills: ['Fingerprint Scanner', 'Facial Recognition', 'Time & Attendance Software', 'SDK Integration'], suggestedTools: ['Config Utility', 'USB Cable', 'Screwdriver'] },
      { name: 'Alarm System', description: 'Security alarm installation & maintenance', startingPrice: 2499, icon: 'FiBell', rating: 4.8, reviewCount: 64, requiredSkills: ['Intrusion Alarm', 'Motion Sensor', 'Glassbreak Sensor', 'GSM Dialer', 'Panic Button'], suggestedTools: ['Wire Stripper', 'RF Signal Detector', 'Screwdriver Set', 'Double Sided Tape'] },
      { name: 'Video Monitoring', description: 'Remote video monitoring & management', startingPrice: 3499, icon: 'FiMonitor', rating: 4.7, reviewCount: 53, requiredSkills: ['CMS Software', 'Remote Viewing Setup', 'Port Forwarding', 'Cloud Storage Setup'], suggestedTools: ['IP Finder', 'Bandwidth Calculator', 'Laptop'] },
      { name: 'Security Audit', description: 'Security assessment & audit service', startingPrice: 4999, icon: 'FiFileText', rating: 4.8, reviewCount: 45, requiredSkills: ['Vulnerability Check', 'Risk Assessment', 'Compliance Audit', 'Physical Security Audit'], suggestedTools: ['Audit Checksheets', 'Decibel Meter', 'Light Meter'] }
    ]
  },
  {
    name: 'Automation Solutions',
    slug: 'automation-solutions',
    description: 'Smart automation for homes & industries to simplify operations',
    icon: 'FiCpu',
    trustPoints: ['Smart Technology', 'Expert Team', 'Reliable Support'],
    displayOrder: 6,
    roles: ['worker', 'engineer'],
    subServices: [
      { name: 'Smart Home Automation', description: 'Smart home automation solutions', startingPrice: 6999, icon: 'FiHome', rating: 4.8, reviewCount: 128, requiredSkills: ['Smart Lighting', 'Alexa/Google Home Integration', 'Zigbee Devices', 'Z-Wave Devices', 'Smart Locks'], suggestedTools: ['Hub App', 'Multimeter', 'Screwdriver Set', 'RJ45 Crimper'] },
      { name: 'Industrial Automation', description: 'Industrial automation systems & solutions', startingPrice: 12999, icon: 'FiSettings', rating: 4.9, reviewCount: 96, requiredSkills: ['PLC Programming', 'SCADA Design', 'HMI Configuration', 'VFD Commissioning'], suggestedTools: ['PLC Programming Cable', 'Laptop', 'VFD Software', 'Modbus Tester'] },
      { name: 'IoT Solutions', description: 'IoT integration & custom solutions', startingPrice: 5999, icon: 'FiWifi', rating: 4.8, reviewCount: 76, requiredSkills: ['Arduino', 'Raspberry Pi', 'ESP32', 'MQTT Protocol', 'Sensor Interfacing'], suggestedTools: ['Arduino IDE', 'Soldering Iron', 'Multimeter', 'Jumper Wires'] },
      { name: 'Control Panels', description: 'Control panel design & installation', startingPrice: 4999, icon: 'FiGrid', rating: 4.7, reviewCount: 64, requiredSkills: ['Panel Designing', 'AutoCAD Electrical', 'Wiring & Ferrule', 'PLC Panel assembly'], suggestedTools: ['Wire Stripper', 'Ferrule Crimper', 'Cable Cutter', 'Multimeter', 'Drill'] },
      { name: 'Monitoring Systems', description: 'Automation monitoring & management', startingPrice: 3999, icon: 'FiMonitor', rating: 4.8, reviewCount: 58, requiredSkills: ['Modbus Integration', 'BACnet Integration', 'Energy Monitoring', 'Remote Telemetry'], suggestedTools: ['Modbus Poll', 'Network Switch', 'Screwdriver'] },
      { name: 'Integration Services', description: 'System integration & automation support', startingPrice: 6999, icon: 'FiLink', rating: 4.8, reviewCount: 45, requiredSkills: ['System Commissioning', 'API Bridging', 'Protocol Conversion', 'Site Acceptance Test'], suggestedTools: ['Console Cable', 'Serial Converter', 'Laptop'] }
    ]
  },
  {
    name: 'Fire and Safety',
    slug: 'fire-and-safety',
    description: 'Complete fire safety solutions for protection & compliance',
    icon: 'FiAlertTriangle',
    trustPoints: ['Safety First', 'Certified Experts', 'Quick Support'],
    displayOrder: 7,
    roles: ['worker', 'engineer'],
    subServices: [
      { name: 'Fire Alarm System', description: 'Fire alarm installation & maintenance', startingPrice: 4999, icon: 'FiBell', rating: 4.8, reviewCount: 128, requiredSkills: ['Smoke Detector', 'Heat Detector', 'Manual Call Point (MCP)', 'Fire Panel Programming', 'Repeater Panel'], suggestedTools: ['Smoke Detector Tester (Aerosol)', 'Heat Gun', 'Multimeter', 'Panel Key', 'Resistor Kit'] },
      { name: 'Fire Extinguisher Service', description: 'Fire extinguisher installation & servicing', startingPrice: 1999, icon: 'FiCrosshair', rating: 4.9, reviewCount: 96, requiredSkills: ['Refilling Service', 'Hydraulic Testing', 'CO2 Extinguisher', 'DCP Extinguisher', 'Foam Extinguisher'], suggestedTools: ['Hydrotesting Pump', 'Refilling Machine', 'Pressure Gauge', 'CO2 Transfer Hose', 'Extinguisher Seals'] },
      { name: 'Safety Audit', description: 'Fire & safety audit & assessment', startingPrice: 3999, icon: 'FiFileText', rating: 4.9, reviewCount: 76, requiredSkills: ['Fire Safety Audit', 'Exit Path Assessment', 'Fire Drill Execution', 'Compliance Certification'], suggestedTools: ['Safety Checksheet', 'Lux Meter', 'Sound Level Meter'] },
      { name: 'Emergency Systems', description: 'Emergency system installation & maintenance', startingPrice: 4999, icon: 'FiAlertCircle', rating: 4.7, reviewCount: 64, requiredSkills: ['Emergency Exit Lights', 'Public Address (PA) System', 'Talkback System', 'Fire Doors'], suggestedTools: ['Battery Tester', 'Public Address Mic Tester', 'Multimeter'] },
      { name: 'Evacuation Plan', description: 'Evacuation planning & safety training', startingPrice: 2999, icon: 'FiMap', rating: 4.8, reviewCount: 58, requiredSkills: ['Evacuation Map Designing', 'Signage Placement', 'Drill Planning', 'Role Assignment'], suggestedTools: ['Drafting Tool', 'Measuring Tape', 'Signage Kit'] },
      { name: 'Fire Training', description: 'Fire safety training & awareness programs', startingPrice: 2499, icon: 'FiUsers', rating: 4.8, reviewCount: 45, requiredSkills: ['Extinguisher Usage Demo', 'Smoke Simulation', 'First Aid Basics', 'Evacuation Drill Guidance'], suggestedTools: ['Training Pan', 'Co2 Training Cylinders', 'Smoke Generator'] }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Clearing existing SubServices...');
    await SubService.deleteMany({});
    
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
            isActive: true,
            requiredSkills: sub.requiredSkills || [],
            suggestedTools: sub.suggestedTools || []
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
