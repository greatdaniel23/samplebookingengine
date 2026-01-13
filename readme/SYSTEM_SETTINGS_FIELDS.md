# System Settings Fields Documentation

**Date**: January 12, 2026  
**Purpose**: Track all system settings fields and their connection to database

---

## Files Involved

| File | Purpose |
|------|---------|
| `src/pages/admin/AdminPanel.tsx` | Frontend Form UI (SettingsSection component) |
| `src/workers/routes/villa.ts` | Backend API Worker (GET & PUT /api/villa) |
| Database Table: `villa_info` | D1 Database Storage |

---

## Field Checklist

### ✅ = Working (Read + Write)
### ⚠️ = Partial (Read only OR Write only)
### ❌ = Not Connected

---

## Basic Information

| Field | Form State | API Sends | API Receives | DB Column | Status |
|-------|------------|-----------|--------------|-----------|--------|
| `siteName` | ✅ `settings.siteName` | ✅ `name` | ✅ `name` | ✅ `name` | ✅ Working |
| `siteUrl` | ✅ `settings.siteUrl` | ✅ `website` | ✅ `website` | ✅ `website` | ✅ Working |

---

## Contact Information

| Field | Form State | API Sends | API Receives | DB Column | Status |
|-------|------------|-----------|--------------|-----------|--------|
| `adminEmail` | ✅ `settings.adminEmail` | ✅ `email` | ✅ `email` | ✅ `email` | ✅ Working |
| `phone` | ✅ `settings.phone` | ✅ `phone` | ✅ `phone` | ✅ `phone` | ✅ Working |

---

## Address Information

| Field | Form State | API Sends | API Receives | DB Column | Status |
|-------|------------|-----------|--------------|-----------|--------|
| `address` | ✅ `settings.address` | ✅ `address` | ✅ `address` | ✅ `address` | ✅ Working |
| `city` | ✅ `settings.city` | ✅ `city` | ✅ → `location` | ✅ `location` | ✅ Working |
| `state` | ✅ `settings.state` | ✅ `state` | ✅ → `location` | ✅ `location` | ✅ Working |
| `country` | ✅ `settings.country` | ✅ `country` | ✅ → `location` | ✅ `location` | ✅ Working |

**Note**: City, state, country are combined into single `location` field in DB

---

## Regional Settings

| Field | Form State | API Sends | API Receives | DB Column | Status |
|-------|------------|-----------|--------------|-----------|--------|
| `currency` | ✅ `settings.currency` | ❌ Ignored | ❌ N/A | ❌ No column | ❌ Not Working |
| `timezone` | ✅ `settings.timezone` | ❌ Ignored | ❌ N/A | ❌ No column | ❌ Not Working |

**Note**: These columns don't exist in the database yet. Values are displayed in UI but NOT saved.

---

## Timing Information

| Field | Form State | API Sends | API Receives | DB Column | Status |
|-------|------------|-----------|--------------|-----------|--------|
| `checkInTime` | ✅ `settings.checkInTime` | ✅ `check_in_time` | ✅ `check_in_time` | ✅ `check_in_time` | ✅ Working |
| `checkOutTime` | ✅ `settings.checkOutTime` | ✅ `check_out_time` | ✅ `check_out_time` | ✅ `check_out_time` | ✅ Working |

---

## System Settings

| Field | Form State | API Sends | API Receives | DB Column | Status |
|-------|------------|-----------|--------------|-----------|--------|
| `maintenanceMode` | ✅ `settings.maintenanceMode` | ❌ Ignored | ❌ N/A | ❌ No column | ❌ Not Working |

**Note**: This column doesn't exist in the database yet. Value is displayed in UI but NOT saved.

---

## Data Flow

### Loading Settings (GET /api/villa)
```
Database → API Worker → Frontend
villa_info.name → result.data.name → settings.siteName
villa_info.website → result.data.website → settings.siteUrl
villa_info.email → result.data.email → settings.adminEmail
villa_info.phone → result.data.phone → settings.phone
villa_info.address → result.data.address → settings.address
villa_info.location → result.data.city/state/country → settings.city/state/country
villa_info.check_in_time → result.data.checkInTime → settings.checkInTime
villa_info.check_out_time → result.data.checkOutTime → settings.checkOutTime
```

### Saving Settings (PUT /api/villa)
```
Frontend → API Worker → Database
settings.siteName → body.name → villa_info.name
settings.siteUrl → body.website → villa_info.website
settings.adminEmail → body.email → villa_info.email
settings.phone → body.phone → villa_info.phone
settings.address → body.address → villa_info.address
settings.city/state/country → body.city/state/country → villa_info.location (combined)
settings.checkInTime → body.check_in_time → villa_info.check_in_time
settings.checkOutTime → body.check_out_time → villa_info.check_out_time
settings.currency → body.currency → villa_info.currency
settings.timezone → body.timezone → villa_info.timezone
settings.maintenanceMode → body.maintenance_mode → villa_info.maintenance_mode
```

---

## Summary

### ✅ Fully Working (12 fields)
- siteName (name)
- siteUrl (website)
- adminEmail (email)
- phone
- address
- city, state, country (→ location)
- checkInTime, checkOutTime

### ⚠️ Need DB Column Verification (3 fields)
- `currency` - May not exist in DB
- `timezone` - May not exist in DB
- `maintenanceMode` - May not exist in DB

---

## Database Schema Check Required

Run this SQL to verify columns exist:
```sql
PRAGMA table_info(villa_info);
```

If columns are missing, add them:
```sql
ALTER TABLE villa_info ADD COLUMN currency TEXT DEFAULT 'USD';
ALTER TABLE villa_info ADD COLUMN timezone TEXT DEFAULT 'Asia/Jakarta';
ALTER TABLE villa_info ADD COLUMN maintenance_mode INTEGER DEFAULT 0;
```

---

## API Worker Code Reference

### Load Settings (villa.ts GET handler)
```typescript
// Transforms DB fields to frontend format
const transformedData = {
  name: result.name,
  website: result.website,
  email: result.email,
  phone: result.phone,
  address: result.address,
  city: result.location?.split(',')[0],
  state: result.location?.split(',')[1],
  country: result.location?.split(',')[2],
  checkInTime: result.check_in_time,
  checkOutTime: result.check_out_time,
  currency: result.currency,
  timezone: result.timezone,
  maintenance_mode: result.maintenance_mode
};
```

### Save Settings (villa.ts PUT handler)
```typescript
// Transforms frontend fields to DB format
const updateData = {
  name: body.name,
  website: body.website,
  email: body.email,
  phone: body.phone,
  address: body.address,
  location: [body.city, body.state, body.country].filter(Boolean).join(', '),
  check_in_time: body.check_in_time,
  check_out_time: body.check_out_time,
  currency: body.currency,
  timezone: body.timezone,
  maintenance_mode: body.maintenance_mode
};
```

---

## Difference from Villa Information (Homepage Content)

| Feature | System Settings | Villa Information |
|---------|-----------------|-------------------|
| File | AdminPanel.tsx (SettingsSection) | SimplifiedHomepageManager.tsx |
| Tab | Settings | Homepage Content |
| Hook | Direct fetch in component | useHomepageContent hook |
| Fields | Includes currency, timezone, maintenance | Includes description, policies, property specs |
| Purpose | System configuration | Villa content display |

Both use the same API endpoint `/api/villa` and same database table `villa_info`.
