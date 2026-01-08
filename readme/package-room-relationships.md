# 🏨 Package-Room Relationships Documentation

**✅ Multi-Room Package Support - IMPLEMENTATION COMPLETE**

*Status: Production-Ready | API Updated: December 14, 2025*

This document explains the implemented multi-room package system that allows packages to connect to multiple rooms, enabling flexible booking options, room upgrades, and dynamic pricing adjustments.

---

## 📋 **Previous Limitations (SOLVED)**

### **What Was Limited Before**
The original `packages` table used a single `base_room_id` field:
```sql
CREATE TABLE `packages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `base_room_id` varchar(50) DEFAULT NULL,  -- Single room connection
  -- ... other fields
);
```

**Previous Problems (Now Solved):**
- ❌ ~~One package = One room only~~ → ✅ **Multiple room options per package**
- ❌ ~~No room options within packages~~ → ✅ **Flexible room selection**
- ❌ ~~No upgrade pricing~~ → ✅ **Dynamic pricing adjustments**
- ❌ ~~Limited flexibility~~ → ✅ **Full upgrade/downgrade system**

---

## ✅ **Implemented Enhanced Structure**

### **1. Package-Room Junction Table**

```sql
-- New table to connect packages to multiple rooms
CREATE TABLE `package_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `room_id` varchar(50) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `price_adjustment` decimal(10,2) DEFAULT 0.00,
  `adjustment_type` enum('fixed', 'percentage') DEFAULT 'fixed',
  `max_occupancy_override` int(11) NULL,
  `availability_priority` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_package_room` (`package_id`, `room_id`),
  FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **2. Enhanced Packages Table**

```sql
-- Add new fields to existing packages table
ALTER TABLE `packages` 
ADD COLUMN `room_selection_type` enum('single', 'multiple', 'upgrade') DEFAULT 'single' AFTER `base_room_id`,
ADD COLUMN `allow_room_upgrades` tinyint(1) DEFAULT 0 AFTER `room_selection_type`,
ADD COLUMN `upgrade_price_calculation` enum('fixed', 'percentage', 'per_night') DEFAULT 'fixed' AFTER `allow_room_upgrades`;
```

---

## 💾 **Implementation Schema**

### **Complete Database Setup (Production-Ready)**

```sql
-- 1. Create package_rooms junction table (idempotent)
CREATE TABLE IF NOT EXISTS `package_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `room_id` varchar(50) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0 COMMENT 'Default room for this package',
  `price_adjustment` decimal(10,2) DEFAULT 0.00 COMMENT 'Price difference from base package price',
  `adjustment_type` enum('fixed', 'percentage') DEFAULT 'fixed' COMMENT 'How price adjustment is calculated',
  `max_occupancy_override` int(11) NULL COMMENT 'Override package max occupancy for this room',
  `availability_priority` int(11) DEFAULT 1 COMMENT 'Room selection priority (1=highest)',
  `is_active` tinyint(1) DEFAULT 1,
  `description` text NULL COMMENT 'Room-specific package description',
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_package_room` (`package_id`, `room_id`),
  KEY `idx_package_id` (`package_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_active_priority` (`is_active`, `availability_priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add foreign keys safely (idempotent)
SET @fk_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'package_rooms' 
                AND CONSTRAINT_NAME = 'package_rooms_ibfk_1');
                
SET @sql = IF(@fk_check = 0,
  'ALTER TABLE `package_rooms` ADD FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE',
  'SELECT "Foreign key package_rooms_ibfk_1 already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'package_rooms' 
                AND CONSTRAINT_NAME = 'package_rooms_ibfk_2');
                
SET @sql = IF(@fk_check = 0,
  'ALTER TABLE `package_rooms` ADD FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE',
  'SELECT "Foreign key package_rooms_ibfk_2 already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Enhance packages table (idempotent)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND COLUMN_NAME = 'room_selection_type');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `packages` ADD COLUMN `room_selection_type` enum(\'single\', \'multiple\', \'upgrade\') DEFAULT \'single\' COMMENT \'single=one room only, multiple=choose from options, upgrade=base+upgrades\' AFTER `base_room_id`',
  'SELECT "Column room_selection_type already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add allow_room_upgrades column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND COLUMN_NAME = 'allow_room_upgrades');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `packages` ADD COLUMN `allow_room_upgrades` tinyint(1) DEFAULT 0 COMMENT \'Allow customers to upgrade rooms\' AFTER `room_selection_type`',
  'SELECT "Column allow_room_upgrades already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add upgrade_price_calculation column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND COLUMN_NAME = 'upgrade_price_calculation');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `packages` ADD COLUMN `upgrade_price_calculation` enum(\'fixed\', \'percentage\', \'per_night\') DEFAULT \'fixed\' COMMENT \'How upgrade prices are calculated\' AFTER `allow_room_upgrades`',
  'SELECT "Column upgrade_price_calculation already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add indexes for performance (idempotent)
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND INDEX_NAME = 'idx_room_selection');

SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE `packages` ADD INDEX `idx_room_selection` (`room_selection_type`)',
  'SELECT "Index idx_room_selection already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND INDEX_NAME = 'idx_allow_upgrades');

SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE `packages` ADD INDEX `idx_allow_upgrades` (`allow_room_upgrades`)',
  'SELECT "Index idx_allow_upgrades already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

### **🛡️ SQL Implementation Features**

**Idempotent Design:**
- ✅ **Safe Re-execution**: Script can run multiple times without errors
- ✅ **Existence Checks**: Uses `INFORMATION_SCHEMA` to check for existing objects
- ✅ **Conditional Logic**: Only creates missing tables, columns, indexes, and constraints
- ✅ **Production Ready**: No risk of "already exists" errors or constraint failures

**Error Prevention:**
- 🔒 **Foreign Key Safety**: Checks existing constraints before adding new ones
- 🔒 **Column Safety**: Validates column existence before ALTER TABLE operations
- 🔒 **Index Safety**: Prevents duplicate index creation
- 🔒 **Prepared Statements**: Dynamic SQL execution for maximum compatibility

---

## 📊 **Package-Room Relationship Types**

### **Type 1: Single Room Package**
```sql
-- Traditional: One package, one room
room_selection_type = 'single'
allow_room_upgrades = 0
```
**Example:** "Honeymoon Package" → Villa 1 only

### **Type 2: Multiple Room Options**
```sql
-- Customer chooses from available rooms
room_selection_type = 'multiple'
allow_room_upgrades = 0
```
**Example:** "Family Package" → Choose from Villa 2, Villa 3, or Villa 6

### **Type 3: Base + Upgrade Options**
```sql
-- Base room with upgrade options
room_selection_type = 'upgrade'
allow_room_upgrades = 1
```
**Example:** "Wellness Package" → Base: Villa 2 (+$0) → Upgrade: Pool Villa (+$50/night)

---

## 🔧 **Implementation Examples**

### **🌐 API Configuration Status**

**✅ All API Endpoints Updated to use `api.rumahdaisycantik.com`**

**Files Updated:**
- `api/packages.php` - Enhanced with multi-room support
- `src/components/admin/PackageCalendarManager.tsx` - Updated API calls
- `src/config/paths.ts` - Centralized configuration
- All frontend components now use `paths.buildApiUrl()` helper

**API Endpoints:**
```
https://api.rumahdaisycantik.com/packages.php - Package management
https://api.rumahdaisycantik.com/packages.php?id=1&include_rooms=true - Multi-room data
https://api.rumahdaisycantik.com/packages.php?id=1&action=check_availability&checkin=2025-12-15&checkout=2025-12-17 - Availability
https://api.rumahdaisycantik.com/package-rooms.php - Package-room relationship management
https://api.rumahdaisycantik.com/package-rooms.php?package_id=1 - Get rooms for package
```

### **🗃️ SQL File Location**

**Complete Implementation:** `database/package-room-relationships.sql`

This file contains the full idempotent SQL script that can be safely executed in production:

```bash
# To execute the SQL script:
mysql -u your_username -p your_database < database/package-room-relationships.sql
```

### **Sample Data Setup**

