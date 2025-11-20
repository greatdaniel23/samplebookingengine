# Admin Panel Data Display Debugging Guide

## 🚀 Current Status
✅ **API Configuration Fixed:** All API calls now go to `https://api.rumahdaisycantik.com`  
✅ **Enhanced Debugging Added:** Comprehensive logging for all admin sections  
🔍 **Next Step:** Analyze API responses to fix data display issues

## 📊 How to Debug Data Display Issues

### Step 1: Open Admin Panel with Developer Tools
1. Go to `http://127.0.0.1:8080/admin`
2. **Open Developer Tools:** Press `F12` or right-click → "Inspect"
3. **Go to Console Tab:** Look for debugging messages

### Step 2: Navigate Through Admin Sections
Click on each section and watch the console for debugging output:

#### Bookings Management
- Look for: `🔍 Fetching bookings from: https://api.rumahdaisycantik.com/bookings.php`
- Check: `📡 Bookings API Response: 200 OK` (or error status)
- Analyze: `📊 Bookings Raw Data:` (see actual API response)
- Verify: `✅ Bookings set to state: X items`

#### Rooms Management  
- Look for: `🔍 Fetching rooms from: https://api.rumahdaisycantik.com/rooms.php`
- Check: `📡 Rooms API Response: 200 OK`
- Analyze: `📊 Rooms Raw Data:`
- Verify: `✅ Rooms set to state: X items`

#### Packages Management
- Look for: `🔍 Fetching packages from: https://api.rumahdaisycantik.com/packages.php`
- Check: `📡 Packages API Response: 200 OK`
- Analyze: `📊 Packages Raw Data:`
- Verify: `✅ Packages set to state: X items`

#### Property Management
- Look for: `🔍 Fetching property data from: https://api.rumahdaisycantik.com/villa.php`
- Check: `📡 Property API Response: 200 OK`
- Analyze: `📊 Property Raw Data:`
- Verify: `✅ Property data set to state:`

### Step 3: Identify Common Issues

#### Issue 1: API Returns Error
**Console shows:** `❌ Error fetching [section]: HTTP 404/500`
**Solution:** API endpoint doesn't exist or server error
- Check if API files exist on server
- Verify server configuration

#### Issue 2: API Returns Wrong Data Format
**Console shows:** `📊 [Section] Is Array: false` (when expecting array)
**Or:** `📊 [Section] Length: 0` (empty data)
**Solution:** API returning wrong format
- Check API response structure
- May need to adjust data parsing

#### Issue 3: API Returns Data But Wrong Field Names
**Console shows:** `📊 First [Item] Keys: ["wrong_field", "other_field"]`
**Solution:** Database field names don't match UI expectations
- Check database schema
- Update component to use correct field names

#### Issue 4: API Authentication/CORS Issues
**Console shows:** Network errors or CORS errors
**Solution:** Server-side configuration needed
- Check API server CORS settings
- Verify API authentication

## 🔧 Quick Fix Patterns

### If Data Structure is Wrong:
```javascript
// Current code expects:
booking.guest_name || booking.name

// If API returns different fields, add more fallbacks:
booking.guest_name || booking.name || booking.customer_name || booking.full_name
```

### If API Returns Object Instead of Array:
```javascript
// Current: setItems(Array.isArray(data) ? data : []);
// Fix: setItems(Array.isArray(data) ? data : data.items ? data.items : []);
```

### If API Returns Success Wrapper:
```javascript
// If API returns: { success: true, data: [...] }
// Fix: const items = data.success ? data.data : [];
```

## 📋 Debug Checklist

**For each admin section:**
- [ ] API URL shows production domain (not localhost)
- [ ] API response shows 200 OK status
- [ ] Raw data is logged and visible
- [ ] Data type matches expectations (array/object)
- [ ] Data has expected field names
- [ ] State is updated with correct item count
- [ ] UI shows "No [items] found" or actual data

## 🆘 Common Solutions

### Solution 1: Field Name Mismatch
If console shows data exists but UI shows "No items found", check field names:
```typescript
// Update component to match actual API field names
// Instead of: booking.guest_name
// Use: booking.customer_name (or whatever API returns)
```

### Solution 2: Data Wrapper Issue
If API wraps data in success object:
```typescript
// Instead of: setItems(Array.isArray(data) ? data : []);
// Use: setItems(Array.isArray(data.data) ? data.data : []);
```

### Solution 3: Empty Response
If API returns empty but should have data:
- Check database has data
- Verify API endpoint logic
- Check database connection

## 📞 Next Steps

1. **Open admin panel and check console**
2. **Navigate through all sections**  
3. **Copy/screenshot console output for each section**
4. **Report findings:** What shows in console vs what shows in UI
5. **Identify pattern:** Are all sections empty or just some?

The enhanced debugging will show exactly what's happening with the API responses and help identify whether the issue is:
- **API returning wrong data format**
- **Missing data in database**  
- **Field name mismatches between API and UI**
- **Data processing errors in the frontend**

---
**Last Updated:** November 17, 2025  
**Debug Version:** Enhanced with comprehensive API logging