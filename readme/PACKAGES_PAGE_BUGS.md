# Packages Page Bug Analysis

**File**: `src/pages/user/Packages.tsx`  
**Date**: January 11, 2026

---

## 🔴 Critical Bugs

### 1. Wrong Active Filter Field
**Location**: Line 127 (applyFilters function)
```tsx
filtered = filtered.filter(pkg => pkg.available === 1 || pkg.available === true);
```
**Issue**: Uses `available` field but API returns `is_active` field  
**Impact**: May filter out all packages or show inactive ones  
**Fix**: Change to check `is_active` field like in `usePackages.tsx`

---

### 2. Missing Date Validity Filtering
**Location**: applyFilters function
**Issue**: Does not filter packages by `valid_from` and `valid_until` dates  
**Impact**: Expired packages or future packages may show to customers  
**Fix**: Add date range validation like in `usePackages.tsx`

---

### 3. Package Type Filter Value "all" Issue
**Location**: Line 281
```tsx
<SelectItem value="all">All types ({packages.length})</SelectItem>
```
**Issue**: Sets value to "all" but `handleFilterChange` doesn't handle "all" → should be empty string ""  
**Impact**: Type filter gets stuck on "all" value, doesn't show all packages  
**Fix**: Change `value="all"` to `value=""`

---

## 🟡 Medium Bugs

### 4. Inclusions Field Name Mismatch
**Location**: Line 133-134
```tsx
(pkg.inclusions || pkg.includes || []).some(...)
```
**Issue**: `inclusions` is stored as JSON string in DB, needs parsing  
**Impact**: Search by inclusion text may not work  
**Fix**: Parse JSON before searching

---

### 5. Server-Side Filter Not Sending Correct Parameters
**Location**: Lines 89-93
```tsx
if (filters.type) apiFilters.type = filters.type;
```
**Issue**: Sends `type` but API might expect `package_type`  
**Impact**: Type filtering may not work server-side  
**Fix**: Verify API parameter names

---

### 6. Date Input Min/Max Not Set
**Location**: Lines 295-312
**Issue**: Check-in/check-out date inputs don't have `min` attribute set to today  
**Impact**: Users can select past dates  
**Fix**: Add `min={new Date().toISOString().split('T')[0]}`

---

## 🟢 Minor Issues

### 7. Hardcoded Guest Max
**Location**: Line 335
```tsx
max="10"
```
**Issue**: Hardcoded to 10, should be dynamic based on available packages  
**Impact**: Minor UX issue

---

### 8. No Loading State for Package Types
**Location**: loadPackageTypes function
**Issue**: No loading/error state for package types  
**Impact**: User might see empty dropdown briefly

---

## 📋 Recommended Fix Order

1. ✅ Fix `is_active` field check (Critical)
2. ✅ Add date validity filtering (Critical)
3. ✅ Fix "all" filter value (Critical)
4. ⚠️ Fix date input min values (Medium)
5. ⚠️ Parse inclusions JSON for search (Medium)
6. ℹ️ Other minor fixes (Low priority)

---

## Code Fix Summary

### Fix #1, #2, #3 Combined:

```tsx
const applyFilters = () => {
  let filtered = [...packages];
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // CRITICAL: Filter by is_active AND date validity
  filtered = filtered.filter(pkg => {
    const isActive = pkg.is_active === 1 || pkg.is_active === true || 
                    pkg.available === 1 || pkg.available === true;
    
    // Check date validity
    let isDateValid = true;
    if (pkg.valid_from && today < pkg.valid_from) isDateValid = false;
    if (pkg.valid_until && today > pkg.valid_until) isDateValid = false;
    
    return isActive && isDateValid;
  });

  // Filter by type (skip if empty or "all")
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(pkg => 
      pkg.package_type === filters.type || pkg.type === filters.type
    );
  }

  // Filter by search term
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(pkg => {
      // Parse inclusions if string
      let inclusions = pkg.inclusions || pkg.includes || [];
      if (typeof inclusions === 'string') {
        try { inclusions = JSON.parse(inclusions); } catch { inclusions = []; }
      }
      
      return pkg.name.toLowerCase().includes(search) ||
        pkg.description.toLowerCase().includes(search) ||
        inclusions.some((item: string) => item.toLowerCase().includes(search));
    });
  }

  // Filter by guest count
  filtered = filtered.filter(pkg => pkg.max_guests >= filters.guests);

  setFilteredPackages(filtered);
};
```
