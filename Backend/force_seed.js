const mongoose = require('mongoose');
require('dotenv').config();

const Vendor = require('./models/Vendor');
const DigitalServiceCategory = require('./models/DigitalServiceCategory');
const DigitalServiceSubcategory = require('./models/DigitalServiceSubcategory');
const DigitalService = require('./models/DigitalService');
const DigitalServiceOrder = require('./models/DigitalServiceOrder');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  try {
    const vendors = await Vendor.find();
    console.log(`Found ${vendors.length} vendors.`);

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
      console.log('Inserted global categories.');

      const webCat = cats.find(c => c.name === 'Web Development');
      await DigitalServiceSubcategory.insertMany([
        { categoryId: webCat._id, name: 'Business Website' },
        { categoryId: webCat._id, name: 'Corporate Website' },
        { categoryId: webCat._id, name: 'Ecommerce Website' }
      ]);
    } else {
      console.log('Categories already exist.');
    }

    for (const vendor of vendors) {
      const vId = vendor._id;
      const serviceCount = await DigitalService.countDocuments({ vendorId: vId });
      
      if (serviceCount === 0) {
        console.log(`Seeding services for vendor: ${vendor.vendorName || vendor._id}`);
        
        const webCat = cats.find(c => c.name === 'Web Development');
        const s1 = await DigitalService.create({
          vendorId: vId, categoryId: webCat._id, title: 'Custom Website Development', 
          shortDescription: 'We build fast, responsive and modern websites tailored to your business.',
          basePrice: 15000, status: 'Active', rating: 4.8, totalOrders: 28, totalRevenue: 245000, iconUrl: 'FiCode'
        });

        const appCat = cats.find(c => c.name === 'App Development');
        const s2 = await DigitalService.create({
          vendorId: vId, categoryId: appCat._id, title: 'Mobile App Development', 
          shortDescription: 'Native & cross-platform mobile apps for iOS and Android.',
          basePrice: 45000, status: 'Active', rating: 4.7, totalOrders: 22, totalRevenue: 310000, iconUrl: 'FiSmartphone'
        });

        const crmCat = cats.find(c => c.name === 'CRM Development');
        const s3 = await DigitalService.create({
          vendorId: vId, categoryId: crmCat._id, title: 'CRM Solution Development', 
          shortDescription: 'Custom CRM solutions to manage your business efficiently.',
          basePrice: 25000, status: 'Active', rating: 4.6, totalOrders: 18, totalRevenue: 125000, iconUrl: 'FiDatabase'
        });

        const dmCat = cats.find(c => c.name === 'Digital Marketing');
        const s4 = await DigitalService.create({
          vendorId: vId, categoryId: dmCat._id, title: 'Digital Marketing Services', 
          shortDescription: 'SEO, SEM, Social Media Marketing & more to grow your brand.',
          basePrice: 12000, status: 'Active', rating: 4.6, totalOrders: 30, totalRevenue: 125000, iconUrl: 'FiTrendingUp'
        });

        const uiCat = cats.find(c => c.name === 'UI/UX Design');
        const s5 = await DigitalService.create({
          vendorId: vId, categoryId: uiCat._id, title: 'UI/UX Design Services', 
          shortDescription: 'Beautiful and intuitive UI/UX designs that enhance user experience.',
          basePrice: 10000, status: 'Active', rating: 4.8, totalOrders: 16, totalRevenue: 85000, iconUrl: 'FiFigma'
        });

        const mainCat = cats.find(c => c.name === 'Maintenance');
        const s6 = await DigitalService.create({
          vendorId: vId, categoryId: mainCat._id, title: 'Website Maintenance', 
          shortDescription: 'We provide regular website updates and maintenance.',
          basePrice: 5000, status: 'Active', rating: 4.5, totalOrders: 12, totalRevenue: 60000, iconUrl: 'FiTool'
        });

        const othersCat = cats.find(c => c.name === 'Others');
        const s7 = await DigitalService.create({
          vendorId: vId, categoryId: othersCat._id, title: 'Cloud Deployment', 
          shortDescription: 'Secure and scalable cloud deployment solutions.',
          basePrice: 20000, status: 'Active', rating: 4.6, totalOrders: 9, totalRevenue: 50000, iconUrl: 'FiCloud'
        });

        const s8 = await DigitalService.create({
          vendorId: vId, categoryId: othersCat._id, title: 'Other Services', 
          shortDescription: 'Custom solutions for unique business needs.',
          basePrice: 0, isCustomPricing: true, status: 'Active', rating: 4.4, totalOrders: 5, totalRevenue: 20000, iconUrl: 'FiMoreHorizontal'
        });

        await DigitalServiceOrder.insertMany([
          { serviceId: s1._id, vendorId: vId, customerName: 'John Doe', amount: 25000, status: 'Completed', date: new Date() },
          { serviceId: s2._id, vendorId: vId, customerName: 'Acme Corp', amount: 75000, status: 'In Progress', date: new Date() },
          { serviceId: s3._id, vendorId: vId, customerName: 'Tech Solutions', amount: 30000, status: 'New', date: new Date() },
          { serviceId: s5._id, vendorId: vId, customerName: 'Creative Agency', amount: 15000, status: 'Completed', date: new Date() }
        ]);
        
        console.log(`Finished seeding vendor: ${vendor.vendorName || vendor._id}`);
      } else {
        console.log(`Vendor ${vendor.vendorName || vendor._id} already has services (${serviceCount}).`);
      }
    }
  } catch (err) {
    console.error('ERROR SEEDING:', err);
  }
  process.exit(0);
}

run();
