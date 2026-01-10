# R2 Image Picker Implementation Plan

## Date: January 9, 2026

## Current Status Analysis

### What Was Just Implemented:
1. ✅ Created `R2ImagePicker.tsx` component
2. ✅ Updated `PropertySection.tsx` to use R2ImagePicker
3. ✅ Added `/api/images/file/:key` endpoint to serve images
4. ✅ Updated `/api/images/upload` endpoint
5. ✅ Updated `/api/images/list` endpoint
6. ✅ Deployed Worker (Version: f3c17cd0-76bc-4541-80bd-845c830767d1)
7. ✅ Deployed Frontend (https://e656503f.bookingengine-8g1-boe-kxn.pages.dev)

---

## Issues to Check & Fix

### 1. **R2ImagePicker Component Issues**

#### Current Implementation Check:
- Uses hardcoded API URL: `https://booking-engine-api.danielsantosomarketing2017.workers.dev`
- ❌ Should use `paths.buildApiUrl()` from config
- ❌ No error handling UI for failed uploads
- ❌ No loading states for image display
- ❌ No image preview before upload

#### Files to Review:
- `src/components/admin/R2ImagePicker.tsx`
- `src/config/paths.ts`

---

### 2. **PropertySection Integration Issues**

#### Current Implementation Check:
- Image keys stored as strings in `formData.images` array
- Display uses: `/api/images/file/${image}`
- ❌ Need to verify image key format consistency
- ❌ Check if empty images array causes issues
- ❌ Verify image display in non-edit mode

#### Files to Review:
- `src/components/admin/PropertySection.tsx`
- `src/hooks/useVillaInfo.tsx`

---

### 3. **Worker Image Endpoints**

#### Current Endpoints:
1. `GET /api/images/list` - List all images
2. `GET /api/images/file/:key` - Serve image file
3. `GET /api/images/:key` - Get metadata (might conflict!)
4. `POST /api/images/upload` - Upload image
5. `DELETE /api/images/:key` - Delete image

#### Issues to Check:
- ❌ Route conflict: `/api/images/file/:key` vs `/api/images/:key`
- ❌ Need proper route ordering (more specific routes first)
- ❌ Missing CORS headers on OPTIONS requests
- ❌ No validation of file extensions
- ❌ No duplicate file prevention

#### Files to Review:
- `src/workers/index.ts` (handleImages function)

---

### 4. **Database Villa Info Schema**

#### Current villa_info Table:
```sql
- id
- name
- description
- location
- max_guests
- total_rooms
- total_bathrooms
- size_sqm
- check_in_time
- check_out_time
- phone
- email
- website
- address
- policies
- amenities_summary
```

#### Issue:
- ❌ No `images` field in database!
- ❌ Villa images stored in `formData.images` array but where is it persisted?
- ❌ Need to check if images are stored as JSON string or separate table

#### Need to Check:
- Does villa_info table have an `images` column?
- Is it JSON or TEXT type?
- Does villa.ts handler save images correctly?

---

### 5. **Image Storage Structure**

#### Current Structure:
```
R2 Bucket (imageroom):
├── villa/
│   ├── {timestamp}-{random}.{ext}
│   └── ...
├── room/
│   └── {roomId}/
│       └── {timestamp}-{random}.{ext}
└── amenity/
    └── ...
```

#### Issues to Check:
- ❌ No roomId for villa images (they go to `villa/{timestamp}`)
- ❌ Should villa images have a specific structure?
- ✅ Prefix filtering works with `villa/`

---

## Action Plan

### Phase 1: Fix Critical Issues (MUST DO NOW)

#### 1.1 Fix Route Conflict in Worker
**File:** `src/workers/index.ts`
**Problem:** `/api/images/:key` matches everything, conflicts with `/api/images/file/:key`
**Solution:** Reorder routes - put specific routes first

```typescript
// CORRECT ORDER:
1. GET /api/images/list
2. GET /api/images/file/:key  ← Specific route first
3. POST /api/images/upload
4. DELETE /api/images/:key
5. GET /api/images/:key       ← Generic route last
```

#### 1.2 Add Images Column to Villa Table
**File:** `database/d1-villa-images-column.sql` (NEW)
**Action:** Add images column to villa_info table

```sql
ALTER TABLE villa_info ADD COLUMN images TEXT;
-- Store as JSON string: '["villa/123.jpg", "villa/456.jpg"]'
```

#### 1.3 Update Villa Handler to Save Images
**File:** `src/workers/routes/villa.ts`
**Action:** Update PUT handler to save images as JSON string

```typescript
// In PUT handler:
images: body.images ? JSON.stringify(body.images) : '[]'

// In GET handler:
images: result.images ? JSON.parse(result.images) : []
```

#### 1.4 Fix R2ImagePicker to Use Config
**File:** `src/components/admin/R2ImagePicker.tsx`
**Action:** Replace hardcoded API URL with config

```typescript
import { paths } from '@/config/paths';
const API_BASE_URL = paths.apiBaseUrl;
```

---

### Phase 2: Enhance Features (NICE TO HAVE)

#### 2.1 Add Image Preview Before Upload
**File:** `src/components/admin/R2ImagePicker.tsx`
**Feature:** Show preview thumbnail before uploading

#### 2.2 Add Loading States
**File:** `src/components/admin/R2ImagePicker.tsx`
**Feature:** Skeleton loaders for images in grid

#### 2.3 Add Error Handling UI
**File:** `src/components/admin/R2ImagePicker.tsx`
**Feature:** Toast notifications for errors

#### 2.4 Add Image Deletion
**File:** `src/components/admin/R2ImagePicker.tsx`
**Feature:** Delete button on each image in grid

#### 2.5 Add Drag & Drop Upload
**File:** `src/components/admin/R2ImagePicker.tsx`
**Feature:** Drag and drop zone for file upload

---

### Phase 3: Apply to Other Sections (FUTURE)

#### 3.1 Rooms Section
- Replace room image URL inputs with R2ImagePicker
- Use prefix: `room/{roomId}/`

#### 3.2 Packages Section
- Replace package image URL inputs with R2ImagePicker
- Use prefix: `package/{packageId}/`

#### 3.3 Amenities Section
- Replace amenity icon/image with R2ImagePicker
- Use prefix: `amenity/`

---

## Files That Need Changes

### Critical (Phase 1):
1. ✅ `src/workers/index.ts` - Fix route ordering
2. ✅ `database/d1-villa-images-column.sql` - Add images column
3. ✅ `src/workers/routes/villa.ts` - Save/load images as JSON
4. ✅ `src/components/admin/R2ImagePicker.tsx` - Use config for API URL

### Optional (Phase 2):
5. `src/components/admin/R2ImagePicker.tsx` - Add enhancements
6. `src/components/admin/PropertySection.tsx` - Add better error handling

### Future (Phase 3):
7. `src/components/admin/RoomsSection.tsx`
8. `src/components/admin/PackagesSection.tsx`
9. `src/components/admin/AmenitiesSection.tsx`

---

## Testing Checklist

### Before Deploy:
- [ ] Check route order in Worker
- [ ] Verify images column exists in D1
- [ ] Test image upload to R2
- [ ] Test image list API
- [ ] Test image serve API

### After Deploy:
- [ ] Upload villa image via Property section
- [ ] Verify image appears in picker modal
- [ ] Verify image saves to database
- [ ] Verify image displays on homepage
- [ ] Test image selection from existing images
- [ ] Test image removal

---

## Current Deployment URLs

**Frontend:** https://e656503f.bookingengine-8g1-boe-kxn.pages.dev
**Worker:** https://booking-engine-api.danielsantosomarketing2017.workers.dev
**Worker Version:** f3c17cd0-76bc-4541-80bd-845c830767d1
**D1 Database:** booking-engine (71df7f17-943b-46dd-8870-2e7769a3c202)
**R2 Bucket:** imageroom

---

## Implementation Order

1. Fix Worker route ordering (handleImages function)
2. Add images column to villa_info table
3. Update villa.ts GET handler to parse images JSON
4. Update villa.ts PUT handler to save images JSON
5. Update R2ImagePicker to use config paths
6. Build & deploy Worker
7. Execute D1 migration
8. Build & deploy Frontend
9. Test complete flow

---

## Potential Risks

1. **Route Conflict:** If routes aren't ordered correctly, `/api/images/:key` will catch all requests
2. **JSON Parse Error:** If images column has invalid JSON, parse will fail
3. **Migration Risk:** Adding column to production database
4. **R2 Costs:** Storing many large images could increase costs
5. **Cache Issues:** Browser might cache old API responses

---

## Next Steps

Execute Phase 1 fixes in this order:
1. ✅ Fix handleImages route ordering
2. ✅ Create and execute D1 migration for images column  
3. ✅ Update villa.ts handlers
4. ✅ Update R2ImagePicker component
5. ✅ Deploy and test
