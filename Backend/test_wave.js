require('dotenv').config();
const mongoose = require('mongoose');
const WaveManagerService = require('./services/WaveManagerService');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const lat = 22.7173843;
    const lng = 75.8716682;
    console.log(`Querying lat=${lat}, lng=${lng}...`);
    const waves = await WaveManagerService.findAndGroupWorkers(lat, lng, 10);
    console.log('Result waves:', JSON.stringify(waves, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

test();
