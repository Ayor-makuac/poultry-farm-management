# Poultry Farm Management System - Backend API

## Overview
This is the backend API for the Poultry Farm Management System built with Node.js, Express, and MySQL.

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` file and update with your MySQL credentials
   - Update `DB_PASSWORD` with your MySQL root password
   - Update `JWT_SECRET` with a secure random string

3. Create the database:
```bash
# Login to MySQL
mysql -u root -p

# Run the initialization script
source scripts/init_database.sql

# Or manually create database
CREATE DATABASE poultry_farm_db;
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## Database Schema

### Tables
- **users** - System users (Admin, Manager, Worker, Veterinarian)
- **poultry_batches** - Poultry flock batches
- **feed_records** - Daily feeding records
- **production_records** - Egg production and mortality tracking
- **health_records** - Vaccination and health treatments
- **inventory** - Feed, medicine, and equipment stock
- **sales_records** - Sales transactions
- **expenses** - Farm expenses
- **notifications** - System notifications

## API Endpoints (To be implemented)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Flocks
- `POST /api/flocks` - Create poultry batch
- `GET /api/flocks` - Get all batches
- `GET /api/flocks/:id` - Get batch details
- `PUT /api/flocks/:id` - Update batch
- `DELETE /api/flocks/:id` - Delete batch

### Feeding
- `POST /api/feeding` - Record feeding
- `GET /api/feeding` - Get feeding records
- `GET /api/feeding/batch/:batchId` - Get batch feeding history

### Production
- `POST /api/production` - Record production
- `GET /api/production` - Get production records
- `GET /api/production/stats` - Get production statistics

### Health
- `POST /api/health` - Record health data
- `GET /api/health` - Get health records
- `GET /api/health/batch/:batchId` - Get batch health history

### Inventory
- `POST /api/inventory` - Add inventory item
- `GET /api/inventory` - Get all inventory
- `PUT /api/inventory/:id` - Update inventory
- `GET /api/inventory/alerts` - Get low stock alerts

### Sales & Expenses
- `POST /api/sales` - Record sale
- `GET /api/sales` - Get sales records
- `POST /api/expenses` - Record expense
- `GET /api/expenses` - Get expense records

### Reports
- `GET /api/reports/production` - Production reports
- `GET /api/reports/financial` - Financial summary
- `GET /api/reports/performance` - Performance metrics

## Technologies Used
- **Express.js** - Web framework
- **Sequelize** - ORM for MySQL
- **MySQL2** - MySQL driver
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## Project Structure
```
backend/
├── config/          # Database configuration
├── models/          # Sequelize models
├── controllers/     # Request handlers
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── scripts/         # Database scripts
├── server.js        # Entry point
└── .env             # Environment variables
```

## Development
- Models are automatically synced with the database on server start
- Use `npm run dev` for development with auto-reload
- Check console for database connection status

## Security
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Input validation on all endpoints

