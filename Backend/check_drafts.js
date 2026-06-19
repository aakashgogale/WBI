require('dotenv').config();
const mongoose = require('mongoose');
require('./models/User');
require('./models/OneTimeService');
require('./models/ServicePackage');
const BookingDraft = require('./models/BookingDraft');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to MongoDB!");
  
  const drafts = await BookingDraft.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('serviceId', 'name')
    .populate('packageIds', 'name price');
  
  console.log("RECENT DRAFTS:");
  console.log(JSON.stringify(drafts, null, 2));
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
