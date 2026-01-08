# API Configuration Analysis - Production Emergency

## CRITICAL FINDINGS SUMMARY

**STATUS:** 🔴 PRODUCTION CRITICAL - API Server Infrastructure Failure
**ISSUE:** HTTP 522 Connection Timeout - API subdomain completely unreachable
**IMPACT:** Complete website failure - All booking functionality down
**ROOT CAUSE:** Server infrastructure failure on `api.rumahdaisycantik.com`

---

## API CONFIGURATION CURRENT STATE

### Central Configuration File: `src/config/paths.ts`
```typescript
// CURRENT PRODUCTION CONFIG
const PRODUCTION_API = 'https://api.rumahdaisycantik.com';
let API_BASE = import.meta.env.VITE_API_BASE || PRODUCTION_API;

// DISABLED RELATIVE API CODE (COMMENTED OUT)
// if (bookingLike || forceRelative) {
//   API_BASE = '/api';  // <-- EMERGENCY FALLBACK AVAILABLE
// }
```

**Key Configuration Points:**
- **API Base URL:** `https://api.rumahdaisycantik.com` (FAILING - 522 Error)
- **Frontend Domain:** `https://booking.rumahdaisycantik.com` (Working)
- **Relative API Path:** `/api` (Disabled but available for emergency use)
- **Environment Detection:** Production mode auto-detected

---

## FILES USING API CONFIGURATION

### High Priority API Service Files (20+ files affected)
1. **Core API Services:**
   - `src/services/api.js` - Main API service with all endpoints
   - `src/services/villaService.ts` - Villa information API
   - `src/services/packageService.ts` - Package management API
   - `src/services/calendarService.ts` - Calendar integration API

2. **React Components Using API:**
   - `src/pages/BookingSummary.tsx`
   - `src/pages/Booking.tsx` 
   - `src/pages/AdminPanel.tsx`
   - `src/pages/AdminCalendar.tsx`
   - `src/components/ImageGallery.tsx`
   - `src/components/ImageManager.tsx`
   - `src/components/admin/*.tsx` (4+ admin components)

3. **Hooks with API Dependencies:**
   - `src/hooks/useVillaInfo.tsx`
   - `src/hooks/useHomepageContent.tsx`

---

## EXISTING CORS CONFIGURATION ✅

**GOOD NEWS:** CORS headers are already properly configured!

### PHP Files with CORS Headers:
```php
// Found in ALL main API endpoints:
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

**Files with CORS:** `api/villa.php`, `api/rooms.php`, `api/packages.php`, `api/utils/helpers.php`

---

## EMERGENCY SAME-DOMAIN SOLUTION

### Option 1: Enable Relative API Path (RECOMMENDED)
**File:** `src/config/paths.ts`

```typescript
// UNCOMMENT AND MODIFY LINES 33-40:
if (typeof window !== 'undefined') {
  const hostLower = window.location.host.toLowerCase();
  const bookingLike = /(^|\.)booking\.rumahdaisycantik\.com$/i.test(hostLower);
  // FORCE RELATIVE API FOR PRODUCTION:
  if (bookingLike) {
    API_BASE = '/api';  // Use same domain API
  }
}
```

**Requirements:**
- Server must proxy `/api/*` → `https://api.rumahdaisycantik.com/*`
- OR copy API files to `booking.rumahdaisycantik.com/api/` directory

### Option 2: Direct Same-Domain API
**Copy API files to:** `booking.rumahdaisycantik.com/api/`
- Copy entire `/api` directory to main domain
- Update database connections if needed
- Test all endpoints: `/api/villa.php`, `/api/rooms.php`, `/api/packages.php`

---

## IMMEDIATE ACTION COMMANDS

### 1. Emergency Same-Domain Fix
```bash
# Edit paths.ts to enable relative API
# Find line ~33-40 and uncomment the domain detection code
# Change API_BASE = '/api' for production domain
```

### 2. Test API Endpoints After Fix
```bash
curl -I https://booking.rumahdaisycantik.com/api/villa.php
curl -I https://booking.rumahdaisycantik.com/api/rooms.php  
curl -I https://booking.rumahdaisycantik.com/api/packages.php
```

### 3. Validate CORS Headers
```bash
curl -H "Origin: https://booking.rumahdaisycantik.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS https://booking.rumahdaisycantik.com/api/villa.php
```

---

## API ENDPOINT MAPPING

### Current Failed Endpoints:
- ❌ `https://api.rumahdaisycantik.com/villa.php` → 522 Error
- ❌ `https://api.rumahdaisycantik.com/rooms.php` → 522 Error  
- ❌ `https://api.rumahdaisycantik.com/packages.php` → 522 Error
- ❌ `https://api.rumahdaisycantik.com/bookings.php` → 522 Error

### Emergency Same-Domain Targets:
- ✅ `https://booking.rumahdaisycantik.com/api/villa.php`
- ✅ `https://booking.rumahdaisycantik.com/api/rooms.php`
- ✅ `https://booking.rumahdaisycantik.com/api/packages.php` 
- ✅ `https://booking.rumahdaisycantik.com/api/bookings.php`

---

## HOSTING PROVIDER ACTIONS NEEDED

### Contact hosting provider with:
1. **522 Connection Timeout** on `api.rumahdaisycantik.com`
2. **Request DNS/Server check** for API subdomain
3. **Provide alternative:** Copy API to main domain `/api` directory
4. **Request proxy setup:** Route `/api/*` → API subdomain (when fixed)

### Server Configuration Check:
- Apache/Nginx proxy configuration
- SSL certificate for api.rumahdaisycantik.com
- DNS A record pointing to correct server
- Firewall/port configuration for API subdomain

---

## VALIDATION RESULTS

✅ **CORS Configuration:** Properly implemented in all PHP files
✅ **API Service Files:** Centralized configuration via paths.ts  
✅ **Frontend Integration:** All components use standardized API imports
❌ **API Server Infrastructure:** Complete failure (522 errors)
❌ **Production API Access:** All endpoints unreachable

**NEXT ACTION:** Implement emergency same-domain API routing or contact hosting provider for immediate server infrastructure repair.