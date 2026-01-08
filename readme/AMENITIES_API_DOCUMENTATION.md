# 🛠️ Amenities Management API Documentation

**Last Updated**: December 12, 2025  
**Project**: Villa Booking Engine  
**API Base**: `https://api.rumahdaisycantik.com`

---

## 🌟 **OVERVIEW**

The Amenities Management API provides comprehensive CRUD operations for managing villa amenities, room assignments, and package relationships. This system supports the villa booking engine with structured amenity data and icon mapping.

### **✅ Current Status - FULLY FUNCTIONAL**
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete amenities
- ✅ **Category Management** - Organize amenities by categories  
- ✅ **Room Assignments** - Link amenities to specific rooms
- ✅ **Package Integration** - Associate amenities with packages (FIXED Dec 12)
- ✅ **Icon System** - Backend-to-frontend icon mapping with Lucide React
- ✅ **Frontend UI** - Complete admin interface for amenities management
- ✅ **API Endpoints** - All endpoints tested and working
- ✅ **Bug Fixes Applied** - Package amenities "0" count issue resolved

---

## 📚 **API ENDPOINTS**

**⚠️ IMPORTANT**: All endpoints use `PATH_INFO` routing. The base URL structure is:
`/amenities.php/{endpoint}/{optional_id}`

### **📋 Quick Reference - All Available Endpoints:**
```
AMENITIES CRUD:
GET    /amenities.php                           → List all amenities (default)
GET    /amenities.php/amenities                 → List all amenities (explicit)
GET    /amenities.php/amenities/{id}            → Get specific amenity
POST   /amenities.php/amenities                 → Create new amenity
PUT    /amenities.php/amenities/{id}            → Update amenity
DELETE /amenities.php/amenities/{id}            → Delete amenity

ROOM ASSIGNMENTS:
GET    /amenities.php/room-amenities/{room_id}  → Get room amenities
POST   /amenities.php/room-amenities/{room_id}  → Add amenity to room
DELETE /amenities.php/room-amenities/{room_id}  → Remove amenity from room

PACKAGE AMENITIES (Fixed Dec 12, 2025):
GET    /package-amenities.php?package_id={id}   → Get package amenities
GET    /package-amenities.php?action=add        → Add amenity to package
GET    /package-amenities.php?action=remove     → Remove amenity from package

OTHER ENDPOINTS:
GET    /amenities.php/categories                → Get category statistics
GET    /amenities.php/package-amenities/{id}    → Get package amenities (legacy)
GET    /amenities.php/sales-tool/{package_id}   → Get sales tool data
```

**🔧 Recent Fixes (December 12, 2025):**
- Fixed package amenities "0" count bug by correcting API endpoints
- Updated frontend to use proper `package-amenities.php` endpoints
- Synchronized backend icon mapping with frontend Lucide React icons
- Added comprehensive debugging and error handling

### **🏷️ Amenities CRUD**

#### **GET /amenities.php** or **GET /amenities.php/amenities**
Get all amenities with optional filtering

**Query Parameters:**
- `category` - Filter by category (optional)
- `featured` - Filter featured amenities (1/0)
- `include_inactive` - Include inactive amenities (true/false)

**Response:**
```json
{
  "success": true,
  "amenities": [
    {
      "id": 1,
      "name": "Free WiFi",
      "category": "connectivity",
      "description": "High-speed wireless internet access",
      "icon": "wifi",
      "display_order": 1,
      "is_featured": 1,
      "is_active": 1,
      "created_at": "2025-11-19 10:00:00",
      "updated_at": "2025-11-19 10:00:00"
    }
  ],
  "grouped_by_category": {
    "connectivity": [...],
    "comfort": [...]
  },
  "total": 26
}
```

#### **GET /amenities.php/amenities/{id}**
Get specific amenity by ID

**Example:** `GET /amenities.php/amenities/1`

#### **POST /amenities.php/amenities**
Create new amenity

**Request Body:**
```json
{
  "name": "Swimming Pool",
  "category": "recreation",
  "description": "Outdoor swimming pool with sun deck",
  "icon": "swimming",
  "display_order": 10,
  "is_featured": 1,
  "is_active": 1
}
```

#### **PUT /amenities.php/amenities/{id}**
Update existing amenity

**Example:** `PUT /amenities.php/amenities/1`

#### **DELETE /amenities.php/amenities/{id}**
Soft delete amenity (sets is_active = 0)

**Example:** `DELETE /amenities.php/amenities/1`

**Query Parameters:**
- `force=1` - Force delete and remove all relationships

---

### **🏨 Room-Amenity Relationships**

#### **GET /amenities.php/room-amenities/{room_id}**
Get all amenities assigned to a specific room

