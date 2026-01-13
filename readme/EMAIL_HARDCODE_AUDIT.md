# 🔍 Hardcoded Email Settings - Audit Report

## Found Issues

### 1. **src/services/villaService.ts** (2 occurrences)
```typescript
// Line 51 - Fallback email
email: response.data.email || 'info@villa.com',

// Line 62 - Default email in error handling
email: 'info@villa.com',
```

### 2. **src/pages/user/RoomDetails.tsx** (1 occurrence)
```typescript
// Lines 626, 630 - Hardcoded contact email
href="mailto:danielsantosomarketing2017@gmail.com"
<span>danielsantosomarketing2017@gmail.com</span>
```

### 3. **src/pages/user/PackageDetails.tsx** (1 occurrence)
```typescript
// Line 198 - Fallback email
return villaInfo?.email || "support@villa.com";
```

### 4. **src/pages/user/BookingSummary.tsx** (2 occurrences)
```typescript
// Line 125 - Fallback email
return villaInfo?.email || "support@villa.com";

// Line 219 - Default guest email (test data)
email: bookingApiData?.email || searchParams.get('email') || 'guest@example.com',
```

---

## Summary

| File | Count | Type | Priority |
|------|-------|------|----------|
| villaService.ts | 2 | Fallback/Default | ⚠️ High |
| RoomDetails.tsx | 1 | Hardcoded | 🔴 Critical |
| PackageDetails.tsx | 1 | Fallback | ⚠️ High |
| BookingSummary.tsx | 2 | Fallback/Test | ⚠️ High |

**Total**: 6 hardcoded email occurrences

---

## Recommendation

These should be:
1. **Moved to environment variables** for easy configuration
2. **Fetched from villa settings API** endpoint  
3. **Stored in Cloudflare KV** for dynamic updates
4. **Never hardcoded** in source files

### Action Items
- [ ] Create email config constant file
- [ ] Add email settings to villa info API
- [ ] Update all components to use dynamic email
- [ ] Remove all hardcoded email strings
