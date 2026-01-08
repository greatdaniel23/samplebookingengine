# 🌐 CLOUDFLARE EMERGENCY: Production API Failure Analysis

## 🚨 **CRITICAL CLOUDFLARE ISSUE IDENTIFIED**

**Status:** 🔴 PRODUCTION DOWN - Cloudflare Configuration Problem  
**Domain:** `booking.rumahdaisycantik.com`  
**API Subdomain:** `api.rumahdaisycantik.com`  
**Root Cause:** Cloudflare proxy/DNS/SSL configuration issue  
**Error Type:** HTTP 522 + CORS policy violation  
**Impact:** Complete booking website failure

---

## 📋 **ERROR ANALYSIS**

### **HTTP 522 Error = Cloudflare Cannot Connect to Origin**
```
GET https://api.rumahdaisycantik.com/villa.php
Status: 522 Connection timed out
Meaning: Cloudflare proxy → Origin server connection failed
```

### **CORS Error is Secondary Effect**
```
Access to fetch at 'https://api.rumahdaisycantik.com/rooms.php' 
from origin 'https://booking.rumahdaisycantik.com' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header 
is present on the requested resource.
```

**Why CORS fails:** When Cloudflare gets HTTP 522, it returns error page **without CORS headers**

---

## 🔧 **CLOUDFLARE EMERGENCY FIXES**

### **🎯 Priority 1: Cloudflare Dashboard Checks**

#### **1. DNS Records Verification**
```
Login: dash.cloudflare.com
Domain: rumahdaisycantik.com
Check:
  ✅ api.rumahdaisycantik.com A record exists
  ✅ Points to correct server IP  
  ⚠️ Proxy status: 🟠 Proxied or ⚫ DNS Only?
```

#### **2. SSL/TLS Settings**
```
Cloudflare Dashboard → SSL/TLS → Overview
Current Mode: [Check what's set]
  
Recommended for API subdomains:
  ✅ Full (Strict) - If origin has valid SSL
  ✅ Full - If origin has self-signed SSL
  ❌ Flexible - Never for API endpoints
```

#### **3. Security Level & Bot Fight**
```
Cloudflare Dashboard → Security → Settings
  
Check if blocking legitimate requests:
  - Security Level: [Medium/High might block API]
  - Bot Fight Mode: [Can cause issues]  
  - Rate Limiting: [Check for API limits]
```

---

### **🚀 Priority 2: Emergency Same-Domain Bypass**

#### **Option A: Disable Cloudflare Proxy for API**
```
Cloudflare Dashboard → DNS → Records
Find: api.rumahdaisycantik.com
Click: Orange cloud 🟠 → Gray cloud ⚫ (DNS Only)
Wait: 2-3 minutes for propagation
Test: curl -I https://api.rumahdaisycantik.com/villa.php
```

#### **Option B: Enable Same-Domain API (IMMEDIATE FIX)**
**File:** `src/config/paths.ts`
```typescript
// UNCOMMENT LINES ~33-40:
if (typeof window !== 'undefined') {
  const hostLower = window.location.host.toLowerCase();
  const bookingLike = /(^|\.)booking\.rumahdaisycantik\.com$/i.test(hostLower);
  if (bookingLike) {
    API_BASE = '/api';  // Use booking.rumahdaisycantik.com/api/
  }
}
```

**Then copy API files:**
```bash
# Copy entire /api directory to main domain
cp -r api/ /path/to/booking.rumahdaisycantik.com/api/
```

---

### **⚡ Priority 3: Cloudflare Page Rules & Workers**

#### **Create API Bypass Page Rule**
```
Cloudflare Dashboard → Rules → Page Rules
Pattern: api.rumahdaisycantik.com/*
Settings:
  - SSL: Full
  - Cache Level: Bypass  
  - Security Level: Essentially Off
  - Browser Integrity Check: Off
```

