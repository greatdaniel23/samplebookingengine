-- ===================================================================
-- COMPLETE DATABASE SCHEMA FOR VILLA BOOKING ENGINE
-- Includes all tables: Core, Amenities, Packages, Calendar, Analytics
-- ===================================================================
-- Run this in phpMyAdmin or MySQL command line

CREATE DATABASE IF NOT EXISTS booking_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_engine;

-- ===================================================================
-- CORE TABLES
-- ===================================================================

-- Enhanced Rooms table
CREATE TABLE IF NOT EXISTS rooms (
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

-- Enhanced Packages table  
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
    exclusions JSON,
    terms_conditions TEXT,
    images JSON,
    available BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    valid_from DATE,
    valid_until DATE,
    booking_advance_days INT DEFAULT 7,
    cancellation_policy TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (package_type),
    INDEX idx_price (base_price),
    INDEX idx_available (available),
    INDEX idx_featured (featured),
    INDEX idx_valid_dates (valid_from, valid_until),
    INDEX idx_sort_order (sort_order)
);

-- Enhanced Bookings table
CREATE TABLE IF NOT EXISTS bookings (
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

-- Enhanced Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
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
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(5) DEFAULT 'en',
    email_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (active)
);

-- Enhanced Villa Information table
CREATE TABLE IF NOT EXISTS villa_info (
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
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(5) DEFAULT 'en',
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    service_fee DECIMAL(5,2) DEFAULT 0.00,
    cancellation_policy TEXT,
    house_rules TEXT,
    amenities JSON,
    nearby_attractions JSON,
    images JSON,
    social_media JSON,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    rating DECIMAL(2,1) DEFAULT 4.9,
    reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===================================================================
-- AMENITIES SYSTEM TABLES
-- ===================================================================

-- Main Amenities table
CREATE TABLE IF NOT EXISTS amenities (
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

-- Room-Amenities relationship table
CREATE TABLE IF NOT EXISTS room_amenities (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    amenity_id INT(11) NOT NULL,
    is_highlighted TINYINT(1) DEFAULT 0,
    custom_note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_amenity (room_id, amenity_id),
    INDEX idx_room_id (room_id),
    INDEX idx_amenity_id (amenity_id),
    INDEX idx_highlighted (is_highlighted)
);

-- Package-Amenities relationship table
CREATE TABLE IF NOT EXISTS package_amenities (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    package_id INT(11) NOT NULL,
    amenity_id INT(11) NOT NULL,
    is_highlighted TINYINT(1) DEFAULT 0,
    custom_note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_package_amenity (package_id, amenity_id),
    INDEX idx_package_id (package_id),
    INDEX idx_amenity_id (amenity_id),
    INDEX idx_highlighted (is_highlighted)
);

-- ===================================================================
-- CALENDAR & ICAL SUPPORT TABLES
-- ===================================================================

-- Calendar Settings table
CREATE TABLE IF NOT EXISTS calendar_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (setting_key),
    INDEX idx_category (category),
    INDEX idx_public (is_public)
);

-- Calendar Subscriptions tracking
CREATE TABLE IF NOT EXISTS calendar_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_token VARCHAR(255) UNIQUE NOT NULL,
    subscriber_email VARCHAR(255),
    subscriber_name VARCHAR(255),
    subscription_type ENUM('ical', 'webcal', 'google', 'outlook', 'apple') DEFAULT 'ical',
    filter_status VARCHAR(50) DEFAULT 'all',
    filter_room_id VARCHAR(50),
    date_from DATE,
    date_to DATE,
    last_accessed TIMESTAMP NULL,
    access_count INT DEFAULT 0,
    user_agent TEXT,
    ip_address VARCHAR(45),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (filter_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    INDEX idx_token (subscription_token),
    INDEX idx_email (subscriber_email),
    INDEX idx_type (subscription_type),
    INDEX idx_active (active),
    INDEX idx_last_accessed (last_accessed)
);

-- ===================================================================
-- SYSTEM CONFIGURATION & MONITORING TABLES
-- ===================================================================

-- API Access Logs for monitoring and security
CREATE TABLE IF NOT EXISTS api_access_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_headers JSON,
    request_body TEXT,
    response_status INT,
    response_time_ms INT,
    response_size_bytes INT,
    error_message TEXT,
    admin_user_id INT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_endpoint (endpoint),
    INDEX idx_method (method),
    INDEX idx_ip (ip_address),
    INDEX idx_status (response_status),
    INDEX idx_created_at (created_at),
    INDEX idx_user (admin_user_id)
);

