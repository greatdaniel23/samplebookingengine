-- Complete Database Setup for Booking Engine
-- This script creates the database, tables, and populates with sample data
-- Run this in phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS booking_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_engine;

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS rooms;

-- Rooms table with improved structure
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    size VARCHAR(100),
    beds VARCHAR(100),
    features JSON,
    amenities JSON,
    images JSON,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_price (price),
    INDEX idx_capacity (capacity),
    INDEX idx_available (available)
);

-- Bookings table with proper relationships
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_room_dates (room_id, check_in, check_out),
    INDEX idx_dates (check_in, check_out),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Admin users table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('admin', 'manager', 'staff') DEFAULT 'admin',
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Insert rooms data
INSERT INTO rooms (id, name, type, price, capacity, description, size, beds, features, amenities, images, available) VALUES

-- Deluxe Suite
('deluxe-suite', 'Deluxe Suite', 'Suite', 250.00, 4, 
'Spacious luxury suite with panoramic city views, separate living area, and premium amenities. Perfect for special occasions and extended stays with elegant furnishings and modern conveniences.', 
'65 sqm', '1 King Bed + Sofa Bed', 
'["City View", "Living Area", "Premium Bathroom", "Work Desk", "Mini Bar", "Walk-in Closet"]', 
'["WiFi", "TV", "Air Conditioning", "Minibar", "Balcony", "Safe"]', 
'[]', TRUE),

-- Standard Room  
('standard-room', 'Standard Room', 'Standard', 120.00, 2,
'Comfortable and well-appointed room with modern amenities. Great value for business and leisure travelers seeking quality accommodation with essential conveniences.',
'30 sqm', '1 Queen Bed',
'["Garden View", "Work Desk", "Premium Bedding", "Ensuite Bathroom", "Reading Area"]',
'["WiFi", "TV", "Air Conditioning", "Safe"]',
'[]', TRUE),

-- Family Room
('family-room', 'Family Room', 'Family', 180.00, 6,
'Spacious family accommodation with separate sleeping areas. Ideal for families with children, featuring kid-friendly amenities and plenty of space for everyone to relax.',
'50 sqm', '1 King Bed + 2 Twin Beds',
'["Family Friendly", "Separate Kids Area", "Large Bathroom", "Play Corner", "Mini Fridge", "Extra Storage"]',
'["WiFi", "TV", "Air Conditioning", "Minibar", "Safe"]',
'[]', TRUE),

-- Master Suite
('master-suite', 'Master Suite', 'Presidential', 450.00, 4,
'Ultimate luxury accommodation with butler service, private terrace, and exclusive amenities. The pinnacle of hospitality excellence with personalized service and premium facilities.',
'95 sqm', '1 King Bed + Living Room',
'["Ocean View", "Private Terrace", "Butler Service", "Jacuzzi", "Dining Area", "Premium Bar", "Walk-in Closet"]',
'["WiFi", "TV", "Air Conditioning", "Spa", "Minibar", "Balcony", "Safe"]',
'[]', TRUE),

-- Economy Room
('economy-room', 'Economy Room', 'Budget', 85.00, 2,
'Clean, comfortable, and affordable accommodation with essential amenities. Perfect for budget-conscious travelers who value quality and cleanliness without compromising on comfort.',
'25 sqm', '1 Double Bed',
'["Compact Design", "Essential Amenities", "Efficient Layout", "Study Area"]',
'["WiFi", "TV", "Air Conditioning"]',
'[]', TRUE);

-- Insert admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash, email, first_name, last_name, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@bookingengine.com', 'System', 'Administrator', 'admin');

-- Insert sample bookings for testing
INSERT INTO bookings (room_id, first_name, last_name, email, phone, check_in, check_out, guests, total_price, special_requests, status) VALUES

-- Current bookings
('deluxe-suite', 'John', 'Smith', 'john.smith@email.com', '+1-555-0101', '2025-11-20', '2025-11-23', 2, 750.00, 'Late check-in requested', 'confirmed'),
('standard-room', 'Maria', 'Garcia', 'maria.garcia@email.com', '+1-555-0102', '2025-11-25', '2025-11-27', 1, 240.00, NULL, 'confirmed'),
('family-room', 'David', 'Johnson', 'david.johnson@email.com', '+1-555-0103', '2025-12-01', '2025-12-05', 4, 720.00, 'Extra towels for children', 'confirmed'),

-- Future bookings
('master-suite', 'Sarah', 'Wilson', 'sarah.wilson@email.com', '+1-555-0104', '2025-11-30', '2025-12-03', 2, 1350.00, 'Champagne welcome package', 'confirmed'),
('economy-room', 'Mike', 'Brown', 'mike.brown@email.com', '+1-555-0105', '2025-11-22', '2025-11-24', 1, 170.00, NULL, 'confirmed'),
('deluxe-suite', 'Lisa', 'Chen', 'lisa.chen@email.com', '+1-555-0106', '2025-12-10', '2025-12-13', 2, 750.00, 'Quiet room preferred', 'confirmed'),

-- Holiday bookings
('standard-room', 'Robert', 'Taylor', 'robert.taylor@email.com', '+1-555-0107', '2025-12-15', '2025-12-18', 2, 360.00, NULL, 'pending'),
('family-room', 'Jennifer', 'Davis', 'jennifer.davis@email.com', '+1-555-0108', '2025-12-20', '2025-12-23', 5, 540.00, 'Baby crib needed', 'confirmed'),
('master-suite', 'William', 'Anderson', 'william.anderson@email.com', '+1-555-0109', '2025-12-24', '2025-12-28', 3, 1800.00, 'New Year celebration package', 'confirmed'),
('deluxe-suite', 'Emily', 'Thompson', 'emily.thompson@email.com', '+1-555-0110', '2025-12-25', '2025-12-30', 4, 1250.00, 'Christmas decoration', 'confirmed');

-- Verification queries
SELECT '=== DATABASE SETUP COMPLETE ===' as status;
SELECT 'Total Rooms:' as info, COUNT(*) as count FROM rooms;
SELECT 'Available Rooms:' as info, COUNT(*) as count FROM rooms WHERE available = TRUE;
SELECT 'Total Bookings:' as info, COUNT(*) as count FROM bookings;
SELECT 'Confirmed Bookings:' as info, COUNT(*) as count FROM bookings WHERE status = 'confirmed';
SELECT 'Admin Users:' as info, COUNT(*) as count FROM admin_users;

-- Show sample data
SELECT '=== ROOM TYPES AND PRICES ===' as info;
SELECT name, type, CONCAT('$', price, ' per night') as price, CONCAT(capacity, ' guests') as capacity FROM rooms ORDER BY price DESC;

SELECT '=== UPCOMING BOOKINGS ===' as info;
SELECT CONCAT(first_name, ' ', last_name) as guest, rooms.name as room, check_in, check_out, status 
FROM bookings 
JOIN rooms ON bookings.room_id = rooms.id 
WHERE check_in >= CURDATE() 
ORDER BY check_in LIMIT 5;