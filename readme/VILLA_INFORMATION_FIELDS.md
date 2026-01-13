# Villa Information Fields Documentation

**Date**: January 12, 2026 (Updated)  
**Purpose**: Track all villa information fields and their connection to database

---

## Files Involved

| File | Purpose |
|------|---------|
| `src/components/admin/SimplifiedHomepageManager.tsx` | Frontend Form UI |
| `src/hooks/useHomepageContent.tsx` | Frontend API Hook (fetch & update) |
| `src/workers/routes/villa.ts` | Backend API Worker |
| Database Table: `villa_info` | D1 Database Storage |

---

## Field Checklist

### ✅ = Working (Read + Write)
### ⚠️ = Partial (Read only OR Write only)
### ❌ = Not Connected

---

## Basic Information

| Field | Frontend Form | Hook Sends | API Receives | DB Column | Status |
|-------|---------------|------------|--------------|-----------|--------|
| `name` | ✅ `formData.name` | ✅ `name` | ✅ `name` | ✅ `name` | ✅ Working |
| `description` | ✅ `formData.description` | ✅ `description` | ✅ `description` | ✅ `description` | ✅ Working |

---

## Contact Information

| Field | Frontend Form | Hook Sends | API Receives | DB Column | Status |
|-------|---------------|------------|--------------|-----------|--------|
| `phone` | ✅ `formData.phone` | ✅ `phone` | ✅ `phone` | ✅ `phone` | ✅ Working |
| `email` | ✅ `formData.email` | ✅ `email` | ✅ `email` | ✅ `email` | ✅ Working |
| `website` | ✅ `formData.website` | ✅ `website` | ✅ `website` | ✅ `website` | ✅ Working |

---

## Address Information

| Field | Frontend Form | Hook Sends | API Receives | DB Column | Status |
|-------|---------------|------------|--------------|-----------|--------|
| `address` | ✅ `formData.address` | ✅ `address` | ✅ `address` | ✅ `address` | ✅ Working |
| `city` | ✅ `formData.city` | ✅ `city` | ✅ → `location` | ✅ `location` | ✅ Working |
| `state` | ✅ `formData.state` | ✅ `state` | ✅ → `location` | ✅ `location` | ✅ Working |
| `country` | ✅ `formData.country` | ✅ `country` | ✅ → `location` | ✅ `location` | ✅ Working |
| `zipCode` | ✅ `formData.zipCode` | ⚠️ `postal_code` | ❌ Not handled | ❌ No column | ❌ Not Working |

**Note**: City, state, country are combined into single `location` field in DB

---

## Timing Information

| Field | Frontend Form | Hook Sends | API Receives | DB Column | Status |
|-------|---------------|------------|--------------|-----------|--------|
| `checkInTime` | ✅ `formData.checkInTime` | ✅ `checkInTime` | ✅ `check_in_time` | ✅ `check_in_time` | ✅ Working |
| `checkOutTime` | ✅ `formData.checkOutTime` | ✅ `checkOutTime` | ✅ `check_out_time` | ✅ `check_out_time` | ✅ Working |

---

## Property Specifications

| Field | Frontend Form | Hook Sends | API Receives | DB Column | Status |
|-------|---------------|------------|--------------|-----------|--------|
| `maxGuests` | ✅ `formData.maxGuests` | ✅ `max_guests` | ✅ `max_guests` | ✅ `max_guests` | ✅ Working |
| `bedrooms` | ✅ `formData.bedrooms` | ✅ `total_rooms` | ✅ `total_rooms` | ✅ `total_rooms` | ✅ Working |
| `bathrooms` | ✅ `formData.bathrooms` | ✅ `total_bathrooms` | ✅ `total_bathrooms` | ✅ `total_bathrooms` | ✅ Working |
| `basePrice` | ✅ `formData.basePrice` | ❌ Not sent | ❌ Not handled | ? | ❌ Not Working |
| `currency` | ✅ `formData.currency` | ❌ Not sent | ✅ `currency` | ? `currency` | ❌ Not Working |

