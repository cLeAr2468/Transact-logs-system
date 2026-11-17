# Admin Notification API Auto-Detection Fix

## Problem
The admin notification page was hardcoded to use `localhost:8000` API URL, causing CORS errors when accessing the deployed site on Cloudflare Pages (`pages.dev` domain). The notification API was not automatically switching to the Railway backend URL.

## Root Cause
The file `src/api/notificationApi.js` had a hardcoded API URL:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

This meant even when the site was deployed on Cloudflare Pages, it was still trying to connect to localhost, causing:
- CORS errors (Cross-Origin Resource Sharing blocked)
- Failed network requests
- "No notifications yet" display despite having data

## Solution
Updated three files to implement automatic environment detection that prioritizes the current domain over environment variables:

### 1. `src/api/notificationApi.js`
**Before:**
```javascript
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**After:**
```javascript
// Automatically detect environment and use correct API URL
const getApiUrl = () => {
  const currentHost = window.location.hostname;
  
  // If running on production domain (Cloudflare Pages), always use Railway backend
  if (currentHost.includes('pages.dev') || currentHost.includes('transactlogs.pro')) {
    return 'https://logs-server-system-production.up.railway.app/api';
  }
  
  // If running on localhost, use local backend
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://127.0.0.1:8000/api';
  }
  
  // Default to Railway backend for any other domain
  return 'https://logs-server-system-production.up.railway.app/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

console.log('🔔 Notification API initialized with baseURL:', api.defaults.baseURL);
```

### 2. `src/api.js`
Updated the `getApiUrl()` function to prioritize domain detection over environment variables:
```javascript
const getApiUrl = () => {
  const currentHost = window.location.hostname;
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // If running on production domain (Cloudflare Pages), always use Railway backend
  if (currentHost.includes('pages.dev') || currentHost.includes('transactlogs.pro')) {
    console.log('🚀 Using Railway API:', 'https://logs-server-system-production.up.railway.app/api');
    return 'https://logs-server-system-production.up.railway.app/api';
  }
  
  // If running on localhost, use local backend (or env var if set)
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    const localUrl = envApiUrl || 'http://127.0.0.1:8000/api';
    console.log('💻 Using local API:', localUrl);
    return localUrl;
  }
  
  // Default to Railway backend for any other domain
  console.log('🌐 Using Railway API (default):', 'https://logs-server-system-production.up.railway.app/api');
  return 'https://logs-server-system-production.up.railway.app/api';
};
```

### 3. `src/utils/apiConfig.js`
Updated to match the same logic as `api.js` for consistency.

## Key Changes

### Priority Order (NEW)
1. **Domain-based detection first** - Check `window.location.hostname`
2. **Environment variable second** - Only used for localhost
3. **Default fallback** - Railway production URL

### Old Behavior (WRONG)
```
Environment Variable (.env file) → Domain Detection
```
Problem: `.env` file with localhost URL was being bundled into production builds

### New Behavior (CORRECT)
```
Domain Detection → Environment Variable (localhost only) → Default (Railway)
```
Solution: Domain check happens first, so production deployments always use Railway

## Benefits

1. **Automatic Switching**: No manual configuration needed when switching between local dev and production
2. **Works on Any Domain**: Correctly detects:
   - `localhost` / `127.0.0.1` → Local backend
   - `*.pages.dev` → Railway backend
   - `transactlogs.pro` → Railway backend
   - Any other domain → Railway backend (safe default)
3. **Debug Logging**: Console logs show which API URL is being used
4. **CORS Compliant**: Added `withCredentials: true` for proper authentication
5. **Environment Variable Override**: Still respects `.env` for local development

## Testing

### On Cloudflare Pages (Production)
Open browser console and look for:
```
🚀 Using Railway API: https://logs-server-system-production.up.railway.app/api
✅ API initialized with baseURL: https://logs-server-system-production.up.railway.app/api
🔔 Notification API initialized with baseURL: https://logs-server-system-production.up.railway.app/api
```

### On Localhost (Development)
```
💻 Using local API: http://127.0.0.1:8000/api
✅ API initialized with baseURL: http://127.0.0.1:8000/api
🔔 Notification API initialized with baseURL: http://127.0.0.1:8000/api
```

## Files Changed
- ✅ `src/api/notificationApi.js` - Fixed hardcoded localhost URL
- ✅ `src/api.js` - Improved domain-first detection
- ✅ `src/utils/apiConfig.js` - Synced with main api.js logic

## Deployment
The fix has been committed and pushed to the main branch. Cloudflare Pages will automatically rebuild and deploy with these changes.

## Verification Steps
1. Wait for Cloudflare Pages to finish deploying (check dashboard)
2. Visit the deployed site: `https://<your-deployment>.pages.dev`
3. Open browser DevTools → Console
4. Navigate to the Notifications page
5. Verify console shows Railway API URL
6. Verify notifications load without CORS errors

---

**Fixed by:** Kiro AI  
**Date:** November 2026  
**Commit:** c3dc4d6  
**Related Issue:** Admin notification page not connecting to Railway backend on production deployment
