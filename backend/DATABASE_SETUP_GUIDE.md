# Database Setup and User Seeding Guide

This guide will help you set up your MongoDB database and seed initial users.

## Quick Start

### 1. Set Environment Variable

Create or update `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/poultry_farm
```

**For MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/poultry_farm?retryWrites=true&w=majority
```

### 2. Test Connection

```bash
cd backend
npm run test:db
```

This will verify your MongoDB connection and database access.

### 3. Setup Database and Seed Users

```bash
npm run setup:db
```

This will:
- ✅ Connect to MongoDB
- ✅ Create/verify database exists
- ✅ Initialize all collections
- ✅ Seed default users (Admin, Manager, Worker, Veterinarian)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run test:db` | Test MongoDB connection and access |
| `npm run setup:db` | Setup database and seed all users |
| `npm run seed` | Seed users only (requires existing connection) |
| `npm run setup` | Basic connection test |

## Default Users Created

After running `npm run setup:db`, these users will be available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@poultryfarm.com | admin123 |
| Manager | manager@poultryfarm.com | manager123 |
| Worker | worker@poultryfarm.com | worker123 |
| Veterinarian | vet@poultryfarm.com | vet123 |

⚠️ **Important:** Change these passwords in production!

## Step-by-Step Setup

### Option 1: Local MongoDB

1. **Install MongoDB** (if not already installed):
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: Follow MongoDB installation guide

2. **Start MongoDB**:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   mongod
   ```

3. **Set MONGO_URI in .env**:
   ```env
   MONGO_URI=mongodb://localhost:27017/poultry_farm
   ```

4. **Run setup**:
   ```bash
   npm run setup:db
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas account**: https://www.mongodb.com/cloud/atlas

2. **Create a cluster** (free M0 tier is fine)

3. **Create database user**:
   - Go to Database Access
   - Add New Database User
   - Choose Password authentication
   - Save username and password

4. **Whitelist IP addresses**:
   - Go to Network Access
   - Add IP Address
   - For development: Add `0.0.0.0/0` (allows all IPs)
   - For production: Add specific IPs

5. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `poultry_farm`

6. **Set MONGO_URI in .env**:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/poultry_farm?retryWrites=true&w=majority
   ```

7. **Run setup**:
   ```bash
   npm run setup:db
   ```

## Verification

After setup, verify everything works:

1. **Check connection**:
   ```bash
   npm run test:db
   ```

2. **Start server**:
   ```bash
   npm run dev
   ```

3. **Test login**:
   - Go to your frontend
   - Login with: `admin@poultryfarm.com` / `admin123`
   - You should see the dashboard

## Troubleshooting

### Connection Refused Error

```
❌ Unable to connect to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
- Check MongoDB is running (local MongoDB)
- Verify MONGO_URI is set correctly
- Check network access (MongoDB Atlas)
- Verify IP is whitelisted (MongoDB Atlas)

### Authentication Failed

```
❌ Unable to connect to MongoDB: Authentication failed
```

**Solutions:**
- Verify database user credentials
- Check password is URL-encoded if it contains special characters
- Ensure database user has proper permissions

### Database Already Exists

The script will skip existing users automatically. If you want to reset:

1. **Delete users manually** (via MongoDB shell or Atlas UI)
2. **Or drop the database** (careful - deletes all data):
   ```javascript
   // In MongoDB shell or Atlas
   use poultry_farm
   db.dropDatabase()
   ```
3. **Run setup again**: `npm run setup:db`

## Script Details

### `setupDatabase.js`
- Connects to MongoDB
- Creates database (if doesn't exist)
- Initializes all model collections
- Seeds default users
- Provides detailed output

### `testConnection.js`
- Tests MongoDB connection
- Verifies database access
- Tests read/write permissions
- Lists existing collections

### `seedUsers.js`
- Seeds users only (assumes connection exists)
- Can be run multiple times (skips existing users)
- Useful for adding users after initial setup

## Production Considerations

1. **Change default passwords** immediately
2. **Use strong passwords** for database users
3. **Restrict IP access** in MongoDB Atlas
4. **Enable MongoDB authentication** (required in Atlas)
5. **Use environment variables** for MONGO_URI (never commit to git)
6. **Set AUTO_SEED=false** in production to prevent auto-seeding on server start

## Next Steps

After database setup:
1. ✅ Database is ready
2. ✅ Users are seeded
3. ✅ Start server: `npm run dev`
4. ✅ Test API endpoints
5. ✅ Login with default credentials
6. ✅ Change passwords in production

For more information, see:
- `MONGODB_SETUP.md` - MongoDB connection setup
- `DEPLOYMENT.md` - Deployment guide
- `README.md` - Project overview

