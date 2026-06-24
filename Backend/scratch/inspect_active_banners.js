const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Banner = require('../models/Banner');

async function inspectActiveBanners() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB:', mongoose.connection.name);
    const banners = await Banner.find({ isDeleted: { $ne: true } });
    console.log('Active banners in DB:', banners.length);
    console.log(JSON.stringify(banners, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

inspectActiveBanners();
