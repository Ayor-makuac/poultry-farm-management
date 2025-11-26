const mongoose = require('mongoose');
const path = require('path');

// Load .env file from backend directory (works from any script location)
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

mongoose.set('strictQuery', false);

const buildMongoUri = () => {
  // Debug: Show what MONGO_URI is being used (hide credentials)
  if (process.env.MONGO_URI) {
    const maskedUri = process.env.MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`🔗 Using MONGO_URI from environment: ${maskedUri}`);
    return process.env.MONGO_URI;
  }

  // Fallback to individual components
  console.log('⚠️  MONGO_URI not found, using individual components...');
  const host = process.env.MONGO_HOST || '127.0.0.1';
  const port = process.env.MONGO_PORT || '27017';
  const db = process.env.MONGO_DB || 'poultry_farm';
  const fallbackUri = `mongodb://${host}:${port}/${db}`;
  console.log(`🔗 Using fallback URI: ${fallbackUri}`);
  return fallbackUri;
};

const connectDB = async () => {
  const mongoUri = buildMongoUri();

  // Validate that MONGO_URI is set in production
  if (!process.env.MONGO_URI && process.env.NODE_ENV === 'production') {
    console.error('❌ MONGO_URI environment variable is required in production!');
    console.error('   Please set MONGO_URI in your deployment platform\'s environment variables.');
    process.exit(1);
  }

  try {
    // Connection options - if MONGO_URI is provided, it already contains auth info
    const connectionOptions = {
      autoIndex: true
    };

    // Only add user/pass if MONGO_URI is not provided (for local development with separate vars)
    if (!process.env.MONGO_URI) {
      if (process.env.MONGO_USER) connectionOptions.user = process.env.MONGO_USER;
      if (process.env.MONGO_PASSWORD) connectionOptions.pass = process.env.MONGO_PASSWORD;
      if (process.env.MONGO_DB) connectionOptions.dbName = process.env.MONGO_DB;
    }

    await mongoose.connect(mongoUri, connectionOptions);

    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔗 Connection URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs
    }
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error.message);
    if (!process.env.MONGO_URI) {
      console.error('\n💡 Tip: Set MONGO_URI environment variable with your MongoDB connection string.');
      console.error('   Example: mongodb://localhost:27017/poultry_farm');
      console.error('   Or for MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname');
    }
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };

