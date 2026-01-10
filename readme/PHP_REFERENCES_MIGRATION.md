# PHP References Migration Checklist

This document lists all remaining `.php` API references in the frontend codebase that need to be migrated to Cloudflare Worker endpoints.

**Last Updated:** January 9, 2026 - 23:55 (Complete Recount)

**Total TSX Files Scanned:** 113 files  
**Files with PHP References:** 35 files (29 production + 6 debug/test)

---

## 📋 Quick Status

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ **Production Files Migrated** | 22/29 | 76% |
| ❌ **Production Files Remaining** | 7/29 | 24% |
| 🔵 **Debug/Test Files (Ignored)** | 6 | N/A |
| **Total PHP References Found** | ~150 refs | - |

---

## 📁 Complete TSX File Inventory

### ✅ User-Facing Pages (Migrated)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| Index.tsx | `src/pages/user/` | 0 | ✅ Clean |
| Booking.tsx | `src/pages/user/` | 0 | ✅ Migrated |
| RoomDetails.tsx | `src/pages/user/` | 0 | ✅ Migrated |
| Packages.tsx | `src/pages/user/` | 0 | ✅ Clean |
| ImageGalleryPage.tsx | `src/pages/user/` | 0 | ✅ Clean |

### ❌ User-Facing Pages (Pending)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| PackageDetails.tsx | `src/pages/user/` | 2 | ❌ TODO |
| BookingSummary.tsx | `src/pages/user/` | 2 | ❌ TODO |

### ✅ Admin Pages (Migrated)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| AdminLogin.tsx | `src/pages/admin/` | 0 | ✅ Clean |

### ⚠️ Admin Pages (Partial)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| AdminPanel.tsx | `src/pages/admin/` | 9 | ⚠️ Calendar only |

### ✅ Admin Components (Migrated)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| BookingsSection.tsx | `src/components/admin/` | 0 | ✅ Migrated |
| RoomsSection.tsx | `src/components/admin/` | 0 | ✅ Migrated |
| InclusionsSection.tsx | `src/components/admin/` | 0 | ✅ Migrated |
| MarketingCategoriesSection.tsx | `src/components/admin/` | 0 | ✅ Migrated |
| MultipleRoomImageButton.tsx | `src/components/admin/` | 0 | ✅ Migrated |
| RoomImageButton.tsx | `src/components/admin/` | 0 | ✅ Migrated |
| PropertySection.tsx | `src/components/admin/` | 0 | ✅ Clean |
| SimplifiedHomepageManager.tsx | `src/components/admin/` | 0 | ✅ Clean |

### ❌ Admin Components (Pending)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| PackageRoomsManager.tsx | `src/components/admin/` | 13 | ❌ TODO |
| PackagesSection.tsx | `src/components/admin/` | 1 | ❌ TODO |
| AmenitiesSection.tsx | `src/components/admin/` | 5 | ❌ TODO |
| PackageCalendarManager.tsx | `src/components/admin/` | 5 | ⚠️ Blocked |
| HomepageContentManager.tsx | `src/components/admin/` | 0 (comment) | ✅ Clean |

### ✅ Hooks (Migrated)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| useVillaInfo.tsx | `src/hooks/` | 0 | ✅ Migrated |
| useHomepageContent.tsx | `src/hooks/` | 0 (comment) | ✅ Migrated |
| useRooms.tsx | `src/hooks/` | 0 | ✅ Clean |
| usePackages.tsx | `src/hooks/` | 0 | ✅ Clean |
| useHeroImages.tsx | `src/hooks/` | 0 | ✅ Clean |
| useRoomFiltering.tsx | `src/hooks/` | 0 | ✅ Clean |
| useIndexPageData.tsx | `src/hooks/` | 0 | ✅ Clean |
| useDescriptionProcessor.tsx | `src/hooks/` | 0 | ✅ Clean |

### ⚠️ Services (Blocked)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| villaService.ts | `src/services/` | 0 | ✅ Migrated |
| packageService.ts | `src/services/` | 0 | ✅ Migrated |
| emailService.ts | `src/services/` | 0 (comment) | ✅ Clean |
| icalService.ts | `src/services/` | 4 | ⚠️ Blocked |
| calendarService.ts | `src/services/` | 10 | ⚠️ Blocked |

