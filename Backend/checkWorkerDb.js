require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('./models/Worker');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const workers = await Worker.find({});
  for(let w of workers) {
    console.log(`Worker: ${w.name}, Status: ${w.status}, Location:`, w.location.coordinates);
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
