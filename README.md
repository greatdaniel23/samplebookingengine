# 🏨 Complete Villa Booking Engine with Dynamic Content Management

A comprehensive villa booking system featuring a React + TypeScript frontend, PHP backend, and a powerful admin content management system. The platform allows complete villa information management through a secure admin panel with real-time updates to the public website.

## ✨ Key Features

### 🏡 **Public Villa Website**
- 🏠 **Dynamic Villa Information**: Name, description, location, rating, and reviews
- 📸 **Photo Gallery Management**: Image carousel with admin-controlled content
- 🎯 **Amenities Display**: Customizable amenities with icons and descriptions
- 📦 **Package Booking System**: Select and book accommodation packages
- � **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🌐 **Real-time Content**: All content dynamically loaded from database

### 🔐 **Secure Admin Panel** (`/admin/villa`)
- 🏢 **Villa Information Management**: Name, description, location, rating
- 📞 **Contact Information**: Phone, email, website management
- 🏠 **Address Details**: Street address, city, state, country, ZIP code
- 🛏️ **Villa Specifications**: Max guests, bedrooms, bathrooms
- � **Pricing & Policies**: Price per night, currency, cancellation policy, house rules
- ⏰ **Check-in/out Times**: Customizable arrival and departure times
- 📱 **Social Media Integration**: Facebook, Instagram, Twitter links
- 🖼️ **Image Gallery Editor**: Add, remove, and reorder villa photos
- ✨ **Amenities Manager**: Add, edit, and remove villa amenities with custom icons

### 🔒 **Security & Authentication**
- � **Hidden Admin Access**: Discrete "Staff Portal" link in footer
- 🔐 **Login Protection**: Secure authentication system
- �️ **Route Guards**: Protected admin routes with session management
- 🚪 **Logout Functionality**: Secure session termination

### 🔄 **Real-time Integration**
- ⚡ **Live Updates**: Changes in admin panel instantly reflect on public site
- � **Dynamic Footer**: Contact information updates automatically
- 📍 **Location Management**: Header location updates based on admin settings
- 💾 **Database Sync**: All changes saved to MySQL database

## 🚀 System Architecture

✅ **Frontend**: React + TypeScript + Vite (Port 8081)  
✅ **Backend**: PHP API with comprehensive villa management endpoints  
✅ **Database**: MySQL with complete villa information schema  
✅ **Admin System**: Secure content management with authentication  
✅ **Integration**: Complete frontend ↔ backend ↔ database integration

## 🛠️ Prerequisites

| Tool | Purpose | Status |
|------|---------|--------|
| XAMPP (Apache + MySQL) | Serves PHP API + database | ✅ Required |
| Node.js / pnpm | Runs the frontend dev server | ✅ Required |
| Web Browser | Access the application | ✅ Any modern browser |

## 📁 Project Structure

```
htdocs/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── AdminGuard.tsx  # Route protection
│   │   ├── Footer.tsx      # Dynamic footer with villa info
│   │   └── ...
│   ├── pages/
│   │   ├── Index.tsx       # Main villa page (dynamic content)
│   │   ├── Admin.tsx       # Villa management panel
│   │   ├── AdminLogin.tsx  # Admin authentication
│   │   └── ...
│   ├── hooks/
│   │   ├── useVillaInfo.tsx # Villa data management
│   │   └── ...
│   ├── api/                # Backend API endpoints
│   │   ├── villa.php       # Villa CRUD operations
│   │   ├── config/         # Database configuration
│   │   ├── migrate-db.php  # Database migration script
│   │   └── init-data.php   # Sample data initialization
│   └── ...
├── package.json
├── vite.config.ts
└── README.md
```

### 1️⃣ **Start XAMPP Services**
```bash
# Open XAMPP Control Panel
# Start Apache and MySQL services
# Verify at: http://localhost/
```

### 2️⃣ **Database Setup**
```bash
# Run database migration (adds all villa info columns)
curl http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/migrate-db.php

# Initialize sample villa data
curl http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/init-data.php
```