### ✅ User Components (Migrated)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| PackageCard.tsx | `src/components/` | 0 | ✅ Migrated |
| RoomCard.tsx | `src/components/` | 0 | ✅ Clean |
| ImageGallery.tsx | `src/components/` | 0 | ✅ Migrated |
| ImageManager.tsx | `src/components/` | 0 | ✅ Migrated |
| RoomImageGallery.tsx | `src/components/` | 0 | ✅ Migrated |
| CalendarIntegration.tsx | `src/components/` | 0 | ✅ Migrated |
| Header.tsx | `src/components/` | 0 | ✅ Clean |
| Footer.tsx | `src/components/` | 0 | ✅ Clean |
| Amenities.tsx | `src/components/` | 0 | ✅ Clean |
| AboutSection.tsx | `src/components/` | 0 | ✅ Clean |
| ServiceSections.tsx | `src/components/` | 0 | ✅ Clean |
| RoomsSection.tsx | `src/components/` | 0 | ✅ Clean |
| PhotoGallery.tsx | `src/components/` | 0 | ✅ Clean |
| BookingSearchForm.tsx | `src/components/` | 0 | ✅ Clean |
| BookingSteps.tsx | `src/components/` | 0 | ✅ Clean |
| FilterButtons.tsx | `src/components/` | 0 | ✅ Clean |
| CalendarDashboard.tsx | `src/components/` | 0 | ✅ Clean |

### 🔵 Debug/Test Components (Low Priority)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| ApiDebug.tsx | `src/pages/debug/` | 1 | 🔵 DEBUG |
| CalendarTestPage.tsx | `src/components/test/` | 9 | 🔵 TEST |
| ApiUrlTester.tsx | `src/components/` | 4 | 🔵 DEBUG |
| ApiDebugComponent.tsx | `src/components/` | 1 | 🔵 DEBUG |
| ApiTestComponent.tsx | `src/components/` | 0 | 🔵 DEBUG |
| ComprehensiveDebug.tsx | `src/components/` | 1 | 🔵 DEBUG |
| AdminApiDiagnostics.tsx | `src/components/` | 2 | 🔵 DEBUG |
| DebugPackages.tsx | `src/components/` | 0 | 🔵 DEBUG |

### ✅ Context & Core Files
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| App.tsx | `src/` | 0 | ✅ Clean |
| main.tsx | `src/` | 0 | ✅ Clean |
| BookingContext.tsx | `src/context/` | 0 | ✅ Clean |
| NotFound.tsx | `src/pages/shared/` | 0 | ✅ Clean |
| AdminPanel.tsx (old) | `src/components/` | 0 | ✅ Unused |
| AdminGuard.tsx | `src/components/` | 0 | ✅ Clean |

### ✅ UI Components (All Clean)
| Count | Path | Status |
|-------|------|--------|
| 48 files | `src/components/ui/` | ✅ All Clean (no API calls) |

**UI Components:** accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

---

## 📁 TypeScript (TS) File Inventory

### ✅ Configuration Files
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| paths.ts | `src/config/` | 0 | ✅ Migrated |
| cloudflare.ts | `src/config/` | 0 | ✅ Clean |
| images.ts | `src/config/` | 0 | ✅ Clean |

### ⚠️ Services with PHP References
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| icalService.ts | `src/services/` | 4 | ⚠️ Blocked |
| calendarService.ts | `src/services/` | 10 | ⚠️ Blocked |

### ✅ Services (Clean)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| villaService.ts | `src/services/` | 0 | ✅ Migrated |
| packageService.ts | `src/services/` | 0 | ✅ Migrated |
| emailService.ts | `src/services/` | 0 | ✅ Migrated |
| cloudflareApi.ts | `src/services/` | 0 | ✅ Clean |

### ✅ Hooks (TS Files)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| useCloudflareApi.ts | `src/hooks/` | 0 | ✅ Clean |
| useEmailService.ts | `src/hooks/` | 0 | ✅ Clean |
| use-toast.ts | `src/hooks/` | 0 | ✅ Clean |
| useBookings.ts | `src/hooks/admin/` | 0 | ✅ Clean |
| useApi.ts | `src/hooks/admin/` | 0 | ✅ Clean |

