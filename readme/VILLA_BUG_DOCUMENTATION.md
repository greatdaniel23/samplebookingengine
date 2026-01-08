# Villa Information Bug Documentation

## Overview
This document tracks the fucking annoying bugs and field mapping issues between the frontend, local database, production database, and API endpoints for Villa Information management.

## 1. Database Schema Requirements

### Local Database (villa_booking.villa_info)
```sql
-- Confirmed existing columns in local XAMPP database:
id (int(11))
name (varchar(255))
location (varchar(255)) 
description (text)
rating (decimal(2,1))
reviews (int(11))
images (longtext) -- JSON
amenities (longtext) -- JSON
phone (varchar(50))
email (varchar(255))
website (varchar(255))
address (text)
city (varchar(100))
state (varchar(100))
zip_code (varchar(20)) -- NOTE: LOCAL uses zip_code
country (varchar(100))
check_in_time (varchar(20))
check_out_time (varchar(20))
max_guests (int(11))
bedrooms (int(11))
bathrooms (int(11))
price_per_night (decimal(10,2))
currency (varchar(10))
cancellation_policy (text)
house_rules (text)
social_media (longtext) -- JSON
created_at (timestamp)
updated_at (timestamp)
```

### Production Database (u289291769_booking)
```sql
-- ACTUAL PRODUCTION SCHEMA - COMPLETELY DIFFERENT!
-- Production uses homepage_content table, NOT villa_info!

CREATE TABLE `homepage_content` (
  `id` int(11) NOT NULL,
  `hero_title` varchar(200) DEFAULT NULL,
  `hero_subtitle` varchar(300) DEFAULT NULL,
  `hero_description` text DEFAULT NULL,
  `property_name` varchar(200) NOT NULL,
  `property_location` varchar(300) DEFAULT NULL,
  `property_description` text DEFAULT NULL,
  `property_rating` decimal(2,1) DEFAULT 4.5,
  `property_reviews` int(11) DEFAULT 0,
  `contact_phone` varchar(50) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_website` varchar(200) DEFAULT NULL,
  `address_street` varchar(300) DEFAULT NULL,
  `address_city` varchar(100) DEFAULT NULL,
  `address_state` varchar(100) DEFAULT NULL,
  `address_country` varchar(100) DEFAULT 'Indonesia',
  `address_zipcode` varchar(20) DEFAULT NULL,  -- NOTE: address_zipcode NOT zip_code!
  `spec_max_guests` int(11) DEFAULT 2,
  `spec_bedrooms` int(11) DEFAULT 1,
  `spec_bathrooms` int(11) DEFAULT 1,
  `spec_base_price` decimal(10,2) DEFAULT 100.00,
  `timing_check_in` varchar(20) DEFAULT '2:00 PM',
  `timing_check_out` varchar(20) DEFAULT '12:00 PM',
  `policy_cancellation` text DEFAULT NULL,
  `policy_house_rules` text DEFAULT NULL,
  `policy_terms_conditions` text DEFAULT NULL,
  `social_facebook` varchar(200) DEFAULT NULL,
  `social_instagram` varchar(200) DEFAULT NULL,
  `social_twitter` varchar(200) DEFAULT NULL,
  `images_json` longtext DEFAULT NULL,
  `amenities_json` longtext DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_by` varchar(100) DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PROBLEM IDENTIFIED:
-- 1. NO villa_info table exists in production!
-- 2. Uses homepage_content table with different field names
-- 3. address_zipcode NOT zip_code
-- 4. spec_ prefix for specifications
-- 5. timing_ prefix for check-in/out times
-- 6. policy_ prefix for policies
```

## 2. API Files for Villa Information

### Local Development
```
/api/villa.php (Local XAMPP)
- Location: c:\xampp\htdocs\frontend-booking-engine\api\villa.php
- Database: villa_booking.villa_info
- Status: Fixed for local development
- Supports: Dynamic field updates, selective updates
```

