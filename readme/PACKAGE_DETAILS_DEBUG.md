# PackageDetails.tsx - Debug Analysis

## Issue Summary
- Loading spinner shows ✓
- Then page goes blank ✗
- No console errors ✗

---

## Standard Troubleshooting Checklist

### ✅ Step 1: Verify API is Working
```bash
curl "https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/packages/6"
```
**Expected**: `{"success":true,"data":{...}}`
**Status**: [ ] Pass / [ ] Fail

### ✅ Step 2: Check Browser Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Load `/packages/6`
4. Find request to `/api/packages/6`
5. Check Response tab

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "Adventure Seeker",
    "is_active": 1,
    "valid_from": "2026-01-01",
    "valid_until": "2026-12-31"
  }
}
```
**Status**: [ ] Pass / [ ] Fail

### ✅ Step 3: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Load `/packages/6`
4. Look for any errors (red text)

**Status**: [ ] No errors / [ ] Has errors (list below)

### ✅ Step 4: Verify packageService.ts
File: `src/services/packageService.ts`

Check `getPackageById` function:
- [ ] Uses correct URL: `/packages/${id}`
- [ ] Returns `result` (not `result.data`)
- [ ] Has proper error handling

### ✅ Step 5: Verify Component State Flow
File: `src/pages/user/PackageDetails.tsx`

Check these in order:
1. [ ] `loading` starts as `true`
2. [ ] `fetchPackage()` is called
3. [ ] API response received
4. [ ] `setPackage(response.data)` called
5. [ ] `setLoading(false)` called
6. [ ] Component re-renders

### ✅ Step 6: Check Conditional Renders
Each condition should show something visible:

| Condition | Expected Display | Actually Shows |
|-----------|-----------------|----------------|
| `loading === true` | BookingSkeleton | [ ] Yes / [ ] No |
| `error !== null` | Red error text | [ ] Yes / [ ] No |
| `pkg === null` | NotFound page | [ ] Yes / [ ] No |
| `!isActive \|\| !dateValid` | "Not Available" | [ ] Yes / [ ] No |
| All pass | Main content | [ ] Yes / [ ] No |

### ✅ Step 7: Check Child Components
These components are used in main render:

| Component | File | Might Crash? |
|-----------|------|--------------|
| `<Header />` | `src/components/Header.tsx` | [ ] Check |
| `<PhotoGallery />` | `src/components/PhotoGallery.tsx` | [ ] Check |
| `<BookingSkeleton />` | `src/components/BookingSkeleton.tsx` | [ ] Check |
| `<NotFound />` | `src/pages/shared/NotFound.tsx` | [ ] Check |

### ✅ Step 8: Test Minimal Render
Replace main return with:
```tsx
return (
  <div style={{background:'red',color:'white',padding:'20px'}}>
    TEST: {pkg?.name || 'no name'}
  </div>
);
```
**Status**: [ ] Shows red box / [ ] Still blank

---

## Quick Diagnosis

### If Step 8 shows red box:
→ Problem is in the **main render JSX** (complex UI breaking)

### If Step 8 is still blank:
→ Problem is **before render** (data fetching, state, or conditional)

### If API returns error:
→ Problem is **backend** (Worker/D1 database)

### If Network shows no request:
→ Problem is **routing** or component not mounting

---

### 1. Initial State (Lines 89-113)
```tsx
const [pkg, setPackage] = useState<Package | null>(null);
const [loading, setLoading] = useState(true);  // Starts TRUE
const [error, setError] = useState<string | null>(null);
```

### 2. Data Fetching (Lines 291-314)
```tsx
useEffect(() => {
  const fetchPackage = async () => {
    if (!packageId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await packageService.getPackageById(packageId);
      setPackage(response.data);  // <-- SETS pkg HERE
    } catch (err: any) {
      setError("...");
    } finally {
      setLoading(false);  // <-- ALWAYS runs
    }
  };
  fetchPackage();
}, [packageId]);
```

### 3. Conditional Renders (Lines 316-355)

#### Check 1: Loading State (Line 316)
```tsx
if (loading) {
  return <BookingSkeleton />;  // Shows spinner
}
```
**Status**: ✓ Works (user sees loading)

#### Check 2: Error State (Line 320)
```tsx
if (error) {
  return <div className="text-center py-10 text-red-500">{error}</div>;
}
```
**Status**: Not triggered (no error shown)

#### Check 3: No Package (Line 324)
```tsx
if (!pkg) {
  return <NotFound />;  // <-- POSSIBLE CULPRIT?
}
```
**Status**: ⚠️ SUSPECT - If pkg is null/undefined after fetch, shows NotFound

#### Check 4: Availability Check (Lines 328-345)
```tsx
const isPackageActive = pkg.is_active === 1 || pkg.is_active === true;

const today = new Date().toISOString().split('T')[0];
let isDateValid = true;
if (pkg.valid_from && today < pkg.valid_from) isDateValid = false;
if (pkg.valid_until && today > pkg.valid_until) isDateValid = false;

if (!isPackageActive || !isDateValid) {
  return (
    <div>Package Not Available</div>
  );
}
```
**Status**: ⚠️ SUSPECT - If is_active check fails, shows "Not Available"

---

## Debug Tests Needed

### Test A: Is `pkg` being set?
Add before line 316:
```tsx
console.log('DEBUG: loading=', loading, 'pkg=', pkg, 'error=', error);
```

### Test B: Is API returning data correctly?
Check browser Network tab for `/api/packages/6` response.

### Test C: What does packageService.getPackageById return?
The service should return `{ success: true, data: {...} }`.
Component expects `response.data` to be the package object.

---

## API Response Structure

**Expected from API** (`/api/packages/6`):
```json
{
  "success": true,
  "data": {
    "id": 6,
    "name": "Adventure Seeker",
    "is_active": 1,
    "valid_from": "2026-01-01",
    "valid_until": "2026-12-31",
    ...
  }
}
```

**packageService.getPackageById returns**:
```tsx
return result;  // { success: true, data: {...} }
```

**Component usage**:
```tsx
const response = await packageService.getPackageById(packageId);
setPackage(response.data);  // Should get the package object
```

---

## Likely Issue

The component goes blank (not "Not Found" or "Not Available") which means:
1. `pkg` is being set (otherwise NotFound shows)
2. `isPackageActive` and `isDateValid` pass (otherwise "Not Available" shows)
3. The main render is reached but something inside causes blank

**Next step**: Check if there's an error in the main render section (lines 500+)
that causes React to fail silently.

---

## Files to Check

1. `src/services/packageService.ts` - getPackageById function
2. `src/components/PhotoGallery.tsx` - might crash on bad image data
3. `src/components/Header.tsx` - might have an issue
4. `src/components/BookingSkeleton.tsx` - loading component

---

## Current Test Results

### Test Date: 2026-01-12

| Step | Test | Result | Notes |
|------|------|--------|-------|
| 1 | API curl test | ✅ Pass | Returns valid JSON with is_active=1 |
| 2 | Network tab | ⏳ Pending | |
| 3 | Console errors | ⏳ Pending | User reports "no error" |
| 4 | packageService | ✅ Pass | Uses `/packages/${id}` correctly |
| 5 | State flow | ⏳ Pending | Loading shows, then blank |
| 6 | Conditionals | ⏳ Pending | |
| 7 | Child components | ⏳ Pending | |
| 8 | Minimal render | ⏳ Pending | |

---

## Action Items

1. [ ] Deploy minimal render test
2. [ ] Check if red box appears
3. [ ] If yes, bisect the main render to find breaking section
4. [ ] If no, add console.log to each conditional check

---

## Fix History

| Date | Change | Result |
|------|--------|--------|
| 2026-01-12 | Changed `pkg.available` to `pkg.is_active === 1` | Still blank |
| 2026-01-12 | Added date validity check | Still blank |
| 2026-01-12 | Tried minimal component | Works! Shows data |
| 2026-01-12 | Restored original with fix | Blank again |

**Conclusion**: Problem is in the **main render section**, not the data fetching.