-- System Configuration table
CREATE TABLE IF NOT EXISTS system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type ENUM('string', 'integer', 'boolean', 'json', 'encrypted') DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) DEFAULT 'system',
    is_sensitive BOOLEAN DEFAULT FALSE,
    environment ENUM('all', 'development', 'production') DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_key (config_key),
    INDEX idx_category (category),
    INDEX idx_environment (environment),
    INDEX idx_sensitive (is_sensitive)
);

-- ===================================================================
-- NOTIFICATION & COMMUNICATION TABLES
-- ===================================================================

-- Booking Notifications management
CREATE TABLE IF NOT EXISTS booking_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    notification_type ENUM('confirmation', 'reminder', 'check_in', 'check_out', 'cancellation', 'payment', 'custom') NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT,
    template_name VARCHAR(100),
    template_data JSON,
    status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_type (notification_type),
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_recipient (recipient_email)
);

-- ===================================================================
-- PLATFORM INTEGRATION TABLES
-- ===================================================================

-- Platform Integrations (Airbnb, Booking.com, VRBO, etc.)
CREATE TABLE IF NOT EXISTS platform_integrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    platform_name VARCHAR(50) NOT NULL,
    platform_type ENUM('ota', 'calendar', 'payment', 'channel_manager', 'pms') NOT NULL,
    integration_key VARCHAR(255) UNIQUE NOT NULL,
    api_endpoint VARCHAR(255),
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP NULL,
    sync_frequency ENUM('realtime', 'hourly', 'daily', 'weekly', 'manual') DEFAULT 'daily',
    last_sync_at TIMESTAMP NULL,
    sync_status ENUM('active', 'paused', 'error', 'disabled') DEFAULT 'active',
    sync_direction ENUM('import', 'export', 'bidirectional') DEFAULT 'export',
    config_data JSON,
    mapping_rules JSON,
    error_log TEXT,
    sync_stats JSON,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_platform (platform_name),
    INDEX idx_type (platform_type),
    INDEX idx_key (integration_key),
    INDEX idx_sync_status (sync_status),
    INDEX idx_active (active),
    INDEX idx_last_sync (last_sync_at)
);

-- Platform Sync History
CREATE TABLE IF NOT EXISTS platform_sync_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    integration_id INT NOT NULL,
    sync_type ENUM('full', 'incremental', 'manual') DEFAULT 'incremental',
    direction ENUM('import', 'export') NOT NULL,
    entity_type ENUM('booking', 'availability', 'rates', 'property', 'reviews') NOT NULL,
    entity_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    error_count INT DEFAULT 0,
    status ENUM('running', 'completed', 'failed', 'cancelled') DEFAULT 'running',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    error_details JSON,
    sync_summary JSON,
    
    FOREIGN KEY (integration_id) REFERENCES platform_integrations(id) ON DELETE CASCADE,
    INDEX idx_integration (integration_id),
    INDEX idx_type (sync_type),
    INDEX idx_entity (entity_type),
    INDEX idx_status (status),
    INDEX idx_started (started_at)
);

-- ===================================================================
-- ANALYTICS & REPORTING TABLES
-- ===================================================================

-- Booking Analytics
CREATE TABLE IF NOT EXISTS booking_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    room_id VARCHAR(50),
    package_id INT,
    source VARCHAR(100),
    bookings_count INT DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0.00,
    guests_count INT DEFAULT 0,
    avg_stay_duration DECIMAL(4,2) DEFAULT 0.00,
    occupancy_rate DECIMAL(5,2) DEFAULT 0.00,
    cancellation_count INT DEFAULT 0,
    no_show_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    UNIQUE KEY unique_daily_analytics (date, room_id, package_id, source),
    INDEX idx_date (date),
    INDEX idx_room (room_id),
    INDEX idx_package (package_id),
    INDEX idx_source (source)
);

