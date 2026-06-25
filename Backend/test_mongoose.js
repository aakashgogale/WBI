require('dotenv').config();
const mongoose = require('mongoose');
const Engineer = require('./models/Engineer');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');
    const id = '6a264fdd493909a242590e63';
    
    const eng = await Engineer.findById(id);
    console.log('findById:', eng ? 'Found' : 'Null');
    
    const updateRes = await Engineer.findByIdAndUpdate(id, { $set: { updatedAt: new Date() } });
    console.log('findByIdAndUpdate (simple):', updateRes ? 'Found' : 'Null');
    
    const pushRes = await Engineer.findByIdAndUpdate(id, { $push: { fcmTokenMobile: 'test_token' } }, { new: true });
    console.log('findByIdAndUpdate (push):', pushRes ? 'Found' : 'Null');
    
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
