# Poultry Farm Management System - Project Structure

## 📁 Complete Directory Structure

```
Poultry Farm/
│
├── 📄 AYOR666147-MID TERM PROJECT@@@@.docx    # Project proposal document
├── 📄 PHASE1_COMPLETED.md                     # Phase 1 completion summary
├── 📄 QUICK_START.md                          # Quick start guide
├── 📄 PROJECT_STRUCTURE.md                    # This file
│
├── 📁 backend/                                # Backend API (Node.js/Express)
│   ├── 📁 config/
│   │   └── database.js                        # Sequelize database configuration
│   │
│   ├── 📁 models/                             # Database models (Sequelize)
│   │   ├── User.js                            # User model (Admin/Manager/Worker/Vet)
│   │   ├── PoultryBatch.js                    # Poultry flock batches
│   │   ├── FeedRecord.js                      # Daily feeding records
│   │   ├── ProductionRecord.js                # Egg production & mortality
│   │   ├── HealthRecord.js                    # Vaccinations & treatments
│   │   ├── Inventory.js                       # Stock management
│   │   ├── SalesRecord.js                     # Sales transactions
│   │   ├── Expense.js                         # Farm expenses
│   │   ├── Notification.js                    # System notifications
│   │   └── index.js                           # Model relationships
│   │
│   ├── 📁 controllers/                        # [Phase 2] Request handlers
│   │   ├── authController.js                  # To be created
│   │   ├── userController.js                  # To be created
│   │   ├── flockController.js                 # To be created
│   │   ├── feedingController.js               # To be created
│   │   ├── productionController.js            # To be created
│   │   ├── healthController.js                # To be created
│   │   ├── inventoryController.js             # To be created
│   │   ├── salesController.js                 # To be created
│   │   ├── expenseController.js               # To be created
│   │   ├── notificationController.js          # To be created
│   │   └── reportController.js                # To be created
│   │
│   ├── 📁 routes/                             # [Phase 2] API routes
│   │   ├── authRoutes.js                      # To be created
│   │   ├── userRoutes.js                      # To be created
│   │   ├── flockRoutes.js                     # To be created
│   │   ├── feedingRoutes.js                   # To be created
│   │   ├── productionRoutes.js                # To be created
│   │   ├── healthRoutes.js                    # To be created
│   │   ├── inventoryRoutes.js                 # To be created
│   │   ├── salesRoutes.js                     # To be created
│   │   ├── expenseRoutes.js                   # To be created
│   │   ├── notificationRoutes.js              # To be created
│   │   └── reportRoutes.js                    # To be created
│   │
│   ├── 📁 middleware/                         # [Phase 2] Custom middleware
│   │   ├── auth.js                            # To be created - JWT authentication
│   │   ├── authorize.js                       # To be created - Role-based access
│   │   └── validate.js                        # To be created - Input validation
│   │
│   ├── 📁 utils/                              # [Phase 2] Utility functions
│   │   ├── generateToken.js                   # To be created - JWT token generator
│   │   └── validators.js                      # To be created - Validation helpers
│   │
│   ├── 📁 scripts/                            # Database scripts
│   │   ├── init_database.sql                  # SQL database creation
│   │   └── setup.js                           # Node.js database setup
│   │
│   ├── 📄 server.js                           # Main Express server
│   ├── 📄 package.json                        # Dependencies & scripts
│   ├── 📄 .env                                # Environment variables
│   ├── 📄 .gitignore                          # Git ignore rules
│   └── 📄 README.md                           # Backend documentation
│
└── 📁 frontend/                               # [Phase 3] React application
    ├── 📁 public/                             # To be created
    ├── 📁 src/
    │   ├── 📁 components/                     # To be created - Reusable components
    │   ├── 📁 pages/                          # To be created - Page components
    │   ├── 📁 context/                        # To be created - React context
    │   ├── 📁 services/                       # To be created - API services
    │   ├── 📁 utils/                          # To be created - Helper functions
    │   └── 📁 assets/                         # To be created - Images, styles
    ├── 📄 package.json                        # To be created
    └── 📄 README.md                           # To be created
```

