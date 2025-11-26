# Poultry Farm Management System - API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Flocks](#flocks)
4. [Feeding](#feeding)
5. [Production](#production)
6. [Health](#health)
7. [Inventory](#inventory)
8. [Sales](#sales)
9. [Expenses](#expenses)
10. [Notifications](#notifications)
11. [Reports](#reports)

---

## Authentication

### Register User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Worker",
  "phone": "+254700000000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Worker",
    "phone": "+254700000000",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## Users

### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
Roles: Admin, Manager
```

### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>

Body:
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+254700000001"
}
```

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
Roles: Admin
```

---

## Flocks

### Create Poultry Batch
```http
POST /api/flocks
Authorization: Bearer <token>
Roles: Admin, Manager

Body:
{
  "breed": "Layers",
  "quantity": 500,
  "age": 8,
  "date_acquired": "2025-01-15",
  "housing_unit": "House A",
  "status": "Active"
}
```

### Get All Flocks
```http
GET /api/flocks?status=Active&breed=Layers
Authorization: Bearer <token>
```

### Get Flock by ID
```http
GET /api/flocks/:id
Authorization: Bearer <token>
```

### Update Flock
```http
PUT /api/flocks/:id
Authorization: Bearer <token>
Roles: Admin, Manager
```

### Delete Flock
```http
DELETE /api/flocks/:id
Authorization: Bearer <token>
Roles: Admin
```

### Get Flock Statistics
```http
GET /api/flocks/stats/summary
Authorization: Bearer <token>
```

---

## Feeding

### Create Feeding Record
```http
POST /api/feeding
Authorization: Bearer <token>

Body:
{
  "batch_id": 1,
  "feed_type": "Layer Mash",
  "quantity": 50,
  "unit": "kg",
  "date": "2025-11-22"
}
```

### Get All Feeding Records
```http
GET /api/feeding?batch_id=1&start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer <token>
```

### Get Batch Feeding History
```http
GET /api/feeding/batch/:batchId
Authorization: Bearer <token>
```

### Update Feeding Record
```http
PUT /api/feeding/:id
Authorization: Bearer <token>
```

### Delete Feeding Record
```http
DELETE /api/feeding/:id
Authorization: Bearer <token>
Roles: Admin, Manager
```

---

## Production

### Create Production Record
```http
POST /api/production
Authorization: Bearer <token>

Body:
{
  "batch_id": 1,
  "eggs_collected": 450,
  "mortality_count": 2,
  "date": "2025-11-22",
  "notes": "Normal production day"
}
```

### Get All Production Records
```http
GET /api/production?batch_id=1&start_date=2025-11-01
Authorization: Bearer <token>
```

### Get Batch Production
```http
GET /api/production/batch/:batchId
Authorization: Bearer <token>
```

### Get Production Statistics
```http
GET /api/production/stats/summary?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer <token>
```

### Update Production Record
```http
PUT /api/production/:id
Authorization: Bearer <token>
```

### Delete Production Record
```http
DELETE /api/production/:id
Authorization: Bearer <token>
Roles: Admin, Manager
```

---

## Health

### Create Health Record
```http
POST /api/health
Authorization: Bearer <token>
Roles: Admin, Manager, Veterinarian

Body:
{
  "batch_id": 1,
  "vaccination_date": "2025-11-22",
  "vaccine_name": "Newcastle Disease Vaccine",
  "status": "Healthy",
  "notes": "Routine vaccination"
}
```

### Get All Health Records
```http
GET /api/health?batch_id=1&status=Healthy
Authorization: Bearer <token>
```

### Get Batch Health History
```http
GET /api/health/batch/:batchId
Authorization: Bearer <token>
```

### Get Active Health Alerts
```http
GET /api/health/alerts/active
Authorization: Bearer <token>
```

### Update Health Record
```http
PUT /api/health/:id
Authorization: Bearer <token>
Roles: Admin, Manager, Veterinarian
```

### Delete Health Record
```http
DELETE /api/health/:id
Authorization: Bearer <token>
Roles: Admin
```

---

## Inventory

### Create Inventory Item
```http
POST /api/inventory
Authorization: Bearer <token>
Roles: Admin, Manager

Body:
{
  "item_name": "Layer Mash",
  "item_type": "Feed",
  "quantity": 1000,
  "unit": "kg",
  "minimum_stock": 200,
  "unit_price": 50,
  "supplier": "ABC Feeds Ltd"
}
```

### Get All Inventory Items
```http
GET /api/inventory?item_type=Feed
Authorization: Bearer <token>
```

### Get Inventory Item
```http
GET /api/inventory/:id
Authorization: Bearer <token>
```

### Get Low Stock Alerts
```http
GET /api/inventory/alerts/low-stock
Authorization: Bearer <token>
```

### Update Inventory Item
```http
PUT /api/inventory/:id
Authorization: Bearer <token>
Roles: Admin, Manager
```

### Delete Inventory Item
```http
DELETE /api/inventory/:id
Authorization: Bearer <token>
Roles: Admin
```

---

## Sales

### Create Sales Record
```http
POST /api/sales
Authorization: Bearer <token>

Body:
{
  "product_type": "Eggs",
  "quantity": 100,
  "unit_price": 15,
  "total_amount": 1500,
  "customer_name": "Jane Doe",
  "customer_phone": "+254700000000",
  "date": "2025-11-22",
  "notes": "Bulk order"
}
```

### Get All Sales Records
```http
GET /api/sales?product_type=Eggs&start_date=2025-11-01
Authorization: Bearer <token>
```

### Get Sales Statistics
```http
GET /api/sales/stats/summary?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer <token>
```

### Update Sales Record
```http
PUT /api/sales/:id
Authorization: Bearer <token>
Roles: Admin, Manager
```

### Delete Sales Record
```http
DELETE /api/sales/:id
Authorization: Bearer <token>
Roles: Admin
```

---

## Expenses

### Create Expense Record
```http
POST /api/expenses
Authorization: Bearer <token>

Body:
{
  "category": "Feed",
  "description": "Purchase of layer mash",
  "amount": 50000,
  "date": "2025-11-22",
  "notes": "Monthly feed purchase"
}
```

### Get All Expense Records
```http
GET /api/expenses?category=Feed&start_date=2025-11-01
Authorization: Bearer <token>
```

### Get Expense Statistics
```http
GET /api/expenses/stats/summary?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer <token>
```

### Update Expense Record
```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Roles: Admin, Manager
```

### Delete Expense Record
```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
Roles: Admin
```

---

## Notifications

### Create Notification
```http
POST /api/notifications
Authorization: Bearer <token>
Roles: Admin, Manager

Body:
{
  "user_id": 1,
  "message": "Low feed stock alert",
  "type": "Warning"
}
```

### Get User Notifications
```http
GET /api/notifications/user/:userId
Authorization: Bearer <token>
```

### Mark Notification as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /api/notifications/user/:userId/read-all
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

---

## Reports

### Get Production Report
```http
GET /api/reports/production?start_date=2025-11-01&end_date=2025-11-30&batch_id=1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEggs": 13500,
      "totalMortality": 15,
      "recordCount": 30,
      "avgEggsPerDay": "450.00"
    },
    "trend": [...]
  }
}
```

### Get Financial Report
```http
GET /api/reports/financial?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer <token>
Roles: Admin, Manager
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 150000,
      "totalExpenses": 80000,
      "profit": 70000,
      "profitMargin": 46.67,
      "salesCount": 45,
      "expenseCount": 20
    },
    "revenueByProduct": [...],
    "expensesByCategory": [...]
  }
}
```

### Get Performance Metrics
```http
GET /api/reports/performance?start_date=2025-11-01&end_date=2025-11-30
Authorization: Bearer <token>
```

### Get Inventory Report
```http
GET /api/reports/inventory?item_type=Feed
Authorization: Bearer <token>
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'Worker' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message (development only)"
}
```

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all endpoints |
| **Manager** | Create, read, update flocks, feeding, production, health, inventory, sales, expenses |
| **Worker** | Read and create feeding, production records |
| **Veterinarian** | Full access to health records |

---

## Query Parameters

### Common Filters
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)
- `batch_id` - Filter by poultry batch
- `status` - Filter by status
- `category` - Filter by category
- `product_type` - Filter by product type
- `item_type` - Filter by item type

---

## Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

**Last Updated:** November 22, 2025  
**API Version:** 1.0.0