```sql
-- Example 1: Romance Package with multiple room options
INSERT INTO package_rooms (package_id, room_id, is_default, price_adjustment, adjustment_type, availability_priority) VALUES
(1, 'pool-view-family-villa', 1, 0.00, 'fixed', 1),           -- Default room
(1, 'deluxe-suite', 0, 25.00, 'fixed', 2),                   -- +$25 upgrade
(1, 'cosy-villa', 0, -15.00, 'fixed', 3);                    -- -$15 budget option

-- Example 2: Family Package with room choices
INSERT INTO package_rooms (package_id, room_id, is_default, price_adjustment, adjustment_type, max_occupancy_override) VALUES
(2, 'family-room', 1, 0.00, 'fixed', 6),                     -- Default for families
(2, 'pool-view-family-villa', 0, 30.00, 'fixed', 8);        -- Larger family option

-- Example 3: Business Package with percentage upgrades
INSERT INTO package_rooms (package_id, room_id, is_default, price_adjustment, adjustment_type) VALUES
(3, 'deluxe-suite', 1, 0.00, 'fixed'),                       -- Base business room
(3, '423523423434', 0, 20.00, 'percentage');                 -- +20% for premium villa

-- Update packages table
UPDATE packages SET 
  room_selection_type = 'upgrade', 
  allow_room_upgrades = 1, 
  upgrade_price_calculation = 'fixed' 
WHERE id IN (1, 2);

UPDATE packages SET 
  room_selection_type = 'upgrade', 
  allow_room_upgrades = 1, 
  upgrade_price_calculation = 'percentage' 
WHERE id = 3;
```

### **🚀 Deployment Notes**

**Production Checklist:**
- ✅ Script is fully idempotent (can run multiple times safely)
- ✅ Foreign key constraints handled with existence checks
- ✅ All database objects created conditionally
- ✅ No "already exists" errors possible
- ✅ Backward compatible with existing data
- ✅ **API Configuration**: All endpoints target `api.rumahdaisycantik.com`
- ✅ **Frontend Integration**: Components use centralized `paths.buildApiUrl()`
- ✅ **Multi-Room Support**: Enhanced packages API with room options

**Rollback Safety:**
- The schema additions are non-destructive
- Existing `packages.base_room_id` field remains untouched
- Can be safely rolled back by dropping the new table and columns

---

## 🚀 **API Integration**

### **Enhanced API Endpoints**

#### **1. Get Package with Room Options**
```http
GET https://api.rumahdaisycantik.com/packages.php?id=1&include_rooms=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Romance Package",
    "base_price": 450.00,
    "room_selection_type": "upgrade",
    "allow_room_upgrades": true,
    "available_rooms": [
      {
        "room_id": "pool-view-family-villa",
        "room_name": "Pool View Family Villa",
        "is_default": true,
        "price_adjustment": 0.00,
        "final_price": 450.00,
        "adjustment_type": "fixed",
        "max_occupancy": 2,
        "availability_priority": 1
      },
      {
        "room_id": "deluxe-suite",
        "room_name": "Pool Side Villa",
        "is_default": false,
        "price_adjustment": 25.00,
        "final_price": 475.00,
        "adjustment_type": "fixed",
        "max_occupancy": 2,
        "availability_priority": 2
      }
    ]
  }
}
```

#### **2. Check Room Availability for Package**
```http
GET https://api.rumahdaisycantik.com/packages.php?id=1&action=check_availability&checkin=2025-12-15&checkout=2025-12-17
```

#### **3. Package-Room Relationship Management**
```http
# Get rooms for a package
GET https://api.rumahdaisycantik.com/package-rooms.php?package_id=1

# Get packages for a room
GET https://api.rumahdaisycantik.com/package-rooms.php?room_id=deluxe-suite

# Add room to package
POST https://api.rumahdaisycantik.com/package-rooms.php
{
  "package_id": 1,
  "room_id": "deluxe-suite",
  "is_default": false,
  "price_adjustment": 25.00,
  "adjustment_type": "fixed",
  "availability_priority": 2
}

# Update room relationship
PUT https://api.rumahdaisycantik.com/package-rooms.php?id=1
{
  "price_adjustment": 30.00,
  "is_default": true
}

# Remove room from package
DELETE https://api.rumahdaisycantik.com/package-rooms.php?id=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "package_id": 1,
    "checkin": "2025-12-15",
    "checkout": "2025-12-17",
    "nights": 2,
    "available_rooms": [
      {
        "room_id": "pool-view-family-villa",
        "available": true,
        "total_price": 900.00
      },
      {
        "room_id": "deluxe-suite", 
        "available": true,
        "total_price": 950.00
      }
    ]
  }
}
```

---

## 💻 **Frontend Integration**

### **React Component Updates**

