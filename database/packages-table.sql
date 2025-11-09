-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    package_type VARCHAR(50) DEFAULT 'Standard',
    base_price DECIMAL(10,2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    min_nights INT DEFAULT 1,
    max_nights INT DEFAULT 30,
    max_guests INT DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    includes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample packages
INSERT INTO packages (name, description, package_type, base_price, discount_percentage, min_nights, max_nights, max_guests, is_active, includes) VALUES
('Romantic Getaway', 'Perfect for couples seeking a romantic escape with champagne, rose petals, and spa treatments', 'Romance', 299.99, 15, 2, 5, 2, 1, '["Champagne bottle", "Rose petals setup", "Couples massage", "Late checkout"]'),
('Family Adventure', 'Family-friendly package with activities for all ages and special kids amenities', 'Family', 399.99, 20, 3, 7, 6, 1, '["Kids welcome pack", "Family game room access", "Breakfast included", "Activity guide"]'),
('Business Executive', 'Premium package for business travelers with conference facilities and high-speed internet', 'Business', 199.99, 10, 1, 14, 2, 0, '["Meeting room access", "Premium WiFi", "Business center", "Airport transfer"]'),
('Luxury Wellness', 'Ultimate relaxation package with spa treatments, yoga sessions, and healthy dining', 'Wellness', 499.99, 25, 3, 10, 4, 1, '["Daily spa treatment", "Private yoga sessions", "Healthy meal plan", "Meditation guide"]'),
('Adventure Explorer', 'For thrill-seekers with outdoor activities and adventure equipment included', 'Adventure', 349.99, 18, 2, 8, 4, 1, '["Hiking equipment", "Adventure guide", "Outdoor activities", "Energy meals"]');