### ✅ Worker Files (Cloudflare)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| index.ts | `src/workers/` | 0 | ✅ Clean |
| types.ts | `src/workers/` | 0 | ✅ Clean |
| database.ts | `src/workers/lib/` | 0 | ✅ Clean |
| auth.ts | `src/workers/utils/` | 0 | ✅ Clean |
| bookings.ts | `src/workers/routes/` | 0 | ✅ Clean |
| amenities.ts | `src/workers/routes/` | 0 | ✅ Clean |
| images.ts | `src/workers/routes/` | 0 | ✅ Clean |
| auth.ts | `src/workers/routes/` | 0 | ✅ Clean |

### ✅ Utility & Library Files
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| utils.ts | `src/lib/` | 0 | ✅ Clean |
| offlineBookings.ts | `src/lib/` | 0 | ✅ Clean |
| toast.ts | `src/utils/` | 0 | ✅ Clean |
| images.ts | `src/utils/` | 0 | ✅ Clean |
| debugLogger.ts | `src/utils/` | 0 | ✅ Clean |

### ✅ Type Definition Files
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| types.ts | `src/` | 0 | ✅ Clean |
| vite-env.d.ts | `src/` | 0 | ✅ Clean |
| index.ts | `src/types/admin/` | 0 | ✅ Clean |

### ✅ Export & Data Files
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| exports.ts | `src/pages/user/` | 0 | ✅ Clean |
| exports.ts | `src/pages/admin/` | 0 | ✅ Clean |
| exports.ts | `src/pages/debug/` | 0 | ✅ Clean |
| exports.ts | `src/pages/shared/` | 0 | ✅ Clean |
| index.ts | `src/components/admin/` | 0 | ✅ Clean |
| dummy.ts | `src/data/` | 0 | ✅ Clean |
| diagnostic.ts | `src/` | 0 | ✅ Clean |

### 📊 TS Files Summary
| Category | Files | PHP Refs | Status |
|----------|-------|----------|--------|
| Configuration | 3 | 0 | ✅ All Clean |
| Services (Clean) | 4 | 0 | ✅ All Migrated |
| Services (Blocked) | 2 | 14 | ⚠️ Calendar/iCal |
| Hooks | 5 | 0 | ✅ All Clean |
| Worker Files | 8 | 0 | ✅ All Clean |
| Utility & Library | 5 | 0 | ✅ All Clean |
| Type Definitions | 3 | 0 | ✅ All Clean |
| Export & Data | 7 | 0 | ✅ All Clean |
| **Total TS Files** | **37** | **14** | **35/37 Clean** |

---

## 🎯 FINAL COMPLETE SUMMARY

### Total Files Scanned
| Type | Count | With PHP Refs | Clean/Migrated |
|------|-------|---------------|----------------|
| **TSX Files** | 113 | 35 | 105 (93%) |
| **TS Files** | 37 | 2 | 35 (95%) |
| **JS Files** | 8 | 1 | 7 (88%) |
| **TOTAL** | **158** | **38** | **147 (93%)** |

### Production Files Requiring Action
| Priority | Files | PHP Refs | Description |
|----------|-------|----------|-------------|
| **P0 - CRITICAL** | 2 | 4 | User-facing pages (TSX) |
| **P1 - HIGH** | 4 | 24 | Admin components (TSX) |
| **P2 - BLOCKED** | 3 | 23 | Calendar/iCal services (TS) |
| **P3 - LEGACY** | 1 | 3 | Old API service (JS) |
| **P4 - DEBUG** | 8 | 14 | Debug/test components (skip) |
| **TOTAL PENDING** | **18** | **68** | **10 production + 3 blocked + 1 legacy** |

---

## 📁 JavaScript (JS) File Inventory

### ❌ Legacy JS Files with PHP References
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| api.js | `src/services/` | 3 | 🔴 LEGACY (Replace with TS) |

**Details:**
- Line 17: `rooms.php`
- Line 44: `bookings.php`
- Line 58: `bookings.php`

**Recommendation:** This is an old API service file. Should be deleted as it's been replaced by TypeScript service files.

### ✅ Configuration JS Files (Clean)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| tailwind.config.js | Root | 0 | ✅ Clean |
| postcss.config.js | Root | 0 | ✅ Clean |
| config.js | Root | 0 | ✅ Clean |
| config-production.js | Root | 0 | ✅ Clean |
| admin-auth-guard.js | Root | 0 | ✅ Clean |

