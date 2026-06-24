const mongoose = require('mongoose');
require('dotenv').config();
const { getHomeData } = require('./controllers/userControllers/userHome.controller');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const req = { query: {}, user: { _id: '6a3bc0c5bfe494fce48af08a' } };
  const res = {
    status: (s) => ({
      json: (data) => {
        console.log('User Home Status:', s);
        console.log('Banners:', JSON.stringify(data.banners, null, 2));
        mongoose.disconnect();
      }
    })
  };
  await getHomeData(req, res);
}).catch(console.error);
