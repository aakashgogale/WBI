const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const connectWithRetry = async () => {
    try {
      console.log('Attempting to connect to MongoDB Atlas...');
      const conn = await mongoose.connect(primaryUri, {
        family: 4, // Use IPv4, skip trying IPv6
        serverSelectionTimeoutMS: 5000,
      });

      mongoose.connection.on('error', err => {
        console.error('MongoDB runtime error:', err);
      });

      console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
      console.error('❌ MongoDB Connection Failed:', error.message);
      console.log('⏳ Retrying in 5 seconds... (Hint: Please whitelist your IP in MongoDB Atlas!)');
      setTimeout(connectWithRetry, 5000); // Dynamic retry without crashing server
    }
  };

  connectWithRetry();
};

module.exports = connectDB;

