const mongoose = require('mongoose');
require('dotenv').config();

const migrateLogos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const brands = await mongoose.connection.db.collection('brands').find({}).toArray();
    const serviceBrands = await mongoose.connection.db.collection('servicebrands').find({}).toArray();

    let updatedCount = 0;
    
    for (let sb of serviceBrands) {
      // Find matching old brand by title (case-insensitive)
      const match = brands.find(b => b.title.toLowerCase() === sb.brandName.toLowerCase());
      
      if (match && match.iconUrl) {
        await mongoose.connection.db.collection('servicebrands').updateOne(
          { _id: sb._id }, 
          { $set: { logo: match.iconUrl } }
        );
        updatedCount++;
        console.log(`Updated logo for ${sb.brandName} -> ${match.iconUrl}`);
      }
    }

    console.log(`Successfully migrated ${updatedCount} brand logos!`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

migrateLogos();