## 🗄️ Database Schema

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ user_id (PK)    │
│ name            │
│ email           │
│ password        │
│ role            │ ← Admin, Manager, Worker, Veterinarian
│ phone           │
│ created_at      │
│ updated_at      │
└─────────────────┘
        │
        │ records
        ├──────────────────┬──────────────────┬──────────────────┐
        ↓                  ↓                  ↓                  ↓
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  feed_records   │ │production_records│ │ sales_records  │ │    expenses     │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ feed_id (PK)    │ │production_id(PK)│ │ sale_id (PK)    │ │ expense_id (PK) │
│ batch_id (FK)   │ │ batch_id (FK)   │ │ product_type    │ │ category        │
│ feed_type       │ │ eggs_collected  │ │ quantity        │ │ description     │
│ quantity        │ │ mortality_count │ │ unit_price      │ │ amount          │
│ date            │ │ date            │ │ total_amount    │ │ date            │
│ recorded_by(FK) │ │ recorded_by(FK) │ │ customer_name   │ │ recorded_by(FK) │
└─────────────────┘ └─────────────────┘ │ date            │ └─────────────────┘
        ↑                  ↑             │ recorded_by(FK) │
        │                  │             └─────────────────┘
        │                  │
        │ belongs to       │
        │                  │
┌─────────────────────────────────────┐
│       poultry_batches               │
├─────────────────────────────────────┤
│ batch_id (PK)                       │
│ breed                               │
│ quantity                            │
│ age                                 │
│ date_acquired                       │
│ housing_unit                        │
│ status ← Active/Sold/Deceased       │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘
        │
        │ has many
        ↓
┌─────────────────┐
│ health_records  │
├─────────────────┤
│ health_id (PK)  │
│ batch_id (FK)   │
│ vaccination_date│
│ vaccine_name    │
│ disease         │
│ treatment       │
│ vet_id (FK)     │
│ status          │
│ notes           │
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   inventory     │       │  notifications  │
├─────────────────┤       ├─────────────────┤
│ inventory_id(PK)│       │notification_id  │
│ item_name       │       │ user_id (FK)    │
│ item_type       │       │ message         │
│ quantity        │       │ type            │
│ unit            │       │ is_read         │
│ minimum_stock   │       │ created_at      │
│ unit_price      │       └─────────────────┘
│ supplier        │
└─────────────────┘
```

## 🔧 Technology Stack

### Backend (Phase 1 - ✅ Complete)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt (password hashing)
- **CORS:** cors middleware
- **Environment:** dotenv

### Frontend (Phase 3 - 📋 Planned)
- **Framework:** React.js
- **Routing:** React Router
- **HTTP Client:** Axios
- **Charts:** Chart.js / React-Chartjs-2
- **Styling:** CSS / Tailwind CSS (TBD)
- **State Management:** React Context API

## 📊 API Endpoints Structure (Phase 2 - Planned)

```
/api
├── /auth
│   ├── POST   /register          # Register new user
│   └── POST   /login             # User login
│
├── /users
│   ├── GET    /                  # Get all users
│   ├── GET    /:id               # Get user by ID
│   ├── PUT    /:id               # Update user
│   └── DELETE /:id               # Delete user
│
├── /flocks
│   ├── POST   /                  # Create poultry batch
│   ├── GET    /                  # Get all batches
│   ├── GET    /:id               # Get batch details
│   ├── PUT    /:id               # Update batch
│   ├── DELETE /:id               # Delete batch
│   └── GET    /stats             # Get statistics
│
├── /feeding
│   ├── POST   /                  # Record feeding
│   ├── GET    /                  # Get feeding records
│   ├── GET    /batch/:batchId    # Get batch feeding history
│   ├── PUT    /:id               # Update feeding record
│   └── DELETE /:id               # Delete feeding record
│
├── /production
│   ├── POST   /                  # Record production
│   ├── GET    /                  # Get production records
│   ├── GET    /batch/:batchId    # Get batch production
│   ├── GET    /stats             # Get statistics
│   └── PUT    /:id               # Update production record
│
├── /health
│   ├── POST   /                  # Record health data
│   ├── GET    /                  # Get health records
│   ├── GET    /batch/:batchId    # Get batch health history
│   ├── PUT    /:id               # Update health record
│   └── POST   /alerts            # Create health alert
│
├── /inventory
│   ├── POST   /                  # Add inventory item
│   ├── GET    /                  # Get all inventory
│   ├── GET    /:id               # Get item details
│   ├── PUT    /:id               # Update inventory
│   ├── DELETE /:id               # Remove item
│   └── GET    /alerts            # Get low stock alerts
│
├── /sales
│   ├── POST   /                  # Record sale
│   ├── GET    /                  # Get sales records
│   └── GET    /stats             # Get sales statistics
│
├── /expenses
│   ├── POST   /                  # Record expense
│   ├── GET    /                  # Get expense records
│   └── GET    /stats             # Get expense statistics
│
├── /notifications
│   ├── POST   /                  # Create notification
│   ├── GET    /user/:userId      # Get user notifications
│   └── PUT    /:id/read          # Mark as read
│
└── /reports
    ├── GET    /production        # Production reports
    ├── GET    /financial         # Financial summary
    ├── GET    /performance       # Performance metrics
    └── GET    /inventory         # Inventory reports
