const mongoose = require('mongoose');
const dotenv = require('dotenv');
const OneTimeService = require('../models/OneTimeService'); // Adjust path as needed

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

const approvedList = [
  'Home Cleaning',
  'AC Repair',
  'Plumbing',
  'Electrician',
  'Salon at Home',
  'Painting',
  'Pest Control',
  'Car Wash',
  'Appliance Repair',
  'Carpenter',
  'Laundry',
  'Beauty Services',
  'Deep Cleaning',
  'Home Maintenance'
];

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const syncServices = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB.');

    const approvedSlugs = [];

    let sortIndex = 1;
    console.log('--- UPSERTING APPROVED SERVICES ---');
    for (const name of approvedList) {
      const slug = generateSlug(name);
      approvedSlugs.push(slug);

      const existing = await OneTimeService.findOne({ slug });

      if (existing) {
        existing.isActive = true;
        existing.name = name; // ensure correct casing
        existing.categoryType = 'one_time';
        existing.sortOrder = sortIndex;
        await existing.save();
        console.log(`[UPDATED] ${name}`);
      } else {
        await OneTimeService.create({
          name,
          slug,
          isActive: true,
          categoryType: 'one_time',
          sortOrder: sortIndex,
          // other defaults are handled by schema
        });
        console.log(`[CREATED] ${name}`);
      }
      sortIndex++;
    }

    console.log('\n--- DEACTIVATING EXTRA SERVICES ---');
    // Find services not in the approved slugs
    const extras = await OneTimeService.find({ slug: { $nin: approvedSlugs } });
    
    let deactivatedCount = 0;
    for (const extra of extras) {
      if (extra.isActive) {
        extra.isActive = false;
        await extra.save();
        console.log(`[DEACTIVATED] ${extra.name} (${extra.slug})`);
        deactivatedCount++;
      }
    }

    if (deactivatedCount === 0) {
      console.log('No extra services needed deactivation.');
    }

    console.log('\nSync complete successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing services:', error);
    process.exit(1);
  }
};

syncServices();
