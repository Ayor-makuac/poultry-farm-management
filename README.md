# 🐔 Poultry Farm Management System

**A comprehensive full-stack web application for managing poultry farm operations**

[![Status](https://img.shields.io/badge/Status-85%25%20Complete-success)]()
[![Backend](https://img.shields.io/badge/Backend-100%25-brightgreen)]()
[![Frontend](https://img.shields.io/badge/Frontend-70%25-yellow)]()

---

## 📋 Project Information

**Student:** AYOR MAKUAC ALIT  
**Student ID:** 666147  
**Institution:** United States International University - Africa  
**Course:** APT3065 - Mid-Term Project  
**Supervisor:** Prof. Paul Okanda  
**Date:** November 22, 2025

---

## 🎯 Overview

The Poultry Farm Management System is a modern web application designed to automate and streamline poultry farm operations. It provides comprehensive tools for managing flocks, tracking production, monitoring health, managing inventory, recording sales, and generating analytical reports.

### Key Features
- 🔐 Secure authentication with role-based access
- 🐔 Complete flock management
- 🥚 Production tracking and analytics
- 💊 Health and vaccination management
- 📦 Inventory management with alerts
- 💰 Sales and expense tracking
- 📊 Comprehensive reports and analytics
- 🔔 Real-time notifications

---

## 🏗️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas or self-hosted)
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt
- **CORS:** cors middleware

### Frontend
- **Framework:** React 18
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Charts:** Chart.js with React-Chartjs-2
- **Notifications:** React-Toastify
- **Styling:** CSS3 (Custom)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local instance or a hosted cluster such as MongoDB Atlas)
- npm or yarn

### Installation

**1. Clone the repository**
```bash
cd "Poultry Farm"
```

**2. Backend Setup**
```bash
cd backend
npm install
```

**3. Configure Environment**
Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/poultry_farm
JWT_SECRET=your_secure_random_string
CLIENT_URL=http://localhost:3000
```

> ℹ️ When using MongoDB Atlas, replace `MONGO_URI` with the connection string provided by Atlas.

**4. Start Backend Server**
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

> 🌱 **Auto-Seeding**: On first startup, the system automatically creates default users for each role:
> - **Admin**: admin@poultryfarm.com / admin123
> - **Manager**: manager@poultryfarm.com / manager123
> - **Worker**: worker@poultryfarm.com / worker123
> - **Veterinarian**: vet@poultryfarm.com / vet123
>
> To manually seed users: `npm run seed`  
> To disable auto-seeding: Set `AUTO_SEED=false` in `.env`

**5. Frontend Setup** (New terminal)
```bash
cd frontend
npm install
npm start
```
Frontend will run on `http://localhost:3000`

---

## 📊 Project Status

### Completed (85%)
- ✅ Database schema (9 tables)
- ✅ Backend API (50+ endpoints)
- ✅ Authentication system
- ✅ User management
- ✅ Flock management (full CRUD)
- ✅ Dashboard with statistics
- ✅ Layout and navigation
- ✅ API services layer
- ✅ Comprehensive documentation

### In Progress (15%)
- ⏳ Additional feature modules
- ⏳ Charts and visualizations
- ⏳ Advanced filtering
- ⏳ Integration testing

---

## 🎨 Features

### User Roles
- **Admin:** Full system access
- **Manager:** Manage flocks, production, sales
- **Worker:** Record daily activities
- **Veterinarian:** Health management

### Modules

**1. Authentication**
- User registration with role selection
- Secure login with JWT
- Password hashing
- Protected routes

**2. Dashboard**
- Real-time statistics
- Flock overview
- Production summary
- Financial metrics
- Quick action cards

**3. Flock Management**
- Add/Edit/Delete flocks
- Track breed, quantity, age
- Housing unit assignment
- Status management
- Grid view with cards

**4. Production Tracking**
- Daily egg collection
- Mortality tracking
- Production statistics
- Batch-specific data

**5. Health Management**
- Vaccination schedules
- Disease tracking
- Treatment records
- Health alerts

**6. Inventory Management**
- Stock tracking
- Low stock alerts
- Supplier information
- Multiple item types

**7. Financial Management**
- Sales recording
- Expense tracking
- Revenue calculations
- Profit/loss analysis

**8. Reports & Analytics**
- Production reports
- Financial summaries
- Performance metrics
- Inventory status

---

## 📁 Project Structure

```
Poultry Farm/
├── backend/
│   ├── config/              # Database configuration
│   ├── models/              # Mongoose models (9 collections)
│   ├── controllers/         # Request handlers (11)
│   ├── routes/              # API routes (11)
│   ├── middleware/          # Auth & validation (3)
│   ├── utils/               # Helper functions
│   ├── scripts/             # Database scripts
│   └── server.js            # Main server file
│
├── frontend/
│   ├── public/              # Static files
│   └── src/
│       ├── components/      # Reusable components
│       ├── pages/           # Page components
│       ├── context/         # React context
│       ├── services/        # API services
│       ├── utils/           # Utilities
│       └── App.js           # Main app
│
└── Documentation/
    ├── PHASE1_COMPLETED.md
    ├── PHASE2_COMPLETED.md
    ├── PHASE3_PROGRESS.md
    ├── PROJECT_SUMMARY.md
    ├── QUICK_START.md
    └── API_DOCUMENTATION.md
```

---

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control
- Protected API routes
- Input validation
- Query sanitization through Mongoose
- CORS configuration
- Automatic token expiration handling

---

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <token>
```

### Main Endpoints

**Authentication**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Flocks**
- `GET /api/flocks` - Get all flocks
- `POST /api/flocks` - Create flock
- `PUT /api/flocks/:id` - Update flock
- `DELETE /api/flocks/:id` - Delete flock

**Production**
- `GET /api/production` - Get production records
- `POST /api/production` - Record production
- `GET /api/production/stats/summary` - Get statistics

**Reports**
- `GET /api/reports/production` - Production report
- `GET /api/reports/financial` - Financial report
- `GET /api/reports/performance` - Performance metrics

*See `API_DOCUMENTATION.md` for complete API reference*

---

## 🧪 Testing

### Test User Registration
1. Navigate to `http://localhost:3000`
2. Click "Register here"
3. Fill in details and select role
4. Submit and verify dashboard access

### Test Flock Management
1. Login to dashboard
2. Navigate to "Flocks"
3. Click "Add New Flock"
4. Fill in flock details
5. Verify flock appears in grid
6. Test edit and delete operations

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README.md` | This file - project overview |
| `QUICK_START.md` | Detailed setup instructions |
| `PROJECT_SUMMARY.md` | Complete project summary |
| `PHASE1_COMPLETED.md` | Phase 1 details |
| `PHASE2_COMPLETED.md` | Phase 2 details |
| `PHASE3_PROGRESS.md` | Phase 3 progress |
| `API_DOCUMENTATION.md` | Complete API reference |
| `backend/README.md` | Backend documentation |

---

## 🎓 Learning Outcomes

This project demonstrates proficiency in:
- Full-stack web development
- RESTful API design
- Database design and management
- Authentication and authorization
- React development
- State management
- Security best practices
- Project documentation

---

## 📈 Statistics

- **Total Files:** 80+
- **Lines of Code:** ~8,000+
- **API Endpoints:** 50+
- **Database Collections:** 9
- **Frontend Components:** 10+
- **Documentation Pages:** 8

---

## 🤝 Contributing

This is an academic project. For questions or feedback:
- **Student:** AYOR MAKUAC ALIT
- **Email:** [Your email]
- **Institution:** USIU-Africa

---

## 📝 License

This project is submitted as part of the University requirement for the award of the degree of Bachelor of Information Systems and Technology from the United States International University Africa.

---

## 🙏 Acknowledgments

- **Supervisor:** Prof. Paul Okanda
- **Institution:** United States International University - Africa
- **Course:** APT3065 - Mid-Term Project

---

## 🎯 Project Status

**Overall Completion:** 85%  
**Backend:** 100% ✅  
**Frontend:** 70% ⚙️  
**Documentation:** 100% ✅  

**Status:** SUBSTANTIALLY COMPLETE AND FUNCTIONAL ✅

---

## 🚀 Next Steps

1. Complete remaining feature modules
2. Add data visualization (charts)
3. Implement advanced filtering
4. Conduct integration testing
5. Deploy to cloud platform

---

**Last Updated:** November 22, 2025  
**Version:** 1.0.0  
**Status:** Active Development

---

Made with ❤️ by AYOR MAKUAC ALIT

