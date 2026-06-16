require('dotenv').config();
const mongoose = require('mongoose');

// Load all models
require('./models/Worker');
require('./models/Booking');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected');
}).catch(err => {
  console.error('Initial Error:', err);
});

mongoose.connection.on('error', err => {
  console.error('Mongoose Connection Error:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
