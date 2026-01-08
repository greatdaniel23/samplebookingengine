# 🏨 Villa Booking Engine - Complete Workflow Documentation

## 📋 **Project Overview**
- **Name**: Villa Booking Engine  
- **Type**: React/TypeScript Frontend + PHP Backend
- **Database**: `u289291769_booking` (MySQL)
- **API Base**: `https://api.rumahdaisycantik.com`
- **Frontend**: `http://localhost:5173` (Vite dev server)
- **Status**: ✅ **Production Ready** with hotel theme and enhanced UX
- **Recent Updates**: Package details with calendar widget, image gallery system, hotel branding

---

## 🌐 **Critical API & Database Configuration**

### **API Configuration**
- **Production API**: `https://api.rumahdaisycantik.com`
- **Database Name**: `u289291769_booking`  
- **Sample Database**: `sample-data/u289291769_booking.sql`
- **Config File**: `src/config/paths.ts`

### **🏗️ SERVER STRUCTURE ✅ CONFIRMED**
```
/home/u289291769/domains/rumahdaisycantik.com/public_html/
├── api/          → api.rumahdaisycantik.com ✅ CONFIRMED
├── booking/      → booking.rumahdaisycantik.com ✅ CONFIRMED  
└── images/       → https://rumahdaisycantik.com/images/ ✅ CONFIRMED
    └── rooms/    → https://rumahdaisycantik.com/images/rooms/ (TO BE VERIFIED)
```

**Discovery Results from http://rumahdaisycantik.com/server-scanner.php:**
- ✅ User: `u289291769` 
- ✅ PHP Version: `8.2.29`
- ✅ Platform: `hostinger` / `hpanel`
- ✅ Folders Found: `api`, `booking`, `images`, `public`

### **🔍 STRUCTURE DISCOVERY TOOLS**
- `server-scanner.php` - ✅ Created: Full directory structure scanner
- `api/check-images.php` - ✅ Created: Image folder location detector
- **DEPLOYMENT NEEDED**: Upload check-images.php to api.rumahdaisycantik.com
- **ACTION REQUIRED**: Run scanners to discover actual server structure

### **📁 IMAGE PATH STRATEGY ✅ CONFIRMED**
- **API Access**: `../images/rooms` (confirmed sibling folder access from api/)
- **Public URL**: `https://rumahdaisycantik.com/images/rooms/` (corrected domain)
- **Server Path**: `/home/u289291769/domains/rumahdaisycantik.com/public_html/images/`
- **Status**: ✅ **STRUCTURE CONFIRMED** - Ready for implementation

### **🚨 DEPLOYMENT RULES - NEVER FORGET!**
1. **All PHP files** that need database access → `api/` folder
2. **All PHP files** in `api/` folder → **MUST be uploaded to api.rumahdaisycantik.com**
3. **Local PHP files** DO NOT automatically sync to production
4. **Always remind about deployment** when creating PHP files

### **⚠️ MANDATORY PHP DEPLOYMENT REMINDER CHECKLIST**
🔴 **BEFORE making ANY frontend changes that depend on API changes:**
- [ ] Check if existing PHP API needs updates
- [ ] Update PHP API files in `api/` folder if needed  
- [ ] **UPLOAD updated PHP files to api.rumahdaisycantik.com**
- [ ] Test API endpoints on production server
- [ ] Only THEN test frontend changes

🔴 **AFTER making frontend changes:**
- [ ] Did frontend changes require new API endpoints?
- [ ] Did frontend changes require API modifications?
- [ ] **UPLOAD any new/modified PHP files to api.rumahdaisycantik.com**
- [ ] Verify production API works with frontend changes

### **🚨 CURRENT DEPLOYMENT STATUS - IMAGE SYSTEM**
**UPDATED FILES READY FOR DEPLOYMENT:**
- `api/image-scanner.php` - ✅ Updated with sibling folder strategy (`../images/rooms`)  
- `api/rooms.php` - ✅ Updated with local scanner integration
- **DEPLOYMENT NEEDED**: Both files must be uploaded to api.rumahdaisycantik.com
- **STRATEGY**: Changed from cross-domain HTTP to local file system access
- **PATH**: `public_html/api/` accessing `public_html/images/rooms/` (siblings)

---

## 📁 **Project Structure Rules**

### **Frontend Structure**
```
src/
├── components/         # React components
├── pages/             # Page components (routing)
├── services/          # API services
├── types.ts          # TypeScript interfaces
├── config/paths.ts   # API configuration
└── hooks/            # Custom React hooks
```

### **🚨 CRITICAL HTML FILE RULES**
```
Root Directory:
├── index.html         # ✅ ESSENTIAL - Vite entry point (NEVER DELETE)
├── dist/             # ✅ Build output (Vite generates)
└── [legacy].html     # ❌ Delete legacy HTML files (admin-*, config-*, etc.)
```

