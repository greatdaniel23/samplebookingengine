# Room Amenities API Deployment Instructions

## 📋 Production Deployment Required

The room amenities functionality requires deploying the new `room-amenities.php` API endpoint to the production server at `api.rumahdaisycantik.com`.

### 🚀 Files to Deploy:

**1. API Endpoint:**
- `api/room-amenities.php` → Deploy to `https://api.rumahdaisycantik.com/room-amenities.php`

**2. Database Setup:**
- Run the SQL script to create the `room_amenities` table on production database
- Alternatively, access `https://api.rumahdaisycantik.com/setup-room-amenities.php` (if deployed)

### 🔧 Database Schema Required:

```sql
CREATE TABLE IF NOT EXISTS `room_amenities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `amenity_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_amenity` (`room_id`, `amenity_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_amenity_id` (`amenity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 🎯 API Endpoints Available:

- `GET /room-amenities.php?room_id=X` - Get amenities for specific room
- `GET /room-amenities.php` - Get all available amenities  
- `GET /room-amenities.php?action=add&room_id=X&amenity_id=Y` - Add amenity to room
- `GET /room-amenities.php?action=remove&id=Z` - Remove room amenity by ID

### ✅ Frontend Updated:

The frontend has been updated to use the production API URLs:
- All room amenities calls now point to `https://api.rumahdaisycantik.com/room-amenities.php`
- Uses the same URL parameter pattern as the existing package-amenities API

### 🔄 Next Steps:

1. Deploy `room-amenities.php` to production server
2. Create the `room_amenities` table in production database  
3. Test the room amenities functionality in the admin panel

Once deployed, the room amenities feature will be fully functional!