const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const buildMongoUri = () => {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  const host = process.env.MONGO_HOST || '127.0.0.1';
  const port = process.env.MONGO_PORT || '27017';
  const db = process.env.MONGO_DB || 'poultry_farm';
  return `mongodb://${host}:${port}/${db}`;
};

const connectDB = async () => {
  const mongoUri = buildMongoUri();

  try {
    await mongoose.connect(mongoUri, {
      user: process.env.MONGO_USER || undefined,
      pass: process.env.MONGO_PASSWORD || undefined,
      dbName: process.env.MONGO_DB || undefined,
      autoIndex: true
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };

