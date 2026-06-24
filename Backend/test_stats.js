const mongoose = require('mongoose');
require('dotenv').config();
const { getDashboardStats } = require('./controllers/adminControllers/adminDashboardController');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const req = { query: {} };
  const res = {
    status: (s) => ({
      json: (data) => {
        console.log('Status:', s);
        console.log(JSON.stringify(data, null, 2));
        mongoose.disconnect();
      }
    })
  };
  await getDashboardStats(req, res);
}).catch(console.error);