### 🔧 Build Artifacts (Generated)
| File | Path | PHP Refs | Status |
|------|------|----------|--------|
| middleware-insertion-facade.js | `.wrangler/tmp/` | 0 | 🔵 Generated |
| index.js | `.wrangler/tmp/` | 0 | 🔵 Generated |

---

## 📄 Configuration Files

### Cloudflare Configuration
| File | Type | Purpose |
|------|------|---------|
| wrangler-api.toml | TOML | ✅ Worker API config |
| wrangler-pages.toml | TOML | ✅ Pages config |
| wrangler.toml | TOML | ✅ Main config |

### TypeScript Configuration
| File | Type | Purpose |
|------|------|---------|
| tsconfig.json | JSON | ✅ Main TS config |
| tsconfig.node.json | JSON | ✅ Node TS config |
| tsconfig.workers.json | JSON | ✅ Workers TS config |

### Build Configuration
| File | Type | Purpose |
|------|------|---------|
| package.json | JSON | ✅ NPM dependencies |
| vercel.json | JSON | ✅ Vercel config (unused) |
| vite.config.ts | TS | ✅ Vite bundler config |

### Other Files
| File | Type | Purpose |
|------|------|---------|
| index.html | HTML | ✅ Entry point |
| payment-test.html | HTML | 🔵 Test file |
| test-payment.json | JSON | 🔵 Test data |

---

## 📚 Documentation Files (122 MD files)

### Migration & Deployment Docs
- MIGRATION_COMPLETE.md
- MIGRATION_TO_CLOUDFLARE.md
- CLOUDFLARE_MIGRATION_COMPLETE.md
- DEPLOYMENT_SUCCESS.md
- DEPLOYMENT_CHECKLIST.md
- DEPLOYMENT_COMPLETE.md
- FRONTEND_SETUP_COMPLETE.md

### API Documentation
- API_DOCUMENTATION.md
- API_CONFIGURATION_ANALYSIS.md
- WORKER_API_REFERENCE.md
- WORKERS_API_DOCS.md
- FUNCTION_API_MAPPING.md
- **PHP_REFERENCES_MIGRATION.md** (this file)

### System Documentation
- SYSTEM_ARCHITECTURE_LAYERS.md
- SYSTEM_STATUS.md
- COMPLETE_FILE_STRUCTURE.md
- MASTER_DOCUMENTATION_INDEX.md
- PROJECT_README.md

### Feature Documentation
- BOOKING_FLOW_DOCUMENTATION.md
- CALENDAR_DOCUMENTATION.md
- ICAL_DOCUMENTATION.md
- IMAGE_GALLERY_SYSTEM.md
- PACKAGES_SYSTEM.md
- EMAIL_CLOUDFLARE_DOCUMENTATION.md
- DATABASE_CLOUDFLARE_DOCUMENTATION.md

### Debugging & Testing
- DEBUG_CONSOLE_GUIDE.md
- DEBUG_REPORT.md
- API_TESTING.md
- BUG_VALIDATION_CHECKLIST.md
- TESTING_GUIDE.md

### Setup & Configuration
- CLOUDFLARE_SETUP.md
- EMAIL_SERVICE_SETUP.md
- FRONTEND_INTEGRATION_GUIDE.md
- QUICK_START.md
- QUICK_REFERENCE.md

### (... and 85+ more documentation files in readme/ folder)

---

## 🗂️ Sandbox Files (11 HTML prototypes)

Design prototype files in `sandbox/`:
- marriott-luxury-test.html
- marriott-multiple-rooms-packages.html
- marriott-room-pricing-layout.html
- marriott-room-list-rows.html
- marriott-package-sidebar.html
- marriott-package-detail-rooms.html
- mariotdesign.html
- mariotbody.html
- image-gallery.html
- formaston.html
- contohfrontend.html
- contohfrontend2.html
- contohheadtitle.html
- IMAGE_GALLERY_DOCUMENTATION.md

---

## ✅ COMPLETED (Already Migrated)

