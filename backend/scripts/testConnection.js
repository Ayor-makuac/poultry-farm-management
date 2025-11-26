/**
 * Test MongoDB Connection Script
 * Use this to verify your MongoDB connection and database access
 */

const { connectDB, mongoose } = require('../config/database');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...\n');

    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI && !process.env.MONGO_HOST) {
      console.error('❌ MONGO_URI or MONGO_HOST environment variable is not set!');
      console.error('\n💡 Set MONGO_URI in your .env file:');
      console.error('   MONGO_URI=mongodb://localhost:27017/poultry_farm');
      console.error('   Or for MongoDB Atlas:');
      console.error('   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/poultry_farm\n');
      process.exit(1);
    }

    // Connect to MongoDB
    await connectDB();

    // Get connection info
    const db = mongoose.connection.db;
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    const port = mongoose.connection.port;

    console.log('✅ Connection successful!\n');
    console.log('📊 Connection Details:');
    console.log(`   Database: ${dbName}`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port || 'N/A'}`);
    console.log(`   State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}\n`);

    // Test database access by listing collections
    console.log('📋 Testing database access...');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Database access confirmed!`);
    console.log(`   Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('\n   Existing collections:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   (No collections yet - they will be created automatically)');
    }

    // Test write access (optional - creates a test collection)
    console.log('\n✍️  Testing write access...');
    const testCollection = db.collection('_connection_test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date() 
    });
    await testCollection.deleteOne({ test: true });
    console.log('✅ Write access confirmed!\n');

    console.log('🎉 All tests passed! Your MongoDB connection is working correctly.\n');
    console.log('👉 You can now run: npm run setup:db\n');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check MONGO_URI is set correctly in .env');
    console.error('   2. Verify MongoDB is running (if using local MongoDB)');
    console.error('   3. Check network access (if using MongoDB Atlas)');
    console.error('   4. Verify database user credentials\n');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;

