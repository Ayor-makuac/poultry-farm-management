# Poultry Farm Management System - Quick Start Guide

## 🚀 Phase 1 Complete!

The foundation of your Poultry Farm Management System is ready. Follow these steps to get started.

## Prerequisites

Before you begin, make sure you have:
- ✅ Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- ✅ MySQL (v5.7 or higher) - [Download here](https://dev.mysql.com/downloads/)
- ✅ A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install MySQL (if not already installed)
- Download and install MySQL
- Remember your root password
- Start MySQL service

### 2. Navigate to Backend Directory
```bash
cd "C:\Users\LENOVO\Desktop\Poultry Farm\backend"
```

### 3. Install Dependencies (Already Done ✅)
The dependencies are already installed, but if needed:
```bash
npm install
```

### 4. Configure Environment Variables
Open `backend/.env` and update:
```env
DB_PASSWORD=your_mysql_root_password_here
JWT_SECRET=change_this_to_a_random_secure_string
```

**Important:** 
- Replace `your_mysql_root_password_here` with your actual MySQL password
- Generate a secure JWT secret (can be any long random string)

### 5. Create Database
Run the setup script:
```bash
npm run setup
```

You should see:
```
✅ Connected to MySQL server
✅ Database 'poultry_farm_db' created or already exists
✅ Database setup completed successfully!
```

### 6. Start the Server
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ Database models synchronized
🚀 Server running on port 5000
📍 Environment: development
```

### 7. Test the API
Open your browser and go to:
```
http://localhost:5000
```

You should see:
```json
{
  "message": "Poultry Farm Management System API",
  "version": "1.0.0",
  "status": "Running"
}
```

## ✅ Success!

If you see the above message, Phase 1 is working perfectly!

## What's Been Built

### Backend Structure
```
backend/
├── config/          ✅ Database configuration
├── models/          ✅ 9 database models
│   ├── User.js
│   ├── PoultryBatch.js
│   ├── FeedRecord.js
│   ├── ProductionRecord.js
│   ├── HealthRecord.js
│   ├── Inventory.js
│   ├── SalesRecord.js
│   ├── Expense.js
│   └── Notification.js
├── controllers/     📁 Ready for Phase 2
├── routes/          📁 Ready for Phase 2
├── middleware/      📁 Ready for Phase 2
├── server.js        ✅ Express server
└── .env             ✅ Configuration
```

### Database Tables Created
1. **users** - Admin, Manager, Worker, Veterinarian accounts
2. **poultry_batches** - Flock information
3. **feed_records** - Daily feeding logs
4. **production_records** - Egg production & mortality
5. **health_records** - Vaccinations & treatments
6. **inventory** - Stock management
7. **sales_records** - Sales transactions
8. **expenses** - Farm expenses
9. **notifications** - System alerts

## Troubleshooting

### Problem: "Cannot connect to database"
**Solution:** 
- Check if MySQL is running
- Verify DB_PASSWORD in `.env` is correct
- Ensure MySQL is on port 3306

### Problem: "Port 5000 already in use"
**Solution:**
- Change PORT in `.env` to 5001 or another available port
- Or stop the process using port 5000

### Problem: "Module not found"
**Solution:**
```bash
cd backend
npm install
```

## Useful Commands

```bash
# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Setup/Reset database
npm run setup

# Check if server is running
curl http://localhost:5000
```

## Next Steps (Phase 2)

Phase 2 will implement:
- 🔐 Authentication (Login/Register)
- 👥 User management APIs
- 🐔 Flock management APIs
- 🌾 Feeding management APIs
- 🥚 Production tracking APIs
- 💊 Health management APIs
- 📦 Inventory management APIs
- 💰 Sales & financial APIs
- 📊 Reports & analytics APIs
- 🔔 Notifications system

## Need Help?

Check the documentation:
- `backend/README.md` - Detailed backend documentation
- `PHASE1_COMPLETED.md` - Complete Phase 1 summary

## Project Information

**Student:** AYOR MAKUAC ALIT  
**Student ID:** 666147  
**Project:** Poultry Farm Management System  
**Institution:** United States International University - Africa  
**Supervisor:** Prof. Paul Okanda

---

**Phase 1 Status:** ✅ COMPLETE  
**Current Phase:** Ready for Phase 2  
**Last Updated:** November 22, 2025

