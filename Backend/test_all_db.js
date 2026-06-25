require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const id = '6a264fdd493909a242590e63';
    
    const User = require('./models/User');
    const Vendor = require('./models/Vendor');
    const Worker = require('./models/Worker');
    const Engineer = require('./models/Engineer');
    const Admin = require('./models/Admin');
    
    console.log('User:', await User.findById(id) ? 'Found' : 'Null');
    console.log('Vendor:', await Vendor.findById(id) ? 'Found' : 'Null');
    console.log('Worker:', await Worker.findById(id) ? 'Found' : 'Null');
    console.log('Engineer:', await Engineer.findById(id) ? 'Found' : 'Null');
    console.log('Admin:', await Admin.findById(id) ? 'Found' : 'Null');
    
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
