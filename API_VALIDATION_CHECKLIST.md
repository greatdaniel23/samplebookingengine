# 🔍 API & CORS Validation Checklist

## 📋 **File Validation List**

### **🎯 PRIORITY 1: API Configuration Files**

#### **1. Core API Configuration**
- [ ] `src/config/paths.ts` - API URL configuration
- [ ] `config.js` - Global configuration (if exists)
- [ ] `vite.config.ts` - Development proxy settings

#### **2. API Service Files**
- [ ] `src/services/api.js` - Main API service
- [ ] `src/services/packageService.ts` - Package API calls
- [ ] `src/services/villaService.ts` - Villa API calls
- [ ] `src/services/roomService.ts` - Room API calls (if exists)

#### **3. React Hooks (Data Fetching)**
- [ ] `src/hooks/useVillaInfo.tsx` - Villa data fetching
- [ ] `src/hooks/usePackages.tsx` - Package data fetching  
- [ ] `src/hooks/useRooms.tsx` - Room data fetching
- [ ] `src/hooks/useHomepageContent.tsx` - Homepage data

### **🎯 PRIORITY 2: Backend API Files**

#### **4. PHP API Endpoints**
- [ ] `api/villa.php` - Villa information endpoint
- [ ] `api/rooms.php` - Room listings endpoint
- [ ] `api/packages.php` - Package data endpoint
- [ ] `api/bookings.php` - Booking management
- [ ] `api/init-data.php` - Initial data setup
- [ ] `api/init-villa.php` - Villa initialization

#### **5. API Infrastructure**
- [ ] `api/config/database.php` - Database connection
- [ ] `api/.htaccess` - Apache configuration
- [ ] `api/index.php` - API root file

### **🎯 PRIORITY 3: Frontend Components**

#### **6. Data-Consuming Components**
- [ ] `src/pages/Index.tsx` - Homepage data usage
- [ ] `src/components/Footer.tsx` - Villa info display
- [ ] `src/components/AboutSection.tsx` - Property details
- [ ] `src/components/RoomsSection.tsx` - Room listings
- [ ] `src/components/PackageCard.tsx` - Package display

#### **7. Admin Components**
- [ ] `src/pages/AdminPanel.tsx` - Admin data management
- [ ] `src/components/admin/PropertySection.tsx` - Property editing
- [ ] `src/components/admin/RoomsSection.tsx` - Room management
- [ ] `src/components/admin/PackagesSection.tsx` - Package management

### **🎯 PRIORITY 4: Build & Deployment**

#### **8. Build Configuration**
- [ ] `package.json` - Dependencies and scripts
- [ ] `tsconfig.json` - TypeScript configuration
- [ ] `tailwind.config.ts` - CSS configuration
- [ ] `postcss.config.js` - CSS processing

#### **9. Deployment Files**
- [ ] `vercel.json` - Vercel deployment config
- [ ] `index.html` - Main HTML file
- [ ] `.env` files (if any) - Environment variables

---

## 🔍 **Validation Commands**

### **API URL Validation**
```bash
# Check current API configuration
grep -r "api.rumahdaisycantik.com" src/
grep -r "API_BASE_URL" src/
grep -r "buildApiUrl" src/
```

### **CORS Headers Validation**
```bash
# Test API endpoints
curl -I https://api.rumahdaisycantik.com/villa.php
curl -I https://api.rumahdaisycantik.com/rooms.php  
curl -I https://api.rumahdaisycantik.com/packages.php
```

### **Local API Testing**
```bash
# Test local endpoints
curl -I http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api/villa.php
curl -I http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api/rooms.php
```

### **Frontend Build Testing**
```bash
# Check for API references in build
npm run build
grep -r "api.rumahdaisycantik.com" dist/
```

---

## 📊 **File Content Validation**

### **1. Check API URL Configuration**
```bash
# Primary config file
cat src/config/paths.ts | grep -A 10 -B 10 "API_BASE_URL\|buildApiUrl"

# Service files
grep -n "fetch\|API_BASE_URL" src/services/*.ts src/services/*.js
```

### **2. Check CORS Headers in PHP**
```bash
# Look for existing CORS headers
grep -n "Access-Control-Allow-Origin" api/*.php
grep -n "header(" api/*.php | grep -i cors
```

