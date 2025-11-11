-- ===================================================================
-- COMPLETE ENHANCED DATABASE INSTALLATION
-- Villa Booking Engine with Calendar, iCal, API Tracking, and Analytics
-- ===================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS booking_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_engine;

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS guest_analytics;
DROP TABLE IF EXISTS booking_analytics;
DROP TABLE IF EXISTS platform_sync_history;
DROP TABLE IF EXISTS platform_integrations;
DROP TABLE IF EXISTS booking_notifications;
DROP TABLE IF EXISTS api_access_logs;
DROP TABLE IF EXISTS calendar_subscriptions;
DROP TABLE IF EXISTS calendar_settings;
DROP TABLE IF EXISTS system_config;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS villa_info;
DROP TABLE IF EXISTS rooms;

-- ===================================================================
-- CORE TABLES WITH INITIAL DATA
-- ===================================================================

-- Enhanced Rooms table
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
    seo_title VARCHAR(255),
    seo_description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_price (price),
    INDEX idx_capacity (capacity),
    INDEX idx_available (available),
    INDEX idx_sort_order (sort_order)
);

-- Insert room data
INSERT INTO rooms (id, name, type, price, capacity, description, size, beds, features, amenities, images, available, seo_title, seo_description, sort_order) VALUES

('master-suite', 'Master Suite', 'Presidential', 450.00, 4, 
'Ultimate luxury accommodation with butler service, private terrace, and exclusive amenities. The pinnacle of hospitality excellence with personalized service and premium facilities.', 
'95 sqm', '1 King Bed + Living Room', 
'["Ocean View", "Private Terrace", "Butler Service", "Jacuzzi", "Dining Area", "Premium Bar", "Walk-in Closet"]', 
'["WiFi", "TV", "Air Conditioning", "Spa", "Minibar", "Balcony", "Safe"]', 
'[]', TRUE, 'Master Suite - Ultimate Luxury | Villa Daisy Cantik', 'Experience unparalleled luxury in our Master Suite with ocean views, private terrace, butler service, and premium amenities in Bali.', 1),

('deluxe-suite', 'Deluxe Suite', 'Suite', 250.00, 4, 
'Spacious luxury suite with panoramic city views, separate living area, and premium amenities. Perfect for special occasions and extended stays with elegant furnishings and modern conveniences.', 
'65 sqm', '1 King Bed + Sofa Bed', 
'["City View", "Living Area", "Premium Bathroom", "Work Desk", "Mini Bar", "Walk-in Closet"]', 
'["WiFi", "TV", "Air Conditioning", "Minibar", "Balcony", "Safe"]', 
'[]', TRUE, 'Deluxe Suite - Luxury & Comfort | Villa Daisy Cantik', 'Enjoy spacious luxury in our Deluxe Suite featuring city views, living area, and premium amenities in the heart of Bali.', 2),

('family-room', 'Family Room', 'Family', 180.00, 6,
'Spacious family accommodation with separate sleeping areas. Ideal for families with children, featuring kid-friendly amenities and plenty of space for everyone to relax.',
'50 sqm', '1 King Bed + 2 Twin Beds',
'["Family Friendly", "Separate Kids Area", "Large Bathroom", "Play Corner", "Mini Fridge", "Extra Storage"]',
'["WiFi", "TV", "Air Conditioning", "Minibar", "Safe"]',
'[]', TRUE, 'Family Room - Perfect for Families | Villa Daisy Cantik', 'Spacious family accommodation with separate sleeping areas and kid-friendly amenities for memorable family vacations.', 3),

('standard-room', 'Standard Room', 'Standard', 120.00, 2,
'Comfortable and well-appointed room with modern amenities. Great value for business and leisure travelers seeking quality accommodation with essential conveniences.',
'30 sqm', '1 Queen Bed',
'["Garden View", "Work Desk", "Premium Bedding", "Ensuite Bathroom", "Reading Area"]',
'["WiFi", "TV", "Air Conditioning", "Safe"]',
'[]', TRUE, 'Standard Room - Comfort & Value | Villa Daisy Cantik', 'Comfortable and well-appointed standard room with modern amenities and garden views at excellent value.', 4),

