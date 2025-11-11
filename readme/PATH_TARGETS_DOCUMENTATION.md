# 🗺️ PATH TARGET POINTS DOCUMENTATION
**Villa Booking Engine - Complete Path Reference Guide**

---

## 📂 **PROJECT STRUCTURE OVERVIEW**

```
frontend-booking-engine-1/
├── 🌐 Frontend (React/Vite)
│   ├── src/config/paths.ts         # Path configuration
│   ├── src/services/               # API service layers
│   └── src/components/             # UI components
│
├── 🔧 Backend API (PHP)
│   ├── api/                        # REST API endpoints
│   ├── database/                   # Database scripts
│   └── public/                     # Static assets
│
├── 🗄️ Database (MySQL)
│   └── booking_engine              # Main database
│
└── 📄 Documentation
    ├── Database docs               # DB status and structure
    └── API documentation          # Endpoint references
```

---

## 🌐 **FRONTEND PATH CONFIGURATION**

### **Environment Detection**
```typescript
// src/config/paths.ts
const env = import.meta.env.PROD ? 'production' : 'development';

// Development (Local XAMPP)
DEFAULT_LOCAL_API = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api'

// Production
DEFAULT_PRODUCTION_API = 'https://api.rumahdaisycantik.com'
```

### **Frontend Routes**
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Index | Main booking page |
| `/rooms` | RoomsSection | Room listings |
| `/packages` | PackageCard | Package offerings |
| `/booking` | BookingSteps | Booking flow |
| `/admin` | AdminPanel | Management dashboard |

### **Asset Paths**
```typescript
assets: {
  images: '/public/images/',
  roomImages: '/public/images/rooms/',
  packageImages: '/public/images/packages/',
  uiImages: '/public/images/ui/'
}
```

---

## 🔌 **API ENDPOINTS REFERENCE**

### **Base URLs**
- **Development**: `http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api`
- **Production**: `https://api.rumahdaisycantik.com`

### **Core Endpoints**

#### 🏨 **Rooms API** - `/api/rooms.php`
```bash
# Get all rooms
GET /api/rooms.php

# Get specific room
GET /api/rooms.php?id=deluxe-suite

# Room availability check
GET /api/rooms.php?action=availability&room_id=deluxe-suite&check_in=2025-11-20&check_out=2025-11-23
```

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deluxe-suite",
      "name": "Deluxe Suite",
      "type": "Suite",
      "price": "250.00",
      "capacity": 4,
      "description": "Spacious luxury suite...",
      "size": "65 sqm",
      "beds": "1 King Bed + Sofa Bed",
      "features": ["City View", "Living Area"],
      "amenities": ["WiFi", "TV", "Air Conditioning"],
      "images": [],
      "available": 1
    }
  ]
}
```

#### 🎁 **Packages API** - `/api/packages.php`
```bash
# Get all packages
GET /api/packages.php

# Get specific package
GET /api/packages.php?id=1

# Filter by type
GET /api/packages.php?type=Romance

# Active packages only
GET /api/packages.php?active=1
```

#### 📅 **Bookings API** - `/api/bookings.php`
```bash
# Get all bookings
GET /api/bookings.php

# Search bookings
GET /api/bookings.php?search=Emma

# Filter by status
GET /api/bookings.php?status=confirmed

# Create new booking
POST /api/bookings.php
Content-Type: application/json
{
  "room_id": "deluxe-suite",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "check_in": "2025-12-01",
  "check_out": "2025-12-03",
  "guests": 2
}

# Update booking
PUT /api/bookings.php?id=1

# Delete booking
DELETE /api/bookings.php?id=1
```

#### 🏡 **Villa Info API** - `/api/villa.php`
```bash
# Get villa information
GET /api/villa.php

# Update villa info (Admin)
POST /api/villa.php
```

#### 📊 **Admin API** - `/api/admin/`
```bash
# Admin authentication
POST /api/admin/auth.php

# Dashboard data
GET /api/admin/dashboard.php