**Example:** `GET /amenities.php/room-amenities/deluxe-suite`

**Response:**
```json
{
  "success": true,
  "room_id": "deluxe-suite",
  "room_name": "Deluxe Suite",
  "amenities": [
    {
      "id": 1,
      "name": "Free WiFi",
      "category": "connectivity",
      "description": "High-speed wireless internet access",
      "icon": "wifi",
      "is_highlighted": 1,
      "custom_note": "Premium speed available"
    }
  ],
  "total": 5
}
```

#### **POST /amenities.php/room-amenities/{room_id}**
Add amenity to room

**Request Body:**
```json
{
  "amenity_id": 1,
  "is_highlighted": true,
  "custom_note": "Premium speed available"
}
```

#### **DELETE /amenities.php/room-amenities/{room_id}?amenity_id={id}**
Remove amenity from room

**Example:** `DELETE /amenities.php/room-amenities/deluxe-suite?amenity_id=1`

---

### **📦 Package-Amenity Relationships**

#### **GET /amenities.php/package-amenities/{package_id}**
Get all amenities included in a specific package

---

### **📁 Categories Management**

#### **GET /amenities.php/categories**
Get all amenity categories with statistics

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "category": "connectivity",
      "amenity_count": 2,
      "featured_count": 1,
      "active_count": 2
    },
    {
      "category": "comfort",
      "amenity_count": 3,
      "featured_count": 2,
      "active_count": 3
    }
  ],
  "total": 15
}
```

---

### **🧪 Sales Tool Integration**

#### **GET /amenities.php/sales-tool/{package_id}**
Get combined room and package amenities for sales presentations

---

## 🗂️ **DATABASE SCHEMA**

### **amenities Table**
```sql
CREATE TABLE amenities (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    description TEXT,
    icon VARCHAR(100),
    display_order INT(11) DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **room_amenities Table**
```sql
CREATE TABLE room_amenities (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    amenity_id INT(11) NOT NULL,
    is_highlighted TINYINT(1) DEFAULT 0,
    custom_note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);
```

### **package_amenities Table**
```sql
CREATE TABLE package_amenities (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    package_id INT(11) NOT NULL,
    amenity_id INT(11) NOT NULL,
    is_highlighted TINYINT(1) DEFAULT 0,
    custom_note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);
```

---

## 📋 **AVAILABLE CATEGORIES**

### **Core Categories:**
- `connectivity` - WiFi, internet, phone services
- `comfort` - Air conditioning, heating, bedding
- `bathroom` - Toiletries, fixtures, amenities
- `entertainment` - TV, sound system, games
- `appliances` - Fridge, coffee maker, microwave
- `security` - Safe, locks, surveillance
- `outdoor` - Balcony, terrace, garden access
- `view` - Ocean view, garden view, city view

### **Service Categories:**
- `transport` - Airport transfer, parking, car rental
- `service` - Housekeeping, concierge, room service
- `hospitality` - Welcome drinks, turndown service
- `dining` - Breakfast, minibar, room service
- `wellness` - Spa, yoga, fitness facilities
- `activities` - Tours, classes, entertainment
- `recreation` - Pool, gym, sports facilities
- `location` - Beach access, proximity to attractions

---

## 🔧 **USAGE EXAMPLES**

### **Create Featured Amenity**
```bash
curl -X POST https://api.rumahdaisycantik.com/amenities.php/amenities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Infinity Pool", 
    "category": "recreation",
    "description": "Stunning infinity pool overlooking the ocean",
    "icon": "swimming",
    "is_featured": 1
  }'
```

### **Update Amenity**
```bash
curl -X PUT https://api.rumahdaisycantik.com/amenities.php/amenities/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Premium WiFi", "description": "Ultra-fast fiber internet"}'
```

### **Get Room Amenities**
```bash
curl https://api.rumahdaisycantik.com/amenities.php/room-amenities/deluxe-suite
```

### **Add Amenity to Room**
```bash
curl -X POST https://api.rumahdaisycantik.com/amenities.php/room-amenities/deluxe-suite \
  -H "Content-Type: application/json" \
  -d '{"amenity_id": 5, "is_highlighted": true}'
```

---

## ⚠️ **ERROR HANDLING**

### **Common HTTP Status Codes:**
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation errors)
- `404` - Resource not found
- `409` - Conflict (duplicate name, relationship exists)
- `405` - Method not allowed
- `500` - Internal server error

### **Error Response Format:**
```json
{
  "error": "Amenity with this name already exists",
  "debug": {
    "file": "amenities.php",
    "line": 123,
    "method": "POST",
    "endpoint": "amenities"
  }
}
```

---

