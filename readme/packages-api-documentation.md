# Packages API Documentation

## Overview
The Packages API (`/api/packages.php`) provides comprehensive CRUD operations for managing vacation packages in the booking system. Packages are marketing sales tools that combine room accommodations with services and amenities to create attractive bundled offers.

## Base URL
```
/api/packages.php
```

## Authentication
- **CORS Enabled**: Allows all origins (`*`)
- **Methods Supported**: GET, POST, PUT, DELETE, OPTIONS
- **Content-Type**: `application/json`

---

## API Endpoints

### 1. GET /api/packages.php
**Get All Packages**

Returns a list of all packages with their amenities and decoded JSON fields.

#### Request
```http
GET /api/packages.php
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Romantic Getaway",
      "description": "Perfect for couples...",
      "package_type": "Romance",
      "base_price": "299.00",
      "max_guests": 2,
      "min_nights": 2,
      "max_nights": 7,
      "discount_percentage": "10.00",
      "is_active": 1,
      "inclusions": ["Breakfast", "Spa Treatment"],
      "exclusions": ["Airport Transfer"],
      "images": ["/images/packages/romance1.jpg"],
      "valid_from": "2024-01-01",
      "valid_until": "2024-12-31",
      "terms_conditions": "Terms apply...",
      "base_room_id": "deluxe-suite",
      "amenities": [
        {
          "id": 1,
          "name": "Wi-Fi",
          "category": "Technology",
          "icon": "wifi",
          "is_highlighted": 1
        }
      ]
    }
  ]
}
```

---

### 2. GET /api/packages.php?id={id}
**Get Specific Package**

Returns detailed information for a specific package by ID.

#### Parameters
- `id` (required): Package ID
- `include_rooms` (optional): Set to "true" to include room options

#### Request
```http
GET /api/packages.php?id=1&include_rooms=true
```