### 3️⃣ **Frontend Setup**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# Server will run on: http://127.0.0.1:8081/
```

### 4️⃣ **Verify Installation**
- **Main Site**: http://127.0.0.1:8081/
- **Admin Login**: http://127.0.0.1:8081/admin/login
- **API Test**: http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/villa.php

## 🎯 Usage Guide

### 🌐 **Public Villa Website**
1. **Visit**: http://127.0.0.1:8081/
2. **Browse**: Dynamic villa information, photos, and amenities
3. **Book**: Select packages and make reservations
4. **Contact**: View dynamic contact information in footer

### 🔐 **Admin Panel Access**
1. **Method 1 - Direct**: http://127.0.0.1:8081/admin/login
2. **Method 2 - Discrete**: Go to main page → Scroll to footer → Click "Staff Portal"

**Default Admin Credentials:**
```
Username: admin
Password: admin123
```

### 🏡 **Villa Content Management**
After logging in, you can manage:

- **🏢 Basic Information**: Villa name, description, location, rating
- **📞 Contact Details**: Phone, email, website  
- **🏠 Address Information**: Street, city, state, country, ZIP
- **🛏️ Villa Specs**: Max guests, bedrooms, bathrooms, pricing
- **⏰ Timing**: Check-in/out times, policies
- **📱 Social Media**: Facebook, Instagram, Twitter links
- **🖼️ Photo Gallery**: Add/remove/reorder images
- **✨ Amenities**: Customize amenities with icons

### 🔄 **Real-time Updates**
- Save changes in admin panel
- Visit main page to see updates instantly
- Footer contact information updates automatically
- All changes persist in MySQL database

## 🗄️ Database Schema

### Villa Information Table (`villa_info`)
```sql
CREATE TABLE villa_info (
    id INT PRIMARY KEY DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 4.9,
    reviews INT DEFAULT 0,
    images JSON,
    amenities JSON,
    -- Contact Information
    phone VARCHAR(50) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    website VARCHAR(255) DEFAULT '',
    -- Address Information  
    address TEXT DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    state VARCHAR(100) DEFAULT '',
    zip_code VARCHAR(20) DEFAULT '',
    country VARCHAR(100) DEFAULT 'Indonesia',
    -- Villa Details
    check_in_time VARCHAR(20) DEFAULT '15:00',
    check_out_time VARCHAR(20) DEFAULT '11:00', 
    max_guests INT DEFAULT 8,
    bedrooms INT DEFAULT 4,
    bathrooms INT DEFAULT 3,
    price_per_night DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    -- Policies
    cancellation_policy TEXT DEFAULT '',
    house_rules TEXT DEFAULT '',
    social_media JSON,
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Documentation

### Villa Information Endpoints

#### GET /api/villa.php
Get villa information
```json
{
    "name": "Aspen Villa",
    "description": "Luxury villa in the mountains",
    "location": "Aspen, Colorado",
    "phone": "+1 (555) 123-4567",
    "email": "info@aspenvilla.com",
    "website": "https://aspenvilla.com",
    "address": "123 Mountain View Drive",
    "city": "Aspen",
    "state": "Colorado",
    "country": "United States",
    "zipcode": "81611",
    "max_guests": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "price_per_night": 850.00,
    "currency": "USD",
    "checkin_time": "15:00",
    "checkout_time": "11:00",
    "cancellation_policy": "Free cancellation 48 hours before check-in",
    "house_rules": "No smoking, No pets, Quiet hours 10 PM - 8 AM",
    "social_media": {
        "facebook": "https://facebook.com/aspenvilla",
        "instagram": "https://instagram.com/aspenvilla",
        "twitter": "https://twitter.com/aspenvilla"
    }
}
```

#### PUT /api/villa.php
Update villa information
- Content-Type: application/json
- Body: Villa information object

### Room Endpoints

#### GET /api/index.php/rooms
Get all available rooms

### Booking Endpoints

#### POST /api/index.php/bookings
Create new booking
- Content-Type: application/json
- Body: Booking information object

## Troubleshooting

### Common Issues

#### XAMPP Issues
1. **Apache won't start**: Check if port 80 is in use
   - Stop IIS if running
   - Change Apache port in XAMPP config

2. **MySQL won't start**: Check if port 3306 is in use
   - Stop other MySQL services
   - Check Windows services

#### Database Issues
1. **Connection failed**: Verify database credentials in `api/config/database.php`
2. **Tables don't exist**: Run migration script `php database/migrate-db.php`
3. **No villa data**: Run initialization script `php database/init-data.php`

#### CORS Issues
1. **API calls blocked**: Ensure CORS headers are set in PHP files
2. **Credentials not included**: Check fetch requests include credentials

#### Admin Access Issues
1. **Can't access admin**: Use credentials `admin` / `admin123`
2. **Admin not loading**: Check if React dev server is running on port 3000
3. **Changes not saving**: Verify API endpoints are accessible

#### Frontend Issues
1. **White screen**: Check browser console for errors
2. **API calls failing**: Verify XAMPP is running and API endpoints are accessible
3. **Hot reload not working**: Restart Vite dev server

### Development Tips
- Always keep XAMPP running during development
- Check browser console for JavaScript errors
- Use browser Network tab to debug API calls
- Verify database changes in phpMyAdmin
- Test admin changes reflect on main page

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License
This project is licensed under the MIT License.
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
