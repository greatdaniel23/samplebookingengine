-- Add packages table to the database
-- Run this after the main database setup

USE booking_engine;

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    package_type ENUM('romantic', 'business', 'family', 'luxury', 'weekend', 'holiday', 'spa', 'adventure') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    min_nights INT DEFAULT 1,
    max_nights INT DEFAULT 30,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_guests INT DEFAULT 2,
    includes JSON, -- What's included in the package
    terms TEXT, -- Terms and conditions
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_package_type (package_type),
    INDEX idx_active_dates (is_active, valid_from, valid_until),
    INDEX idx_price (base_price)
);

-- Create package_rooms junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS package_rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    package_id VARCHAR(50) NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    room_priority INT DEFAULT 1, -- 1 = primary choice, 2 = alternative, etc.
    price_override DECIMAL(10,2) NULL, -- Override room price for this package
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_package_room (package_id, room_id),
    INDEX idx_package_id (package_id),
    INDEX idx_room_id (room_id)
);

-- Create package_bookings table for tracking package bookings
CREATE TABLE IF NOT EXISTS package_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    package_id VARCHAR(50) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    package_discount DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    package_extras JSON, -- Additional services/items included
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_package_id (package_id)
);

-- Insert sample packages
INSERT INTO packages (id, name, description, package_type, base_price, discount_percentage, min_nights, max_nights, valid_from, valid_until, max_guests, includes, terms, image_url) VALUES

-- Romantic Package
('romantic-escape', 'Romantic Escape Package', 
'Perfect for couples seeking a romantic getaway. Includes champagne, rose petals, couples spa treatment, and romantic dinner for two.',
'romantic', 150.00, 15.00, 2, 7, '2025-11-01', '2026-02-14', 2,
'["Champagne on arrival", "Rose petals room decoration", "Couples spa treatment (60min)", "Romantic candlelight dinner", "Late checkout (2PM)", "Complimentary breakfast", "Room upgrade (subject to availability)"]',
'Valid for new bookings only. Spa treatment subject to availability. Minimum 2 nights stay required.', 
'/images/packages/romantic-escape.jpg'),

-- Business Package
('business-elite', 'Business Elite Package',
'Designed for business travelers who demand excellence. Premium rooms with work facilities, meeting room access, and business services.',
'business', 75.00, 10.00, 1, 14, '2025-11-01', '2026-12-31', 2,
'["Meeting room access (4 hours)", "Business center facilities", "Express laundry service", "Airport transfer", "Premium breakfast", "Late checkout", "High-speed internet", "Workspace amenities"]',
'Meeting room subject to availability. Airport transfer within 30km radius only.',
'/images/packages/business-elite.jpg'),

-- Family Fun Package
('family-adventure', 'Family Adventure Package',
'Ultimate family experience with activities for all ages. Kids eat free, family entertainment, and special amenities for children.',
'family', 200.00, 20.00, 3, 10, '2025-11-01', '2026-08-31', 6,
'["Kids eat free (under 12)", "Family game room access", "Swimming pool activities", "Kids welcome gift", "Baby crib (if needed)", "Family movie night", "Ice cream treats", "Extra towels and amenities"]',
'Kids eat free applies to hotel restaurant only. Maximum 2 children under 12 per booking.',
'/images/packages/family-adventure.jpg'),

-- Luxury Spa Package
('luxury-spa-retreat', 'Luxury Spa Retreat',
'Indulge in ultimate relaxation with premium spa treatments, gourmet dining, and luxury accommodations.',
'luxury', 300.00, 25.00, 2, 5, '2025-11-01', '2026-12-31', 4,
'["Full body massage (90min)", "Facial treatment (60min)", "Spa access all day", "Gourmet dinner", "Premium room upgrade", "Spa robe and slippers", "Healthy breakfast", "Meditation session"]',
'Spa treatments must be booked in advance. Package valid for luxury rooms only.',
'/images/packages/luxury-spa-retreat.jpg'),

-- Weekend Getaway Package
('weekend-special', 'Weekend Special Package',
'Perfect weekend escape with great value pricing and entertainment options for a short but memorable stay.',
'weekend', 80.00, 12.00, 2, 3, '2025-11-01', '2026-12-31', 4,
'["Welcome drink", "Late checkout (1PM)", "Restaurant discount (20%)", "Pool access", "Complimentary breakfast", "Weekend entertainment", "Room service discount"]',
'Valid for Friday-Sunday bookings only. Restaurant discount applies to dinner only.',
'/images/packages/weekend-special.jpg'),

-- Holiday Special Package
('holiday-celebration', 'Holiday Celebration Package',
'Celebrate special occasions and holidays with festive decorations, special meals, and memorable experiences.',
'holiday', 250.00, 18.00, 3, 7, '2025-12-15', '2026-01-15', 6,
'["Holiday room decoration", "Special holiday dinner", "Festive welcome gifts", "Holiday entertainment", "Special desserts", "Photo session", "Holiday breakfast buffet", "Celebration cake"]',
'Available during holiday seasons only. Decoration themes vary by holiday.',
'/images/packages/holiday-celebration.jpg');

-- Link packages to rooms
INSERT INTO package_rooms (package_id, room_id, room_priority, price_override) VALUES

-- Romantic Escape - Luxury rooms preferred
('romantic-escape', 'deluxe-suite', 1, 225.00),
('romantic-escape', 'master-suite', 1, 400.00),
('romantic-escape', 'standard-room', 2, 110.00),

-- Business Elite - Work-friendly rooms
('business-elite', 'deluxe-suite', 1, 240.00),
('business-elite', 'standard-room', 1, 110.00),
('business-elite', 'master-suite', 2, 420.00),

-- Family Adventure - Family-friendly rooms
('family-adventure', 'family-room', 1, 160.00),
('family-adventure', 'deluxe-suite', 2, 230.00),
('family-adventure', 'master-suite', 2, 400.00),

-- Luxury Spa - Premium rooms only  
('luxury-spa-retreat', 'master-suite', 1, 380.00),
('luxury-spa-retreat', 'deluxe-suite', 2, 220.00),

-- Weekend Special - All room types
('weekend-special', 'standard-room', 1, 105.00),
('weekend-special', 'economy-room', 1, 75.00),
('weekend-special', 'family-room', 2, 165.00),
('weekend-special', 'deluxe-suite', 2, 225.00),

-- Holiday Celebration - Festive rooms
('holiday-celebration', 'deluxe-suite', 1, 235.00),
('holiday-celebration', 'master-suite', 1, 400.00),
('holiday-celebration', 'family-room', 2, 170.00);

-- Verification queries
SELECT '=== PACKAGES SETUP COMPLETE ===' as status;
SELECT 'Total Packages:' as info, COUNT(*) as count FROM packages;
SELECT 'Active Packages:' as info, COUNT(*) as count FROM packages WHERE is_active = TRUE;
SELECT 'Package-Room Links:' as info, COUNT(*) as count FROM package_rooms;

-- Show package overview
SELECT '=== PACKAGE OVERVIEW ===' as info;
SELECT 
    p.name as package_name,
    p.package_type as type,
    CONCAT('$', p.base_price, ' (', p.discount_percentage, '% off)') as pricing,
    CONCAT(p.min_nights, '-', p.max_nights, ' nights') as duration,
    COUNT(pr.room_id) as available_rooms
FROM packages p
LEFT JOIN package_rooms pr ON p.id = pr.package_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.package_type, p.base_price, p.discount_percentage, p.min_nights, p.max_nights
ORDER BY p.base_price DESC;