#### Response with Rooms
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Romantic Getaway",
    "description": "Perfect for couples...",
    "package_type": "Romance",
    "base_price": "299.00",
    "available_rooms": [
      {
        "room_id": "deluxe-suite",
        "room_name": "Deluxe Suite",
        "is_default": true,
        "price_adjustment": 0.00,
        "final_price": 299.00,
        "adjustment_type": "fixed",
        "max_occupancy": 2,
        "availability_priority": 1,
        "description": "Luxury suite with ocean view"
      },
      {
        "room_id": "master-suite",
        "room_name": "Master Suite",
        "is_default": false,
        "price_adjustment": 50.00,
        "final_price": 349.00,
        "adjustment_type": "fixed",
        "max_occupancy": 4,
        "availability_priority": 2,
        "description": "Premium suite with balcony"
      }
    ],
    "amenities": [...],
    "inclusions": [...],
    "exclusions": [...]
  }
}
```

---

### 3. GET /api/packages.php?action=types
**Get Package Types**

Returns all package types with their counts.

#### Request
```http
GET /api/packages.php?action=types
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "package_type": "Romance",
      "count": 3
    },
    {
      "package_type": "Family",
      "count": 2
    },
    {
      "package_type": "Adventure",
      "count": 1
    }
  ]
}
```

---

### 4. GET /api/packages.php?action=check_availability
**Check Package Availability**

Checks room availability for a package within specified dates.

#### Parameters
- `action=check_availability` (required)
- `id` (required): Package ID
- `checkin` (required): Check-in date (YYYY-MM-DD)
- `checkout` (required): Check-out date (YYYY-MM-DD)

#### Request
```http
GET /api/packages.php?action=check_availability&id=1&checkin=2024-06-01&checkout=2024-06-05
```

#### Response
```json
{
  "success": true,
  "data": {
    "package_id": 1,
    "checkin": "2024-06-01",
    "checkout": "2024-06-05",
    "nights": 4,
    "available_rooms": [
      {
        "room_id": "deluxe-suite",
        "room_name": "Deluxe Suite",
        "available": true,
        "price_per_night": 299.00,
        "total_price": 1196.00
      }
    ]
  }
}
```

---

### 5. POST /api/packages.php
**Create New Package**

Creates a new package with the provided data.

#### Request Body
```json
{
  "name": "Adventure Explorer",
  "description": "Thrilling outdoor experiences...",
  "package_type": "Adventure",
  "base_price": 399.00,
  "max_guests": 4,
  "min_nights": 3,
  "max_nights": 10,
  "discount_percentage": 15.00,
  "is_active": 1,
  "inclusions": ["Breakfast", "Guide Service", "Equipment"],
  "exclusions": ["Personal Insurance"],
  "images": ["/images/packages/adventure1.jpg"],
  "valid_from": "2024-01-01",
  "valid_until": "2024-12-31",
  "terms_conditions": "Age restrictions apply...",
  "base_room_id": "family-room"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "6"
  }
}
```

---

### 6. PUT /api/packages.php
**Update Package**

Updates an existing package with new data.

#### Request Body
```json
{
  "id": "1",
  "name": "Romantic Getaway Premium",
  "description": "Enhanced romantic experience...",
  "package_type": "Romance",
  "base_price": 349.00,
  "max_guests": 2,
  "min_nights": 2,
  "max_nights": 7,
  "discount_percentage": 12.00,
  "is_active": 1,
  "inclusions": ["Breakfast", "Spa Treatment", "Wine Tasting"],
  "exclusions": ["Airport Transfer"],
  "images": ["/images/packages/romance1.jpg", "/images/packages/romance2.jpg"],
  "base_room_id": "deluxe-suite"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "updated": true,
    "affected_rows": 1,
    "id": "1"
  }
}
```

---

### 7. DELETE /api/packages.php
**Delete Package**

Removes a package from the system.

#### Request Body
```json
{
  "id": "6"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

---

## Data Models

### Package Model
```typescript
interface Package {
  id: string;
  name: string;
  description?: string;
  package_type: string;
  base_price: number;
  max_guests: number;
  min_nights: number;
  max_nights: number;
  discount_percentage?: number;
  is_active: boolean;
  inclusions?: string[];
  exclusions?: string[];
  images?: string[];
  valid_from?: string;
  valid_until?: string;
  terms_conditions?: string;
  base_room_id?: string;
  amenities?: Amenity[];
  available_rooms?: RoomOption[];
}
```

### Room Option Model
```typescript
interface RoomOption {
  room_id: string;
  room_name: string;
  is_default: boolean;
  price_adjustment: number;
  final_price: number;
  adjustment_type: 'fixed' | 'percentage';
  max_occupancy: number;
  availability_priority: number;
  description?: string;
}
```

### Amenity Model
```typescript
interface Amenity {
  id: number;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  is_featured: boolean;
  is_highlighted: boolean;
  custom_note?: string;
}
```

---

## Business Logic

### Package-Room Relationship
1. **Packages are Marketing Sales Tools** - They combine room accommodation with services
2. **Base Room Controls Availability** - Each package must have a `base_room_id`
3. **Multiple Room Options** - Packages can offer several room choices with price adjustments
4. **Price Calculations** - Room final price = base price ± adjustment (fixed amount or percentage)

### Pricing Structure
- **Base Price**: Package starting price
- **Room Adjustments**: Additional charges/discounts for specific rooms
- **Discount Percentage**: Package-wide discount applied
- **Final Calculation**: (Base Price ± Room Adjustment) × (1 - Discount%)

### Availability Logic
- Package availability depends on underlying room availability
- Multiple rooms can be offered per package with priority ordering
- Default room is assigned if no specific room selected

---

## Database Schema

### Tables Used
- **packages**: Main package information
- **package_rooms**: Room options for packages
- **package_amenities**: Package-amenity relationships
- **amenities**: Available amenities
- **rooms**: Room inventory

### Key Relationships
```sql
packages.base_room_id → rooms.id
package_rooms.package_id → packages.id
package_rooms.room_id → rooms.id
package_amenities.package_id → packages.id
package_amenities.amenity_id → amenities.id
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Name and price are required"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Package not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Database error: Connection failed",
  "debug": {
    "file": "packages.php",
    "line": 45,
    "method": "GET"
  }
}
```

---

## Field Mapping & Compatibility

### Legacy Support
The API supports multiple field names for backward compatibility:

| Frontend Field | Database Field | Alternative Names |
|---------------|----------------|-------------------|
| `price` | `base_price` | `base_price` |
| `type` | `package_type` | `package_type` |
| `duration_days` | `min_nights` | `min_nights` |
| `available` | `is_active` | `is_active` |
| `includes` | `includes` | `inclusions` |
| `terms` | `terms_conditions` | `terms_conditions` |

### JSON Field Handling
- **Inclusions/Includes**: Stored as JSON array, decoded to PHP array
- **Exclusions**: Stored as JSON array, decoded to PHP array
- **Images**: Stored as JSON array, decoded to PHP array
- **Empty Arrays**: Stored as NULL in database, returned as empty array

---

## Usage Examples

### JavaScript/TypeScript Integration

#### Fetch All Packages
```javascript
const response = await fetch('/api/packages.php');
const data = await response.json();
if (data.success) {
  console.log('Packages:', data.data);
}
```

#### Create Package
```javascript
const newPackage = {
  name: "Wellness Retreat",
  package_type: "Wellness",
  base_price: 299.00,
  inclusions: ["Yoga Classes", "Healthy Meals", "Spa Access"]
};

const response = await fetch('/api/packages.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newPackage)
});

const result = await response.json();
```

#### Update Package
```javascript
const updates = {
  id: "1",
  name: "Updated Package Name",
  base_price: 349.00
};

const response = await fetch('/api/packages.php', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});
```

---

## Logging & Debugging

### Error Logging
- All API requests are logged with method and URI
- Detailed error information includes file, line, and stack trace
- JSON parsing errors are captured and reported
- Database errors include SQL error codes and messages

### Debug Information
Error responses include debug information in development:
```json
{
  "success": false,
  "error": "Server error message",
  "debug": {
    "file": "packages.php",
    "line": 123,
    "method": "POST"
  }
}
```

---

## Security Considerations

### Input Validation
- JSON input is validated for structure and content
- Required fields are enforced
- Package existence is verified before updates/deletes
- SQL injection prevention via prepared statements

### CORS Configuration
- Currently allows all origins (`*`)
- Consider restricting to specific domains in production
- Supports all standard HTTP methods

---

## Performance Notes

### Query Optimization
- Amenities are loaded separately to avoid N+1 queries
- Room options use LEFT JOINs for optional relationships
- Indexes recommended on frequently queried fields

### Caching Recommendations
- Consider caching package lists for public endpoints
- Room availability checks may benefit from Redis caching
- Package types endpoint is ideal for caching due to low change frequency

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Basic CRUD operations |
| 2.0 | Current | Added room relationships, amenities integration, availability checking |

---

## ✅ Multiple Room Implementation Status

### **FULLY IMPLEMENTED** (December 14, 2025)

The packages API now supports complete multiple room functionality through the `package_rooms` junction table and enhanced schema:

#### **New Database Features**
- **`package_rooms` Table**: Junction table supporting many-to-many package-room relationships
- **Enhanced Packages Schema**: Added `room_selection_type`, `allow_room_upgrades`, `upgrade_price_calculation` fields
- **Price Adjustments**: Support for both fixed amount and percentage-based room upgrades
- **Priority System**: Room selection priority ordering for availability
- **Default Rooms**: Each package can designate default room options

#### **Room Selection Types**
1. **`single`**: Package tied to one specific room (traditional)
2. **`multiple`**: Customers can choose from available room options
3. **`upgrade`**: Base room with optional upgrades available

#### **Price Calculation Methods**
- **`fixed`**: Add/subtract fixed amount to base price
- **`percentage`**: Calculate percentage-based price adjustments
- **`per_night`**: Per-night calculation for longer stays

#### **Database Views Available**
- **`package_room_options`**: Complete package-room combinations with calculated prices
- **`package_room_stats`**: Statistical summary of package room options and pricing

#### **Sample Implementation**
The system includes sample data with real package-room relationships:
- Romance Package: Base + upgrade options with fixed pricing
- Family Package: Multiple room choices with occupancy overrides
- Business Package: Percentage-based upgrade pricing
- Wellness Package: Mixed pricing strategies

---

## Related Documentation
- [Room & Package Relationship](../readme/room&package.md)
- [Marriott Design Implementation](marriott-design-implementation.md)
- [Booking Flow Documentation](../readme/BOOKING_FLOW_DOCUMENTATION.md)
- [Package Room Relationships Schema](../database/package-room-relationships.sql)