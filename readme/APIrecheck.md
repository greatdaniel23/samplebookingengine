# API Reference - Rumah Daisy Cantik Booking System

**Base URL:** `https://api.rumahdaisycantik.com`  
**Last Updated:** December 18, 2025

---

## 📦 Packages API (`/packages.php`)

### GET - List All Packages
**Endpoint:** `GET /packages.php`

**Query Parameters:**
- `check_in` (optional) - Filter by check-in date (YYYY-MM-DD)
- `check_out` (optional) - Filter by check-out date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "name": "Poolside Villa with Lounge in Kaba-Kaba",
      "description": "...",
      "package_type": "Room + Breakfast",
      "base_price": "72.00",
      "max_guests": 2,
      "base_room_id": "villa-3",
      "amenities": [...],
      "images": [...]
    }
  ]
}
```

### GET - Single Package
**Endpoint:** `GET /packages.php?id={package_id}`

**Query Parameters:**
- `id` (required) - Package ID
- `include_rooms` (optional) - Set to `true` to include available room options

**Response (with include_rooms=true):**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "name": "Package Name",
    "base_price": "72.00",
    "available_rooms": [
      {
        "room_id": "villa-3",
        "room_name": "Villa 3",
        "is_default": true,
        "price_adjustment": 0,
        "final_price": 72.00,
        "max_occupancy": 2
      }
    ],
    "amenities": [...]
  }
}
```

### GET - Check Availability
**Endpoint:** `GET /packages.php?action=check_availability&id={id}&checkin={date}&checkout={date}`

**Query Parameters:**
- `action` - Must be `check_availability`
- `id` (required) - Package ID
- `checkin` (required) - Check-in date (YYYY-MM-DD)
- `checkout` (required) - Check-out date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "package_id": 15,
    "checkin": "2025-12-20",
    "checkout": "2025-12-22",
    "nights": 2,
    "available_rooms": [...]
  }
}
```

### GET - Package Types
**Endpoint:** `GET /packages.php?action=types`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "package_type": "Room + Breakfast",
      "count": 5
    }
  ]
}
```

### POST - Create Package
**Endpoint:** `POST /packages.php`

**Request Body:**
```json
{
  "name": "Package Name",
  "description": "Description",
  "package_type": "Room + Breakfast",
  "base_price": 72.00,
  "max_guests": 2,
  "min_nights": 1,
  "max_nights": 30,
  "base_room_id": "villa-3",
  "inclusions": ["Breakfast", "WiFi"],
  "is_active": 1
}
```

### PUT - Update Package
**Endpoint:** `PUT /packages.php`

**Request Body:**
```json
{
  "id": 15,
  "name": "Updated Name",
  "base_price": 80.00,
  "description": "Updated description"
}
```

### DELETE - Delete Package
**Endpoint:** `DELETE /packages.php`

**Request Body:**
```json
{
  "id": 15
}
```

---

## 🏠 Rooms API (`/rooms.php`)

### GET - List All Rooms
**Endpoint:** `GET /rooms.php`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "villa-1",
      "name": "Villa 1",
      "type": "Standard",
      "price": "0.00",
      "capacity": 2,
      "description": "",
      "available": 1,
      "images": [...],
      "amenities": [...]
    }
  ]
}
```

### GET - Single Room
**Endpoint:** `GET /rooms.php?id={room_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "villa-3",
    "name": "Villa 3",
    "capacity": 2,
    "images": [...]
  }
}
```

**Valid Room IDs:**
- `villa-1`
- `villa-2`
- `villa-3`
- `villa-4`
- `villa-5`

---

## 📅 Bookings API (`/bookings.php`)

### GET - List All Bookings
**Endpoint:** `GET /bookings.php`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "package_id": 15,
      "room_id": "villa-3",
      "check_in": "2025-12-20",
      "check_out": "2025-12-22",
      "total_price": "144.00",
      "status": "confirmed"
    }
  ]
}
```

### GET - Single Booking
**Endpoint:** `GET /bookings.php?id={booking_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "first_name": "John",
    "last_name": "Doe",
    "package_name": "Poolside Villa with Lounge in Kaba-Kaba",
    "room_name": "Villa 3",
    "amenities": [...]
  }
}
```

