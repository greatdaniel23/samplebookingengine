# Villa Management API - Complete REST Endpoints

## Overview
Comprehensive RESTful API for the Villa Management System providing endpoints for villa information, room management, booking operations, and automatic email notifications.

## Base URL
```
http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/
```

## Authentication
Admin endpoints require authentication. Use the following credentials:
- Username: `admin`
- Password: `admin123`

## 📧 Latest Feature: Email Notifications
The API now includes automatic email notification system for booking confirmations with professional HTML templates.

## API Endpoints

### 🏨 Villa Information
- `GET /villa.php` - Get complete villa information and contact details
- `PUT /villa.php` - Update villa information (Admin only)

### 📧 Email Notifications *(NEW)*
- `POST /notify.php` - Send booking confirmation email
  - Automatically triggered on booking completion
  - Professional HTML email templates
  - SMTP integration with Gmail support
  - Includes complete booking details and villa contact info

#### Villa Information Structure
```json
{
  "name": "Villa Name",
  "description": "Villa description",
  "location": "City, State",
  "phone": "+1 (555) 123-4567",
  "email": "info@villa.com",
  "website": "https://villa.com",
  "address": "123 Street Name",
  "city": "City",
  "state": "State",
  "country": "Country",
  "zipcode": "12345",
  "max_guests": 8,
  "bedrooms": 4,
  "bathrooms": 3,
  "price_per_night": 850.00,
  "currency": "USD",
  "checkin_time": "15:00",
  "checkout_time": "11:00",
  "cancellation_policy": "Cancellation policy text",
  "house_rules": "House rules text",
  "social_media": {
    "facebook": "https://facebook.com/villa",
    "instagram": "https://instagram.com/villa",
    "twitter": "https://twitter.com/villa"
  }
}
```

### 🏨 Rooms Management
- `GET /rooms.php` - Get all available rooms with details
- `GET /rooms.php?id={room_id}` - Get specific room by ID
- `POST /rooms.php` - Create new room (Admin only)
- `PUT /rooms.php` - Update room information (Admin only)
- `DELETE /rooms.php?id={room_id}` - Delete room (Admin only)

### 📦 Packages Management
- `GET /packages.php` - Get all available packages
- `GET /packages.php?id={package_id}` - Get specific package by ID
- `POST /packages.php` - Create new package (Admin only)
- `PUT /packages.php` - Update package information (Admin only)
- `DELETE /packages.php?id={package_id}` - Delete package (Admin only)

### 📋 Bookings Management
- `GET /bookings.php` - Get all bookings with filtering options
- `GET /bookings.php?id={booking_id}` - Get specific booking by ID
- `POST /bookings.php` - Create new booking (triggers email notification)
- `PUT /bookings.php` - Update booking information (Admin only)
- `DELETE /bookings.php?id={booking_id}` - Delete booking (Admin only)
- `GET /bookings.php?action=availability&room_id={id}&check_in={date}&check_out={date}` - Check room availability

### 🔐 Authentication
- `POST /auth.php` - Admin login authentication
- `POST /auth.php?action=logout` - Admin logout
- `GET /auth.php?action=check` - Check authentication status

## 📧 Email Notification System

### Configuration
Update SMTP settings in `notify.php`:
```php
$SMTP_HOST = 'smtp.gmail.com';
$SMTP_PORT = 587;
$SMTP_USERNAME = 'your-email@gmail.com';
$SMTP_PASSWORD = 'your-app-password';  // Gmail App Password
$FROM_EMAIL = 'your-email@gmail.com';
$FROM_NAME = 'Villa Booking System';
$TO_EMAIL = 'bookings@rumahdaisycantik.com';
```

### Email Notification Payload
```json
{
  "id": "12345",
  "reference": "BK-2025-001",
  "room_id": "business-elite",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "guests": 2,
  "total_price": 2500.00,
  "special_requests": "Late check-in requested",
  "status": "confirmed"
}
```

### Email Features
- ✅ **HTML Templates**: Professional email design
- ✅ **Booking Details**: Complete reservation information
- ✅ **Villa Contact**: Dynamic villa contact information
- ✅ **Mobile Responsive**: Works on all devices
- ✅ **Error Handling**: Graceful failure management

## Example Usage

### Get Villa Information
```javascript
fetch('/api/villa.php')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Update Villa Information
```javascript
const villaData = {
  name: "Luxury Mountain Villa",
  description: "Beautiful villa with mountain views",
  phone: "+1 (555) 123-4567",
  email: "info@villa.com"
  // ... other fields
};

fetch('/api/villa.php', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(villaData)
});
```

### Create Booking with Email Notification
```javascript
const bookingData = {
  room_id: 'business-elite',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  check_in: '2025-12-01',
  check_out: '2025-12-05',
  guests: 2,
  total_price: 2500.00,
  special_requests: 'Late check-in requested',
  status: 'confirmed'
};

// Create booking (automatically triggers email notification)
fetch('/api/bookings.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(bookingData)
});
```

### Send Manual Email Notification
```javascript
const emailData = {
  id: '12345',
  reference: 'BK-2025-001',
  room_id: 'business-elite',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  check_in: '2025-12-01',
  check_out: '2025-12-05',
  guests: 2,
  total_price: 2500.00,
  special_requests: 'Late check-in requested',
  status: 'confirmed'
};

fetch('/api/notify.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(emailData)
});
```

### Get Available Packages
```javascript
fetch('/api/packages.php')
  .then(response => response.json())
  .then(data => {
    console.log('Available packages:', data.data);
  });
```

### Check Room Availability
```javascript
const params = new URLSearchParams({
  action: 'availability',
  room_id: 'business-elite',
  check_in: '2025-12-01',
  check_out: '2025-12-05'
});

fetch(`/api/bookings.php?${params}`)
  .then(response => response.json())
  .then(data => {
    console.log('Room availability:', data.available);
  });
```

## CORS Configuration
The API includes CORS headers to allow requests from the frontend:
```php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
```

## Error Handling
All endpoints return JSON responses with appropriate HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Database Configuration
Database connection settings are configured in `config/database.php`:
```php
$host = 'localhost';
$dbname = 'booking_engine';
$username = 'root';
$password = '';
```