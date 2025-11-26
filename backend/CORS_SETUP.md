# CORS Configuration Guide

## Issue: CORS Errors in Production

If you're seeing CORS errors like:
```
Access to XMLHttpRequest at 'https://backend-url.com/api/auth/login' from origin 'https://frontend-url.com' 
has been blocked by CORS policy
```

This guide will help you fix it.

## Solution

The CORS configuration has been updated to:
- ✅ Handle trailing slashes in URLs automatically
- ✅ Support multiple origins
- ✅ Work with Vercel deployment URLs
- ✅ Allow localhost in development

## Environment Variables

Set `CLIENT_URL` in your backend deployment platform (Railway, Heroku, etc.):

### For Single Frontend URL:
```env
CLIENT_URL=https://poultry-farm-management-47bp.vercel.app
```

**Important**: Don't include trailing slash - the code handles it automatically.

### For Multiple Frontend URLs:
If you have multiple frontend deployments, you can modify `server.js` to add them to the `getAllowedOrigins()` function.

## Setting CLIENT_URL in Deployment Platforms

### Railway:
1. Go to your backend service
2. Click on **Variables** tab
3. Add new variable:
   - **Name**: `CLIENT_URL`
   - **Value**: `https://poultry-farm-management-47bp.vercel.app`
4. Click **Add**
5. Redeploy the service

### Heroku:
```bash
heroku config:set CLIENT_URL="https://poultry-farm-management-47bp.vercel.app" -a your-backend-app-name
```

### Render:
1. Go to your service dashboard
2. Click **Environment** tab
3. Add environment variable:
   - **Key**: `CLIENT_URL`
   - **Value**: `https://poultry-farm-management-47bp.vercel.app`
4. Save and redeploy

## How It Works

The CORS middleware now:
1. **Normalizes origins** - Removes trailing slashes for comparison
2. **Checks against allowed list** - Compares normalized origins
3. **Allows localhost in development** - Automatically allows localhost:3000 in non-production
4. **Handles no-origin requests** - Allows requests without origin header

## Testing

### Local Development:
- Frontend: `http://localhost:3000` ✅ (automatically allowed)
- Backend: `http://localhost:5000`

### Production:
- Frontend: Your Vercel URL (set in `CLIENT_URL`)
- Backend: Your Railway/Heroku URL

## Troubleshooting

### Still Getting CORS Errors?

1. **Verify CLIENT_URL is set correctly:**
   ```bash
   # In your deployment platform, check environment variables
   # Should be: https://poultry-farm-management-47bp.vercel.app
   # NOT: https://poultry-farm-management-47bp.vercel.app/
   ```

2. **Check the exact error message:**
   - Look for the origin in the error
   - Make sure it matches your `CLIENT_URL` (without trailing slash)

3. **Redeploy after setting CLIENT_URL:**
   - Environment variables require a redeploy to take effect

4. **Check browser console:**
   - Look for the exact origin being blocked
   - Compare it with your `CLIENT_URL` setting

### Common Issues

**Issue**: "The 'Access-Control-Allow-Origin' header has a value '.../' that is not equal to the supplied origin"

**Solution**: The code now normalizes trailing slashes automatically. Make sure `CLIENT_URL` doesn't have a trailing slash, and redeploy.

**Issue**: CORS works locally but not in production

**Solution**: 
- Verify `CLIENT_URL` is set in production environment
- Check that the frontend URL matches exactly (case-sensitive)
- Redeploy the backend after setting the variable

## Frontend Configuration

Make sure your frontend API base URL is set correctly:

```javascript
// In your frontend .env or config
REACT_APP_API_URL=https://poultry-farm-management-production.up.railway.app
```

Or in your API service file:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## Security Notes

- ✅ Only specified origins are allowed in production
- ✅ Credentials are enabled for cookie-based auth
- ✅ Specific HTTP methods are allowed
- ✅ Development mode is more permissive (for testing)

## Quick Checklist

- [ ] Set `CLIENT_URL` in backend deployment platform
- [ ] No trailing slash in `CLIENT_URL`
- [ ] Redeployed backend after setting variable
- [ ] Frontend URL matches `CLIENT_URL` exactly
- [ ] Tested login/API calls from frontend
- [ ] Checked browser console for CORS errors

## Need Help?

If CORS errors persist:
1. Check backend logs for CORS warnings
2. Verify environment variables are set correctly
3. Test with `curl` to see exact CORS headers:
   ```bash
   curl -H "Origin: https://your-frontend-url.com" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS \
        https://your-backend-url.com/api/auth/login \
        -v
   ```

