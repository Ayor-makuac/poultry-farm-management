/**
 * Force Database Creation Script
 * MongoDB creates databases lazily - this script forces creation by inserting a document
 */

const { connectDB, mongoose } = require('../config/database');
const User = require('../models/User');
const path = require('path');

// Ensure .env is loaded from backend directory
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

const forceCreateDatabase = async () => {
  try {
    console.log('🚀 Forcing database creation...\n');

    // Step 1: Connect
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected successfully\n');

    // Step 2: Get database instance
    const db = mongoose.connection.db;
    const dbName = mongoose.connection.name;
    const adminDb = mongoose.connection.db.admin();

    console.log(`📦 Target Database: ${dbName}\n`);

    // Step 3: List all databases BEFORE creation
    console.log('📋 Checking existing databases...');
    const databasesBefore = await adminDb.listDatabases();
    const dbNamesBefore = databasesBefore.databases.map(d => d.name);
    console.log(`   Found ${dbNamesBefore.length} databases:`);
    dbNamesBefore.forEach(name => {
      const marker = name === dbName ? ' 👈 (this one)' : '';
      console.log(`   - ${name}${marker}`);
    });
    console.log('');

    // Step 4: Force database creation by inserting a document
    console.log('🔨 Forcing database creation by inserting a test document...');
    
    // Create a test collection and insert a document
    const testCollection = db.collection('_database_init');
    await testCollection.insertOne({
      created: new Date(),
      purpose: 'Database initialization',
      note: 'This document forces database creation'
    });
    console.log('✅ Test document inserted\n');

    // Step 5: Verify database exists now
    console.log('🔍 Verifying database creation...');
    const databasesAfter = await adminDb.listDatabases();
    const dbNamesAfter = databasesAfter.databases.map(d => d.name);
    
    if (dbNamesAfter.includes(dbName)) {
      console.log(`✅ Database '${dbName}' now exists in MongoDB!\n`);
    } else {
      console.log(`⚠️  Database '${dbName}' not found in list (this is unusual)\n`);
    }

    // Step 6: List collections in the database
    console.log('📋 Collections in database:');
    const collections = await db.listCollections().toArray();
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   (No collections yet)');
    }
    console.log('');

    // Step 7: Get database stats
    console.log('📊 Database Statistics:');
    const stats = await db.stats();
    console.log(`   Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Documents: ${stats.objects}`);
    console.log('');

    // Step 8: Clean up test document (optional)
    console.log('🧹 Cleaning up test document...');
    await testCollection.deleteOne({ purpose: 'Database initialization' });
    console.log('✅ Test document removed\n');

    // Step 9: Create users collection by seeding
    console.log('👥 Creating users collection by seeding default users...\n');
    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@poultryfarm.com',
        password: 'admin123',
        role: 'Admin',
        phone: '+254700000001'
      },
      {
        name: 'Manager User',
        email: 'manager@poultryfarm.com',
        password: 'manager123',
        role: 'Manager',
        phone: '+254700000002'
      },
      {
        name: 'Worker User',
        email: 'worker@poultryfarm.com',
        password: 'worker123',
        role: 'Worker',
        phone: '+254700000003'
      },
      {
        name: 'Veterinarian User',
        email: 'vet@poultryfarm.com',
        password: 'vet123',
        role: 'Veterinarian',
        phone: '+254700000004'
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of defaultUsers) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        const user = await User.create(userData);
        console.log(`✅ Created ${userData.role.padEnd(12)} - ${userData.email}`);
        createdCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          skippedCount++;
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE CREATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📦 Database Name: ${dbName}`);
    console.log(`👥 Users Created: ${createdCount}`);
    console.log(`⏭️  Users Skipped: ${skippedCount}`);
    console.log(`📊 Total Users: ${await User.countDocuments()}`);
    console.log(`📋 Collections: ${(await db.listCollections().toArray()).length}`);
    
    if (createdCount > 0) {
      console.log('\n💡 Default Login Credentials:');
      defaultUsers.forEach(user => {
        console.log(`   ${user.role.padEnd(12)} - ${user.email.padEnd(30)} / ${user.password}`);
      });
    }
    
    console.log('\n📍 Where to find your database:');
    console.log('   - MongoDB Atlas: Clusters → Browse Collections');
    console.log('   - MongoDB Compass: Connect and select database');
    console.log('   - MongoDB Shell: use ' + dbName);
    console.log('');

  } catch (error) {
    console.error('\n❌ Database creation failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check MONGO_URI is correct in .env file');
    console.error('   2. Verify MongoDB connection (run: npm run test:db)');
    console.error('   3. Check network access (MongoDB Atlas IP whitelist)');
    console.error('   4. Verify database user has proper permissions\n');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed\n');
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  forceCreateDatabase();
}

module.exports = forceCreateDatabase;

