-- Database Schema for Booking Engine
-- Run this in phpMyAdmin or MySQL command line

CREATE DATABASE IF NOT EXISTS booking_engine;
USE booking_engine;

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    amenities JSON,
    images JSON,
    description TEXT,
    size VARCHAR(100),
    beds VARCHAR(100),
    features JSON,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(50) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role ENUM('admin', 'manager') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Villa Information table
CREATE TABLE IF NOT EXISTS villa_info (
    id INT PRIMARY KEY DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 4.9,
    reviews INT DEFAULT 0,
    images JSON,
    amenities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample rooms
INSERT INTO rooms (id, name, type, price, capacity, description, size, beds, features, amenities, images) VALUES
('deluxe-suite', 'Deluxe Suite', 'Suite', 250.00, 4, 'Spacious luxury suite with panoramic city views, separate living area, and premium amenities. Perfect for special occasions and extended stays.', '65 sqm', '1 King Bed + Sofa Bed', '["City View", "Living Area", "Premium Bathroom", "Work Desk", "Mini Bar"]', '["WiFi", "TV", "Air Conditioning", "Minibar", "Balcony"]', '[]'),

('standard-room', 'Standard Room', 'Standard', 120.00, 2, 'Comfortable and well-appointed room with modern amenities. Great value for business and leisure travelers.', '30 sqm', '1 Queen Bed', '["Garden View", "Work Desk", "Premium Bedding", "Ensuite Bathroom"]', '["WiFi", "TV", "Air Conditioning"]', '[]'),

('family-room', 'Family Room', 'Family', 180.00, 6, 'Spacious family accommodation with separate sleeping areas. Ideal for families with children, featuring kid-friendly amenities.', '50 sqm', '1 King Bed + 2 Twin Beds', '["Family Friendly", "Separate Kids Area", "Large Bathroom", "Play Area", "Mini Fridge"]', '["WiFi", "TV", "Air Conditioning", "Minibar"]', '[]'),

('master-suite', 'Master Suite', 'Presidential', 450.00, 4, 'Ultimate luxury accommodation with butler service, private terrace, and exclusive amenities. The pinnacle of hospitality excellence.', '95 sqm', '1 King Bed + Living Room', '["Ocean View", "Private Terrace", "Butler Service", "Jacuzzi", "Dining Area", "Premium Bar"]', '["WiFi", "TV", "Air Conditioning", "Spa", "Minibar", "Balcony"]', '[]'),

('economy-room', 'Economy Room', 'Budget', 85.00, 2, 'Clean, comfortable, and affordable accommodation with essential amenities. Perfect for budget-conscious travelers.', '25 sqm', '1 Double Bed', '["Compact Design", "Essential Amenities", "Efficient Layout"]', '["WiFi", "TV"]', '[]');

-- Insert admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@bookingengine.com', 'admin');