-- Guest Analytics
CREATE TABLE IF NOT EXISTS guest_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_email VARCHAR(255) NOT NULL,
    total_bookings INT DEFAULT 1,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_nights INT DEFAULT 0,
    favorite_room_type VARCHAR(100),
    avg_advance_booking_days INT DEFAULT 0,
    last_booking_date DATE,
    guest_segment ENUM('new', 'returning', 'vip', 'frequent') DEFAULT 'new',
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_guest (guest_email),
    INDEX idx_email (guest_email),
    INDEX idx_bookings (total_bookings),
    INDEX idx_revenue (total_revenue),
    INDEX idx_segment (guest_segment)
);

-- ===================================================================
-- SAMPLE DATA INSERTS
-- ===================================================================

-- Insert sample rooms
INSERT INTO rooms (id, name, type, price, capacity, description, size, beds, features, amenities, images, sort_order) VALUES
('deluxe-suite', 'Deluxe Suite', 'Suite', 250.00, 4, 'Spacious luxury suite with panoramic city views, separate living area, and premium amenities. Perfect for special occasions and extended stays.', '65 sqm', '1 King Bed + Sofa Bed', '["City View", "Living Area", "Premium Bathroom", "Work Desk", "Mini Bar"]', '["WiFi", "TV", "Air Conditioning", "Minibar", "Balcony"]', '[]', 1),

('standard-room', 'Standard Room', 'Standard', 120.00, 2, 'Comfortable and well-appointed room with modern amenities. Great value for business and leisure travelers.', '30 sqm', '1 Queen Bed', '["Garden View", "Work Desk", "Premium Bedding", "Ensuite Bathroom"]', '["WiFi", "TV", "Air Conditioning"]', '[]', 2),

('family-room', 'Family Room', 'Family', 180.00, 6, 'Spacious family accommodation with separate sleeping areas. Ideal for families with children, featuring kid-friendly amenities.', '50 sqm', '1 King Bed + 2 Twin Beds', '["Family Friendly", "Separate Kids Area", "Large Bathroom", "Play Area", "Mini Fridge"]', '["WiFi", "TV", "Air Conditioning", "Minibar"]', '[]', 3),

('master-suite', 'Master Suite', 'Presidential', 450.00, 4, 'Ultimate luxury accommodation with butler service, private terrace, and exclusive amenities. The pinnacle of hospitality excellence.', '95 sqm', '1 King Bed + Living Room', '["Ocean View", "Private Terrace", "Butler Service", "Jacuzzi", "Dining Area", "Premium Bar"]', '["WiFi", "TV", "Air Conditioning", "Spa", "Minibar", "Balcony"]', '[]', 4),

('economy-room', 'Economy Room', 'Budget', 85.00, 2, 'Clean, comfortable, and affordable accommodation with essential amenities. Perfect for budget-conscious travelers.', '25 sqm', '1 Double Bed', '["Compact Design", "Essential Amenities", "Efficient Layout"]', '["WiFi", "TV"]', '[]', 5);

-- Insert sample packages
INSERT INTO packages (name, description, package_type, base_price, discount_percentage, min_nights, max_nights, max_guests, is_active, includes) VALUES
('Romantic Getaway', 'Perfect for couples seeking a romantic escape with champagne, rose petals, and spa treatments', 'Romance', 299.99, 15, 2, 5, 2, 1, '["Champagne bottle", "Rose petals setup", "Couples massage", "Late checkout"]'),
('Family Adventure', 'Family-friendly package with activities for all ages and special kids amenities', 'Family', 399.99, 20, 3, 7, 6, 1, '["Kids welcome pack", "Family game room access", "Breakfast included", "Activity guide"]'),
('Business Executive', 'Premium package for business travelers with conference facilities and high-speed internet', 'Business', 199.99, 10, 1, 14, 2, 1, '["Meeting room access", "Premium WiFi", "Business center", "Airport transfer"]'),
('Luxury Wellness', 'Ultimate relaxation package with spa treatments, yoga sessions, and healthy dining', 'Wellness', 499.99, 25, 3, 10, 4, 1, '["Daily spa treatment", "Private yoga sessions", "Healthy meal plan", "Meditation guide"]'),
('Adventure Explorer', 'For thrill-seekers with outdoor activities and adventure equipment included', 'Adventure', 349.99, 18, 2, 8, 4, 1, '["Hiking equipment", "Adventure guide", "Outdoor activities", "Energy meals"]');