### Production API
```
https://api.rumahdaisycantik.com/villa.php
- Status: BROKEN - Wrong table structure
- Issues:
  1. API expects villa_info table but production has homepage_content table
  2. Column names completely different (address_zipcode vs zip_code)
  3. Field prefixes: spec_, timing_, policy_, address_, contact_, social_
  4. API needs complete rewrite for production database structure
```

## 3. Frontend Integration

### Hooks
```
/src/hooks/useHomepageContent.tsx
- Manages villa data fetching/updating
- Current status: SAFE MODE (minimal fields only)
- Issues: Field mapping between frontend and production API
```

### Components  
```
/src/components/admin/SimplifiedHomepageManager.tsx
- New simplified single-container manager
- Status: Created to replace confusing tabbed interface
- Displays: Only actual database fields

/src/components/admin/HomepageContentManager.tsx  
- Old confusing multi-tab interface
- Status: DEPRECATED - Replaced by SimplifiedHomepageManager
```

## 3. Current Bug Status

### ✅ FIXED (Local Development)
- Dynamic field updates (only sends changed fields)
- Removed hardcoded default overrides
- Eliminated cross-field contamination
- Simplified single-container interface

### 🚫 COMPLETELY BROKEN (Production)
- **WRONG TABLE**: API calls villa_info but production has homepage_content
- **WRONG FIELDS**: All field names different with prefixes (spec_, timing_, policy_)
- **WRONG STRUCTURE**: Production schema completely different from local
- **ROOT CAUSE**: Production API villa.php designed for different database structure

### 🔧 SAFE MODE ACTIVE
Currently only sending these SAFE fields to production:
- name (varchar)
- description (text)  
- phone (varchar)
- email (varchar)
- cancellationPolicy (text)
- houseRules (text)
- checkInTime (varchar)
- checkOutTime (varchar)

### ❌ DISABLED FIELDS (Production Table Mismatch)
```
Frontend → Local (villa_info) → Production (homepage_content)
name       → name              → property_name
zipCode    → zip_code          → address_zipcode  
maxGuests  → max_guests        → spec_max_guests
basePrice  → price_per_night   → spec_base_price
checkIn    → check_in_time     → timing_check_in
checkOut   → check_out_time    → timing_check_out
cancellationPolicy → cancellation_policy → policy_cancellation
houseRules → house_rules       → policy_house_rules
phone      → phone             → contact_phone
email      → email             → contact_email
```

## 5. Action Items

### URGENT - Production Schema Analysis
1. Get full production database schema for villa table
2. Compare local vs production column names
3. Create proper field mapping documentation

### API Fixes Needed
1. Update production villa.php field mapping
2. Add proper error handling for missing columns
3. Implement graceful fallbacks

### Frontend Improvements  
1. Add field validation before API calls
2. Better error messages for field mapping issues
3. Progressive field enabling (test one field at a time)

## 6. Test Results Log

### 2025-12-13 - Field Mapping Errors
```
Error: SQLSTATE[42S22]: Column not found: 1054 Unknown column 'zip_code' in 'SET'
Location: /home/u289291769/domains/rumahdaisycantik.com/public_html/api/villa.php(274)
Cause: Production database doesn't have zip_code column
```

### 2025-12-13 - Cross-Field Contamination  
```
Issue: Hero section updates changing basic info
Issue: Basic info updates changing hero section
Cause: Always sending name/description fields
Status: FIXED in local, UNKNOWN in production
```

## 7. Deployment Notes

### Local Development (Works)
- Database: villa_booking.villa_info
- API: c:\xampp\htdocs\frontend-booking-engine\api\villa.php
- Fields: All working with proper mapping

### Production Deployment (Broken)
- Database: Unknown schema
- API: https://api.rumahdaisycantik.com/villa.php  
- Fields: Only basic text fields work

## 8. Emergency Workaround

If production updates are urgently needed:
1. Use only SAFE MODE fields (name, description, policies, timing)
2. Manually update other fields via database admin panel
3. Do NOT enable zipCode, basePrice, or address fields until schema is confirmed

