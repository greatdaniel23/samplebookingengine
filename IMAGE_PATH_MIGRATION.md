# 🖼️ Image Path Migration Plan

## Problem Statement

The application is loading images with relative paths like `/images/hero/DSC02132.JPG` which resolve to the Pages deployment domain instead of the R2 bucket. We need to migrate from:

**OLD (Shared Hosting):**
```
https://rumahdaisycantik.com/images/hero/DSC02132.JPG
```

**NEW (R2 Bucket):**
```
https://pub-e303ec878512482fa87c065266e6bedd.r2.dev/hero/DSC02132.JPG
```

## Current R2 Configuration

- **Bucket Name**: `imageroom`
- **Public URL**: `https://pub-e303ec878512482fa87c065266e6bedd.r2.dev`
- **Worker Binding**: `env.IMAGES`
- **Status**: ✅ Public access enabled

## Files Requiring Updates

### 1. Frontend Components

#### 📄 `src/components/PhotoGallery.tsx`
**Current Issue**: Receives image paths like `/images/hero/DSC02132.JPG` and uses them directly

**Required Changes**:
```tsx
// ADD: Helper function to convert paths to R2 URLs
const R2_PUBLIC_URL = 'https://pub-e303ec878512482fa87c065266e6bedd.r2.dev';

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // Remove leading slash and /images/ prefix if present
  const cleanPath = imagePath.replace(/^\/?(images\/)?/, '');
  
  // Return R2 URL
  return `${R2_PUBLIC_URL}/${cleanPath}`;
};

// UPDATE: Use the helper function
const displayImages = images && images.length > 0 
  ? images.map(img => getImageUrl(img))
  : defaultImages;
```

**Lines to Modify**: 17, 27, 47-56

---

#### 📄 `src/components/Header.tsx`
**Current Issue**: Logo hardcoded to shared hosting URL

**Required Changes**:
```tsx
// REPLACE:
src="https://rumahdaisycantik.com/images/rooms/logo.png"

// WITH: Upload logo to R2 and use:
src="https://pub-e303ec878512482fa87c065266e6bedd.r2.dev/logo.png"
```

**Lines to Modify**: 42

---

#### 📄 `src/components/ImageGallery.tsx`
**Current Issue**: Logo hardcoded to shared hosting URL

**Required Changes**:
```tsx
// REPLACE:
src="https://rumahdaisycantik.com/images/rooms/logo.png"

// WITH:
src="https://pub-e303ec878512482fa87c065266e6bedd.r2.dev/logo.png"
```

**Lines to Modify**: 245

---

#### 📄 `src/components/admin/PropertySection.tsx`
**Status**: ✅ Already updated to use R2 URL correctly

**Current Code** (Line 287):
```tsx
src={`https://pub-e303ec878512482fa87c065266e6bedd.r2.dev/${image}`}
```

---

#### 📄 `src/components/admin/R2ImagePicker.tsx`
**Status**: ✅ Already updated to use R2 URL correctly

**Current Code**:
```tsx
const R2_PUBLIC_URL = 'https://pub-e303ec878512482fa87c065266e6bedd.r2.dev';
```

---

### 2. Worker Configuration

#### 📄 `src/workers/index.ts`
**Status**: ✅ Already updated

**Current Code** (Line 400):
```typescript
const R2_PUBLIC_URL = 'https://pub-e303ec878512482fa87c065266e6bedd.r2.dev';
```

---

### 3. Database Migration

#### 📄 `database/d1-data.sql`
**Current Issue**: Villa images stored as `/images/hero/DSC05979.JPG`

**Required Changes**:
Create migration SQL to update existing paths:

```sql
-- Migration: Update villa image paths from old format to R2 keys
UPDATE villa_info 
SET images = REPLACE(
  REPLACE(images, '"/images/hero/', '"hero/'),
  '"/images/', '"'
)
WHERE images LIKE '%/images/%';

-- Example transformation:
-- BEFORE: '["/images/hero/DSC05979.JPG", "/images/hero/DSC05990.JPG"]'
-- AFTER:  '["hero/DSC05979.JPG", "hero/DSC05990.JPG"]'
```

**Lines to Modify**: 80 (villa_info INSERT statement)

---

### 4. Configuration Files

#### Create: `src/config/r2.ts`
**New File**: Centralize R2 configuration

```typescript
export const R2_CONFIG = {
  publicUrl: 'https://pub-e303ec878512482fa87c065266e6bedd.r2.dev',
  bucketName: 'imageroom',
} as const;

