const mongoose = require('mongoose');
require('dotenv').config();
const HomeContent = require('./models/HomeContent');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const content = await HomeContent.findOne({}).lean();
  console.log('HomeContent:', JSON.stringify(content, null, 2));
  mongoose.disconnect();
}).catch(console.error);
