require('dotenv').config();
const mongoose = require('mongoose');
const OneTimeService = require('./models/OneTimeService');
const ServiceBrand = require('./models/ServiceBrand');
const ServiceIssue = require('./models/ServiceIssue');
const ServicePackage = require('./models/ServicePackage');
const ServicePricingRule = require('./models/ServicePricingRule');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');

    // Clean existing data for safe seeding
    await OneTimeService.deleteMany({ slug: 'ac-service' });

    // 1. Create AC Service
    const acService = await OneTimeService.create({
      name: 'AC Service',
      slug: 'ac-service',
      subtitle: 'Professional AC repair & service at your doorstep',
      image: 'https://res.cloudinary.com/dkxipmmpz/image/upload/v1731932971/ac_image.png', // Fallback generic image
      categoryType: 'one_time',
      rating: 4.8,
      totalReviews: 12500,
      isActive: true,
      sortOrder: 1
    });

    // Pricing Rule
    await ServicePricingRule.create({
      serviceId: acService._id,
      platformFee: 49,
      gstPercent: 18,
      discount: 0
    });

    // 2. Create Brands
    const brandsData = [
      { brandName: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/1024px-LG_logo_%282015%29.svg.png' },
      { brandName: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1024px-Samsung_Logo.svg.png' },
      { brandName: 'Voltas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Voltas_Logo.svg/1024px-Voltas_Logo.svg.png' },
      { brandName: 'Daikin', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Daikin_logo.svg/1024px-Daikin_logo.svg.png' },
      { brandName: 'Panasonic', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Panasonic_logo_%28Blue%29.svg/1024px-Panasonic_logo_%28Blue%29.svg.png' }
    ];

    const brands = [];
    for (const b of brandsData) {
      brands.push(await ServiceBrand.create({ serviceId: acService._id, brandName: b.brandName, logo: b.logo }));
    }

    // 3. Create Issues
    const issuesData = [
      { title: 'AC not cooling', allowMultiple: true },
      { title: 'Water leakage', allowMultiple: true },
      { title: 'Gas leakage', allowMultiple: true },
      { title: 'AC not turning ON', allowMultiple: true },
      { title: 'Unusual noise', allowMultiple: true },
      { title: 'Bad smell from AC', allowMultiple: true }
    ];

    const issues = [];
    for (const i of issuesData) {
      // Empty brandIds array means applies to all brands
      issues.push(await ServiceIssue.create({ serviceId: acService._id, title: i.title, brandIds: [], allowMultiple: i.allowMultiple }));
    }

    // 4. Create Packages
    const packagesData = [
      {
        name: 'General Servicing',
        description: 'Basic water wash and filter cleaning to improve cooling performance.',
        price: 399,
        estimatedDuration: '45 mins',
        warranty: '15 days warranty',
        isRequired: true
      },
      {
        name: 'Deep Cleaning (Foam Wash)',
        description: 'Advanced foam jet wash for indoor and outdoor units.',
        price: 599,
        estimatedDuration: '60 mins',
        warranty: '30 days warranty',
        isRequired: false
      },
      {
        name: 'Gas Refilling',
        description: 'Complete gas leak fix and refill for optimal cooling.',
        price: 2499,
        estimatedDuration: '90 mins',
        warranty: '60 days warranty',
        isRequired: false
      }
    ];

    for (const p of packagesData) {
      // Empty brandIds/issueIds means applies generally for any issue
      await ServicePackage.create({ 
        serviceId: acService._id, 
        name: p.name, 
        description: p.description,
        price: p.price,
        estimatedDuration: p.estimatedDuration,
        warranty: p.warranty,
        isRequired: p.isRequired,
        brandIds: [],
        issueIds: []
      });
    }

    console.log('Seed successful! AC Service dynamic flow data inserted.');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

seedData();