('economy-room', 'Economy Room', 'Budget', 85.00, 2,
'Clean, comfortable, and affordable accommodation with essential amenities. Perfect for budget-conscious travelers who value quality and cleanliness without compromising on comfort.',
'25 sqm', '1 Double Bed',
'["Compact Design", "Essential Amenities", "Efficient Layout", "Study Area"]',
'["WiFi", "TV", "Air Conditioning"]',
'[]', TRUE, 'Economy Room - Budget Friendly | Villa Daisy Cantik', 'Clean and comfortable budget accommodation with essential amenities for value-conscious travelers.', 5);

-- Enhanced Packages table
CREATE TABLE packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    description TEXT,
    inclusions JSON,
    exclusions JSON,
    terms_conditions TEXT,
    images JSON,
    available BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    valid_from DATE,
    valid_until DATE,
    max_guests INT,
    booking_advance_days INT DEFAULT 7,
    cancellation_policy TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_price (price),
    INDEX idx_available (available),
    INDEX idx_featured (featured),
    INDEX idx_valid_dates (valid_from, valid_until),
    INDEX idx_sort_order (sort_order)
);

-- Insert package data
INSERT INTO packages (name, type, price, duration_days, description, inclusions, exclusions, terms_conditions, images, available, featured, valid_from, valid_until, max_guests, booking_advance_days, cancellation_policy, seo_title, seo_description, sort_order) VALUES

('Romantic Getaway', 'Romance', 599.00, 3, 
'Perfect romantic escape with champagne, couples spa treatment, and candlelit dinner. Create unforgettable memories with your loved one in our intimate setting.',
'["Welcome champagne", "Couples spa treatment", "Candlelit dinner", "Room decoration", "Late checkout", "Breakfast in bed"]',
'["Personal expenses", "Additional spa treatments", "Alcoholic beverages during dinner", "Transportation"]',
'Valid for bookings made at least 7 days in advance. Subject to availability. Cannot be combined with other offers.',
'[]', TRUE, TRUE, '2025-01-01', '2025-12-31', 2, 7,
'Free cancellation up to 48 hours before arrival. Cancellations within 48 hours will incur a 50% fee.',
'Romantic Getaway Package | Villa Daisy Cantik Bali', 'Perfect romantic escape package with champagne, spa treatments, and candlelit dinner for couples in Bali.', 1),

('Adventure Explorer', 'Adventure', 899.00, 5,
'Thrilling adventure package including volcano hiking, white water rafting, and traditional village tours. Experience the authentic beauty and culture of Bali.',
'["Volcano hiking tour", "White water rafting", "Village cultural tour", "Traditional lunch", "Photography session", "Adventure gear", "Expert guide"]',
'["Personal travel insurance", "Additional meals", "Shopping expenses", "Optional activities"]',
'Minimum age requirement: 12 years. Good physical condition required. Weather dependent activities.',
'[]', TRUE, TRUE, '2025-01-01', '2025-12-31', 6, 14,
'Cancellation up to 7 days: full refund. 3-7 days: 50% refund. Less than 3 days: no refund.',
'Adventure Explorer Package | Villa Daisy Cantik Bali', 'Thrilling 5-day adventure package with volcano hiking, rafting, and cultural tours in Bali.', 2),

('Wellness Retreat', 'Wellness', 1299.00, 7,
'Complete wellness journey with daily yoga, meditation sessions, spa treatments, and healthy organic meals. Rejuvenate your mind, body, and spirit.',
'["Daily yoga classes", "Meditation sessions", "Full body spa treatments", "Organic meal plan", "Detox program", "Wellness consultation", "Aromatherapy"]',
'["Alcoholic beverages", "Non-organic meal options", "Personal shopping", "Additional spa services"]',
'Suitable for all fitness levels. Dietary restrictions can be accommodated with advance notice.',
'[]', TRUE, FALSE, '2025-01-01', '2025-12-31', 4, 10,
'Free cancellation up to 14 days before arrival. Partial refund available for cancellations 7-14 days prior.',
'Wellness Retreat Package | Villa Daisy Cantik Bali', '7-day complete wellness journey with yoga, meditation, spa treatments, and organic meals in Bali.', 3),

