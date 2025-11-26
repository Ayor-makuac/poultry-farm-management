const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created or already exists`);

    await connection.end();
    console.log('✅ Database setup completed successfully!');
    console.log('\nYou can now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. MySQL is running');
    console.error('2. DB_USER and DB_PASSWORD in .env are correct');
    console.error('3. MySQL user has permission to create databases');
    process.exit(1);
  }
}

setupDatabase();