| File | Old Endpoint | New Endpoint | Status |
|------|--------------|--------------|--------|
| `src/config/paths.ts` | `PRODUCTION_API = 'https://api.rumahdaisycantik.com'` | `https://booking-engine-api.danielsantosomarketing2017.workers.dev/api` | ✅ Done |
| `src/components/admin/BookingsSection.tsx` | `bookings.php` | `bookings/list`, `bookings`, `bookings/{id}` | ✅ Done |
| `src/pages/admin/AdminPanel.tsx` | `bookings.php`, `rooms.php`, `packages.php` | `bookings/list`, `rooms`, `packages` | ✅ Done |
| `src/pages/user/Booking.tsx` | `bookings.php` | `paths.api.bookings` | ✅ Done |
| `src/pages/user/RoomDetails.tsx` | `rooms.php?id=X`, `room-amenities.php`, `villa.php` | `rooms/{id}`, `rooms/{id}/amenities`, `villa` | ✅ Done |
| `src/services/villaService.ts` | `villa.php` | `villa` | ✅ Done |
| `src/services/packageService.ts` | `packages.php` | `packages` | ✅ Done |
| `src/hooks/useHomepageContent.tsx` | `villa.php` | `villa` | ✅ Done |
| `src/hooks/useVillaInfo.tsx` | `villa.php` (3 refs) | `villa` | ✅ Done |
| `src/components/PackageCard.tsx` | `package-inclusions.php` | `packages/{id}/inclusions` | ✅ Done |
| `src/components/CalendarIntegration.tsx` | `packages.php` | `packages` | ✅ Done |
| `src/components/ImageGallery.tsx` | `images.php` | `images` | ✅ Done |
| `src/components/ImageManager.tsx` | `rooms.php`, `scan-room-images.php`, `save-selected-images.php` | `rooms`, `images/scan`, `images/save` | ✅ Done |
| `src/components/admin/MarketingCategoriesSection.tsx` | `marketing-categories.php` | `marketing-categories` | ✅ Done |
| `src/components/admin/PackagesSection.tsx` | All `.php` endpoints (rooms, amenities, inclusions, packages, marketing-categories) | `rooms`, `amenities`, `inclusions`, `packages`, `marketing-categories` | ✅ Done |
| `src/components/admin/RoomsSection.tsx` | All `.php` endpoints (rooms, amenities, room-amenities) | `rooms`, `amenities`, `room-amenities` | ✅ Done |
| `src/components/admin/AmenitiesSection.tsx` | `amenities.php`, `room-amenities.php`, `package-amenities.php`, `inclusions.php` | `amenities`, `room-amenities`, `package-amenities`, `inclusions` | ✅ Done |
| `src/components/admin/InclusionsSection.tsx` | `inclusions.php` (4 refs) | `inclusions` | ✅ Done |
| `src/components/admin/MultipleRoomImageButton.tsx` | Hardcoded `api.rumahdaisycantik.com/rooms.php`, `image-scanner.php` | `paths.buildApiUrl('rooms')`, `paths.buildApiUrl('image-scanner')` | ✅ Done |
| `src/components/admin/RoomImageButton.tsx` | `rooms.php`, `image-scanner.php` | `rooms/{id}`, `images/folders`, `images/folder/{name}` | ✅ Done |
| `src/components/RoomImageGallery.tsx` | `rooms.php` | `rooms/{id}`, `rooms/images/{folder}` | ✅ Done |
| `src/pages/user/PackageDetails.tsx` (room images) | `rooms.php` | `rooms/{id}`, `rooms/images/{folder}` | ✅ Done |

---

## ❌ PENDING MIGRATION - CRITICAL (User-Facing)

### 1. `src/pages/user/PackageDetails.tsx` - 2 refs
| Line | Current | Needed Worker Endpoint | Status |
|------|---------|------------------------|--------|
| 207 | `package-rooms.php?package_id={id}` | `/api/packages/{id}/rooms` | ❌ TODO |
| 242 | `package-inclusions.php?action=list&package_id={id}` | `/api/packages/{id}/inclusions` | ❌ TODO |

### 2. `src/pages/user/BookingSummary.tsx` - 2 refs
| Line | Current | Needed Worker Endpoint | Status |
|------|---------|------------------------|--------|
| 155-156 | `bookings.php?id={id}` / `bookings.php?reference={ref}` | `/api/bookings/{id}` or `/api/bookings/reference/{ref}` | ❌ TODO |

