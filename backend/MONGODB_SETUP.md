# MongoDB Connection Setup Guide

## Issue: Connection Refused Error

If you see this error:
```
❌ Unable to connect to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

This means the `MONGO_URI` environment variable is not set, and the app is trying to connect to localhost (which doesn't exist on deployment servers).

## Solution: Set MONGO_URI Environment Variable

You need to set the `MONGO_URI` environment variable in your deployment platform with your MongoDB connection string.

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create a MongoDB Atlas account** (free tier available): https://www.mongodb.com/cloud/atlas

2. **Create a cluster** (choose the free M0 tier)

3. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)

4. **Set environment variable in your deployment platform:**

   **Railway:**
   - Go to your service → Variables tab
   - Add: `MONGO_URI` = `mongodb+srv://username:password@cluster.mongodb.net/poultry_farm?retryWrites=true&w=majority`
   - Replace `username`, `password`, and `cluster` with your actual values

   **Heroku:**
   ```bash
   heroku config:set MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/poultry_farm?retryWrites=true&w=majority" -a your-app-name
   ```

   **Render:**
   - Go to your service → Environment tab
   - Add: `MONGO_URI` = `mongodb+srv://username:password@cluster.mongodb.net/poultry_farm?retryWrites=true&w=majority`

5. **Whitelist IP addresses in Atlas:**
   - Go to Network Access in Atlas
   - Add `0.0.0.0/0` (allows all IPs) or your deployment platform's IP range

### Option 2: Local MongoDB (Development Only)

For local development, you can use:

```env
MONGO_URI=mongodb://localhost:27017/poultry_farm
```

**Note:** This won't work in production deployments unless you have MongoDB running on the same server.

## Required Environment Variables

Make sure these are set in your deployment platform:

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/poultry_farm
JWT_SECRET=your-secret-key-here
CLIENT_URL=https://your-frontend-url.com
NODE_ENV=production
AUTO_SEED=false
```

## Testing the Connection

After setting `MONGO_URI`, redeploy your application. You should see:

```
✅ MongoDB connected successfully
📦 Database: poultry_farm
```

Instead of the connection refused error.

## Troubleshooting

### Still getting connection refused?

1. **Verify MONGO_URI is set:**
   - Check your deployment platform's environment variables
   - Ensure there are no typos
   - Make sure it's set for the correct service/environment

2. **Check MongoDB Atlas network access:**
   - Ensure your deployment platform's IP is whitelisted
   - Or use `0.0.0.0/0` for testing (less secure)

3. **Verify connection string format:**
   - Atlas: `mongodb+srv://...`
   - Local: `mongodb://...`
   - Make sure username/password are URL-encoded if they contain special characters

4. **Check MongoDB Atlas database user:**
   - Ensure the user exists and has proper permissions
   - Password should match what's in the connection string

### Connection timeout?

- Check if MongoDB Atlas cluster is running (not paused)
- Verify network access settings
- Check if your deployment platform allows outbound connections

## Quick Setup Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created a cluster
- [ ] Created a database user
- [ ] Whitelisted IP addresses (or 0.0.0.0/0)
- [ ] Copied connection string
- [ ] Set MONGO_URI in deployment platform
- [ ] Redeployed application
- [ ] Verified connection in logs

