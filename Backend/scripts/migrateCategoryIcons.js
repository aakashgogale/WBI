const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Category = require('../models/Category');

dotenv.config();

const migrateCategoryIcons = async () => {
  try {
    console.log('ðŸ”Œ Connecting to MongoDB...');
    await connectDB();
    console.log('âœ… Connected to MongoDB\n');

    // Find all categories with icons
    const categories = await Category.find({
      homeIconUrl: { $exists: true, $ne: null, $ne: '' }
    });

    console.log(`ðŸ“‚ Found ${categories.length} categories with icons\n`);

    for (const category of categories) {
      const currentIconUrl = category.homeIconUrl;
      console.log(`ðŸ”„ Processing: ${category.title} (${category.slug})`);
      console.log(`   Current URL: ${currentIconUrl}`);

      // Check if URL already uses WBI folder
      if (currentIconUrl.includes('/WBI/')) {
        console.log(`   âœ… Already in WBI folder\n`);
        continue;
      }

      // Generate new WBI URL
      const iconFilename = currentIconUrl.split('/').pop();
      const newIconUrl = `https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766136203/WBI/${category.slug}/icons/${iconFilename}`;

      console.log(`   New URL: ${newIconUrl}`);

      // Update category with new icon URL
      category.homeIconUrl = newIconUrl;
      await category.save();

      console.log(`   âœ… Updated in database\n`);
    }

    console.log('ðŸŽ‰ Category icon migration completed!');
    console.log('ðŸ“‹ All category icons now use WBI folder structure');

  } catch (error) {
    console.error('âŒ Error migrating category icons:', error);
  } finally {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('\nðŸ”Œ Database connection closed');
  }
};

migrateCategoryIcons();
