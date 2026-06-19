const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const OneTimeService = require('./models/OneTimeService');
const ServicePackage = require('./models/ServicePackage');

const slugMapping = {
  'ac': 'ac-service',
  'geyser': 'geyser-repair',
  'ro-prufier': 'ro-service',
  'ro': 'ro-service',
  'cooler': 'cooler'
};

async function sync() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    console.log(`Found ${categories.length} categories.`);

    for (let cat of categories) {
      let slug = cat.slug;
      if (!slug) continue;
      
      // Check if OneTimeService exists for this slug
      let ots = await OneTimeService.findOne({ slug: slug });
      
      if (!ots) {
        // Maybe it exists under the mapped slug
        const mappedSlug = slugMapping[slug];
        if (mappedSlug) {
          ots = await OneTimeService.findOne({ slug: mappedSlug });
          if (ots) {
            // Update its slug to match the category slug
            ots.slug = slug;
            await ots.save();
            console.log(`Updated OneTimeService slug from ${mappedSlug} to ${slug}`);
          }
        }
      }

      if (!ots) {
        // Create new OneTimeService
        console.log(`Creating OneTimeService for ${cat.title} (${slug})`);
        ots = await OneTimeService.create({
          name: cat.title,
          slug: slug,
          subtitle: `Professional ${cat.title} service`,
          image: cat.icon || cat.iconUrl || '',
          isActive: true
        });
      }

      // Check if it has packages
      const packages = await ServicePackage.find({ serviceId: ots._id });
      if (packages.length === 0) {
        await ServicePackage.create({
          serviceId: ots._id,
          name: 'Basic Visit & Diagnosis',
          description: 'Technician visit charges. Final repair cost will be provided after inspection.',
          price: 299,
          estimatedDuration: '45 mins',
          warranty: '30 Days',
          isRequired: true,
          isActive: true,
          sortOrder: 1
        });
        console.log(`Created default package for ${ots.name}`);
      }
    }

    console.log('Sync complete');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

sync();
