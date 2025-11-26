# Poultry Farm Management System - Quick Start Guide

## 🚀 Phase 1 Complete!

The foundation of your Poultry Farm Management System is ready. Follow these steps to get started.

## Prerequisites

Before you begin, make sure you have:
- ✅ Node.js (v18 or higher) - [Download here](https://nodejs.org/)
- ✅ MongoDB (local server or [MongoDB Atlas](https://www.mongodb.com/atlas/database))
- ✅ A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Prepare MongoDB
- Install MongoDB locally **or** create a free MongoDB Atlas cluster
- Make sure the MongoDB service is running (or that your Atlas cluster is reachable)
- Copy your MongoDB connection string (e.g., `mongodb://localhost:27017/poultry_farm` or the Atlas URI)

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
Create or update `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/poultry_farm
JWT_SECRET=change_this_to_a_random_secure_string
CLIENT_URL=http://localhost:3000
```

**Important:** 
- Replace `MONGO_URI` with your Atlas URI when deploying
- Generate a secure JWT secret (any long random string works)

### 5. (Optional) Verify MongoDB Connectivity
```bash
npm run setup
```

You should see:
```
✅ MongoDB connection verified successfully
👉 Your collections and indexes will be created automatically on first use.
```

### 6. Start the Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📦 Database: poultry_farm
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

### Database Collections
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
- Ensure MongoDB service is running (or your Atlas cluster is online)
- Verify `MONGO_URI` in `.env` is correct
- If using Atlas, make sure your IP whitelist allows your machine

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

# Verify Mongo connection manually
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

