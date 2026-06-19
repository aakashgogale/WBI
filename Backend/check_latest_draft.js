require('dotenv').config();
const mongoose = require('mongoose');
const BookingDraft = require('./models/BookingDraft');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const draft = await BookingDraft.findOne({}).sort({ createdAt: -1 });
    console.log(JSON.stringify(draft, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