---

## Policies

| Field | Frontend Form | Hook Sends | API Receives | DB Column | Status |
|-------|---------------|------------|--------------|-----------|--------|
| `cancellationPolicy` | ✅ `formData.cancellationPolicy` | ✅ `cancellationPolicy` | ✅ → `policies` | ✅ `policies` | ✅ Working |
| `houseRules` | ✅ `formData.houseRules` | ✅ `houseRules` | ✅ → `policies` | ✅ `policies` | ⚠️ Both share same column |

**Note**: Both cancellationPolicy and houseRules save to same `policies` column

---

## Media & Extras (NOT in form)

| Field | Frontend Form | Hook Sends | API Receives | DB Column | Status |
|-------|---------------|------------|--------------|-----------|--------|
| `images` | ❌ Not in form | ❌ Not sent | ✅ `images` | ✅ `images` (JSON) | ❌ No UI |
| `amenities` | ❌ Not in form | ❌ Not sent | ✅ `amenities_summary` | ✅ `amenities_summary` | ❌ No UI |
| `rating` | ❌ Not in form | ✅ Sent if set | ❌ Not handled | ? | ❌ Not Working |
| `reviews` | ❌ Not in form | ✅ Sent if set | ❌ Not handled | ? | ❌ Not Working |
| `socialMedia` | ❌ Not in form | ❌ Not sent | ❌ Not handled | ❌ No column | ❌ Not Working |
| `timezone` | ❌ Not in form | ❌ Not sent | ✅ `timezone` | ? `timezone` | ❌ No UI |

---

## Summary

### ✅ Fully Working (15 fields)
- name, description
- phone, email, website
- address, city, state, country
- checkInTime, checkOutTime
- maxGuests, bedrooms, bathrooms
- cancellationPolicy, houseRules

### ⚠️ Partial Issues (1 field)
- `houseRules` - Shares column with cancellationPolicy

### ❌ Not Working (8 fields)
- `zipCode` - No DB column
- `basePrice` - Not connected
- `currency` - Not sent from hook
- `images` - No UI to edit
- `amenities` - No UI to edit
- `rating` - No UI, API doesn't handle
- `reviews` - No UI, API doesn't handle
- `socialMedia` - No connection
- `timezone` - No UI

---

## Fixes Applied (January 12, 2026)

### ✅ Fix 1: checkIn/checkOut field names in hook
```tsx
// Added support for both formats:
if (data.checkIn !== undefined) apiData.check_in_time = data.checkIn;
if (data.checkOut !== undefined) apiData.check_out_time = data.checkOut;
if (data.checkInTime !== undefined) apiData.check_in_time = data.checkInTime;
if (data.checkOutTime !== undefined) apiData.check_out_time = data.checkOutTime;
```

### ✅ Fix 2: Enabled property specs in hook
```tsx
// Uncommented these lines in useHomepageContent.tsx:
if (data.maxGuests !== undefined) apiData.max_guests = data.maxGuests;
if (data.bedrooms !== undefined) apiData.total_rooms = data.bedrooms; 
if (data.bathrooms !== undefined) apiData.total_bathrooms = data.bathrooms;
```

### ✅ Fix 3: Fixed form field mapping
```tsx
// In SimplifiedHomepageManager handleSave():
checkInTime: formData.checkInTime,
checkOutTime: formData.checkOutTime,
maxGuests: formData.maxGuests,
bedrooms: formData.bedrooms,
bathrooms: formData.bathrooms,
```

---

## Remaining TODO

### To Add currency support:
```tsx
// In useHomepageContent.tsx:
if (data.currency !== undefined) apiData.currency = data.currency;
```

### To Add separate houseRules column:
- Add `house_rules` column to `villa_info` table
- Update API to save/read separately from `cancellationPolicy`
