const mongoose = require('mongoose');
require('dotenv').config();
const Banner = require('./models/Banner');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const banners = await Banner.find({});
  console.log('All Banners:', JSON.stringify(banners, null, 2));
  mongoose.disconnect();
}).catch(console.error);
