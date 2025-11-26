const express = require('express');
const cors = require('cors');
const path = require('path');

// Load .env from backend directory
const envPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: envPath });

const { connectDB } = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import models to ensure relationships are set up
require('./models');

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Poultry Farm Management System API',
    version: '1.0.0',
    status: 'Running'
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/flocks', require('./routes/flockRoutes'));
app.use('/api/feeding', require('./routes/feedingRoutes'));
app.use('/api/production', require('./routes/productionRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Auto-seed users on first startup if none exist
const autoSeedUsers = async () => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('🌱 No users found. Seeding default users...');
      const seedUsers = require('./scripts/seedUsers');
      // Import the function but don't run it directly (it closes connection)
      // Instead, create users inline
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

      for (const userData of defaultUsers) {
        try {
          const existingUser = await User.findOne({ email: userData.email });
          if (!existingUser) {
            await User.create(userData);
            console.log(`✅ Created ${userData.role}: ${userData.email}`);
          }
        } catch (error) {
          if (error.code !== 11000) {
            console.error(`❌ Error creating user ${userData.email}:`, error.message);
          }
        }
      }
      console.log('💡 Default credentials:');
      defaultUsers.forEach(user => {
        console.log(`   ${user.role.padEnd(12)} - ${user.email.padEnd(25)} / ${user.password}`);
      });
      console.log('⚠️  IMPORTANT: Change these passwords in production!\n');
    }
  } catch (error) {
    console.error('⚠️  Auto-seeding failed:', error.message);
    // Don't exit - allow server to start even if seeding fails
  }
};

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed users if none exist (only in non-test environments)
    if (process.env.NODE_ENV !== 'test' && process.env.AUTO_SEED !== 'false') {
      await autoSeedUsers();
    }

    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// Export app for testing
module.exports = app;

