# Villa Management API

## Overview
RESTful API for the Villa Management System providing endpoints for villa information, room management, and booking operations.

## Base URL
```
http://localhost:80/api/
```

## Authentication
Admin endpoints require authentication. Use the following credentials:
- Username: `admin`
- Password: `admin123`

## Endpoints

### Villa Information
- `GET /villa.php` - Get villa information
- `PUT /villa.php` - Update villa information (Admin only)

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

### Rooms
- `GET /index.php/rooms` - Get all available rooms
- `GET /index.php/rooms/{id}` - Get specific room by ID

### Bookings
- `GET /index.php/bookings` - Get all bookings
- `GET /index.php/bookings/{id}` - Get specific booking by ID
- `POST /index.php/bookings` - Create new booking
- `GET /index.php/bookings?action=availability&room_id={id}&check_in={date}&check_out={date}` - Check availability

### Test
- `GET /index.php/test` - Test API connectivity

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

### Create Booking
```javascript
const bookingData = {
  roomId: 'villa-deluxe',
  from: '2025-11-10',
  to: '2025-11-12',
  guests: 2,
  user: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  total: 299.99
};

fetch('/api/index.php/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(bookingData)
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