const { connectDB, mongoose } = require('../config/database');
const User = require('../models/User');
const path = require('path');

// Ensure .env is loaded from backend directory
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

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

const seedUsers = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting user seeding...\n');

    let createdCount = 0;
    let skippedCount = 0;

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
        console.log(`✅ Created ${userData.role}: ${userData.email} (Password: ${userData.password})`);
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

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Created: ${createdCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users`);
    console.log('\n💡 Default credentials:');
    defaultUsers.forEach(user => {
      console.log(`   ${user.role.padEnd(12)} - ${user.email.padEnd(25)} / ${user.password}`);
    });
    console.log('\n⚠️  IMPORTANT: Change these passwords in production!');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;

