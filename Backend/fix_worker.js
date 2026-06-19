require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('./models/Worker');

async function fixWorkerCoord() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // Set to Indore location (longitude, latitude)
    await Worker.findByIdAndUpdate('6a327607886ae04cdfb1d9c1', {
      $set: {
        'location.coordinates': [75.8701536, 22.7186622]
      }
    });
    console.log('Worker Coordinates Updated successfully!');
  } finally {
    mongoose.disconnect();
  }
}
fixWorkerCoord();