## 9. File Status Checklist

### ✅ VERIFIED FILES (2025-12-13)

#### Local API
- **File**: `/api/villa.php`
- **Status**: ✅ WORKING
- **Schema**: Uses `zip_code`, `check_in_time`, `check_out_time`, etc.
- **Features**: Dynamic field updates, selective updates, no hardcoded defaults
- **Issues**: None for local development

#### Frontend Hook  
- **File**: `/src/hooks/useHomepageContent.tsx`
- **Status**: ✅ SAFE MODE ACTIVE
- **API Target**: `https://api.rumahdaisycantik.com/villa.php` (production)
- **Safe Fields**: name, description, phone, email, cancellationPolicy, houseRules, checkInTime, checkOutTime
- **Disabled Fields**: zipCode, basePrice, address, city, state, maxGuests, bedrooms, bathrooms
- **Issues**: Field mapping errors with production API

#### Admin Component
- **File**: `/src/components/admin/SimplifiedHomepageManager.tsx`  
- **Status**: ✅ NEW SIMPLIFIED INTERFACE
- **Features**: Single-container, no tabs, real database fields only
- **Interface**: VillaData with all database fields
- **Issues**: None - clean implementation

#### Admin Integration
- **File**: `/src/pages/AdminPanel.tsx`
- **Status**: ✅ UPDATED TO USE SIMPLIFIED MANAGER
- **Import**: `SimplifiedHomepageManager` (replaced old HomepageContentManager)
- **Issues**: None

#### Configuration
- **File**: `/src/config/paths.ts`
- **Status**: ✅ PRODUCTION API CONFIGURED
- **API Base**: `https://api.rumahdaisycantik.com`
- **Issues**: None - correctly pointing to production

### ❌ DEPRECATED/OLD FILES

#### Old Admin Component
- **File**: `/src/components/admin/HomepageContentManager.tsx`
- **Status**: ❌ DEPRECATED - Complex tabbed interface
- **Issues**: Confusing, cross-field contamination
- **Action**: Keep for reference but use SimplifiedHomepageManager

### 🚫 PRODUCTION ISSUES

#### Production API
- **File**: `https://api.rumahdaisycantik.com/villa.php`
- **Status**: 🚫 FIELD MAPPING ERRORS
- **Issues**: 
  - zip_code column doesn't exist
  - Unknown actual database schema
  - Returns 500 errors on field updates
- **Action**: Need production database schema analysis

## 11. Current System Status

### ✅ FULLY WORKING (Production & Local Development) - DECEMBER 13, 2025
- **All core fields functional**: name, description, address, city, state, country, postal_code
- **Contact info working**: phone, email, website  
- **Timing fields working**: check_in_time, check_out_time
- **Policies working**: cancellation_policy, house_rules
- **Ratings working**: rating, reviews
- **Dynamic updates working**: Only sends changed fields
- **No cross-contamination**: Clean field separation
- **Simplified interface active**: Single-container admin interface
- **Real production data**: Correct Bali villa information persisting
- **API alignment**: Production API matches actual database schema
- **Frontend mapping**: Correct field mapping (zipcode ↔ postal_code)

### 🚫 INTENTIONALLY DISABLED (Non-existent in Production Database)
- Property specs (maxGuests, bedrooms, bathrooms, basePrice) - columns don't exist
- These fields removed from UI and API to prevent 500 errors

## 11. Emergency Action Plan

### If Production Update Needed NOW:
1. Use only SAFE MODE fields in SimplifiedHomepageManager
2. Test one field at a time
3. Immediately disable any field that throws 500 error
4. Use database admin panel for problematic fields

### If Full Production Fix Needed:
1. **PRIORITY 1**: Get production database schema
2. Create field mapping table (local vs production)
3. Update useHomepageContent.tsx with correct field names
4. Test each field individually
5. Gradually re-enable all fields

## 12. Data Update Flow Method

### Current Implementation Process