### **Documentation Structure**
```
readme/
├── WORKFLOW_DOCUMENTATION.md    # This file
├── PACKAGES_SYSTEM.md           # Package system docs
├── BOOKING_FLOW_DOCUMENTATION.md # Booking flow
└── [feature-docs].md           # All markdown docs go here
```

### **Development Tools**
```
sandbox/
├── image-gallery.html          # Image management tool
├── image-scanner.php           # Real-time image scanning
├── IMAGE_GALLERY_DOCUMENTATION.md # Gallery docs
└── [prototype-files].html      # UI prototypes & demos
```

### **Backend Structure** 
```
api/
├── packages.php         # Packages CRUD API
├── rooms.php           # Rooms API with image integration
├── bookings.php        # Bookings API
├── image-scanner.php   # ✅ NEW: Image discovery system (sibling folder access)
├── config/            # Database config
└── [new-apis].php     # All new PHP files go here
```

### **🖼️ Image Management System Structure**
```
api/image-scanner.php   # Backend image discovery (UPDATED: ../images/rooms access)
sandbox/image-gallery.html  # Frontend image management tool
images/rooms/          # Shared images folder (sibling to api/)
├── hero-1.jpg         ✅ Confirmed working
├── hero-2.jpg         ✅ Confirmed working  
├── deluxe/1.jpg       ✅ Confirmed working
├── standard/1.jpg     ✅ Confirmed working
└── family/1.jpg       ✅ Confirmed working
```

### **Database Structure**
```
database/
├── package-room-relationships.sql  # Multiple room schema
├── install.sql                    # Base installation
└── [migration-files].sql         # Schema updates
```

---

## 🔧 **Key Technologies**

