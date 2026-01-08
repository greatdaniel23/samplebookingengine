# Villa Booking Engine - API Testing Documentation

Base URL: `https://api.rumahdaisycantik.com`

## Quick Test Commands

Test all endpoints quickly using curl:

```bash
# Test API connectivity
curl -s "https://api.rumahdaisycantik.com/rooms.php" | head -c 200
```

---

## 1. Rooms API

Manage room inventory (the real inventory that controls availability).

### List All Rooms
```bash
curl -X GET "https://api.rumahdaisycantik.com/rooms.php"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Deluxe Room",
      "type": "Standard",
      "price": "150.00",
      "capacity": 2,
      "size": "25 sqm",
      "description": "...",
      "available": true,
      "images": "[]"
    }
  ]
}
```

### Get Single Room
```bash
curl -X GET "https://api.rumahdaisycantik.com/rooms.php?id=1"
```

### Get Room Images from Folder
```bash
curl -X GET "https://api.rumahdaisycantik.com/rooms.php?images=room-folder-name"
```

### Create Room
```bash
curl -X POST "https://api.rumahdaisycantik.com/rooms.php" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Room",
    "type": "Deluxe",
    "price": 200,
    "capacity": 2,
    "size": "30 sqm",
    "description": "Room description",
    "available": true
  }'
```

### Update Room
```bash
curl -X PUT "https://api.rumahdaisycantik.com/rooms.php" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Updated Room Name",
    "price": 250,
    "available": true
  }'
```

### Delete Room
```bash
curl -X DELETE "https://api.rumahdaisycantik.com/rooms.php" \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

---

## 2. Bookings API

Manage guest bookings.

### List All Bookings
```bash
curl -X GET "https://api.rumahdaisycantik.com/bookings.php"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "guest_name": "John Doe",
      "email": "john@example.com",
      "phone": "+62812345678",
      "check_in": "2025-01-15",
      "check_out": "2025-01-18",
      "room_id": 1,
      "package_id": null,
      "status": "confirmed",
      "total_price": "450.00"
    }
  ]
}
```

### Get Single Booking
```bash
curl -X GET "https://api.rumahdaisycantik.com/bookings.php?id=1"
```

### Create Booking
```bash
curl -X POST "https://api.rumahdaisycantik.com/bookings.php" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+62812345678",
    "check_in": "2025-02-01",
    "check_out": "2025-02-05",
    "room_id": 1,
    "guests": 2,
    "special_requests": "Late check-in"
  }'
```

### Update Booking Status
```bash
curl -X PUT "https://api.rumahdaisycantik.com/bookings.php" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "status": "confirmed"
  }'
```

**Valid Statuses:** `pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`

### Delete Booking
```bash
curl -X DELETE "https://api.rumahdaisycantik.com/bookings.php" \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

---

## 3. Packages API (Sales Tools)

Marketing tools that bundle rooms with services.

### List All Packages
```bash
curl -X GET "https://api.rumahdaisycantik.com/packages.php"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Romantic Getaway",
      "description": "Perfect for couples",
      "package_type": "Romance",
      "base_price": "500.00",
      "base_room_id": 1,
      "min_nights": 2,
      "max_nights": 7,
      "max_guests": 2,
      "is_active": 1
    }
  ]
}
```

### Create Package
```bash
curl -X POST "https://api.rumahdaisycantik.com/packages.php" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Family Adventure",
    "description": "Perfect for families",
    "type": "Family",
    "base_room_id": 1,
    "base_price": 800,
    "min_nights": 3,
    "max_nights": 14,
    "max_guests": 4,
    "is_active": true
  }'
```

### Update Package
```bash
curl -X PUT "https://api.rumahdaisycantik.com/packages.php" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Updated Package Name",
    "base_price": 600,
    "is_active": 1
  }'
```

### Delete Package
```bash
curl -X DELETE "https://api.rumahdaisycantik.com/packages.php" \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

---

## 4. Amenities API

Property features that enhance rooms and packages.

### List All Amenities
```bash
curl -X GET "https://api.rumahdaisycantik.com/amenities.php"
```

**Expected Response:**
```json
{
  "success": true,
  "amenities": [
    {
      "id": 1,
      "name": "Free WiFi",
      "category": "connectivity",
      "icon": "wifi",
      "is_featured": 1,
      "is_active": 1
    }
  ]
}
```

### Create Amenity
```bash
curl -X POST "https://api.rumahdaisycantik.com/amenities.php" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Swimming Pool",
    "category": "recreation",
    "description": "Outdoor infinity pool",
    "icon": "waves",
    "is_featured": true,
    "is_active": true
  }'
```

### Update Amenity
```bash
curl -X PUT "https://api.rumahdaisycantik.com/amenities.php" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "High-Speed WiFi",
    "is_featured": true
  }'
```

### Delete Amenity
```bash
curl -X DELETE "https://api.rumahdaisycantik.com/amenities.php?id=1"
```

---

## 5. Room Amenities API

Link amenities to specific rooms.

### List Room Amenities
```bash
curl -X GET "https://api.rumahdaisycantik.com/room-amenities.php?room_id=1"
```

### Add Amenity to Room
```bash
curl -X GET "https://api.rumahdaisycantik.com/room-amenities.php?action=add&room_id=1&amenity_id=5"
```

### Remove Amenity from Room
```bash
curl -X GET "https://api.rumahdaisycantik.com/room-amenities.php?action=remove&id=123"
```

---

## 6. Package Amenities API

Link amenities to packages.

### List Package Amenities
```bash
curl -X GET "https://api.rumahdaisycantik.com/package-amenities.php?package_id=1"
```

### Add Amenity to Package
```bash
curl -X GET "https://api.rumahdaisycantik.com/package-amenities.php?action=add&package_id=1&amenity_id=5&is_highlighted=1"
```

### Remove Amenity from Package
```bash
curl -X GET "https://api.rumahdaisycantik.com/package-amenities.php?action=remove&package_id=1&amenity_id=5"
```

---

## 7. Inclusions API

"What's included" items for packages.

### List All Inclusions
```bash
curl -X GET "https://api.rumahdaisycantik.com/inclusions.php"
```

**Expected Response:**
```json
{
  "success": true,
  "inclusions": [
    {
      "id": 1,
      "name": "Breakfast for 2",
      "category": "meals",
      "icon": "coffee",
      "is_featured": 1,
      "is_active": 1
    }
  ]
}
```

### Create Inclusion
```bash
curl -X POST "https://api.rumahdaisycantik.com/inclusions.php" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Airport Transfer",
    "category": "transport",
    "description": "Round-trip airport transfer",
    "icon": "car",
    "is_featured": true,
    "is_active": true
  }'
