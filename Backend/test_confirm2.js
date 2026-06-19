require('dotenv').config();
const mongoose = require('mongoose');
const BookingDraft = require('./models/BookingDraft');
const Booking = require('./models/Booking');
const { confirmReview } = require('./controllers/user-controllers/bookingDraft.controller');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    const draftId = '6a35325785a42bea56b0bf90';
    console.log('Testing confirm with draftId:', draftId);
    
    // Simulate req, res
    const req = {
      body: { draftId }
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
