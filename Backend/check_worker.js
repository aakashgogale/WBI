require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('./models/Worker');

async function checkWorkerCoord() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const worker = await Worker.findById('6a327607886ae04cdfb1d9c1');
    console.log('Worker Coordinates:', worker.location.coordinates);
  } finally {
    mongoose.disconnect();
  }
}
checkWorkerCoord();
