# 🏨 Complete Villa Booking Engine with Comprehensive Admin Management System

A full-featured villa booking system with React + TypeScript frontend, PHP backend APIs, and a powerful admin dashboard for complete hotel management. The platform provides end-to-end booking management, room administration, package control, and dynamic content management with real-time database integration.

## ✨ Key Features

### 🏡 **Public Villa Website**
- 🏠 **Dynamic Villa Information**: Name, description, location, rating, and reviews
- 📸 **Photo Gallery Management**: Image carousel with admin-controlled content
- 🎯 **Amenities Display**: Customizable amenities with icons and descriptions
- 📦 **Package Booking System**: Select and book accommodation packages
- � **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🌐 **Real-time Content**: All content dynamically loaded from database

### 🔐 **Comprehensive Admin Dashboard** (`admin-dashboard.html`)

#### 📊 **Overview & Analytics**
- 📈 **Dashboard Overview**: Real-time statistics and key metrics
- 📋 **Quick Actions**: Direct access to all management functions
- � **Business Intelligence**: Revenue tracking and performance indicators

#### 📅 **Bookings Management**
- 📋 **Complete Booking CRUD**: Create, read, update, delete bookings
- 🔍 **Advanced Filtering**: Filter by status (pending, confirmed, cancelled, checked_in, checked_out)
- ⚡ **Quick Status Updates**: Instant status changes via dropdown
- � **Guest Information**: Full guest details with contact information
- 📅 **Date Management**: Check-in/check-out date handling
- 💰 **Pricing Control**: Total price management and tracking
- 📝 **Special Requests**: Guest requirements and notes management
- � **Room Integration**: Connected with room availability system

#### 🏨 **Rooms Management**
- 🛏️ **Room CRUD Operations**: Complete room lifecycle management
- 🏷️ **Room Types**: Standard, Deluxe, Suite, Family, Budget, Luxury, Business
- 💰 **Dynamic Pricing**: Price per night with currency support
- 👥 **Capacity Management**: Guest limits and occupancy control
- � **Room Specifications**: Size, bed configurations, descriptions
- ✨ **Features & Amenities**: Customizable room features and amenities arrays
- 🖼️ **Image Management**: Room photo galleries with upload support
- 🔄 **Availability Toggle**: Enable/disable room availability
- 📦 **Package Compatibility**: Smart matching with available packages

#### 📦 **Packages Management**
- 🎯 **Package Types**: Romantic, Business, Family, Luxury, Weekend, Holiday, Spa, Adventure
- 💰 **Pricing Control**: Base price and discount percentage management
- 📅 **Validity Periods**: Valid from/to date management
- 👥 **Guest Limits**: Maximum guests per package
- 🌙 **Night Requirements**: Minimum and maximum night stays
- ✅ **Includes Management**: Package inclusions and features
- 📋 **Terms & Conditions**: Package terms and policies
- �️ **Package Images**: Image URL management
- 🔄 **Active/Inactive Status**: Package availability control

#### 🏢 **Villa Information Management**
- 🏠 **Property Details**: Name, description, location, rating
- � **Contact Information**: Phone, email, website management
- 🏠 **Address Management**: Complete address details
- 🛏️ **Villa Specifications**: Max guests, bedrooms, bathrooms
- 💰 **Pricing & Policies**: Price per night, cancellation policies
- ⏰ **Timing Management**: Check-in/out times
- 📱 **Social Media**: Facebook, Instagram, Twitter integration

#### ⚙️ **System Settings**
- 👤 **User Management**: Admin user accounts and permissions
- 🔧 **System Configuration**: Application settings and preferences

### 🔒 **Security & Authentication**
- 🔐 **Session-based Authentication**: Secure login system with session management
- �️ **Protected Routes**: Admin access control and route protection
- 🚪 **Secure Logout**: Proper session termination
- � **User Validation**: Username/password authentication

### 🔄 **Real-time Integration**
- ⚡ **Live Updates**: Changes in admin panel instantly reflect on public site
- 🔄 **Dynamic Footer**: Contact information updates automatically
- 📍 **Location Management**: Header location updates based on admin settings
- 💾 **Database Sync**: All changes saved to MySQL database
- 🔗 **API Integration**: Complete frontend ↔ backend ↔ database integration

