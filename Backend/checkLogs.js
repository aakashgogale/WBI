require('dotenv').config();
const mongoose = require('mongoose');
const BookingAssignmentLog = require('./models/BookingAssignmentLog');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const logs = await BookingAssignmentLog.find().sort({ createdAt: -1 }).limit(10).populate('workerId', 'name');
  console.log('Latest logs:');
  for(let log of logs) {
    console.log(`Booking: ${log.bookingId}, Worker: ${log.workerId?.name}, Status: ${log.status}, Reason: ${log.reason}, Action: ${log.action}`);
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
