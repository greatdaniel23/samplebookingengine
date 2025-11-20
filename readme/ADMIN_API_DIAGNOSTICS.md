# Admin Panel API Configuration Documentation

## 🎯 Issue Summary
The admin panel at `http://127.0.0.1:8080/admin` is making API calls to localhost instead of the production API server.

**Expected Behavior:** All API calls should go to `https://api.rumahdaisycantik.com`  
**Current Problem:** API calls are going to localhost/127.0.0.1

## 📊 Diagnostic Tools Created

### 1. API URL Tester
**URL:** `http://127.0.0.1:8080/api-url-test`
- Shows current environment variables
- Displays resolved API URLs from paths configuration
- Tests each API endpoint
- **Color Coding:** 🟢 Green = Production API, 🔴 Red = Localhost API

### 2. Admin Panel Diagnostics Tab
**Location:** Admin Panel → "API Diagnostics" tab
- Real-time monitoring of console logs
- Network request interception
- Live API call tracking
- **Features:** Start/Stop monitoring, Export diagnostics, Test API calls

### 3. Comprehensive Debug Page
**URL:** `http://127.0.0.1:8080/env-debug`
- Deep environment variable inspection
- Paths configuration analysis
- Real-time API testing

### 4. Console Diagnostics
**Console Output:** Automatic diagnostic logging on page load
- Environment variable dump
- Paths configuration check
- Localhost detection warning

## 🔧 Configuration Files Status

### Environment Variables (.env.development)
```bash
# Development Environment Variables - Using Production API
VITE_API_BASE=https://api.rumahdaisycantik.com
VITE_PUBLIC_BASE=/
```
✅ **Status:** Correctly configured for production API

### Paths Configuration (src/config/paths.ts)
```typescript
// Always use production API URL regardless of environment
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_PRODUCTION_API;
```
✅ **Status:** Configured to use environment variable or fallback to production

### Vite Configuration (vite.config.ts)
```typescript
server: {
  host: "127.0.0.1",
  port: 8080,
  // No proxy needed - always use production API directly
},
```
✅ **Status:** No proxy configuration that could interfere

## 🏥 Admin Panel Sections Analysis

All admin panel sections are using the correct pattern:
```typescript
const response = await fetch(paths.buildApiUrl('endpoint.php'));
```

### Sections Checked:
- ✅ **Overview Section:** Uses `paths.buildApiUrl()`
- ✅ **Bookings Management:** Uses `paths.buildApiUrl()`  
- ✅ **Rooms Management:** Uses `paths.buildApiUrl()`
- ✅ **Packages Management:** Uses `paths.buildApiUrl()`
- ✅ **Property Management:** Uses `paths.buildApiUrl()`
- ✅ **Analytics & Reports:** Uses `paths.buildApiUrl()`

## 🔍 How to Diagnose the Issue

### Step 1: Open API URL Tester
1. Go to `http://127.0.0.1:8080/api-url-test`
2. Check "Environment Variables" section - `VITE_API_BASE` should be `https://api.rumahdaisycantik.com`
3. Check "Paths Configuration" section - all URLs should start with `https://api.rumahdaisycantik.com`
4. If any URLs show localhost, there's a configuration problem

### Step 2: Check Browser Console
1. Open browser Developer Tools (F12)
2. Look for diagnostic messages starting with "🔍 Environment Diagnostic Check"
3. Check if "Using Localhost API" shows "NO (Good)" or "YES (PROBLEM!)"

### Step 3: Monitor Network Requests
1. Go to `http://127.0.0.1:8080/admin`
2. Open "API Diagnostics" tab in the admin panel
3. Click "Start Monitoring"
4. Navigate through different admin sections
5. Check the "Network Requests Monitor" table
6. Look for 🔴 red entries (localhost calls) vs 🟢 green entries (production calls)

### Step 4: Test API Endpoints
In the API Diagnostics tab:
1. Click "Test APIs" button
2. Check console output
3. Verify production API is accessible

## 🚨 Common Issues & Solutions

### Issue 1: Environment Variables Not Loading
**Symptoms:** API URL Tester shows `undefined` for `VITE_API_BASE`
**Solution:** 
```bash
# Restart development server
npm run dev
```

### Issue 2: Browser Cache
**Symptoms:** Changes not reflected in browser
**Solution:** 
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Clear browser cache
3. Restart development server

### Issue 3: Vite Cache
**Symptoms:** Environment changes not taking effect
**Solution:**
```bash
# Clear Vite cache and restart
rm -rf node_modules/.vite
rm -rf .vite
npm run dev
```

### Issue 4: Multiple Environment Files
**Symptoms:** Wrong API base despite correct .env.development
**Check for:** `.env.local`, `.env.development.local` files that might override settings

## 📝 Expected Diagnostic Results

### ✅ Correct Configuration:
- Environment Variables: `VITE_API_BASE: "https://api.rumahdaisycantik.com"`
- API URLs: All start with `https://api.rumahdaisycantik.com`
- Network Monitor: All requests show 🟢 "production" type
- Console: "Using Localhost API: NO (Good)"

### ❌ Problem Configuration:
- Environment Variables: `VITE_API_BASE: undefined` or localhost URL
- API URLs: Contain `localhost` or `127.0.0.1`
- Network Monitor: Requests show 🔴 "localhost" type  
- Console: "Using Localhost API: YES (PROBLEM!)"

## 🔄 Next Steps

1. **Test Configuration:** Use diagnostic tools to verify current state
2. **Identify Root Cause:** Determine if issue is environment, cache, or code
3. **Apply Fix:** Based on diagnostic results
4. **Verify Solution:** Confirm all admin sections use production API

## 📞 Troubleshooting Checklist

- [ ] Environment file exists and has correct content
- [ ] Vite development server restarted after env changes
- [ ] Browser cache cleared
- [ ] API URL Tester shows production URLs
- [ ] Console diagnostics show correct configuration
- [ ] Network monitor shows only production API calls
- [ ] All admin sections tested individually

---

**Last Updated:** November 17, 2025  
**Configuration Target:** https://api.rumahdaisycantik.com  
**Development Server:** http://127.0.0.1:8080/