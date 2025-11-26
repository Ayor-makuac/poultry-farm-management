/**
 * Check Environment Variables Script
 * Use this to verify your .env file is being loaded correctly
 */

const path = require('path');
const fs = require('fs');

// Try to load .env from backend directory
const envPath = path.resolve(__dirname, '..', '.env');

console.log('🔍 Checking environment configuration...\n');
console.log(`📁 Looking for .env file at: ${envPath}\n`);

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found!\n');
  
  // Load .env
  require('dotenv').config({ path: envPath });
  
  // Check MONGO_URI
  console.log('📋 Environment Variables:');
  console.log('='.repeat(60));
  
  if (process.env.MONGO_URI) {
    const maskedUri = process.env.MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`✅ MONGO_URI: ${maskedUri}`);
    console.log(`   (Full URI length: ${process.env.MONGO_URI.length} characters)`);
  } else {
    console.log('❌ MONGO_URI: NOT SET');
    console.log('   ⚠️  Will use fallback: mongodb://127.0.0.1:27017/poultry_farm');
  }
  
  console.log('');
  
  // Check other MongoDB variables
  if (process.env.MONGO_HOST) {
    console.log(`✅ MONGO_HOST: ${process.env.MONGO_HOST}`);
  }
  if (process.env.MONGO_PORT) {
    console.log(`✅ MONGO_PORT: ${process.env.MONGO_PORT}`);
  }
  if (process.env.MONGO_DB) {
    console.log(`✅ MONGO_DB: ${process.env.MONGO_DB}`);
  }
  if (process.env.MONGO_USER) {
    console.log(`✅ MONGO_USER: ${process.env.MONGO_USER}`);
  }
  if (process.env.MONGO_PASSWORD) {
    console.log(`✅ MONGO_PASSWORD: ${'*'.repeat(process.env.MONGO_PASSWORD.length)}`);
  }
  
  console.log('');
  
  // Check other important vars
  if (process.env.JWT_SECRET) {
    console.log(`✅ JWT_SECRET: ${'*'.repeat(process.env.JWT_SECRET.length)}`);
  } else {
    console.log('⚠️  JWT_SECRET: NOT SET');
  }
  
  if (process.env.NODE_ENV) {
    console.log(`✅ NODE_ENV: ${process.env.NODE_ENV}`);
  } else {
    console.log('ℹ️  NODE_ENV: Not set (defaults to development)');
  }
  
  console.log('='.repeat(60));
  
  // Summary
  console.log('\n📊 Summary:');
  if (process.env.MONGO_URI) {
    console.log('✅ MONGO_URI is set - will use this for connection');
  } else {
    console.log('⚠️  MONGO_URI is NOT set');
    console.log('   💡 Add to .env file:');
    console.log('      MONGO_URI=mongodb://localhost:27017/poultry_farm');
    console.log('      Or for MongoDB Atlas:');
    console.log('      MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/poultry_farm');
  }
  
} else {
  console.log('❌ .env file NOT FOUND!\n');
  console.log('💡 Create a .env file in the backend directory with:');
  console.log('');
  console.log('   MONGO_URI=mongodb://localhost:27017/poultry_farm');
  console.log('   JWT_SECRET=your-secret-key-here');
  console.log('   CLIENT_URL=http://localhost:3000');
  console.log('');
  console.log('   Or for MongoDB Atlas:');
  console.log('   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/poultry_farm');
  console.log('');
}