```

### Update Inclusion
```bash
curl -X PUT "https://api.rumahdaisycantik.com/inclusions.php?id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Inclusion",
    "is_featured": false
  }'
```

### Delete Inclusion
```bash
curl -X DELETE "https://api.rumahdaisycantik.com/inclusions.php?id=1"
```

---

## 8. Package Inclusions API

Link inclusions to packages.

### List Package Inclusions
```bash
curl -X GET "https://api.rumahdaisycantik.com/package-inclusions.php?action=list&package_id=1"
```

### Add Inclusion to Package
```bash
curl -X GET "https://api.rumahdaisycantik.com/package-inclusions.php?action=add&package_id=1&inclusion_id=5"
```

### Remove Inclusion from Package
```bash
curl -X GET "https://api.rumahdaisycantik.com/package-inclusions.php?action=remove&package_id=1&inclusion_id=5"
```

---

## 9. Package Rooms API

Get rooms assigned to a package.

### List Package Rooms
```bash
curl -X GET "https://api.rumahdaisycantik.com/package-rooms.php?package_id=1"
```

---

## 10. Villa/Property API

Property information and settings.

### Get Property Info
```bash
curl -X GET "https://api.rumahdaisycantik.com/villa.php"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "name": "Villa Name",
    "description": "Property description",
    "address": "Full address",
    "phone": "+62xxx",
    "email": "info@example.com",
    "check_in_time": "14:00",
    "check_out_time": "11:00"
  }
}
```

### Update Property Info
```bash
curl -X PUT "https://api.rumahdaisycantik.com/villa.php" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Villa Name",
    "phone": "+62123456789"
  }'
```

---

## 11. Marketing Categories API

Package categories for filtering.

### List Marketing Categories
```bash
curl -X GET "https://api.rumahdaisycantik.com/marketing-categories.php"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "Romance", "slug": "romance"},
    {"id": 2, "name": "Family", "slug": "family"},
    {"id": 3, "name": "Adventure", "slug": "adventure"}
  ]
}
```

### Create Category
```bash
curl -X POST "https://api.rumahdaisycantik.com/marketing-categories.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Wellness", "slug": "wellness"}'
```

### Delete Category
```bash
curl -X DELETE "https://api.rumahdaisycantik.com/marketing-categories.php" \
  -H "Content-Type: application/json" \
  -d '{"id": 5}'
```

---

## 12. iCal Integration API

Calendar sync for external booking platforms.

### Get iCal Feed URL
```
https://api.rumahdaisycantik.com/ical.php
```

### Sync External Calendar
```bash
curl -X POST "https://api.rumahdaisycantik.com/ical.php" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "sync",
    "calendar_url": "https://external-booking-site.com/calendar.ics"
  }'
```

---

## 13. Image Scanner API

Scan server folder for available images.

### List Image Folders
```bash
curl -X GET "https://api.rumahdaisycantik.com/image-scanner.php?action=folders&basePath=../images/rooms"
```

### List Images in Folder
```bash
curl -X GET "https://api.rumahdaisycantik.com/image-scanner.php?folder=room-1&basePath=../images/rooms"
```

---

## Testing Checklist

Use this checklist to verify all API endpoints:

| Endpoint | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| rooms.php | ⬜ | ⬜ | ⬜ | ⬜ |
| bookings.php | ⬜ | ⬜ | ⬜ | ⬜ |
| packages.php | ⬜ | ⬜ | ⬜ | ⬜ |
| amenities.php | ⬜ | ⬜ | ⬜ | ⬜ |
| inclusions.php | ⬜ | ⬜ | ⬜ | ⬜ |
| room-amenities.php | ⬜ | N/A | N/A | N/A |
| package-amenities.php | ⬜ | N/A | N/A | N/A |
| package-inclusions.php | ⬜ | N/A | N/A | N/A |
| package-rooms.php | ⬜ | N/A | N/A | N/A |
| villa.php | ⬜ | N/A | ⬜ | N/A |
| marketing-categories.php | ⬜ | ⬜ | N/A | ⬜ |
| ical.php | ⬜ | ⬜ | N/A | N/A |
| image-scanner.php | ⬜ | N/A | N/A | N/A |

---

## Common Error Responses

### 404 Not Found
```json
{"success": false, "error": "Resource not found"}
```

### 400 Bad Request
```json
{"success": false, "error": "Missing required fields"}
```

### 500 Server Error
```json
{"success": false, "error": "Internal server error", "details": "..."}
```

---

## Notes

1. All endpoints support CORS for cross-origin requests
2. Date format: `YYYY-MM-DD`
3. Boolean values: `1`/`0` or `true`/`false`
4. Arrays (inclusions, images) are stored as JSON strings
5. Image URLs: `https://rumahdaisycantik.com/images/rooms/{folder}/{filename}`
