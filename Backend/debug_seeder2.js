const mongoose = require('mongoose');
require('dotenv').config();

const DigitalServiceCategory = require('./models/DigitalServiceCategory');
const DigitalServiceSubcategory = require('./models/DigitalServiceSubcategory');
const DigitalService = require('./models/DigitalService');
const DigitalServiceOrder = require('./models/DigitalServiceOrder');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const vId = new mongoose.Types.ObjectId("665e12345678901234567890"); 
  
  try {
    let cats = await DigitalServiceCategory.find();
    console.log('Cats found:', cats.length);
    const webCat = cats.find(c => c.name === 'Web Development');
    console.log('webCat:', webCat);

    const s1 = new DigitalService({
      vendorId: vId, categoryId: webCat._id, title: 'Custom Website Development', 
      shortDescription: 'We build fast, responsive and modern websites tailored to your business.',
      basePrice: 15000, status: 'Active', rating: 4.8, totalOrders: 28, totalRevenue: 245000, iconUrl: 'FiCode'
    });
    
    await s1.validate();
    console.log('S1 Validated!');
  } catch (err) {
    console.error('ERROR SEEDING:', err);
  }
  process.exit(0);
}

run();