## 🚀 System Architecture

✅ **Frontend**: React + TypeScript + Vite  
✅ **Backend**: PHP REST APIs with comprehensive CRUD operations  
✅ **Database**: MySQL with complete hotel management schema  
✅ **Admin System**: HTML-based React dashboard with session authentication  
✅ **Integration**: Complete end-to-end data synchronization

## 🛠️ Prerequisites

| Tool | Purpose | Status |
|------|---------|--------|
| XAMPP (Apache + MySQL) | Serves PHP API + database | ✅ Required |
| Node.js / pnpm | Runs the frontend dev server | ✅ Required |
| Web Browser | Access the application | ✅ Any modern browser |

## 📁 Project Structure

```
htdocs/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/
├── admin-dashboard.html        # Complete admin management system
├── admin-login.html           # Admin authentication
├── src/
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── BookingSteps.tsx  # Booking flow components
│   │   ├── RoomCard.tsx      # Room display components
│   │   └── ...
│   ├── pages/
│   │   ├── Index.tsx         # Main villa page
│   │   ├── Booking.tsx       # Booking interface
│   │   ├── AdminBookings.tsx # Admin booking management
│   │   └── ...
│   ├── context/
│   │   └── BookingContext.tsx # Global booking state
│   ├── hooks/
│   │   ├── useRooms.tsx      # Room data management
│   │   └── ...
│   └── services/
│       └── api.js            # API service layer
├── api/                      # Backend API endpoints
│   ├── bookings.php         # Bookings CRUD API
│   ├── rooms.php            # Rooms CRUD API
│   ├── packages.php         # Packages CRUD API
│   ├── config/
│   │   └── database.php     # Database configuration
│   ├── controllers/
│   │   ├── BookingController.php
│   │   └── RoomController.php
│   ├── models/
│   │   ├── Booking.php
│   │   └── Room.php
│   └── utils/
│       └── helpers.php      # Utility functions
├── database/
│   └── schema.sql           # Database schema
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
```sql
-- Import the database schema
-- Run the schema.sql file in phpMyAdmin or MySQL CLI
mysql -u root -p villa_booking < database/schema.sql
```

### 3️⃣ **Frontend Setup**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# Server will run on: http://127.0.0.1:5173/
```

### 4️⃣ **Admin Dashboard Setup**
```bash
# The admin dashboard is a standalone HTML file
# Access directly via file path or serve through web server
# Default admin credentials: admin / admin123
```

### 5️⃣ **Verify Installation**
- **Main Site**: http://127.0.0.1:5173/
- **Admin Dashboard**: Open `admin-dashboard.html` in browser
- **API Test**: http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/bookings.php

## ⚙️ **Environment Configuration**

The system includes a powerful configuration management system for different deployment environments (local, staging, production).

### 🔧 **Configuration Files**
- **`config.js`**: Core configuration system with environment management
- **`config-manager.html`**: Web-based configuration interface

### 🌍 **Environment Management**

#### **Local Development** (Default)
```javascript
// Automatically configured for XAMPP
API Base URL: http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api
```

#### **Staging Environment**
```javascript
// For staging server deployment
API Base URL: https://staging.yourdomain.com/api
```

#### **Production Environment**
```javascript
// For production deployment
API Base URL: https://yourdomain.com/api
```

### 🛠️ **Configuration Manager**

Access the **Configuration Manager** (`config-manager.html`) to:

- ✅ **Switch Environments**: Toggle between local, staging, production
- 🔗 **Test API Connections**: Verify API endpoints are working
- ⚙️ **Custom Configuration**: Set custom API URLs
- 📤 **Export Settings**: Download configuration for deployment
- 🔄 **Reset to Defaults**: Restore original settings

### 🚀 **Deployment Configuration**

#### **For Staging Deployment:**
1. Open `config-manager.html`
2. Select "Staging" environment
3. Update API base URL to your staging server
4. Test API connections
5. Export configuration settings

#### **For Production Deployment:**
1. Open `config-manager.html`
2. Select "Production" environment  
3. Update API base URL to your production server
4. Test API connections
5. Deploy with exported configuration

### 🔧 **Manual Configuration**

You can also manually edit `config.js`:

```javascript
// Set environment
setEnvironment('production'); // 'local', 'staging', 'production'

// Or set custom URL
setCustomApiUrl('https://your-custom-domain.com/api');
```

### 📝 **Environment Variables**

The configuration system replaces traditional environment variables with:
- Dynamic environment switching
- Web-based configuration interface
- API endpoint testing
- Easy deployment management

## 🎯 Usage Guide

### 🌐 **Public Villa Website**
1. **Visit**: http://127.0.0.1:5173/
2. **Browse**: Dynamic villa information, photos, and amenities
3. **Book**: Select packages and make reservations
4. **View**: Room details and availability

### 🔐 **Admin Dashboard Access**
1. **Open**: `admin-dashboard.html` directly in your browser
2. **Login**: Use default credentials (admin / admin123)
3. **Navigate**: Use the tab navigation to access different sections

**Default Admin Credentials:**
```
Username: admin
Password: admin123
```

### 📅 **Bookings Management**
- View all bookings in a comprehensive table
- Filter bookings by status (all, pending, confirmed, cancelled, checked_in, checked_out)
- Quick status updates via dropdown selection
- Create new bookings with complete guest information
- Edit existing booking details
- Delete bookings with confirmation
- View guest contact information and special requests

### 🏨 **Rooms Management**
- Add new rooms with complete specifications
- Edit room details, pricing, and availability
- Manage room features and amenities
- Upload and manage room images
- Set room capacity and bed configurations
- Enable/disable room availability
- View package compatibility for each room

### 📦 **Packages Management**
- Create vacation packages with different types
- Set pricing, discounts, and validity periods
- Manage package inclusions and features
- Control package availability and guest limits
- Set minimum and maximum night requirements
- Add package images and descriptions

### 🔄 **Real-time Updates**
- All changes made in admin dashboard save to database
- Updates are immediately available via API endpoints
- Frontend applications receive updated data automatically
- No manual refresh required for most operations

## 🗄️ Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

### Rooms Table
```sql
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Standard', 'Deluxe', 'Suite', 'Family', 'Budget', 'Luxury', 'Business') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    size VARCHAR(50),
    beds VARCHAR(100),
    features JSON,
    amenities JSON,
    images JSON,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Packages Table
```sql
CREATE TABLE packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    package_type ENUM('romantic', 'business', 'family', 'luxury', 'weekend', 'holiday', 'spa', 'adventure') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    min_nights INT DEFAULT 1,
    max_nights INT DEFAULT 30,
    max_guests INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    includes JSON,
    valid_from DATE,
    valid_until DATE,
    terms TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔌 API Documentation

### Base URL
```
http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/
```

### Bookings Endpoints

#### GET `/bookings.php`
Get all bookings with room information
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "room_id": "deluxe-suite",
            "first_name": "John",
            "last_name": "Smith",
            "email": "john.smith@email.com",
            "phone": "+1-555-0101",
            "check_in": "2025-11-20",
            "check_out": "2025-11-23",
            "guests": 2,
            "total_price": "750.00",
            "special_requests": "Late check-in requested",
            "status": "confirmed",
            "room_name": "Deluxe Suite",
            "room_type": "Suite",
            "room_price": "250.00"
        }
    ]
}
```

#### POST `/bookings.php`
Create new booking
```json
{
    "room_id": "deluxe-suite",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-1234",
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "guests": 2,
    "total_price": 1000.00,
    "special_requests": "Ocean view preferred",
    "status": "confirmed"
}
```

#### PUT `/bookings.php?id={id}`
Update existing booking

#### DELETE `/bookings.php?id={id}`
Delete booking

### Rooms Endpoints

#### GET `/rooms.php`
Get all rooms with features and amenities
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
            "features": ["City View", "Living Area", "Premium Bathroom"],
            "amenities": ["WiFi", "TV", "Air Conditioning", "Minibar"],
            "images": [],
            "available": 1
        }
    ]
}
```

#### POST `/rooms.php`
Create new room

#### PUT `/rooms.php?id={id}`
Update room

#### DELETE `/rooms.php?id={id}`
Delete room

### Packages Endpoints