### **Frontend Stack**
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components + Hotel Theme System
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State**: React Context + useState/useEffect
- **Theme**: Hotel Gold (#E6A500), Navy (#2F3A4F), Bronze (#7A5C3F), Sage (#8B9A7A), Cream (#F5F2E8)
- **Components**: Enhanced with calendar widgets, image galleries, professional UX

### **Backend Stack**  
- **Language**: PHP 8+
- **Database**: MySQL
- **API Style**: RESTful JSON APIs
- **CORS**: Enabled for cross-origin requests

---

## 🗄️ **Database Schema (Key Tables)**

### **Core Tables**
- `packages` - Package/sales tool information
- `rooms` - Room inventory 
- `bookings` - Booking records
- `package_rooms` - Package-room relationships (multiple room support)
- `amenities` - Feature/amenity master list
- `package_amenities` - Package-amenity relationships

### **Enhanced Package System**
- `room_selection_type`: 'single' | 'multiple' | 'upgrade'
- `allow_room_upgrades`: Boolean
- `upgrade_price_calculation`: 'fixed' | 'percentage' | 'per_night'

---

## 🚀 **Development Workflow**

### **Starting Development**
1. `cd c:\xampp\htdocs\frontend-booking-engine`
2. `npm run dev` (starts Vite on localhost:5173)
3. Ensure XAMPP is running for any local PHP testing

### **Creating New Features**
1. **Frontend**: Create components in appropriate folders
2. **Backend**: Create PHP files in `api/` folder
3. **Database**: Create SQL files in `database/` folder
4. **Documentation**: Create markdown files in `readme/` folder
5. **🚨 DEPLOYMENT**: Upload API files to api.rumahdaisycantik.com

### **API Development Pattern**
1. Create PHP file in `api/` folder
2. Handle CORS headers
3. Use `config/database.php` for DB connection
4. Return JSON responses
5. **Upload to production server**

---

## 📦 **Package & Room System**

### **Business Logic**
- **Packages** = Marketing sales tools (room + services bundle)
- **Rooms** = Real inventory that controls availability
- **Package availability** depends on underlying room availability
- **Multiple room options** per package with price adjustments
- **Enhanced UX**: Date selection, calendar widgets, room comparison

### **Key Files**
- `api/packages.php` - Package CRUD with room support
- `src/pages/PackageDetails.tsx` - Enhanced package detail page with calendar
- `src/services/packageService.ts` - API service layer
- `database/package-room-relationships.sql` - Schema

### **Room Image System Files (To Be Created)**
- `src/components/RoomImageSelector.tsx` - Image selection modal component
- `src/components/ImageGalleryModal.tsx` - Embedded gallery for room selection
- `api/room-images.php` - Room image management API
- `database/room-images-schema.sql` - Room image database updates

### **Recent Enhancements**
- ✅ **Date Selection Calendar**: Users can modify booking dates inline
- ✅ **Hotel Theme Integration**: Consistent branding throughout
- ✅ **Back Navigation**: Improved user flow
- ✅ **Responsive Design**: Mobile-optimized interface
- ✅ **Error Handling**: Graceful fallbacks and TypeScript fixes

### **🖼️ Room Image Management System - UPDATED IMPLEMENTATION**

#### **✅ BACKEND READY - DEPLOYMENT NEEDED**
**Status**: Backend files updated with new server structure understanding
- `api/image-scanner.php` - ✅ Updated with sibling folder access (`../images/rooms`)
- `api/rooms.php` - ✅ Updated with local image scanner integration
- **Path Strategy**: Optimized for `public_html/api/` → `public_html/images/rooms/`
- **🚨 DEPLOYMENT REQUIRED**: Upload updated PHP files to api.rumahdaisycantik.com

#### **Server Structure Discovery Phase**
```bash
# DISCOVERY TOOLS TO RUN:
🔍 Upload api/check-images.php to api.rumahdaisycantik.com
🔍 Test: https://api.rumahdaisycantik.com/check-images.php
🔍 Run server-scanner.php to map directory structure

# ASSUMPTIONS REMOVED - NEED REAL DATA:
❌ Previous image URLs were assumed (not verified)
❌ Folder structure was guessed (not confirmed)
❌ Path strategy needs actual server investigation

# NEXT STEPS:
1. Deploy check-images.php to production
2. Run discovery tools to map real structure
3. Update path strategy based on actual findings
```

#### **Implementation Phases**

**Phase 1: IMMEDIATE (Deploy Backend)**
1. **🚨 CRITICAL**: Upload updated `api/image-scanner.php` and `api/rooms.php`
2. **Test Endpoints**: Verify folder discovery and image scanning work
3. **Path Validation**: Confirm `../images/rooms` access from api folder

**Phase 2: Frontend Components** 
1. **Room Image Button** - Add "Image" button to room cards/rows
2. **Gallery Modal Integration** - Embed image gallery in popup/modal
3. **Image Selection Interface** - Modified gallery with "Use" buttons
4. **Image Preview** - Show selected image on room card immediately

**Phase 3: Database Schema**
```sql
ALTER TABLE rooms ADD COLUMN room_image VARCHAR(500) NULL;
ALTER TABLE rooms ADD COLUMN image_folder VARCHAR(100) NULL;
ALTER TABLE rooms ADD COLUMN image_selected_at TIMESTAMP NULL;
```

**Phase 4: UI/UX Implementation**
1. **Modal Gallery** - Popup version of image gallery system
2. **Folder Navigation** - Same folder structure as main gallery
3. **Image Selection** - Click to select, visual feedback, "Use" confirmation
4. **Mobile Responsive** - Touch-friendly interface for mobile users

---

## 🔄 **Common Tasks & Solutions**

### **Adding New API Endpoint**
1. Create `api/new-endpoint.php`
2. Add CORS headers and error handling
3. Use database config from `config/database.php`
4. **🚨🚨🚨 CRITICAL: Upload to api.rumahdaisycantik.com 🚨🚨🚨**
   - **Local file ≠ Production file**
   - **Frontend will FAIL without this step**
   - **ALWAYS test production API endpoint**

### **Database Schema Changes**
1. Create SQL file in `database/` folder
2. Use idempotent SQL (IF NOT EXISTS, etc.)
3. Create migration script in `api/` folder
4. **🚨 Upload and run on production**

### **Frontend API Integration**
1. Update service file in `src/services/`
2. Update TypeScript types in `src/types.ts`
3. Update components to use new data

### **Development Tools Usage**

#### **Image Gallery System**
1. **Access**: Open `/sandbox/image-gallery.html`
2. **Features**: Browse all hosting images, folder selection, real-time scanning
3. **Hosting Ready**: Auto-detects paths, works on any hosting provider
4. **Documentation**: See `/sandbox/IMAGE_GALLERY_DOCUMENTATION.md`
5. **Room Integration**: Will be embedded as modal for room image selection

#### **Room Image Selection System (Planned)**
```javascript
// Implementation Flow
1. Room Card → "Image" Button → Gallery Modal
2. Gallery Modal → Folder Selection → Image Grid
3. Image Grid → Click Image → "Use This Image" Button
4. Confirmation → API Call → Room Updated → Modal Closed
```

#### **UI Prototyping**
1. **Location**: `/sandbox/marriott-*.html` files
2. **Purpose**: Test designs before React implementation
3. **Hotel Theme**: Consistent branding across all prototypes

### **File Cleanup Rules**
1. **Keep**: `index.html` (Vite entry point)
2. **Keep**: `dist/` folder (build output)
3. **Delete**: Legacy HTML files (admin-*, config-*, *-test.html)
4. **Move**: Markdown files to `readme/` folder
5. **Move**: PHP files to `api/` folder

---

## 🎯 **Key Page Routes**

### **Public Routes**
- `/` - Homepage with villa info and packages
- `/packages` - Package listings page
- `/packages/:id` - **Enhanced** package detail page with calendar widget, room selection
- `/book` - **Enhanced** booking flow with date forwarding
- `/summary` - Booking confirmation

### **Enhanced Features**
- **Date Parameters**: Selected dates flow through entire booking process
- **Calendar Widgets**: Inline date modification on package details
- **Hotel Branding**: Consistent theme across all pages
- **Mobile Optimization**: Responsive design for all screen sizes

### **Admin Routes** 
- `/admin` - Admin panel (protected)
- `/admin/login` - Admin login

---

## 🔍 **Debugging & Testing**

### **API Testing**
- Test endpoints: `https://api.rumahdaisycantik.com/packages.php`
- Use browser dev tools Network tab
- Check CORS and response format

### **Database Testing**
- Access via phpMyAdmin on hosting
- Sample data in `sample-data/u289291769_booking.sql`
- Check table existence and relationships

### **Frontend Testing**
- Use React dev tools
- Check console for API errors
- Test responsive design
- **Image Gallery**: Test image hosting and management
- **Calendar Widgets**: Verify date selection and URL parameter handling
- **Hotel Theme**: Check color consistency across components

### **Common Issues & Solutions**
- **404 Error on localhost**: Check if `index.html` exists (Vite entry point)
- **Port conflicts**: Vite auto-switches ports (5173 → 5174)
- **API 500 errors**: Check database migration status
- **Missing rooms**: Verify `package_rooms` table exists

---

## 🚨 **Critical Reminders**

### **🔥 STOP! READ THIS FIRST - PHP DEPLOYMENT WARNING**
```
⚠️  EVERY TIME YOU SEE THIS WARNING: ⚠️
🔴 DID YOU UPDATE THE PHP FILES ON PRODUCTION? 🔴
    - Frontend changes often need API updates
    - Local PHP ≠ Production PHP  
    - Upload to api.rumahdaisycantik.com
    - Test production API before assuming it works
```

### **ALWAYS Remember**
1. **🚨 PHP DEPLOYMENT**: Upload ALL modified PHP files to api.rumahdaisycantik.com
2. **API Base**: `api.rumahdaisycantik.com` (NOT localhost)
3. **Database**: `u289291769_booking` (production)
4. **PHP Files**: Must go in `api/` folder
5. **Markdown Files**: Must go in `readme/` folder
6. **HTML Files**: NEVER delete `index.html` (Vite needs it)
7. **Deployment**: PHP files need manual upload - NO AUTO-SYNC!
8. **File Structure**: Follow established patterns

### **Never Forget**
- **index.html** is ESSENTIAL for Vite/React (causes 404 if deleted)
- Add deployment notices for PHP files
- Use production API endpoints in services
- Test on actual domain, not localhost APIs
- Follow established folder structure
- Only delete legacy HTML files, not Vite entry points

---

## 📚 **Documentation Files**

### **Key Documentation**
- `readme/packages-api-documentation.md` - Complete API reference
- `readme/marriott-design-implementation.md` - UI design guide
- `readme/WORKFLOW_DOCUMENTATION.md` - This workflow guide
- `readme/UI_UX_DESIGN_SYSTEM.md` - Hotel theme design system
- `sandbox/IMAGE_GALLERY_DOCUMENTATION.md` - Image gallery system
- `readme/` - All markdown documentation goes here
- `database/package-room-relationships.sql` - Schema reference

### **Development Tools Documentation**
- `sandbox/image-gallery.html` - Production-ready image management
- `sandbox/image-scanner.php` - Real-time file scanning backend
- `sandbox/marriott-*.html` - UI/UX prototypes and demos

---

## 🏁 **Quick Start Checklist**

When resuming work:
1. ✅ Verify API endpoints use `api.rumahdaisycantik.com`
2. ✅ Check database is `u289291769_booking`
3. ✅ Confirm PHP files are in `api/` folder
4. ✅ Remember deployment requirements
5. ✅ Use established file structure
6. ✅ Test on production API, not localhost

---

**Last Updated**: December 16, 2025
**Workflow Version**: 1.2
**Recent Updates**: 
- ✅ Enhanced package details with calendar widgets
- ✅ Hotel theme system implementation
- ✅ Image gallery management system
- ✅ Improved error handling and TypeScript fixes
- ✅ Mobile-responsive design enhancements
- ✅ Date parameter flow throughout booking process