('Cultural Heritage', 'Culture', 749.00, 4,
'Immerse yourself in Balinese culture with temple visits, traditional ceremonies, local artisan workshops, and authentic culinary experiences.',
'["Temple tours", "Traditional ceremony participation", "Artisan workshops", "Cooking classes", "Cultural performances", "Local guide", "Traditional costume rental"]',
'["Ceremony donations", "Additional workshop materials", "Personal purchases", "Extended tours"]',
'Respectful attire required for temple visits. Cultural sensitivity briefing included.',
'[]', TRUE, FALSE, '2025-01-01', '2025-12-31', 8, 7,
'Standard cancellation policy applies. Cultural activities are weather and ceremony schedule dependent.',
'Cultural Heritage Package | Villa Daisy Cantik Bali', '4-day cultural immersion with temple visits, ceremonies, workshops, and authentic Balinese experiences.', 4),

('Family Fun', 'Family', 1199.00, 6,
'Family-oriented package with kid-friendly activities, family spa time, educational tours, and memorable experiences for all ages.',
'["Family activities", "Kids club access", "Family spa session", "Educational tours", "Pool games", "Family photoshoot", "Welcome gifts for children"]',
'["Babysitting services", "Additional kids meals", "Optional excursions", "Personal expenses"]',
'Designed for families with children of all ages. Child safety measures included in all activities.',
'[]', TRUE, TRUE, '2025-01-01', '2025-12-31', 10, 5,
'Family-friendly cancellation policy. Full refund for cancellations due to child illness with medical certificate.',
'Family Fun Package | Villa Daisy Cantik Bali', '6-day family package with kid-friendly activities, spa time, and educational tours for memorable family vacations.', 5);

-- Villa Info table
CREATE TABLE villa_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    check_in_time TIME DEFAULT '15:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'Asia/Makassar',
    language VARCHAR(5) DEFAULT 'en',
    tax_rate DECIMAL(5,2) DEFAULT 10.00,
    service_fee DECIMAL(5,2) DEFAULT 5.00,
    cancellation_policy TEXT,
    house_rules TEXT,
    amenities JSON,
    nearby_attractions JSON,
    images JSON,
    social_media JSON,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert villa info
INSERT INTO villa_info (name, description, address, city, state, country, postal_code, latitude, longitude, phone, email, website, check_in_time, check_out_time, currency, timezone, language, tax_rate, service_fee, cancellation_policy, house_rules, amenities, nearby_attractions, images, social_media, seo_title, seo_description, seo_keywords) VALUES

