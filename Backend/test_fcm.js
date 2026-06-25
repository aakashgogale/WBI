const mongoose = require('mongoose');
require('dotenv').config();
const Engineer = require('./models/Engineer');

async function test() {
  try {
    await mongoose.connect('mongodb+srv://user:oQW08LgH1v7l86eO@cluster0.zoxmb84.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected');
    
    const engId = '6a2dafade0e416443f8d9c2c'; // from JWT
    const updateQuery = { $addToSet: { fcmTokenMobile: 'test_token_123' } };
    
    console.log('Updating engineer:', engId);
    const updated = await Engineer.findByIdAndUpdate(engId, updateQuery, { new: true });
    
    if(!updated) {
      console.log('ENGINEER RETURNED NULL!');
    } else {
      console.log('Success!', updated.fcmTokenMobile);
    }
    
  } catch(e) {
    console.error('ERROR THROWN:', e.message);
  } finally {
    mongoose.disconnect();
  }
}
test();