#### Step 1: User Updates/Changes Data
```typescript
// Location: SimplifiedHomepageManager.tsx
const handleInputChange = (field: keyof VillaData, value: string | number) => {
  if (formData) {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  }
};

// User interaction triggers:
- Text input onChange events
- Number input onChange events  
- Textarea onChange events
- Form state updates in real-time
```

#### Step 2: User Clicks Save
```typescript
// Location: SimplifiedHomepageManager.tsx  
const handleSave = async () => {
  if (!formData) return;
  
  setSaving(true);
  try {
    // Transform formData to API format
    const result = await updateHomepageContent({
      name: formData.name,
      description: formData.description,
      phone: formData.phone,
      email: formData.email,
      // ... other safe fields
    });

    if (result.success) {
      setIsEditing(false);  // Exit edit mode
      console.log('✅ Villa data updated successfully');
    } else {
      // Handle API errors
      alert(`Update failed: ${result.error}`);
    }
  } catch (err) {
    // Handle network/unexpected errors
    alert(`Update error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  } finally {
    setSaving(false);
  }
};
```

#### Step 3: Interface Changes with New Data
```typescript
// Location: useHomepageContent.tsx
const updateHomepageContent = async (data: Partial<HomepageContent>) => {
  try {
    // Send PUT request to production API
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData)
    });

    if (result.success) {
      // REFRESH DATA from server
      await fetchHomepageContent();  // Re-fetch latest data
      return { success: true, message: result.message };
    }
  } catch (err) {
    return { success: false, error: errorMessage };
  }
};

// Interface updates automatically via:
1. useEffect hook watches homepageContent changes
2. setFormData updates with fresh server data  
3. Component re-renders with new values
4. Edit mode exits, showing updated read-only values
```

### Data Flow Diagram

```
[User Types] → [formData State] → [Save Button] → [API Call] 
     ↓              ↓                 ↓             ↓
[Input Fields] [Real-time UI] [Loading State] [PUT Request]
                                                    ↓
[Updated UI] ← [Fresh Data] ← [Re-fetch] ← [API Response]
     ↓              ↓            ↓             ↓
[Read Mode]   [New Values]  [useEffect]   [Success/Error]
```

### Current Status by Step

#### ✅ Step 1: User Updates (WORKING)
- Real-time form state updates
- Input validation working
- UI responds immediately to changes

#### 🔧 Step 2: User Clicks Save (PARTIALLY WORKING)  
- **Working Fields**: name, description, phone, email, policies, timing
- **Failing Fields**: zipCode, basePrice, address fields (500 errors)
- **Error Handling**: Shows alerts for failed updates

#### 🔧 Step 3: Interface Updates (PARTIALLY WORKING)
- **Success Case**: Fetches fresh data, updates UI, exits edit mode
- **Failure Case**: Shows error, stays in edit mode, preserves user changes  
- **Issue**: Some fields fail to save but UI flow still works

### Known Issues in Data Flow

#### Issue 1: Production Field Mapping
```
Problem: Step 2 fails for certain fields
Error: "Unknown column 'zip_code' in 'SET'"
Impact: Save fails, user stays in edit mode
Workaround: Only use safe fields
```

#### Issue 2: Partial Updates
```
Problem: If one field fails, entire update fails
Current: All-or-nothing update approach
Needed: Individual field validation/updating
```

#### Issue 3: Error Recovery
```
Problem: User loses changes if page refreshes after error
Current: Form data only in component state
Needed: Draft saving or localStorage backup
```

## 13. Future Prevention

1. **Schema Documentation**: Always document production database schema
2. **Field Validation**: Add runtime field validation before API calls  
3. **Gradual Deployment**: Test one field at a time on production
4. **Error Logging**: Better production error logging and monitoring
5. **Staging Environment**: Use staging that matches production schema exactly
6. **Draft Saving**: Implement localStorage backup for form data
7. **Individual Field Updates**: Allow partial updates instead of all-or-nothing