#### GET `/packages.php`
Get all packages
```json
{
    "success": true,
    "data": [
        {
            "id": "romantic-getaway",
            "name": "Romantic Getaway",
            "description": "Perfect for couples...",
            "package_type": "romantic",
            "base_price": "199.99",
            "discount_percentage": 15,
            "min_nights": 2,
            "max_nights": 7,
            "max_guests": 2,
            "is_active": 1,
            "includes": ["Champagne", "Rose Petals", "Couples Massage"],
            "valid_from": "2025-01-01",
            "valid_until": "2025-12-31"
        }
    ]
}
```

#### POST `/packages.php`
Create new package

#### PUT `/packages.php?id={id}`
Update package

#### DELETE `/packages.php?id={id}`
Delete package

## 🧪 Testing the System

### API Testing with PowerShell
```powershell
# Test bookings endpoint
Invoke-WebRequest -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/bookings.php" | Select-Object StatusCode

# Test rooms endpoint
Invoke-WebRequest -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/rooms.php" | Select-Object StatusCode

# Test packages endpoint  
Invoke-WebRequest -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/packages.php" | Select-Object StatusCode

# Create a test booking
$booking = @{
    room_id = "deluxe-suite"
    first_name = "Test"
    last_name = "User"
    email = "test@example.com"
    phone = "+1-555-0000"
    check_in = "2025-12-01"
    check_out = "2025-12-05"
    guests = 2
    total_price = 1000.00
    status = "confirmed"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/bookings.php" -Method POST -Body $booking -ContentType "application/json"
```

### Admin Dashboard Testing
1. Open `admin-dashboard.html` in your browser
2. Login with admin/admin123
3. Navigate through each section:
   - Overview: Check statistics display
   - Bookings: Create, edit, delete test bookings
   - Rooms: Manage room inventory
   - Packages: Control package offerings
   - Villa Info: Update property details

## 🔧 Troubleshooting

### Common Issues

#### XAMPP Issues
1. **Apache won't start**: Check if port 80 is in use
   - Stop IIS if running
   - Change Apache port in XAMPP config

2. **MySQL won't start**: Check if port 3306 is in use
   - Stop other MySQL services
   - Check Windows services

#### API Issues
1. **CORS errors**: APIs are configured with `Access-Control-Allow-Origin: *`
2. **404 errors**: Verify XAMPP is running and file paths are correct
3. **Database connection**: Check credentials in `api/config/database.php`

#### Admin Dashboard Issues
1. **Login fails**: Use default credentials `admin` / `admin123`
2. **Data not loading**: Check browser console for API errors
3. **Changes not saving**: Verify API endpoints are accessible

#### Frontend Issues
1. **Vite server won't start**: Check if port 5173 is available
2. **API calls failing**: Ensure XAMPP is running
3. **Build errors**: Run `pnpm install` to install dependencies

### Development Tips
- Keep XAMPP running during development
- Check browser console for JavaScript errors
- Use browser Network tab to debug API calls
- Verify database changes in phpMyAdmin
- Test all CRUD operations in admin dashboard

## 📊 System Status

### ✅ **Completed Features**
- **Admin Dashboard**: Complete management interface
- **Bookings System**: Full CRUD operations with 10 existing bookings
- **Rooms Management**: 5 rooms with full specifications
- **Packages System**: 6 packages with different types
- **Database Integration**: All systems connected to MySQL
- **Real-time Updates**: Changes reflect immediately
- **Security**: Session-based authentication
- **API Layer**: RESTful APIs for all operations

### 📈 **Current Data**
- **Bookings**: 10 sample bookings in database
- **Rooms**: 5 configured rooms (Family, Deluxe, Economy, Master, Standard)
- **Packages**: 6 active packages (Romantic, Business, Family, etc.)
- **Admin Users**: Authentication system ready

### 🔮 **Future Enhancements**
- Email notifications for bookings
- Payment gateway integration
- Advanced reporting and analytics
- Multi-language support
- Mobile app integration
- Advanced user roles and permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Test with the provided PowerShell commands
- Verify XAMPP services are running

---

**Note**: This system provides a complete hotel management solution with real-time database integration. The admin dashboard (`admin-dashboard.html`) serves as the central control panel for all hotel operations, while the React frontend provides the customer-facing booking interface.
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
