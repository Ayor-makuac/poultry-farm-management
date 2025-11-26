# Deployment Guide

## MongoDB Migration - Important Notes

This project has been migrated from MySQL/Sequelize to MongoDB/Mongoose. If you encounter Sequelize-related errors during deployment, follow these steps:

## Common Deployment Issues

### Error: "Dialect needs to be explicitly supplied as of v4.0.0"

This error occurs when Sequelize is still present in `node_modules` from a previous deployment or cached build.

#### Solution 1: Clear Build Cache and Reinstall

**For Railway:**
1. Go to your service settings
2. Click "Clear Build Cache"
3. Redeploy the service

**For Heroku:**
```bash
heroku repo:purge_cache -a your-app-name
git commit --allow-empty -m "Clear cache"
git push heroku main
```

**For Docker/General:**
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clean npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

#### Solution 2: Verify Dependencies

Ensure your `package.json` only includes:
- ✅ `mongoose` (NOT `sequelize`)
- ✅ No `mysql2` or `sequelize` dependencies

#### Solution 3: Force Clean Install

Add to your deployment platform's build command:
```bash
rm -rf node_modules package-lock.json && npm install --no-cache
```

## Environment Variables

Ensure these are set in your deployment platform:

```env
MONGO_URI=mongodb://your-connection-string
JWT_SECRET=your-secret-key
CLIENT_URL=https://your-frontend-url.com
NODE_ENV=production
AUTO_SEED=false  # Disable auto-seeding in production
```

## Build Commands

### Railway
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`

### Heroku
- **Buildpack:** Node.js
- **Procfile:** `web: cd backend && npm start`

### Vercel/Netlify
These platforms are primarily for frontend. Deploy backend separately on Railway, Heroku, or similar.

## Verification Steps

After deployment, verify:

1. **Check logs** for MongoDB connection:
   ```
   ✅ MongoDB connected successfully
   ```

2. **Test API endpoint:**
   ```bash
   curl https://your-api-url.com/
   ```

3. **Verify no Sequelize errors:**
   - Check deployment logs
   - Ensure no references to `sequelize` or `mysql2`

## Troubleshooting

### Still seeing Sequelize errors?

1. **Check package-lock.json** - Remove it and regenerate:
   ```bash
   rm package-lock.json
   npm install
   ```

2. **Verify all files are committed:**
   ```bash
   git status
   git add .
   git commit -m "Remove Sequelize dependencies"
   git push
   ```

3. **Check for cached files:**
   - Clear deployment platform cache
   - Remove `.next`, `dist`, or other build directories if present

### MongoDB Connection Issues

If MongoDB connection fails:

1. **Check MONGO_URI format:**
   - Local: `mongodb://localhost:27017/poultry_farm`
   - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

2. **Verify network access:**
   - Atlas: Whitelist deployment platform IP
   - Check firewall settings

3. **Test connection locally first:**
   ```bash
   npm run setup
   ```

## Pre-Deployment Checklist

- [ ] Removed all Sequelize dependencies from `package.json`
- [ ] Verified `package-lock.json` has no Sequelize references
- [ ] Updated all environment variables
- [ ] Tested MongoDB connection locally
- [ ] Cleared deployment platform cache
- [ ] Verified `backend/config/database.js` uses Mongoose
- [ ] All models use Mongoose schemas
- [ ] Controllers use Mongoose queries

## Support

If issues persist:
1. Check deployment logs for specific error messages
2. Verify MongoDB connection string is correct
3. Ensure all code changes are committed and pushed
4. Try a fresh deployment from a clean branch

