const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('servicecategories').updateMany({}, { $set: { roles: ['worker', 'engineer'] } });
  console.log('Updated categories');
  process.exit(0);
});