---

## ❌ PENDING MIGRATION - ADMIN COMPONENTS

### 3. `src/components/admin/PackageRoomsManager.tsx` - 13 refs
| Line | Current | Needed Worker Endpoint | Status |
|------|---------|------------------------|--------|
| 72 | `rooms.php` | `/api/rooms` | ❌ TODO |
| 78, 155, 179, 197, 231, 238 | `package-rooms.php?package_id={id}` (6 refs) | `/api/packages/{id}/rooms` | ❌ TODO |
| 84 | `packages.php?id={id}` | `/api/packages/{id}` | ❌ TODO |
| 119, 213 | `package-rooms.php` (POST - 2 refs) | `/api/packages/{id}/rooms` (POST) | ❌ TODO |
| 172, 194 | `package-rooms.php?id={id}` (PUT/DELETE - 2 refs) | `/api/packages/{id}/rooms/{room_id}` | ❌ TODO |

### 4. `src/components/admin/PackagesSection.tsx` - 1 ref
| Line | Current | Needed Worker Endpoint | Status |
|------|---------|------------------------|--------|
| 79 | `marketing-categories.php` | `/api/marketing-categories` | ❌ TODO |

### 5. `src/components/admin/AmenitiesSection.tsx` - 5 refs
| Line | Current | Needed Worker Endpoint | Status |
|------|---------|------------------------|--------|
| 92 | `room-amenities.php` | `/api/room-amenities` | ❌ TODO |
| 96 | `package-amenities.php` | `/api/package-amenities` | ❌ TODO |
| 125, 169, 220 | `amenities.php` (3 refs) | `/api/amenities` | ❌ TODO |

### 6. `src/components/admin/PackageCalendarManager.tsx` - 5 refs
| Line | Current | Needed Worker Endpoint | Status |
|------|---------|------------------------|--------|
| 83 | `packages.php?id={id}` | `/api/packages/{id}` | ❌ TODO |
| 96, 118, 149, 170 | `package_calendar_sync.php` (4 refs) | `/api/calendar/sync` (NOT IMPLEMENTED) | ⚠️ BLOCKED |

---

## ⚠️ PENDING MIGRATION - CALENDAR/ICAL (Not Implemented in Worker)

### 7. `src/pages/admin/AdminPanel.tsx` (Calendar Section - 9 refs)
| Line | Current | Status |
|------|---------|--------|
| 1543, 1593, 1614, 1653, 1674, 1713, 1734 | `ical.php` (fetch calls - 7 refs) | ⚠️ Worker endpoint NOT IMPLEMENTED |
| 1770, 1776 | `ical.php` (URL display/copy - 2 refs) | ⚠️ Worker endpoint NOT IMPLEMENTED |

### 8. `src/services/icalService.ts` (4 refs)
| Line | Current | Status |
|------|---------|--------|
| 167 | `ical_import_airbnb.php` | ⚠️ NOT IMPLEMENTED |
| 202 | `external_blocks.php` | ⚠️ NOT IMPLEMENTED |
| 371 | `ical.php` | ⚠️ NOT IMPLEMENTED |
| 379 | `ical_proxy.php` | ⚠️ NOT IMPLEMENTED |

### 9. `src/services/calendarService.ts` (10 refs)
| Line | Current | Status |
|------|---------|--------|
| 214 | `bookings.php` | ✅ Can use `/api/bookings/list` |
| 237 | `external_blocks.php` | ⚠️ NOT IMPLEMENTED |
| 314, 336, 363, 493, 527, 562, 580 | `ical.php` (various actions - 7 refs) | ⚠️ NOT IMPLEMENTED |

---

## 🔧 DEBUG/TEST COMPONENTS (Low Priority - 14 refs)

These are debug/test components not used in production:

| File | Line(s) | References | Status |
|------|---------|------------|--------|
| `src/pages/debug/ApiDebug.tsx` | 20 | `rooms.php` | 🔵 DEBUG ONLY |
| `src/components/test/CalendarTestPage.tsx` | 88-127 | `ical.php`, `package_calendar_sync.php` (9 refs in docs) | 🔵 TEST DOCS |
| `src/components/ComprehensiveDebug.tsx` | 31 | `test.php` | 🔵 DEBUG ONLY |
| `src/components/ApiUrlTester.tsx` | 18-21 | `bookings.php`, `rooms.php`, `packages.php`, `villa.php` (4 refs) | 🔵 DEBUG ONLY |
| `src/components/ApiDebugComponent.tsx` | 15 | `test.php` | 🔵 DEBUG ONLY |
| `src/components/AdminApiDiagnostics.tsx` | 166, 171 | `rooms.php` (2 refs - 1 hardcoded) | 🔵 DEBUG ONLY |

**Total Debug References:** 14 (can be ignored - not in production)

---

---

## 📊 UPDATED Migration Summary (Complete Recount)

### Production Files Status:

| Category | Files | Total Refs | Status |
|----------|-------|------------|--------|
| **✅ Completed** | 22 files | ~85+ refs | DONE |
| **❌ User-Facing (CRITICAL)** | 2 files | 4 refs | TODO |
| **❌ Admin Components** | 4 files | 24 refs | TODO |
| **⚠️ Calendar/iCal (BLOCKED)** | 3 services | 23 refs | NEEDS WORKER |
| **🔵 Debug/Test (SKIP)** | 6 files | 14 refs | IGNORE |
| **TOTAL PRODUCTION** | 29 files | ~136 refs | 22/29 Done (76%) |

### Detailed Breakdown:

**✅ COMPLETED (22 files):**
- Core paths configuration
- All main admin CRUD sections (Bookings, Rooms, Packages, Amenities, Inclusions)
- User booking flow
- Room details pages
- Villa information hooks
- Image management
- Marketing categories
- Multiple room images button
- Homepage content hooks

**❌ CRITICAL REMAINING (2 files - 4 refs):**
1. `PackageDetails.tsx` - 2 refs (package-rooms, package-inclusions)
2. `BookingSummary.tsx` - 2 refs (bookings by id/reference)

**❌ ADMIN REMAINING (4 files - 24 refs):**
1. `PackageRoomsManager.tsx` - 13 refs (package-rooms relationships)
2. `PackagesSection.tsx` - 1 ref (marketing-categories)
3. `AmenitiesSection.tsx` - 5 refs (room/package amenities)
4. `PackageCalendarManager.tsx` - 5 refs (calendar sync)

**⚠️ CALENDAR/ICAL (3 files - 23 refs - BLOCKED):**
1. `AdminPanel.tsx` (Calendar section) - 9 refs
2. `icalService.ts` - 4 refs
3. `calendarService.ts` - 10 refs
*Blocked by: Worker endpoints not implemented*

**🔵 DEBUG/TEST (6 files - 14 refs - LOW PRIORITY):**
- ApiDebug, CalendarTestPage, ComprehensiveDebug, ApiUrlTester, ApiDebugComponent, AdminApiDiagnostics

---

## 🎯 Action Items by Priority

### P0 - IMMEDIATE (Fix User-Facing Issues)
1. ⚠️ **Implement Worker Endpoint:** `/api/packages/{id}/rooms`
2. ⚠️ **Implement Worker Endpoint:** `/api/bookings/reference/{ref}`
3. Fix `PackageDetails.tsx` (2 refs)
4. Fix `BookingSummary.tsx` (2 refs)

### P1 - HIGH (Admin Functionality)
1. Fix `PackageRoomsManager.tsx` (13 refs) - depends on P0 endpoint
2. Fix `PackagesSection.tsx` (1 ref - marketing-categories)
3. Fix `AmenitiesSection.tsx` (5 refs)
4. Fix `PackageCalendarManager.tsx` (1 ref - packages endpoint)

### P2 - MEDIUM (Calendar Features)
1. Implement comprehensive Calendar/iCal Worker endpoints
2. Fix `AdminPanel.tsx` calendar section (9 refs)
3. Fix `icalService.ts` (4 refs)
4. Fix `calendarService.ts` (10 refs)

### P3 - LOW (Optional)
- Debug/Test components can be deleted or left as-is

---

## Worker API Endpoints Currently Available

Based on `src/workers/index.ts`:

| Endpoint | Method | Description | Used By |
|----------|--------|-------------|---------|
| `/api/health` | GET | Health check | System |
| `/api/bookings/list` | GET | List all bookings | ✅ BookingsSection |
| `/api/bookings` | POST | Create booking | ✅ Booking.tsx |
| `/api/bookings/{id}` | GET, PUT, DELETE | Single booking CRUD | ✅ BookingsSection |
| `/api/rooms` | GET, POST | List/Create rooms | ✅ RoomsSection |
| `/api/rooms/{id}` | GET, PUT, DELETE | Single room CRUD | ✅ RoomsSection, RoomDetails |
| `/api/packages` | GET, POST | List/Create packages | ✅ PackagesSection |
| `/api/packages/{id}` | GET, PUT, DELETE | Single package CRUD | ✅ PackagesSection |
| `/api/packages/{id}/amenities` | GET, POST, DELETE | Package amenities | ✅ PackagesSection |
| `/api/packages/{id}/inclusions` | GET, POST, DELETE | Package inclusions | ✅ PackagesSection |
| `/api/packages/{id}/rooms` | - | Package-room relationships | ❌ NEEDED |
| `/api/amenities` | GET, POST | List/Create amenities | ✅ AmenitiesSection |
| `/api/amenities/{id}` | GET, PUT, DELETE | Single amenity CRUD | ✅ AmenitiesSection |
| `/api/room-amenities` | GET, POST, DELETE | Room amenities | ✅ RoomsSection |
| `/api/package-amenities` | GET, POST, DELETE | Package amenities | ✅ AmenitiesSection |
| `/api/inclusions` | GET, POST | List/Create inclusions | ✅ InclusionsSection |
| `/api/inclusions/{id}` | GET, PUT, DELETE | Single inclusion CRUD | ✅ InclusionsSection |
| `/api/villa` | GET, PUT | Villa info | ✅ useVillaInfo |
| `/api/marketing-categories` | GET, POST, PUT, DELETE | Marketing categories | ✅ MarketingCategoriesSection |
| `/api/images` | GET | List images | ✅ ImageManager |
| `/api/images/folders` | GET | List image folders | ✅ MultipleRoomImageButton |
| `/api/images/folder/{name}` | GET | Images in folder | ✅ ImageManager |
| `/api/settings` | GET, PUT | Site settings | System |
| `/api/email/send` | POST | Send email via Resend | ✅ Email service |

### Missing Endpoints Needed:
- ❌ `/api/packages/{id}/rooms` - Package-room relationships (CRITICAL)
- ❌ `/api/bookings/reference/{ref}` - Get booking by reference number
- ❌ `/api/ical/*` - All iCal/calendar sync endpoints
- ❌ `/api/external-blocks` - External booking blocks
- ❌ `/api/calendar/sync` - Calendar synchronization

---

## Migration Priority

1. **URGENT** - Implement missing Worker endpoints:
   - `/api/packages/{id}/rooms` (GET, POST, PUT, DELETE)
   - `/api/bookings/reference/{ref}` (GET)
   
2. **HIGH** - Migrate user-facing pages:
   - `PackageDetails.tsx` (depends on package-rooms endpoint)
   - `BookingSummary.tsx` (depends on bookings/reference endpoint)
   
3. **MEDIUM** - Admin components:
   - `PackageRoomsManager.tsx` (depends on package-rooms endpoint)
   - `PackageCalendarManager.tsx` (blocked by calendar implementation)

4. **LOW** - Calendar/iCal features:
   - Requires comprehensive Worker implementation
   - AdminPanel.tsx calendar section
   - icalService.ts
   - calendarService.ts

5. **SKIP** - Debug/Test components (not production)

---

## Latest Deployments

- **Cloudflare Worker API**: `https://booking-engine-api.danielsantosomarketing2017.workers.dev/api`
- **Cloudflare Pages**: `https://bookingengine-8g1-boe.pages.dev`
- **Latest Deploy**: https://4341299f.bookingengine-8g1-boe.pages.dev

---

## Notes

- All core admin CRUD functionality is now using Cloudflare Worker ✅
- Homepage villa information is now loading from Worker ✅
- Bookings management fully migrated ✅
- Rooms, Packages, Amenities, Inclusions all migrated ✅
- Package-room relationships need Worker endpoint implementation before frontend migration
- Calendar/iCal functionality requires significant Worker development
