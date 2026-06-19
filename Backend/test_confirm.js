require('dotenv').config();
const mongoose = require('mongoose');
const BookingDraft = require('./models/BookingDraft');
const Booking = require('./models/Booking');
const { confirmReview } = require('./controllers/user-controllers/bookingDraft.controller');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    // Find the latest draft
    const draft = await BookingDraft.findOne({ status: 'draft' }).sort({ createdAt: -1 });
    if (!draft) {
      console.log('No draft found');
      process.exit(0);
    }
    console.log('Testing confirm with draftId:', draft._id);
    
    // Simulate req, res
    const req = {
      body: { draftId: draft._id }
    };
    const res = {
      status: function(code) {
        console.log('Status code:', code);
        return this;
      },
      json: function(data) {
        console.log('Response JSON:', JSON.stringify(data, null, 2));
        process.exit(0);
      }
    };
    
    await confirmReview(req, res);
  } catch (error) {
    console.error('Fatal Test Error:', error);
    process.exit(1);
  }
});
