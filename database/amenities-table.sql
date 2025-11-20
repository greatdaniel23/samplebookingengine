-- ====================================================
-- AMENITIES TABLE SYSTEM CREATION
-- ====================================================
-- Project: Villa Booking Engine
-- Date: November 17, 2025
-- Purpose: Create amenities management system with relationships

-- ====================================================
-- 1. MAIN AMENITIES TABLE
-- ====================================================
CREATE TABLE amenities (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    description TEXT,
    icon VARCHAR(100),
    display_order INT(11) DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    INDEX idx_display_order (display_order)
);

-- ====================================================
-- 2. ROOM-AMENITIES RELATIONSHIP TABLE
-- ====================================================
CREATE TABLE room_amenities (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    amenity_id INT(11) NOT NULL,
    is_highlighted TINYINT(1) DEFAULT 0,
    custom_note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicates
    UNIQUE KEY unique_room_amenity (room_id, amenity_id),
    
    -- Indexes
    INDEX idx_room_id (room_id),
    INDEX idx_amenity_id (amenity_id),
    INDEX idx_highlighted (is_highlighted)
);

-- ====================================================
-- 3. PACKAGE-AMENITIES RELATIONSHIP TABLE
-- ====================================================
CREATE TABLE package_amenities (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    package_id INT(11) NOT NULL,
    amenity_id INT(11) NOT NULL,
    is_highlighted TINYINT(1) DEFAULT 0,
    custom_note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicates
    UNIQUE KEY unique_package_amenity (package_id, amenity_id),
    
    -- Indexes
    INDEX idx_package_id (package_id),
    INDEX idx_amenity_id (amenity_id),
    INDEX idx_highlighted (is_highlighted)
);

-- ====================================================
-- 4. INSERT SAMPLE AMENITIES DATA
-- ====================================================

-- Room Amenities
INSERT INTO amenities (name, category, description, icon, display_order, is_featured) VALUES
('Free WiFi', 'connectivity', 'High-speed wireless internet access', 'wifi', 1, 1),
('Air Conditioning', 'comfort', 'Climate-controlled comfort', 'snowflake', 2, 1),
('Private Bathroom', 'bathroom', 'En-suite bathroom with modern fixtures', 'bath', 3, 1),
('Flat Screen TV', 'entertainment', 'Smart TV with cable and streaming', 'tv', 4, 0),
('Mini Fridge', 'appliances', 'Small refrigerator for beverages and snacks', 'refrigerator', 5, 0),
('Coffee Maker', 'appliances', 'In-room coffee and tea making facilities', 'coffee', 6, 0),
('Safe Box', 'security', 'Personal secure storage', 'lock', 7, 0),
('Balcony', 'outdoor', 'Private outdoor space with seating', 'balcony', 8, 1),
('Ocean View', 'view', 'Beautiful ocean views from room', 'waves', 9, 1),
('Garden View', 'view', 'Peaceful garden and landscape views', 'tree', 10, 0);

-- Service Amenities (for packages)
INSERT INTO amenities (name, category, description, icon, display_order, is_featured) VALUES
('Airport Transfer', 'transport', 'Complimentary airport pickup and drop-off', 'car', 11, 1),
('Daily Housekeeping', 'service', 'Professional daily cleaning service', 'broom', 12, 0),
('Concierge Service', 'service', '24/7 guest assistance and recommendations', 'bell', 13, 1),
('Welcome Drinks', 'hospitality', 'Complimentary welcome beverages on arrival', 'cocktail', 14, 1),
('Breakfast Included', 'dining', 'Daily breakfast service', 'utensils', 15, 1),
('Spa Treatment', 'wellness', 'Professional spa and massage services', 'spa', 16, 1),
('Yoga Classes', 'wellness', 'Daily yoga and meditation sessions', 'yoga', 17, 0),
('Cultural Tours', 'activities', 'Guided local cultural experiences', 'map', 18, 0),
('Cooking Classes', 'activities', 'Learn traditional local cuisine', 'chef', 19, 0),
('Late Checkout', 'service', 'Extended checkout until 2 PM', 'clock', 20, 0);

-- Villa/Property Amenities
INSERT INTO amenities (name, category, description, icon, display_order, is_featured) VALUES
('Swimming Pool', 'recreation', 'Private outdoor swimming pool', 'swimming', 21, 1),
('BBQ Grill', 'outdoor', 'Outdoor barbecue facilities', 'grill', 22, 0),
('Garden', 'outdoor', 'Beautifully landscaped gardens', 'garden', 23, 0),
('Parking', 'transport', 'Free on-site parking', 'parking', 24, 1),
('Beach Access', 'location', 'Direct access to private beach', 'beach', 25, 1),
('Gym/Fitness', 'wellness', 'Fully equipped fitness center', 'dumbbell', 26, 0);

-- ====================================================
-- 5. MIGRATE EXISTING AMENITY DATA (OPTIONAL)
-- ====================================================

-- This section helps migrate data from existing longtext amenities fields
-- Run this after the tables are created to preserve existing data

-- Example migration queries (run these manually if needed):
/*
-- For rooms with existing amenities in longtext field:
INSERT INTO room_amenities (room_id, amenity_id, is_highlighted)
SELECT r.id, a.id, 1
FROM rooms r, amenities a
WHERE r.amenities LIKE CONCAT('%', a.name, '%')
AND r.amenities IS NOT NULL;

-- For packages with existing inclusions that match amenities:
INSERT INTO package_amenities (package_id, amenity_id, is_highlighted)
SELECT p.id, a.id, 1
FROM packages p, amenities a
WHERE p.inclusions LIKE CONCAT('%', a.name, '%')
AND p.inclusions IS NOT NULL;
*/

-- ====================================================
-- 6. USEFUL QUERIES FOR AMENITIES SYSTEM
-- ====================================================

-- Get all amenities for a specific room:
/*
SELECT a.*, ra.is_highlighted, ra.custom_note
FROM amenities a
JOIN room_amenities ra ON a.id = ra.amenity_id
WHERE ra.room_id = 'deluxe-suite'
AND a.is_active = 1
ORDER BY a.display_order;
*/

-- Get all amenities for a specific package:
/*
SELECT a.*, pa.is_highlighted, pa.custom_note
FROM amenities a
JOIN package_amenities pa ON a.id = pa.amenity_id
WHERE pa.package_id = 1
AND a.is_active = 1
ORDER BY a.display_order;
*/

-- Get featured amenities:
/*
SELECT * FROM amenities 
WHERE is_featured = 1 AND is_active = 1 
ORDER BY display_order;
*/

-- Get amenities by category:
/*
SELECT * FROM amenities 
WHERE category = 'wellness' AND is_active = 1 
ORDER BY display_order;
*/

-- ====================================================
-- COMPLETION MESSAGE
-- ====================================================
-- Tables created successfully!
-- Next steps:
-- 1. Run this SQL file to create the amenities system
-- 2. Update admin panel to manage amenities
-- 3. Update frontend to display amenities from new tables
-- 4. Optionally migrate existing amenity data from longtext fields