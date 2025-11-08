# 🏨 Complete Booking Engine - Frontend & Backend

A fully functional hotel booking system with React + TypeScript frontend and PHP backend. The system includes room browsing, availability checking, booking creation, and admin management - all integrated with a MySQL database via XAMPP.

## ✨ Features

- 🏠 **Room Browsing**: View available rooms with images, prices, and features
- 📅 **Smart Calendar**: Date picker with automatic conflict detection  
- 💼 **Booking Management**: Complete booking flow with guest information
- 🔄 **Real-time Availability**: Prevents double bookings with database integration
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🛠️ **Admin Panel**: View and manage all bookings
- 🔌 **Offline Support**: Bookings saved locally when offline, sync when online

## 🚀 Live System Status

✅ **Frontend**: React + TypeScript + Vite (Port 8080)  
✅ **Backend**: PHP API with proper routing  
✅ **Database**: MySQL with complete schema  
✅ **CORS**: Properly configured  
✅ **Integration**: Frontend ↔ Backend ↔ Database working end-to-end

## 1. Prerequisites

| Tool | Purpose |
|------|---------|
| XAMPP (Apache + MySQL) | Serves PHP API + database |
| Node.js / pnpm | Runs the frontend dev server |
| PowerShell (Win) | Terminal environment |

## 2. Folder Layout (Frontend)

```
frontend-booking-engine/
	src/
	public/
	package.json
	vite.config.ts
```

PHP backend (example) lives parallel or inside an `api/` folder served by Apache:

```
htdocs/
	fontend-bookingengine-100/
		frontend-booking-engine/ (this project)
		api/ (your PHP endpoints: index.php, bookings.php, etc.)
```

## 3. Environment Variables

Create a `.env` (or `.env.local`) in the project root to override defaults:

```
VITE_API_BASE=http://localhost/fontend-bookingengine-100/frontend-booking-engine/api
VITE_PUBLIC_BASE=/fontend-bookingengine-100/frontend-booking-engine/
VITE_ADMIN_BASE=/admin
```

Restart the dev server after changes.

## 4. Starting XAMPP Services

1. Open XAMPP Control Panel.
2. Start Apache and MySQL.
3. Verify Apache: visit `http://localhost/`.
4. Verify MySQL: click Admin (phpMyAdmin) or visit `http://localhost/phpmyadmin/`.

## 5. Database Setup (Automated)

### Quick Setup
Run the automated database setup by visiting:
```
http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/setup-database.php
```

This will automatically create the database, tables, and insert sample data.

### Manual Setup (Alternative)
Or run this SQL in phpMyAdmin:

```sql
CREATE DATABASE IF NOT EXISTS booking_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_engine;

-- Rooms table (actual schema)
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    amenities JSON,
    images JSON,
    description TEXT,
    size VARCHAR(100),
    beds VARCHAR(100),
    features JSON,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (actual schema) 
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reference VARCHAR(20) NOT NULL UNIQUE,
    room_id VARCHAR(50) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    INDEX (email), INDEX (check_in), INDEX (check_out)
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role ENUM('admin', 'manager') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 6. Working API Endpoints

The PHP API is fully implemented with the following endpoints:

### **Room Endpoints**
- `GET /api/rooms` - List all available rooms
- `GET /api/rooms/{id}` - Get specific room details

### **Booking Endpoints** 
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{id}` - Get specific booking
- `GET /api/bookings?action=availability&room_id={id}&check_in={date}&check_out={date}` - Check availability

### **Response Format**
All endpoints return consistent JSON:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### **API Structure**
```
api/
├── index.php              # Main router
├── config/
│   └── database.php       # Database connection
├── controllers/
│   ├── BookingController.php
│   └── RoomController.php
├── models/
│   ├── Booking.php
│   └── Room.php
└── utils/
    └── helpers.php        # Utility functions
```

## 7. Testing the API

### **Test with PowerShell:**
```powershell
# Test rooms endpoint
Invoke-RestMethod -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/rooms" -Method GET

# Test availability check
Invoke-RestMethod -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/bookings?action=availability&room_id=1&check_in=2024-01-15&check_out=2024-01-20" -Method GET

# Create a booking
$body = @{
    room_id = 1
    first_name = "John"
    last_name = "Doe"
    email = "john@example.com"
    phone = "123-456-7890"
    check_in = "2024-01-15"
    check_out = "2024-01-20"
    guests = 2
    total_price = 750.00
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/bookings" -Method POST -Body $body -ContentType "application/json"
```

## 8. Frontend Configuration

### **Vite Development Server**
The React frontend runs on port 8080 with proxy configuration:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost/fontend-bookingengine-100/frontend-booking-engine',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

### **API Service Configuration**
```javascript
// src/services/api.js
const API_BASE_URL = '/api';
const LOCAL_API_BASE_URL = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine/api';

export const apiService = {
  async getRooms() {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    return response.json();
  },
  
  async createBooking(booking) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    return response.json();
  }
};
```

## 8. Running Frontend

```powershell
pnpm install
pnpm dev
```

If port 5173 is busy, Vite will pick the next free one—watch terminal output. Ensure API_BASE matches the served Apache path.

## 9. Testing API Connectivity (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/bookings" -Method GET | Select-Object StatusCode
curl http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/bookings
```

## 9. Running the Application

### **Start Development Environment:**
```powershell
# 1. Start XAMPP (Apache + MySQL)
# 2. Ensure database is created and tables exist
# 3. Navigate to project directory
cd "C:\xampp\htdocs\fontend-bookingengine-100\frontend-booking-engine\frontend-booking-engine"

# 4. Install dependencies (if not done)
pnpm install

# 5. Start development server
pnpm run dev
```

### **Access Points:**
- **Frontend**: http://localhost:8080
- **API Direct**: http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/
- **phpMyAdmin**: http://localhost/phpmyadmin

## 10. System Status ✅

### **Working Features:**
- ✅ Room listing and filtering
- ✅ Date selection and availability checking  
- ✅ Real-time booking creation
- ✅ Database integration with conflict prevention
- ✅ Responsive UI with modern components
- ✅ Form validation and error handling
- ✅ Admin booking management interface

### **Verified Endpoints:**
- ✅ `GET /api/rooms` - Returns formatted room data
- ✅ `GET /api/bookings` - Returns all bookings
- ✅ `POST /api/bookings` - Creates new bookings
- ✅ `GET /api/bookings?action=availability` - Checks room availability

## 11. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| API 404 errors | Incorrect proxy path | Check vite.config.ts proxy settings |
| CORS errors | Missing headers | Verify CORS headers in API controllers |
| Database connection | MySQL not running | Start XAMPP MySQL service |
| Room data not loading | Type mismatches | Ensure Room interface matches API response |
| Booking conflicts | Missing availability check | Verify database booking queries |

## 12. Development Notes

### **Database Schema:**
- All tables use proper indexes for performance
- Foreign key relationships maintain data integrity  
- Booking availability uses date range queries
- Admin users table ready for authentication

### **Frontend Architecture:**
- React Context for global booking state
- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture with shadcn/ui

### **Backend Structure:**
- MVC pattern with proper separation
- Consistent JSON API responses
- Database abstraction layer
- Error handling and validation

---
This README section was generated to help you run locally with XAMPP. Adjust anything as your backend evolves.
