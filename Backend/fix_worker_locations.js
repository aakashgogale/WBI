require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('./models/Worker');

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('MongoDB Connected');
  
  try {
    // Drop the problematic index if it exists and is failing
    try {
      await mongoose.connection.collection('workers').dropIndex('location_2dsphere');
      console.log('Dropped old location_2dsphere index');
    } catch(e) {}
    
    try {
      await mongoose.connection.collection('workers').dropIndex('phone_1');
      console.log('Dropped old phone_1 index');
    } catch(e) {}

    try {
      await mongoose.connection.collection('workers').dropIndex('email_1');
      console.log('Dropped old email_1 index');
    } catch(e) {}

    // Update all workers to use proper GeoJSON format for location
    const workers = await Worker.find({});
    console.log(`Found ${workers.length} workers to check.`);

    let updatedCount = 0;
    for (const worker of workers) {
      if (worker.location && worker.location.lat !== undefined && worker.location.lng !== undefined && !worker.location.type) {
        // Old format detected
        const lat = worker.location.lat;
        const lng = worker.location.lng;
        
        // Use bulk write or direct update to bypass validation if necessary
        await Worker.collection.updateOne(
          { _id: worker._id },
          { $set: { 
            location: {
              type: 'Point',
              coordinates: [Number(lng) || 0, Number(lat) || 0],
              updatedAt: worker.location.updatedAt || new Date()
            }
          }}
        );
        updatedCount++;
      } else if (!worker.location || !worker.location.type) {
        // Missing or completely malformed
        await Worker.collection.updateOne(
          { _id: worker._id },
          { $set: { 
            location: {
              type: 'Point',
              coordinates: [0, 0],
              updatedAt: new Date()
            }
          }}
        );
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} workers to GeoJSON format.`);
    
    // Now create the index safely
    await Worker.createIndexes();
    console.log('Indexes created successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing workers:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('Connection Error:', err);
  process.exit(1);
});