## 🎯 **TESTING**

### **Management Interface**
Use the comprehensive testing interface:
`https://yourdomain.com/amenities-management.html`

### **API Testing Tool**
The management interface includes:
- ✅ **Overview Dashboard** - Statistics and all amenities
- ✅ **CRUD Operations** - Create, update, delete amenities
- ✅ **Room Assignments** - View room-amenity relationships
- ✅ **Category Management** - Browse categories with stats
- ✅ **API Testing** - Direct endpoint testing

---

## 🚀 **INTEGRATION**

### **With Booking System**
```javascript
// Get amenities for a room during booking
const roomAmenities = await fetch('/amenities.php/room-amenities/deluxe-suite');

// Display featured amenities on homepage
const featured = await fetch('/amenities.php/amenities?featured=1');
```

### **With Admin Dashboard**
```javascript
// Create new amenity from admin panel
const createAmenity = async (amenityData) => {
  return await fetch('/amenities.php/amenities', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(amenityData)
  });
};
```

---

## 🔧 **PACKAGE AMENITIES IMPLEMENTATION**

### **Current Working System (Fixed December 12, 2025)**

**Problem Resolved**: Package amenities were showing "0" count due to incorrect API endpoints.

**Solution Applied**: 
- Updated frontend to use dedicated `package-amenities.php` endpoints
- Fixed API routing and action-based parameter handling
- Added comprehensive debugging and error handling

**Working Endpoints:**
```javascript
// GET package amenities
GET /package-amenities.php?package_id={id}

// ADD amenity to package  
GET /package-amenities.php?action=add&package_id={id}&amenity_id={aid}&is_highlighted={0|1}

// REMOVE amenity from package
GET /package-amenities.php?action=remove&package_id={id}&amenity_id={aid}
```

**Frontend Integration:**
- `PackagesSection.tsx` - Admin interface for managing package amenities
- `PackageCard.tsx` - Displays amenities with proper icon mapping
- `PackageDetails.tsx` - Shows detailed amenity information
- Icon mapping system converts backend strings (`"wifi"`, `"car"`) to Lucide React components

---

## 🎨 **ICON SYSTEM IMPLEMENTATION**

### **Backend-Frontend Icon Synchronization**

**Backend Storage**: Icons stored as lowercase strings in `amenities.icon` field
```sql
-- Examples from database
'wifi', 'car', 'bath', 'star', 'sparkles', 'coffee'
```

**Frontend Mapping**: Lucide React components via `getAmenityIcon()` function
```typescript
const getAmenityIcon = (iconName: string) => {
  const iconMap = {
    'wifi': Wifi, 'car': Car, 'bath': Bath, 
    'sparkles': Sparkles, 'star': Star, 'coffee': Coffee
  };
  return iconMap[iconName?.toLowerCase()] || Star;
};
```

**Default Behavior**: 
- Backend default: `'star'` (amenities.php line 518)
- Frontend fallback: `Star` component from Lucide React
- Visual consistency maintained across all interfaces

---

## 📝 **CHANGELOG**

### **v3.0 - December 12, 2025** 🆕
- ✅ **FIXED**: Package amenities "0" count bug
- ✅ **UPDATED**: API endpoints for package-amenity relationships
- ✅ **IMPLEMENTED**: Complete Lucide React icon standardization
- ✅ **ADDED**: Backend-frontend icon mapping system
- ✅ **ENHANCED**: Error handling and debugging capabilities
- ✅ **TESTED**: All package amenities CRUD operations working
- ✅ **DOCUMENTED**: Updated API references and implementation guides

### **v2.0 - November 19, 2025**
- ✅ Added complete CRUD operations
- ✅ Enhanced room-amenity relationship management
- ✅ Added categories endpoint with statistics
- ✅ Implemented soft delete with relationship protection
- ✅ Added comprehensive error handling and logging
- ✅ Created management interface with testing tools
- ✅ Added force delete option for relationships
- ✅ Enhanced API documentation with examples

### **Previous Version**
- ✅ Basic read operations
- ✅ Room and package amenity relationships
- ✅ Sales tool integration

---

## ✅ **CURRENT SYSTEM STATUS**

**🎯 All Components Operational:**
- Database schema and relationships ✅
- API endpoints and routing ✅  
- Admin interface and management ✅
- Frontend package integration ✅
- Icon system standardization ✅
- Error handling and debugging ✅

**🔧 Recent Fixes Applied:**
- Package amenities API endpoints corrected
- Frontend-backend icon synchronization complete
- Admin panel amenities management fully functional
- Package details and cards showing correct amenity data

*This API provides a complete, tested, and fully functional amenity management system for the Villa Booking Engine.*