# API Documentation - Villa Booking Engine

## 📋 Overview
This document provides a comprehensive list of all API endpoints used by the Villa Booking Engine application, organized by functionality and usage.

**Base URL**: `https://api.rumahdaisycantik.com`  
**Environment**: Production  
**Last Updated**: November 20, 2025  
**Last Validated**: November 20, 2025 - 23:15 UTC

## 📊 Validation Summary
- ✅ **Working APIs**: 12/15 endpoints (80% operational)
- ⚠️ **Restricted APIs**: 1/15 endpoints (notify.php - POST only)  
- ❌ **Failed APIs**: 2/15 endpoints (homepage.php not deployed, external_blocks.php error)

---

## 🔧 Admin Panel APIs

### Authentication & Settings
| Endpoint | Method | Purpose | Status | Used By |
|----------|---------|---------|--------|---------|
| `/admin/auth.php` | POST | Admin login authentication | ✅ 200 OK | Admin Login |
| `/admin/settings.php` | GET/PUT | Admin settings management | ✅ 200 OK | Admin Settings |
| `/admin/images.php` | GET/POST | Admin image upload/management | ✅ 200 OK | Image Manager |
| `/admin/hero-selection.php` | GET/PUT | Hero image selection | ✅ 200 OK | Hero Section |

### Data Management APIs (Admin Interface)
| Endpoint | Method | Purpose | Status | Used By |
|----------|---------|---------|--------|---------|
| `/rooms.php` | GET/POST/PUT/DELETE | Room CRUD operations | ✅ 200 OK | Rooms Admin Section |
| `/packages.php` | GET/POST/PUT/DELETE | Package CRUD operations | ✅ 200 OK | Packages Admin Section |
| `/bookings.php` | GET/POST/PUT/DELETE | Booking management | ✅ 200 OK | Bookings Admin Section |
| `/amenities.php` | GET/POST/PUT/DELETE | Amenities CRUD operations | ✅ 200 OK | Amenities Admin Section |

---

## 🏠 Homepage & Public APIs

### Content Display
| Endpoint | Method | Purpose | Status | Used By |
|----------|---------|---------|--------|---------|
| `/villa.php` | GET/PUT | Main property information | ✅ 200 OK | Homepage, Footer |
| `/homepage.php` | GET/PUT | Dedicated homepage content | ❌ 404 Not Found | Homepage (Future) |
| `/hero-images.php` | GET | Hero section images | ✅ 200 OK | Hero Component |
| `/images.php` | GET/POST | Image serving & upload | ✅ 200 OK | Gallery, Components |

### Public Data Access
| Endpoint | Method | Purpose | Status | Used By |
|----------|---------|---------|--------|---------|
| `/rooms.php` | GET | Display available rooms | ✅ 200 OK | Homepage Room Cards |
| `/packages.php` | GET | Display packages | ✅ 200 OK | Homepage Packages |

---

## 📅 Booking & Integration APIs

### Booking System
| Endpoint | Method | Purpose | Status | Used By |
|----------|---------|---------|--------|---------|
| `/bookings.php` | GET | Fetch bookings | ✅ 200 OK | Booking Page |
| `/bookings.php` | POST | Create new booking | ✅ 200 OK | Booking Form |
| `/bookings.php?action=availability` | GET | Check availability | ✅ 200 OK | Calendar Integration |
| `/notify.php` | POST | Email notifications | ⚠️ 405 POST Only | Booking Confirmations |

### Calendar Integration
| Endpoint | Method | Purpose | Status | Used By |
|----------|---------|---------|--------|---------|
| `/ical.php` | GET | iCal calendar export | ✅ 200 OK | Calendar Services |
| `/ical.php?action=subscribe` | GET | Calendar subscription | ✅ 200 OK | External Calendars |
| `/external_blocks.php` | GET | External booking blocks | ❌ 500 Error | Calendar Integration |

---

## 📊 API Usage by Component

### Frontend Components → API Mapping

**Homepage Components:**
- `Footer.tsx` → `/villa.php` (contact info, property details)
- `PhotoGallery.tsx` → `/images.php` (image serving)
- `RoomsSection.tsx` → `/rooms.php` (room listings)
- `PackageCard.tsx` → `/packages.php` (package data)
- `useIndexPageData.tsx` → `/villa.php` (main page data)

**Admin Components:**
- `RoomsSection.tsx` → `/rooms.php` (CRUD operations)
- `PackagesSection.tsx` → `/packages.php` (CRUD operations)
- `BookingsSection.tsx` → `/bookings.php` (booking management)
- `AmenitiesSection.tsx` → `/amenities.php` (amenities management)

**Booking System:**
- `Booking.tsx` → `/bookings.php`, `/notify.php`
- `BookingSummary.tsx` → `/bookings.php` (booking retrieval)
- `CalendarIntegration.tsx` → `/ical.php`, `/external_blocks.php`

---

## 🚀 API Endpoints Status

### ✅ Production Ready (Deployed & Working)
- `/villa.php` - Status: 200 ✅ Main property data (currently used by homepage)
- `/rooms.php` - Status: 200 ✅ Room management and display
- `/packages.php` - Status: 200 ✅ Package management and display  
- `/bookings.php` - Status: 200 ✅ Complete booking system
- `/amenities.php` - Status: 200 ✅ Amenities management
- `/admin/auth.php` - Status: 200 ✅ Admin authentication
- `/admin/settings.php` - Status: 200 ✅ Admin settings management
- `/admin/images.php` - Status: 200 ✅ Admin image management
- `/admin/hero-selection.php` - Status: 200 ✅ Hero image selection
- `/ical.php` - Status: 200 ✅ Calendar integration
- `/images.php` - Status: 200 ✅ Image management
- `/hero-images.php` - Status: 200 ✅ Hero section images

### ⚠️ Functional with Restrictions
- `/notify.php` - Status: 405 (Method Not Allowed for GET) ⚠️ Email notifications (POST only)

### ❌ Not Deployed / Issues
- `/homepage.php` - Status: 404 ❌ Not deployed to production server
  - **File exists locally**: ✅ Created and tested
  - **Database schema**: ✅ Ready (`homepage-content-table.sql`)
  - **Frontend integration**: ✅ Complete (`useHomepageContent.tsx`)
  - **Status**: Needs deployment to production server
- `/external_blocks.php` - Status: 500 ❌ Internal server error

---

## 🔄 Current vs Future State

### Current Implementation (Working)
```
Homepage → villa.php → Production Database → Real Data Display
Admin Panel → Multiple APIs → Production Database → Full Management
```

### Future Implementation (After homepage.php deployment)
```
Homepage → homepage.php → Enhanced Content Management → Richer Data Display
Admin Panel → homepage.php + existing APIs → Complete Content Control
```

---

## 📝 Development Notes

### API Response Format
All APIs follow consistent JSON response format:
```json
{
  "success": true|false,
  "data": {...},
  "message": "Status message",
  "error": "Error details (if any)"
}
```

### Authentication
- Admin APIs require authentication through `/admin/auth.php`
- Public APIs (villa, rooms, packages) are open access
- Image uploads require proper authentication

### Error Handling
- All APIs implement comprehensive error handling
- Fallback data provided for critical display components
- Graceful degradation for missing data

---

## 🎯 Next Steps

1. **Deploy homepage.php** to production server
2. **Deploy homepage-content-table.sql** to production database
3. **Switch homepage components** from villa.php to homepage.php
4. **Enable enhanced content management** through admin panel

---

**Generated**: November 20, 2025  
**Version**: 1.0  
**Project**: Villa Booking Engine - Rumah Daisy Cantik