#### **Emergency Worker Script**
```javascript
// Cloudflare Worker to proxy API requests
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname.startsWith('/api/')) {
    // Proxy to origin server directly
    const apiUrl = `https://[ORIGIN_SERVER_IP]${url.pathname.replace('/api', '')}`
    const response = await fetch(apiUrl, request)
    
    // Add CORS headers
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return newResponse
  }
  
  return fetch(request)
}
```

---

## 🔍 **CLOUDFLARE DIAGNOSTIC COMMANDS**

### **1. Check Cloudflare Status**
```bash
# Test if Cloudflare is proxying
curl -I https://api.rumahdaisycantik.com/villa.php
# Look for: cf-ray header (indicates Cloudflare)

# Test direct origin (if you know IP)
curl -H "Host: api.rumahdaisycantik.com" http://[ORIGIN_IP]/villa.php
```

### **2. DNS Propagation Check**
```bash
# Check DNS resolution
nslookup api.rumahdaisycantik.com
dig api.rumahdaisycantik.com

# Online tools:
# https://www.whatsmydns.net/#A/api.rumahdaisycantik.com
```

### **3. SSL Certificate Validation**
```bash
# Check SSL chain
openssl s_client -connect api.rumahdaisycantik.com:443 -servername api.rumahdaisycantik.com

# Online tools:
# https://www.ssllabs.com/ssltest/analyze.html?d=api.rumahdaisycantik.com
```

---

## 🎯 **COMMON CLOUDFLARE API ISSUES & FIXES**

### **Issue 1: SSL/TLS Mismatch**
```
Problem: Origin server SSL ≠ Cloudflare SSL mode
Fix: Match SSL/TLS mode to origin server capability
  - Origin has valid SSL → Full (Strict)
  - Origin has self-signed → Full
  - Origin HTTP only → Flexible (NOT recommended for APIs)
```

### **Issue 2: Aggressive Security Settings**
```
Problem: Cloudflare blocking legitimate API requests
Fix: Lower security for API subdomain
  - Security Level: Low/Medium
  - Bot Fight: Disabled
  - Challenge Passage: Disabled
```

### **Issue 3: Cache/Firewall Rules**
```
Problem: API responses cached or blocked
Fix: Bypass cache and security for API
  - Cache Level: Bypass
  - Browser Integrity: Off
  - Always Use HTTPS: Check compatibility
```

### **Issue 4: Origin Server Down**
```
Problem: Actual server/hosting issue behind Cloudflare
Fix: Contact hosting provider
  - Check server status
  - Verify PHP/Apache/Nginx running
  - Check server logs for errors
```

---

## 📞 **EMERGENCY CONTACT ACTIONS**

### **1. Cloudflare Support**
- **Enterprise/Business Plan:** Submit ticket with 522 error details
- **Free Plan:** Community forum or troubleshooting guides

### **2. Hosting Provider**
- **Report:** 522 errors on API subdomain
- **Request:** Server status check and origin server logs
- **Backup:** Ask for direct IP access for testing

### **3. Domain Registrar**
- **Verify:** DNS management is through Cloudflare
- **Backup:** Prepare to change nameservers if needed

---

## ✅ **IMMEDIATE ACTION CHECKLIST**

- [ ] **Check Cloudflare Dashboard** - DNS, SSL, Security settings
- [ ] **Test Gray Cloud** - Disable proxy for api.rumahdaisycantik.com  
- [ ] **Enable Same-Domain API** - Uncomment fallback code in paths.ts
- [ ] **Copy API Files** - To main domain /api/ directory  
- [ ] **Contact Hosting Provider** - Report origin server 522 errors
- [ ] **Create Page Rules** - Bypass security/cache for API
- [ ] **Monitor Propagation** - DNS and SSL changes take time

**Status:** 🔴 Cloudflare configuration issue identified - Multiple fix options available  
**Priority:** Enable same-domain API for immediate restoration while fixing Cloudflare  
**Timeline:** Same-domain fix: 5 minutes | Cloudflare fix: 30 minutes - 2 hours