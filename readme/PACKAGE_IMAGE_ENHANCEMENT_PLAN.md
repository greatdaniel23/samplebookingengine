# 📦 Package Page Image Enhancement Plan

**Created**: December 29, 2025  
**Status**: ✅ TASKS 1 & 2 COMPLETED

---

## 🎯 Goals

### 1. Package Page Hero Images (Use Homepage Carousel Template)
Use the **same image carousel/gallery template** from homepage (`booking.rumahdaisycantik.com`) on the package details page. 
- Display **5 package images** (set from admin dashboard) 
- Use the **same visual design/component** as homepage hero carousel
- NOT loading homepage images - using package-specific images with homepage layout

### 2. Room Image Popup Gallery
When clicking room images on the package page, display a popup/lightbox gallery.

---

## 📋 Implementation Tasks

### Task 1: Package Page Hero Images (Homepage Template)

**Files to Modify:**
- `src/pages/user/PackageDetails.tsx`
- Reference: Homepage carousel component

**Requirements:**
- [x] Reuse homepage carousel/gallery template component
- [x] Display package images (from admin `packageFormData.images`)
- [x] Show up to 5 images in carousel
- [x] Match homepage hero section styling exactly

**Technical Approach:**
```tsx
// Use package images from API (set in admin dashboard)
const packageImages = packageData.images; // Array from packages.php
const heroImages = packageImages.slice(0, 5); // Max 5 for carousel

// Reuse homepage carousel component/template
<HeroCarousel images={heroImages} />
// OR copy structure from homepage hero section
```

**UI Component (copy from homepage):**
- Full-width hero carousel
- Auto-play with navigation dots
- Arrow navigation (on hover)
- Responsive sizing (16:9 or 21:9 aspect ratio)

---

### Task 2: Room Image Popup Gallery

**Files to Modify:**
- `src/pages/user/PackageDetails.tsx`
- Create: `src/components/ImageLightbox.tsx` (if not exists)

**Requirements:**
- [ ] Click on room thumbnail → opens fullscreen popup
- [ ] Navigate between images with arrows
- [ ] Close button (X) and click outside to close
- [ ] Keyboard navigation (Esc, Left/Right arrows)

**Technical Approach:**
```tsx
// State for lightbox
const [lightboxOpen, setLightboxOpen] = useState(false);
const [currentImageIndex, setCurrentImageIndex] = useState(0);
const [lightboxImages, setLightboxImages] = useState<string[]>([]);

// Click handler on room image
const handleRoomImageClick = (images: string[], index: number) => {
  setLightboxImages(images);
  setCurrentImageIndex(index);
  setLightboxOpen(true);
};
```

**Lightbox Component:**
```tsx
interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}
```

---

### Task 3: Admin Dashboard Package Image Settings

**File:** `src/components/admin/PackagesSection.tsx` (lines 1127-1250)

#### ✅ Already Implemented:
- Multi-file image upload with drag & drop (line 1186-1238)
- Image preview grid (3 columns) at line 1141
- Delete button on each image (hover to show) at line 1162
- File validation: image/* type, max 10MB (line 1197-1206)
- Images stored as data URLs in `packageFormData.images` array
- Images sent to API as JSON string (line 402-403)

#### 🔧 What Needs to Change:
- [ ] Add limit indicator: "X/5 images uploaded"
- [ ] Enforce maximum 5 images for hero display
- [ ] Add drag-to-reorder functionality (optional)
- [ ] Ensure first 5 images are used as package page hero

**Current Code Structure:**
```tsx
// Line 48 - packageFormData includes images
images: [] as string[],

// Lines 1127-1250 - Edit modal has full image management UI
{/* Package Images */}
<div>
  <label>Package Images</label>
  {/* Current Images - Grid preview */}
  {packageFormData.images.map((image, index) => (...))}
  
  {/* Upload input - accepts multiple images */}
  <input type="file" multiple accept="image/*" />
</div>

// Line 402-403 - Images saved to API
images: JSON.stringify(packageFormData.images)
```

**Enhancement Needed:**
```tsx
// Add limit check before adding new images
const MAX_HERO_IMAGES = 5;
const canAddMore = packageFormData.images.length < MAX_HERO_IMAGES;

// Show count indicator
<p>{packageFormData.images.length}/{MAX_HERO_IMAGES} hero images</p>
```

---

## 🎨 UI/UX Specifications

### Hero Carousel
| Property | Value |
|----------|-------|
| Max Images | 5 |
| Aspect Ratio | 16:9 or 21:9 |
| Auto-play | Yes, 5 seconds |
| Dots Navigation | Yes |
| Arrow Navigation | Yes (on hover) |

### Lightbox Popup
| Property | Value |
|----------|-------|
| Background | Semi-transparent black (rgba(0,0,0,0.9)) |
| Close Button | Top-right corner (X) |
| Navigation | Left/Right arrows |
| Image Display | Centered, max 90% viewport |
| Thumbnails | Optional bottom strip |

---

## 📂 File Structure

```
src/
├── pages/user/
│   └── PackageDetails.tsx    # Add hero carousel + lightbox trigger
├── components/
│   ├── ImageLightbox.tsx     # New component (if needed)
│   ├── HeroCarousel.tsx      # Existing or new
│   └── admin/
│       └── PackagesSection.tsx  # Update image management UI
└── hooks/
    └── useHomepageContent.tsx # Existing - for fetching images
```

---

## ✅ Acceptance Criteria

### Hero Images
- [ ] Package page shows 5 images at top
- [ ] Images load from same source as homepage
- [ ] Carousel auto-plays with manual navigation
- [ ] Responsive on mobile/tablet/desktop

### Room Image Popup
- [ ] Clicking room image opens lightbox
- [ ] Can navigate between room images
- [ ] Esc key closes lightbox
- [ ] Click outside closes lightbox
- [ ] Smooth animations

### Admin Dashboard (PackagesSection)
- [ ] Can upload up to 5 hero images per package
- [ ] Preview grid shows all uploaded images
- [ ] Can delete individual images
- [ ] Can reorder images (drag & drop)
- [ ] First 5 images display on package page
- [ ] Uses existing ImageManager component

---

## 🔗 References

- **Homepage**: https://booking.rumahdaisycantik.com
- **Package Page**: http://localhost:5173/packages/15
- **API Endpoint**: `villa.php` (for hero images)

---

## 📝 Notes

- Consider reusing existing `RoomImageGallery.tsx` component
- Check if shadcn/ui has a Dialog component suitable for lightbox
- Ensure mobile touch gestures work (swipe left/right)