### POST - Create Booking
**Endpoint:** `POST /bookings.php`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+62123456789",
  "package_id": 15,
  "room_id": "villa-3",
  "check_in": "2025-12-20",
  "check_out": "2025-12-22",
  "guests": 2,
  "total_price": 144.00,
  "special_requests": "Late check-in"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "booking_number": "BK-20251218-123"
  }
}
```

**Validation:**
- `room_id` must exist in rooms table with `available = 1`
- `package_id` must be between 1-50
- All required fields must be present

---

## 🎨 Amenities API (`/amenities.php`)

### GET - List All Amenities
**Endpoint:** `GET /amenities.php`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Mini Fridge",
      "description": "Small refrigerator for beverages and snacks",
      "category": "appliances",
      "icon": "refrigerator",
      "is_featured": 0
    }
  ]
}
```

**Categories:**
- `appliances`
- `bathroom`
- `comfort`
- `entertainment`
- `kitchen`
- `outdoor`

---

## 🖼️ Images API (`/images.php`)

### GET - Get Room Images
**Endpoint:** `GET /images.php?room={room_folder}`

**Query Parameters:**
- `room` (required) - Room folder name (e.g., "Villa5")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "image1.webp",
      "url": "https://rumahdaisycantik.com/images/rooms/Villa5/image1.webp"
    }
  ]
}
```

---

## 🎯 Hero Images API (`/hero-images.php`)

### GET - List Hero Images
**Endpoint:** `GET /hero-images.php`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "image_url": "https://example.com/hero1.jpg",
      "title": "Welcome to Villa Daisy",
      "is_active": 1
    }
  ]
}
```

---

## 🏡 Villa API (`/villa.php`)

### GET - Get Villa Information
**Endpoint:** `GET /villa.php`

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Villa Daisy Cantik",
    "description": "...",
    "location": "Kaba-Kaba, Bali",
    "contact": "..."
  }
}
```

---

## 🏠 Homepage API (`/homepage.php`)

### GET - Get Homepage Content
**Endpoint:** `GET /homepage.php`

**Response:**
```json
{
  "success": true,
  "data": {
    "hero_title": "Welcome",
    "hero_subtitle": "...",
    "featured_packages": [...],
    "testimonials": [...]
  }
}
```

---

## 📧 Email Service API (`/email-service.php`)

### POST - Send Booking Confirmation
**Endpoint:** `POST /email-service.php`

**Request Body:**
```json
{
  "booking_id": 123,
  "guest_email": "john@example.com",
  "type": "confirmation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## 🔧 API Health Check

### GET - Health Check
**Endpoint:** `GET /health.php`

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-18T10:30:00Z"
}
```

---

## ⚠️ Error Responses

All APIs return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## 🔑 Important Notes

1. **Room ID Validation:**
   - Valid IDs: `villa-1`, `villa-2`, `villa-3`, `villa-4`, `villa-5`
   - Old IDs (no longer valid): `deluxe-suite`, `economy-room`, `family-room`, `master-suite`, `standard-room`

2. **Package ID Range:**
   - Valid range: 1-50

3. **Database Column Names:**
   - Rooms table uses `capacity` (not `max_occupancy`)
   - Packages table uses `base_price` (not `price`)
   - Packages table uses `includes` (stored as JSON)

4. **CORS Headers:**
   - All APIs support CORS with `Access-Control-Allow-Origin: *`
   - OPTIONS requests return 200

5. **Date Format:**
   - All dates use `YYYY-MM-DD` format
   - Timestamps use `YYYY-MM-DD HH:MM:SS` format

---

## 🐛 Recent Fixes

**December 18, 2025:**
- ✅ Fixed `packages.php?include_rooms=true` - Changed `r.max_occupancy` to `r.capacity`
- ✅ Fixed `bookings.php` room validation - Now uses database query instead of hardcoded array
- ✅ Updated Booking.tsx to use `pkg.base_room_id` from API response

---

## 📝 Testing Commands (PowerShell)

```powershell
# Test packages API
Invoke-RestMethod -Uri "https://api.rumahdaisycantik.com/packages.php"

# Test single package with rooms
Invoke-RestMethod -Uri "https://api.rumahdaisycantik.com/packages.php?id=15&include_rooms=true"

# Test rooms API
Invoke-RestMethod -Uri "https://api.rumahdaisycantik.com/rooms.php"

# Test specific room
Invoke-RestMethod -Uri "https://api.rumahdaisycantik.com/rooms.php?id=villa-3"

# Test bookings API
Invoke-RestMethod -Uri "https://api.rumahdaisycantik.com/bookings.php?id=123"
```

---

**End of API Reference**
