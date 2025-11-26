const { connectDB, mongoose } = require('../config/database');
const User = require('../models/User');
require('dotenv').config();

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

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup and user seeding...\n');

    // Step 1: Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB successfully\n');

    // Step 2: Verify database exists (MongoDB creates it automatically on first use)
    const dbName = mongoose.connection.name;
    console.log(`📦 Database: ${dbName}`);
    console.log(`📍 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}\n`);

    // Step 3: Create collections by initializing models (MongoDB creates collections on first insert)
    console.log('📋 Initializing database collections...');
    // Import all models to ensure they're registered
    require('../models');
    console.log('✅ Collections will be created automatically on first document insert\n');

    // Step 4: Seed users
    console.log('🌱 Seeding default users...\n');
    let createdCount = 0;
    let skippedCount = 0;
    const createdUsers = [];

    for (const userData of defaultUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create new user (password will be hashed by pre-save hook)
        const user = await User.create(userData);
        createdUsers.push({
          role: userData.role,
          email: userData.email,
          password: userData.password,
          id: user.user_id || user._id.toString()
        });
        console.log(`✅ Created ${userData.role.padEnd(12)} - ${userData.email.padEnd(30)} (ID: ${user.user_id || user._id})`);
        createdCount++;
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error (email already exists)
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          skippedCount++;
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Setup Summary:');
    console.log('='.repeat(60));
    console.log(`   ✅ Database: ${dbName}`);
    console.log(`   ✅ Users Created: ${createdCount}`);
    console.log(`   ⏭️  Users Skipped: ${skippedCount}`);
    console.log(`   📦 Total Users: ${await User.countDocuments()}`);
    
    if (createdCount > 0) {
      console.log('\n💡 Default Login Credentials:');
      console.log('='.repeat(60));
      createdUsers.forEach(user => {
        console.log(`   ${user.role.padEnd(12)} - ${user.email.padEnd(30)} / ${user.password}`);
      });
      console.log('='.repeat(60));
      console.log('\n⚠️  IMPORTANT: Change these passwords in production!');
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('👉 You can now start the server with: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check MONGO_URI environment variable is set correctly');
    console.error('   2. Verify MongoDB is running (if using local MongoDB)');
    console.error('   3. Check network access (if using MongoDB Atlas)');
    console.error('   4. Verify database user credentials are correct\n');
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;