#### **Package Selection with Room Options**
```tsx
interface PackageWithRooms extends Package {
  room_selection_type: 'single' | 'multiple' | 'upgrade';
  allow_room_upgrades: boolean;
  available_rooms: Array<{
    room_id: string;
    room_name: string;
    is_default: boolean;
    price_adjustment: number;
    final_price: number;
    adjustment_type: 'fixed' | 'percentage';
    max_occupancy: number;
  }>;
}

const PackageCard: React.FC<{ package: PackageWithRooms }> = ({ package: pkg }) => {
  const [selectedRoom, setSelectedRoom] = useState(
    pkg.available_rooms.find(room => room.is_default)?.room_id || pkg.available_rooms[0]?.room_id
  );
  
  const selectedRoomData = pkg.available_rooms.find(room => room.room_id === selectedRoom);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{pkg.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{pkg.description}</p>
      </CardHeader>
      
      <CardContent>
        {/* Room Selection */}
        {pkg.room_selection_type !== 'single' && pkg.available_rooms.length > 1 && (
          <div className="mb-4">
            <Label>Choose Your Room</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pkg.available_rooms.map(room => (
                  <SelectItem key={room.room_id} value={room.room_id}>
                    <div className="flex justify-between w-full">
                      <span>{room.room_name}</span>
                      <span className="font-medium">
                        ${room.final_price}
                        {!room.is_default && (
                          <span className="text-sm text-muted-foreground ml-1">
                            ({room.price_adjustment > 0 ? '+' : ''}${room.price_adjustment})
                          </span>
                        )}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Price Display */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">
            ${selectedRoomData?.final_price || pkg.base_price}
            <span className="text-sm text-muted-foreground">/night</span>
          </span>
          {selectedRoomData && !selectedRoomData.is_default && (
            <Badge variant="secondary">
              {selectedRoomData.price_adjustment > 0 ? 'Upgrade' : 'Budget Option'}
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={() => handleBookPackage(pkg.id, selectedRoom)}
          className="w-full"
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};
```

---

## 🔍 **Benefits of Multi-Room Packages**

### **For Customers**
- ✅ **Room Choice Flexibility** - Select preferred room type
- ✅ **Upgrade Options** - Choose budget or luxury variations
- ✅ **Clear Pricing** - Transparent upgrade costs
- ✅ **Better Matching** - Find room that fits group size

### **For Business**
- ✅ **Increased Revenue** - Upselling opportunities
- ✅ **Better Inventory Management** - Utilize different room types
- ✅ **Marketing Flexibility** - One package, multiple price points
- ✅ **Competitive Advantage** - More booking options than competitors

---

## 📈 **Migration Strategy**

### **Phase 1: Database Setup**
1. Create `package_rooms` table
2. Add new fields to `packages` table
3. Migrate existing `base_room_id` data

### **Phase 2: API Updates**
1. Enhance packages API endpoints
2. Add room availability checking
3. Update booking flow

### **Phase 3: Frontend Integration**
1. Update package cards with room selection
2. Enhance booking forms
3. Add room upgrade UI

### **Migration Script**
```sql
-- Migrate existing package-room relationships
INSERT INTO package_rooms (package_id, room_id, is_default, price_adjustment, adjustment_type, availability_priority)
SELECT id, base_room_id, 1, 0.00, 'fixed', 1 
FROM packages 
WHERE base_room_id IS NOT NULL;

-- Update packages to use new system
UPDATE packages 
SET room_selection_type = 'single', 
    allow_room_upgrades = 0 
WHERE base_room_id IS NOT NULL;
```

---

## 🎯 **Use Cases & Examples**

### **Romance Package**
- **Base:** Pool View Villa ($450/night)
- **Upgrade:** Private Pool Villa (+$75/night)
- **Premium:** Jungle View Villa (+$125/night)

### **Family Package**  
- **Standard:** Family Room - 4 guests ($350/night)
- **Deluxe:** Pool Side Villa - 6 guests (+$50/night)
- **Premium:** Pool View Family Villa - 8 guests (+$100/night)

### **Business Package**
- **Essential:** Cosy Villa ($300/night) 
- **Executive:** Deluxe Suite (+25%)
- **VIP:** Private Pool Villa (+50%)

This multi-room package system provides the flexibility needed for a modern villa booking platform while maintaining data integrity and performance! 🚀