```

## 🎯 Project Phases

### ✅ Phase 1: Project Setup & Database Design (COMPLETE)
- [x] Initialize project structure
- [x] Set up backend with Express
- [x] Install dependencies
- [x] Create database models
- [x] Configure database connection
- [x] Set up environment variables
- [x] Create setup scripts
- [x] Write documentation

### 📋 Phase 2: Backend Development (Next)
- [ ] Implement authentication system
- [ ] Create all controllers
- [ ] Build API routes
- [ ] Add middleware (auth, validation)
- [ ] Implement role-based access
- [ ] Test all endpoints
- [ ] Add error handling

### 📋 Phase 3: Frontend Development
- [ ] Initialize React app
- [ ] Create authentication pages
- [ ] Build dashboard layouts
- [ ] Implement all modules
- [ ] Add charts and reports
- [ ] Connect to backend API
- [ ] Test user flows

### 📋 Phase 4: Integration & Testing
- [ ] Full system integration
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Performance optimization

### 📋 Phase 5: Deployment & Documentation
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Write user manual
- [ ] Create API documentation
- [ ] Final project report

## 📝 Key Features

### User Management
- Multi-role system (Admin, Manager, Worker, Veterinarian)
- Secure authentication with JWT
- Password hashing with bcrypt

### Flock Management
- Track multiple poultry batches
- Monitor breed, age, quantity
- Housing unit assignment
- Status tracking

### Production Tracking
- Daily egg collection records
- Mortality tracking
- Performance analytics

### Health Management
- Vaccination schedules
- Disease tracking
- Treatment records
- Health status monitoring

### Inventory Management
- Feed stock tracking
- Medicine inventory
- Equipment management
- Low stock alerts

### Financial Management
- Sales recording (eggs, birds, manure)
- Expense tracking by category
- Financial reports
- Profit/loss calculations

### Notifications
- Real-time alerts
- Low stock warnings
- Health alerts
- Task reminders

## 🔐 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Environment variable protection
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ CORS configuration
- 📋 Role-based access control (Phase 2)
- 📋 Input validation (Phase 2)
- 📋 Rate limiting (Phase 2)

## 📚 Documentation Files

1. **PHASE1_COMPLETED.md** - Detailed Phase 1 summary
2. **QUICK_START.md** - Setup instructions
3. **PROJECT_STRUCTURE.md** - This file
4. **backend/README.md** - Backend documentation
5. **AYOR666147-MID TERM PROJECT@@@@.docx** - Project proposal

---

**Last Updated:** November 22, 2025  
**Phase 1 Status:** ✅ COMPLETE  
**Next Phase:** Phase 2 - Backend Development