# Reports
GET /api/admin/reports.php?type=revenue&period=month
```

---

## 🗄️ **DATABASE TARGET POINTS**

### **Connection Configuration**
```php
// api/config/database.php
Host: localhost (XAMPP) / Production MySQL Server
Database: booking_engine
User: root (local) / secure_user (production)
```

### **Table Structure**
| Table | Records | Purpose | Status |
|-------|---------|---------|--------|
| `rooms` | 5 | Room types and pricing | ✅ Production Ready |
| `packages` | 5 | Package offerings | ✅ Production Ready |
| `bookings` | 20 | Customer bookings | ⚠️ Dummy Data |
| `villa_info` | 1 | Property information | ⚠️ Demo Profile |
| `admin_users` | 4 | Admin accounts | ⚠️ Dummy Accounts |

### **Database Connection Points**
```php
// Direct database access points
require_once 'api/config/database.php';
$database = new Database();
$db = $database->getConnection();

// API layer access (recommended)
$apiService = new ApiService();
$rooms = $apiService->getRooms();
```

---

## 📁 **FILE SYSTEM PATHS**

### **Static Assets**
```
public/
├── images/
│   ├── rooms/           # Room photos (empty - needs upload)
│   ├── packages/        # Package images (empty - needs upload)
│   ├── amenities/       # Amenity icons
│   └── ui/             # UI elements
├── robots.txt          # SEO configuration
└── favicon.ico         # Site icon
```

### **Configuration Files**
```
├── config.js           # Environment configuration
├── .env.development    # Development variables
├── .env.production     # Production variables (create)
├── vite.config.ts      # Build configuration
└── package.json        # Dependencies
```

### **Database Scripts**
```
database/
├── install.sql                 # Complete setup
├── dummy-data-complete.sql     # Comprehensive dummy data
├── clear-dummy-data.sql        # Production cleanup
├── db-utilities.sql            # Management queries
└── packages-table.sql          # Package system
```

---

## 🔐 **SECURITY PATHS**

### **Authentication Endpoints**
```bash
# Admin login
POST /api/admin/auth.php
{
  "username": "villa_manager",
  "password": "secure_password"
}

# Session validation
GET /api/admin/validate.php
Headers: Authorization: Bearer <token>
```

### **Protected Resources**
- `/api/admin/*` - Requires authentication
- `/api/bookings.php` (POST/PUT/DELETE) - Admin only
- `/api/villa.php` (POST) - Admin only
- Database direct access - Server-level protection

---

## 🌍 **EXTERNAL INTEGRATIONS**

### **Payment Gateways** (Future)
```bash
# Stripe integration endpoint
POST /api/payments/stripe.php

# PayPal integration endpoint  
POST /api/payments/paypal.php
```

### **Email Services**
```bash
# Booking confirmation emails
POST /api/notify.php
{
  "type": "booking_confirmation",
  "booking_id": 123
}
```

### **Third-Party APIs**
- **Google Maps**: Property location
- **Weather API**: Local weather data
- **Currency API**: Exchange rates
- **Translation API**: Multi-language support

---

## 📊 **DEVELOPMENT ENDPOINTS**

### **Testing & Debugging**
```bash
# API health check
GET /api/index.php

# Database status
GET /api/status.php

# Development utilities
php database/db-utilities.sql
```

### **Build Paths**
```bash
# Development server
npm run dev
# Serves: http://127.0.0.1:8080/

# Production build
npm run build
# Output: dist/

# Preview production build
npm run preview
```

---

## 🎯 **PATH CONFIGURATION BEST PRACTICES**

### **Environment Variables**
```bash
# .env.development
VITE_API_BASE=http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api
VITE_PUBLIC_BASE=/
VITE_ADMIN_BASE=/admin

# .env.production (create for production)
VITE_API_BASE=https://api.rumahdaisycantik.com
VITE_PUBLIC_BASE=/
VITE_ADMIN_BASE=/admin
```

### **Path Helper Functions**
```typescript
// src/config/paths.ts
buildApiUrl: (path: string) => `${API_BASE}/${path}`,
buildImageUrl: (path: string) => `${IMAGES_BASE}/${path}`,
buildAdminUrl: (path: string) => `${ADMIN_BASE}/${path}`
```

---

## 🚀 **DEPLOYMENT PATHS**

### **Local Development (XAMPP)**
- Frontend: `http://127.0.0.1:8080/`
- API: `http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api/`
- Database: `localhost:3306/booking_engine`

### **Production (Example)**
- Frontend: `https://www.villadaisycantik.com/`
- API: `https://api.rumahdaisycantik.com/`
- Database: `production-server:3306/booking_engine`

---

**📝 Note**: This documentation covers all current path target points in the Villa Booking Engine. Update the production URLs and paths according to your actual deployment configuration.