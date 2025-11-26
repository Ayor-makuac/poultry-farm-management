const { connectDB, mongoose } = require('../config/database');
require('../models');
require('dotenv').config();

(async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connection verified successfully');
    console.log('👉 Your collections and indexes will be created automatically on first use.');
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();