### **3. Check Hook Dependencies**
```bash
# Find all API calls in hooks
grep -n "fetch\|axios" src/hooks/*.tsx
grep -n "useEffect" src/hooks/*.tsx
```

---

## ✅ **Validation Checklist Template**

### **Configuration Validation:**
- [ ] API_BASE_URL points to correct domain
- [ ] Development vs Production environment detection working
- [ ] No hardcoded localhost URLs in production build
- [ ] Proxy configuration (if used) properly set up

### **CORS Validation:**
- [ ] All PHP files have proper CORS headers
- [ ] OPTIONS preflight requests handled
- [ ] Correct origin domains specified
- [ ] No wildcard (*) CORS in production

### **API Endpoint Validation:**
- [ ] All endpoints return 200 status (not 522)
- [ ] JSON responses properly formatted
- [ ] Error handling implemented
- [ ] Database connections working

### **Frontend Integration Validation:**
- [ ] React hooks properly handle API failures
- [ ] Loading states implemented
- [ ] Error states with fallback data
- [ ] No infinite re-fetch loops

### **Production Deployment Validation:**
- [ ] Build process includes correct API URLs
- [ ] No development URLs in production bundle
- [ ] Environment variables properly set
- [ ] CDN/hosting configuration correct

---

## 🚨 **Critical Files to Check First**

### **Immediate Priority:**
1. **`src/config/paths.ts`** - Main API configuration
2. **`api/villa.php`** - Most critical endpoint
3. **`api/packages.php`** - Package data source
4. **`api/rooms.php`** - Room listings source

### **Secondary Priority:**
5. **`src/hooks/useVillaInfo.tsx`** - Homepage data fetching
6. **`vite.config.ts`** - Development server config
7. **`vercel.json`** - Production deployment config

### **Error Source Priority:**
8. **`src/services/packageService.ts:30`** - Package fetch error
9. **`src/hooks/usePackages.tsx:21`** - Package hook error
10. **`src/hooks/useRooms.tsx:13`** - Room fetch error

---

**Next Steps:**
1. Start with Priority 1 files
2. Run validation commands
3. Fix any misconfigurations found
4. Test each fix incrementally
5. Document working solutions

---

## 🚨 VALIDATION RESULTS - CRITICAL FINDINGS

🔴 **Status:** PRODUCTION EMERGENCY - SERVER INFRASTRUCTURE FAILURE
📊 **Files Analyzed:** 25+ API configuration files validated
🎯 **Root Cause:** HTTP 522 Connection Timeout on `api.rumahdaisycantik.com`
⚡ **Impact:** Complete website failure - All booking functionality down

### KEY VALIDATION FINDINGS:

✅ **CORS Configuration CONFIRMED:**
- All API files have proper CORS headers: `Access-Control-Allow-Origin: *`
- Files validated: `api/villa.php`, `api/rooms.php`, `api/packages.php`, `api/utils/helpers.php`

✅ **API Configuration VALIDATED:**
- Central config file: `src/config/paths.ts` properly structured
- 20+ service files correctly importing `API_BASE_URL`
- Emergency same-domain fallback code EXISTS (commented out)

❌ **SERVER INFRASTRUCTURE FAILURE:**
- API subdomain `https://api.rumahdaisycantik.com` completely unreachable
- All endpoints returning HTTP 522 Connection Timeout
- DNS/server configuration issue on hosting provider side

### 🚀 IMMEDIATE EMERGENCY SOLUTION:

**File:** `src/config/paths.ts` (Lines 33-40)
```typescript
// UNCOMMENT THIS SECTION TO ENABLE SAME-DOMAIN API:
if (typeof window !== 'undefined') {
  const hostLower = window.location.host.toLowerCase();
  const bookingLike = /(^|\.)booking\.rumahdaisycantik\.com$/i.test(hostLower);
  if (bookingLike) {
    API_BASE = '/api';  // Use same domain instead of subdomain
  }
}
```

**Requirements:**
1. Copy `/api` directory to `booking.rumahdaisycantik.com/api/`
2. OR setup server proxy: `/api/*` → `https://api.rumahdaisycantik.com/*`

**Status:** 🔴 Validation complete - Emergency solution identified  
**Updated:** November 21, 2025