-- Insert sample amenities
INSERT INTO amenities (name, category, description, icon, display_order, is_featured) VALUES
-- Room Amenities
('Free WiFi', 'connectivity', 'High-speed wireless internet access', 'wifi', 1, 1),
('Air Conditioning', 'comfort', 'Climate-controlled comfort', 'snowflake', 2, 1),
('Private Bathroom', 'bathroom', 'En-suite bathroom with modern fixtures', 'bath', 3, 1),
('Flat Screen TV', 'entertainment', 'Smart TV with cable and streaming', 'tv', 4, 0),
('Mini Fridge', 'appliances', 'Small refrigerator for beverages and snacks', 'refrigerator', 5, 0),
('Coffee Maker', 'appliances', 'In-room coffee and tea making facilities', 'coffee', 6, 0),
('Safe Box', 'security', 'Personal secure storage', 'lock', 7, 0),
('Balcony', 'outdoor', 'Private outdoor space with seating', 'balcony', 8, 1),
('Ocean View', 'view', 'Beautiful ocean views from room', 'waves', 9, 1),
('Garden View', 'view', 'Peaceful garden and landscape views', 'tree', 10, 0),

-- Service Amenities (for packages)
('Airport Transfer', 'transport', 'Complimentary airport pickup and drop-off', 'car', 11, 1),
('Daily Housekeeping', 'service', 'Professional daily cleaning service', 'broom', 12, 0),
('Concierge Service', 'service', '24/7 guest assistance and recommendations', 'bell', 13, 1),
('Welcome Drinks', 'hospitality', 'Complimentary welcome beverages on arrival', 'cocktail', 14, 1),
('Breakfast Included', 'dining', 'Daily breakfast service', 'utensils', 15, 1),
('Spa Treatment', 'wellness', 'Professional spa and massage services', 'spa', 16, 1),
('Yoga Classes', 'wellness', 'Daily yoga and meditation sessions', 'yoga', 17, 0),
('Cultural Tours', 'activities', 'Guided local cultural experiences', 'map', 18, 0),
('Cooking Classes', 'activities', 'Learn traditional local cuisine', 'chef', 19, 0),
('Late Checkout', 'service', 'Extended checkout until 2 PM', 'clock', 20, 0),

-- Villa/Property Amenities
('Swimming Pool', 'recreation', 'Private outdoor swimming pool', 'swimming', 21, 1),
('BBQ Grill', 'outdoor', 'Outdoor barbecue facilities', 'grill', 22, 0),
('Garden', 'outdoor', 'Beautifully landscaped gardens', 'garden', 23, 0),
('Parking', 'transport', 'Free on-site parking', 'parking', 24, 1),
('Beach Access', 'location', 'Direct access to private beach', 'beach', 25, 1),
('Gym/Fitness', 'wellness', 'Fully equipped fitness center', 'dumbbell', 26, 0);

-- Insert sample villa info
INSERT INTO villa_info (name, description, address, city, country, phone, email, amenities, images) VALUES
('Villa Daisy Cantik', 'Luxury beachfront villa with stunning ocean views and premium amenities', 'Jl. Pantai Indah No. 123', 'Bali', 'Indonesia', '+62 361 123456', 'info@villadaisycantik.com', '["Swimming Pool", "Beach Access", "WiFi", "Parking", "Garden"]', '[]');

-- Insert admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email, role, active) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@bookingengine.com', 'admin', 1);

-- Insert basic system configuration
INSERT INTO system_config (config_key, config_value, config_type, description, category) VALUES
('site_name', 'Villa Booking Engine', 'string', 'Website name', 'general'),
('site_email', 'info@villadaisycantik.com', 'string', 'Primary contact email', 'general'),
('currency', 'USD', 'string', 'Default currency', 'general'),
('timezone', 'Asia/Jakarta', 'string', 'Default timezone', 'general'),
('booking_advance_days', '30', 'integer', 'Maximum days in advance for booking', 'booking'),
('max_guests_per_booking', '10', 'integer', 'Maximum guests per booking', 'booking');

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================
SELECT '=== COMPLETE DATABASE SCHEMA CREATED SUCCESSFULLY ===' as STATUS;
SELECT '=== ALL TABLES, RELATIONSHIPS, AND SAMPLE DATA INSERTED ===' as INFO;