-- Minimal amenities table creation for immediate testing
-- Run this on your production database

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
    
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    INDEX idx_display_order (display_order)
);

-- Insert a few sample amenities for testing
INSERT INTO amenities (name, category, description, icon, display_order, is_featured) VALUES
('Free WiFi', 'connectivity', 'High-speed wireless internet access', 'wifi', 1, 1),
('Air Conditioning', 'comfort', 'Climate-controlled comfort', 'snowflake', 2, 1),
('Swimming Pool', 'recreation', 'Private outdoor swimming pool', 'swimming', 3, 1),
('Airport Transfer', 'transport', 'Complimentary airport pickup and drop-off', 'car', 4, 1),
('Breakfast Included', 'dining', 'Daily breakfast service', 'utensils', 5, 1);