/**
 * Converts various image path formats to R2 public URLs
 * @param imagePath - Can be:
 *   - R2 key: "hero/DSC02132.JPG"
 *   - Old relative path: "/images/hero/DSC02132.JPG"
 *   - Full URL: "https://..."
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '/placeholder.svg';
  
  // Already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Clean up path: remove leading slash and /images/ prefix
  const cleanPath = imagePath.replace(/^\/?(images\/)?/, '');
  
  return `${R2_CONFIG.publicUrl}/${cleanPath}`;
}
```

---

## Implementation Steps

### Phase 1: Upload Existing Images to R2 ✅ 
- [x] Enable R2 public access
- [x] Configure Worker to use correct R2 URL
- [ ] Upload existing images from `/images/hero/` to R2 bucket
  - Source: `public/images/hero/*.JPG`
  - Destination: `hero/*.JPG` (in R2)

### Phase 2: Update Frontend Components
- [ ] Create `src/config/r2.ts` helper
- [ ] Update `PhotoGallery.tsx` to use `getImageUrl` helper
- [ ] Update `Header.tsx` logo path
- [ ] Update `ImageGallery.tsx` logo path
- [ ] Test image display on homepage
- [ ] Test image display on packages page

### Phase 3: Database Migration
- [ ] Create and run D1 migration SQL
- [ ] Verify villa_info.images column updated
- [ ] Test admin dashboard image display
- [ ] Test PropertySection image selection

### Phase 4: Cleanup
- [ ] Remove old image references from documentation
- [ ] Update README with new R2 structure
- [ ] Remove unused `/public/images/` folder (if applicable)

---

## Testing Checklist

### Homepage (`/`)
- [ ] Hero gallery displays images from R2
- [ ] Header logo loads from R2
- [ ] No 404 errors in console
- [ ] Images load on mobile and desktop

### Packages Page (`/packages`)
- [ ] Hero gallery displays images from R2
- [ ] Package cards display images correctly
- [ ] No 404 errors in console

### Admin Dashboard (`/admin`)
- [ ] PropertySection displays saved images
- [ ] R2ImagePicker shows uploaded images
- [ ] Image upload works correctly
- [ ] Saved images persist after refresh

### Image URLs in Browser DevTools
```bash
# BEFORE (incorrect):
https://a6d26791.bookingengine-8g1-boe-kxn.pages.dev/images/hero/DSC02132.JPG

# AFTER (correct):
https://pub-e303ec878512482fa87c065266e6bedd.r2.dev/hero/DSC02132.JPG
```

---

## Upload Commands

### Upload Images to R2 Bucket
```powershell
# Upload all hero images
cd "c:\xampp\htdocs\frontend-booking-engine to cloudflare"

# Option 1: Upload via Wrangler CLI
npx wrangler r2 object put imageroom/hero/DSC02132.JPG --file=public/images/hero/DSC02132.JPG

# Option 2: Bulk upload using PowerShell
Get-ChildItem "public\images\hero\*.JPG" | ForEach-Object {
    $key = "hero/$($_.Name)"
    npx wrangler r2 object put "imageroom/$key" --file=$_.FullName
    Write-Host "Uploaded: $key"
}
```

---

## Notes

### Image Path Conventions

**R2 Bucket Structure**:
```
imageroom/
├── hero/              # Hero/villa images
│   ├── DSC02132.JPG
│   ├── DSC05979.JPG
│   └── ...
├── rooms/             # Room images
│   └── Villa5/
│       └── image1.webp
├── packages/          # Package images
│   └── romantic-escape.jpg
├── amenities/         # Amenity icons
│   └── pool.svg
└── logo.png          # Site logo
```

**Database Storage** (villa_info.images):
```json
["hero/DSC02132.JPG", "hero/DSC05979.JPG"]
```
NOT:
```json
["/images/hero/DSC02132.JPG", "/images/hero/DSC05979.JPG"]
```

### Why This Migration?

1. **No Shared Hosting**: Cloudflare Pages doesn't serve from `/images/` folder
2. **CDN Performance**: R2 provides global CDN distribution
3. **Cost Effective**: R2 storage is cheaper than hosting
4. **Scalability**: Handle high traffic without server issues
5. **Consistency**: Single source of truth for all images

---

## Quick Reference

**R2 Public URL**: `https://pub-e303ec878512482fa87c065266e6bedd.r2.dev`

**Path Transformation Examples**:
```javascript
// Old format (database)
"/images/hero/DSC02132.JPG"

// New format (database) 
"hero/DSC02132.JPG"

// Display URL (frontend)
"https://pub-e303ec878512482fa87c065266e6bedd.r2.dev/hero/DSC02132.JPG"
```
