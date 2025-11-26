# How to Find Your Database in MongoDB

## Why Database Might Not Show Up

MongoDB creates databases **lazily** - they only appear after the first document is inserted. If you just connected but haven't inserted any data, the database won't show up yet.

## Solution: Force Database Creation

Run this command to force database creation and seed users:

```bash
cd backend
npm run create:db
```

This will:
1. ✅ Connect to MongoDB
2. ✅ Force database creation by inserting a test document
3. ✅ Create the `users` collection
4. ✅ Seed default users
5. ✅ Show you exactly where to find the database

## Where to Find Your Database

### MongoDB Atlas (Cloud)

1. **Go to MongoDB Atlas Dashboard**: https://cloud.mongodb.com
2. **Click on your cluster**
3. **Click "Browse Collections"** button
4. **Select your database** from the dropdown (usually `poultry_farm`)
5. You should see collections like:
   - `users`
   - `poultrybatches`
   - `feedrecords`
   - etc.

**Note**: If you don't see "Browse Collections", the database might not exist yet. Run `npm run create:db` first.

### MongoDB Compass (Desktop App)

1. **Open MongoDB Compass**
2. **Connect** using your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/poultry_farm
   ```
3. **Look in the left sidebar** - you should see `poultry_farm` database
4. **Click on it** to see collections

### MongoDB Shell (mongosh)

```bash
# Connect to MongoDB
mongosh "mongodb+srv://username:password@cluster.mongodb.net/poultry_farm"

# List all databases
show dbs

# Use your database
use poultry_farm

# List collections
show collections

# Count users
db.users.countDocuments()
```

## Verify Database Exists

### Method 1: Check via Script

```bash
npm run test:db
```

This will show:
- Connection status
- Database name
- Existing collections
- Collection counts

### Method 2: Check Environment

```bash
npm run check:env
```

This verifies your `MONGO_URI` is set correctly.

### Method 3: List All Databases

Run this Node.js script:

```javascript
const { connectDB, mongoose } = require('./config/database');

(async () => {
  await connectDB();
  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log('Databases:', dbs.databases.map(d => d.name));
  await mongoose.connection.close();
})();
```

## Common Issues

### Database Not Showing in Atlas

**Problem**: Database doesn't appear in MongoDB Atlas UI

**Solutions**:
1. **Refresh the page** - Sometimes UI needs refresh
2. **Check you're looking at the right cluster** - Make sure you selected the correct cluster
3. **Run `npm run create:db`** - This forces database creation
4. **Check connection string** - Verify MONGO_URI points to the right cluster

### Database Shows But No Collections

**Problem**: Database exists but no collections visible

**Solutions**:
1. **Collections are created on first insert** - Run `npm run create:db` to create users
2. **Check collection names** - MongoDB uses lowercase, pluralized names:
   - `User` model → `users` collection
   - `PoultryBatch` model → `poultrybatches` collection
3. **Refresh the UI** - Sometimes needs a refresh

### Connection Works But Database Not Created

**Problem**: Connection successful but database doesn't exist

**Solution**: 
- MongoDB only creates databases when you insert data
- Run `npm run create:db` to insert test data and create the database

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run create:db` | **Force create database + seed users** |
| `npm run setup:db` | Setup database and seed users |
| `npm run test:db` | Test connection and list collections |
| `npm run check:env` | Verify .env file is loaded |
| `npm run seed` | Seed users only (requires existing DB) |

## Step-by-Step: First Time Setup

1. **Set MONGO_URI in `.env`**:
   ```env
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/poultry_farm
   ```

2. **Verify environment**:
   ```bash
   npm run check:env
   ```

3. **Test connection**:
   ```bash
   npm run test:db
   ```

4. **Create database and seed users**:
   ```bash
   npm run create:db
   ```

5. **Verify in MongoDB Atlas**:
   - Go to Atlas → Browse Collections
   - You should see `poultry_farm` database
   - Click it to see `users` collection
   - Click `users` to see the seeded users

## Still Not Working?

1. **Check MONGO_URI format**:
   - Atlas: `mongodb+srv://...`
   - Local: `mongodb://localhost:27017/...`
   - Make sure database name is in the URI

2. **Verify connection**:
   ```bash
   npm run test:db
   ```

3. **Check MongoDB Atlas**:
   - Is cluster running? (not paused)
   - Is IP whitelisted?
   - Are credentials correct?

4. **Try creating database manually**:
   ```bash
   npm run create:db
   ```

If still having issues, check the error messages from `npm run create:db` - they will tell you exactly what's wrong.

