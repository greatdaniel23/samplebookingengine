# Villa Amenities

This document outlines the various amenities available at our villa property.

## Categories

### Bedroom & Living
- King Size Bed
- Queen Size Bed
- Single Bed
- Sofa Bed
- Air Conditioning
- Ceiling Fan
- Wardrobe
- Safe
- Balcony
- Private Terrace

### Kitchen & Dining
- Fully Equipped Kitchen
- Refrigerator
- Microwave
- Coffee Maker
- Dining Table
- Kitchenette
- Mini Bar
- Dishwasher
- Oven
- Cooking Utensils

### Bathroom
- Private Bathroom
- Hot Water
- Shower
- Bathtub
- Hair Dryer
- Towels
- Toiletries
- Separate Toilet

### Entertainment & Technology
- WiFi
- Television
- Cable TV
- Bluetooth Speaker
- Sound System
- Gaming Console
- DVD Player

### Pool & Outdoor
- Private Pool
- Shared Pool
- Pool Towels
- Outdoor Furniture
- Garden View
- Pool View
- BBQ Grill
- Outdoor Dining Area
- Sun Loungers
- Gazebo

### Services & Facilities
- Daily Housekeeping
- Laundry Service
- Room Service
- Concierge
- Airport Transfer
- Spa Services
- Massage
- Parking
- Security
- 24/7 Reception

### Special Features
- Romantic Setup
- Honeymoon Package
- Family Friendly
- Pet Friendly
- Business Center
- Conference Room
- Gym Access
- Bike Rental

## Usage Notes

- Amenities may vary by room type and package
- Some amenities may require additional fees
- Availability subject to booking type and season
- Special arrangements can be made upon request

## Technical Implementation

Amenities are managed through:
- Database table: `amenities`
- API endpoints: `/amenities.php`, `/package-amenities.php`
- Package association: `package_amenities` table with display_order
- Admin interface: Amenities Management section in PackagesSection.tsx

### Database Schema
```sql
-- Main amenities table
CREATE TABLE amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT 1,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Package-amenity association table
CREATE TABLE package_amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  amenity_id INT NOT NULL,
  display_order INT DEFAULT 0,
  is_included BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
  UNIQUE KEY unique_package_amenity (package_id, amenity_id)
);
```

### API Endpoints

#### GET /amenities.php
Returns all active amenities:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "WiFi",
      "category": "Technology", 
      "description": "High-speed internet access",
      "icon": "wifi"
    }
  ]
}
```

#### GET /package-amenities.php?package_id=X
Returns amenities for a specific package (excludes internal display_order):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Private Pool",
      "category": "Pool & Outdoor",
      "description": "Exclusive swimming pool",
      "icon": "pool"
    }
  ]
}
```

#### POST /package-amenities.php
Add amenity to package:
```json
{
  "package_id": 1,
  "amenity_id": 5,
  "display_order": 1
}
```

#### DELETE /package-amenities.php
Remove amenity from package:
```json
{
  "package_id": 1,
  "amenity_id": 5
}
```

### Security Features
- Input validation and sanitization
- SQL injection prevention using prepared statements
- Error handling with user-friendly messages
- Field filtering to prevent internal data leakage (display_order excluded from API responses)

### Admin Interface Integration
- Real-time amenity management in PackagesSection.tsx
- Drag-and-drop reordering capability
- Visual feedback for add/remove operations
- Automatic refresh after modifications
```