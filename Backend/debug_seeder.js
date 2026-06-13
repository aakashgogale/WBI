const mongoose = require('mongoose');
require('dotenv').config();

const DigitalServiceCategory = require('./models/DigitalServiceCategory');
const DigitalServiceSubcategory = require('./models/DigitalServiceSubcategory');
const DigitalService = require('./models/DigitalService');
const DigitalServiceOrder = require('./models/DigitalServiceOrder');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const vId = new mongoose.Types.ObjectId("665e12345678901234567890"); // Fake vendor ID
  
  try {
    let cats = await DigitalServiceCategory.find();
    if (cats.length === 0) {
      cats = await DigitalServiceCategory.insertMany([
        { name: 'Web Development', color: '#10B981', icon: 'FiCode' },
        { name: 'App Development', color: '#3B82F6', icon: 'FiSmartphone' },
        { name: 'CRM Development', color: '#8B5CF6', icon: 'FiDatabase' },
        { name: 'Digital Marketing', color: '#F59E0B', icon: 'FiTrendingUp' },
        { name: 'UI/UX Design', color: '#EC4899', icon: 'FiFigma' },
        { name: 'Maintenance', color: '#6366F1', icon: 'FiTool' },
        { name: 'Others', color: '#6B7280', icon: 'FiLayers' }
      ]);
    }
    console.log('Categories seeded:', cats.length);

    const webCat = cats.find(c => c.name === 'Web Development');
    const s1 = await DigitalService.create({
      vendorId: vId, categoryId: webCat._id, title: 'Custom Website Development', 
      shortDescription: 'We build fast, responsive and modern websites tailored to your business.',
      basePrice: 15000, status: 'Active', rating: 4.8, totalOrders: 28, totalRevenue: 245000, iconUrl: 'FiCode'
    });
    console.log('Service 1 seeded:', s1.title);
  } catch (err) {
    console.error('ERROR SEEDING:', err);
  }
  process.exit(0);
}

run();
