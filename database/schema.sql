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

-- Insert sample rooms
INSERT INTO rooms (id, name, type, price, capacity, description, size, beds, features, amenities, images) VALUES
('villa-deluxe', 'Villa Deluxe', 'Deluxe Villa', 150.00, 4, 'Luxurious villa with stunning ocean views', '45 sqm', '1 King Bed', '["Ocean View", "Private Balcony", "Air Conditioning", "Mini Bar"]', '["WiFi", "TV", "Safe", "Minibar"]', '["https://example.com/villa1.jpg"]'),
('ocean-suite', 'Ocean Suite', 'Suite', 200.00, 2, 'Elegant suite overlooking the ocean', '55 sqm', '1 King Bed', '["Ocean View", "Living Area", "Kitchenette", "Jacuzzi"]', '["WiFi", "TV", "Safe", "Kitchen"]', '["https://example.com/suite1.jpg"]'),
('garden-room', 'Garden Room', 'Standard', 100.00, 3, 'Comfortable room with garden view', '35 sqm', '1 Queen Bed + 1 Single', '["Garden View", "Air Conditioning", "Work Desk"]', '["WiFi", "TV", "Safe"]', '["https://example.com/room1.jpg"]');

-- Insert admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@bookingengine.com', 'admin');