('Villa Daisy Cantik', 
'Discover the epitome of luxury and tranquility at Villa Daisy Cantik, a premier boutique accommodation nestled in the heart of Ubud, Bali. Our meticulously designed villa offers an authentic Balinese experience with modern comforts, surrounded by lush tropical gardens and rice terraces. Whether you seek adventure, romance, wellness, or cultural immersion, Villa Daisy Cantik provides the perfect sanctuary for an unforgettable Indonesian getaway.',
'Jl. Raya Ubud No. 123, Ubud', 'Ubud', 'Bali', 'Indonesia', '80571', 
-8.5069408, 115.2624495,
'+62 361 123 4567', 'info@villadaisycantik.com', 'https://www.villadaisycantik.com',
'15:00:00', '11:00:00', 'USD', 'Asia/Makassar', 'en', 10.00, 5.00,
'Free cancellation up to 48 hours before arrival. Cancellations within 48 hours will incur a 50% charge. No-shows will be charged the full amount. Refunds will be processed within 7-10 business days.',
'Check-in: 3:00 PM | Check-out: 11:00 AM | No smoking inside rooms | Quiet hours: 10:00 PM - 7:00 AM | Maximum occupancy strictly enforced | Pets not allowed | Pool hours: 6:00 AM - 10:00 PM | Respectful behavior toward staff and other guests | Damage to property will be charged to guest account',
'["Swimming Pool", "Spa Services", "Restaurant", "Free WiFi", "Airport Shuttle", "Bicycle Rental", "Yoga Studio", "Library", "Garden", "Parking", "24/7 Reception", "Room Service", "Laundry Service", "Tour Desk", "Currency Exchange"]',
'["Ubud Monkey Forest (2 km)", "Tegallalang Rice Terraces (5 km)", "Sacred Monkey Forest Sanctuary (1.5 km)", "Ubud Traditional Market (3 km)", "Tegenungan Waterfall (7 km)", "Goa Gajah Temple (6 km)", "Ubud Palace (3 km)", "Campuhan Ridge Walk (4 km)", "Saraswati Temple (3.5 km)", "Blanco Museum (4 km)"]',
'[]',
'{"facebook": "https://facebook.com/villadaisycantik", "instagram": "https://instagram.com/villadaisycantik", "twitter": "https://twitter.com/villadaisycantik", "youtube": "https://youtube.com/villadaisycantik"}',
'Villa Daisy Cantik - Luxury Boutique Accommodation in Ubud, Bali',
'Experience luxury and tranquility at Villa Daisy Cantik, premier boutique accommodation in Ubud, Bali. Authentic Balinese experience with modern comforts, spa services, and cultural immersion.',
'villa bali, ubud accommodation, luxury resort bali, boutique hotel ubud, bali vacation rental, spa resort bali, cultural tours bali, wellness retreat bali, romantic getaway bali');

-- Enhanced Admin Users table
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('admin', 'manager', 'staff', 'viewer') DEFAULT 'staff',
    permissions JSON,
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_changed_at TIMESTAMP NULL,
    must_change_password BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(255),
    phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'Asia/Makassar',
    language VARCHAR(5) DEFAULT 'en',
    email_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (active)
);

-- Insert admin users
INSERT INTO admin_users (username, password_hash, email, first_name, last_name, role, permissions, active, phone, timezone, language, email_notifications) VALUES

('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@villadaisycantik.com', 'System', 'Administrator', 'admin', 
'["all"]', TRUE, '+62 361 123 4567', 'Asia/Makassar', 'en', TRUE),

('villa_manager', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyB6YuVb8gHbe.E7wjrMYQrm6B9ym', 'manager@villadaisycantik.com', 'Kadek', 'Sari', 'manager',
'["bookings", "rooms", "packages", "reports", "calendar"]', TRUE, '+62 361 234 5678', 'Asia/Makassar', 'en', TRUE),

('front_desk', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyB6YuVb8gHbe.E7wjrMYQrm6B9ym', 'frontdesk@villadaisycantik.com', 'Wayan', 'Bagus', 'staff',
'["bookings", "check_in", "check_out", "calendar"]', TRUE, '+62 361 345 6789', 'Asia/Makassar', 'en', TRUE),

('housekeeping', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyB6YuVb8gHbe.E7wjrMYQrm6B9ym', 'housekeeping@villadaisycantik.com', 'Made', 'Dewi', 'staff',
'["bookings_view", "room_status"]', TRUE, '+62 361 456 7890', 'Asia/Makassar', 'en', FALSE),

('finance', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyB6YuVb8gHbe.E7wjrMYQrm6B9ym', 'finance@villadaisycantik.com', 'Nyoman', 'Agus', 'manager',
'["bookings_view", "payments", "reports", "analytics"]', TRUE, '+62 361 567 8901', 'Asia/Makassar', 'en', TRUE);

-- Enhanced Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    package_id INT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    special_requests TEXT,
    internal_notes TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'no_show') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    confirmation_sent BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    source VARCHAR(100) DEFAULT 'direct',
    guest_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    INDEX idx_booking_ref (booking_reference),
    INDEX idx_room_dates (room_id, check_in, check_out),
    INDEX idx_dates (check_in, check_out),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_source (source)
);

-- ===================================================================
-- CONTINUE WITH REMAINING TABLE CREATION...
-- ===================================================================

SELECT '=== CORE TABLES CREATED SUCCESSFULLY ===' as status;