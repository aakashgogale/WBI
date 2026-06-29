require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const { getAllCompanies } = require('../controllers/adminControllers/b2bManagementController');
const { getDashboardStats } = require('../controllers/adminControllers/adminDashboardController');
const { getAdminNotifications } = require('../controllers/notificationControllers/notificationController');

// Mock req and res objects
const mockReq = {
  query: {},
  user: { id: new mongoose.Types.ObjectId() } // Dummy user ID for logs
};

const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log(`[RESPONSE CODE: ${this.statusCode || 200}]`, data);
    return this;
  }
};

async function testControllers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('\n--- Testing getAllCompanies ---');
    try {
      await getAllCompanies(mockReq, mockRes);
    } catch (err) {
      console.error('CRASH in getAllCompanies:', err);
    }

    console.log('\n--- Testing getDashboardStats ---');
    try {
      await getDashboardStats(mockReq, mockRes);
    } catch (err) {
      console.error('CRASH in getDashboardStats:', err);
    }

    console.log('\n--- Testing getAdminNotifications ---');
    try {
      await getAdminNotifications(mockReq, mockRes);
    } catch (err) {
      console.error('CRASH in getAdminNotifications:', err);
    }

  } catch (error) {
    console.error('Connection/Execution failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
  }
}

testControllers();
