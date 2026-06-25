require('dotenv').config();
const mongoose = require('mongoose');

// Register all required models to prevent MissingSchemaError
require('./models/User');
require('./models/Vendor');
require('./models/Worker');
require('./models/UserService');
require('./models/Category');
const Booking = require('./models/Booking');

console.log('Connecting to MongoDB URI:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected! Querying bookings...');
    const start = Date.now();
    const count = await Booking.countDocuments();
    console.log(`Total bookings count: ${count}`);
    const bookings = await Booking.find()
      .populate('vendorId', 'name businessName phone profilePhoto')
      .populate('serviceId', 'title iconUrl')
      .populate('categoryId', 'title slug')
      .populate('workerId', 'name phone profilePhoto')
      .limit(1)
      .lean();
    console.log(`Query took ${Date.now() - start}ms`);
    console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
