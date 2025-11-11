-- ===================================================================
-- ENHANCED DATABASE SCHEMA FOR VILLA BOOKING ENGINE
-- Supporting Calendar, iCal, API Tracking, and Platform Integrations
-- ===================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS booking_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_engine;

-- ===================================================================
-- CORE TABLES (Enhanced versions of existing tables)
-- ===================================================================

-- Enhanced Rooms table with SEO and media support
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS villa_info;
DROP TABLE IF EXISTS rooms;

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

-- Enhanced Bookings table with payment and status tracking
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

-- Enhanced Villa Info table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Enhanced Admin Users table with permissions
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

-- ===================================================================
-- CALENDAR & ICAL SUPPORT TABLES
-- ===================================================================

-- Calendar Settings table
CREATE TABLE calendar_settings (
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
CREATE TABLE calendar_subscriptions (
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
-- API & SYSTEM MONITORING TABLES
-- ===================================================================

-- API Access Logs for monitoring and security
CREATE TABLE api_access_logs (
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
CREATE TABLE system_config (
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
CREATE TABLE booking_notifications (
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
CREATE TABLE platform_integrations (
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
CREATE TABLE platform_sync_history (
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
CREATE TABLE booking_analytics (
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
CREATE TABLE guest_analytics (
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
    
    PRIMARY KEY (id),
    UNIQUE KEY unique_guest (guest_email),
    INDEX idx_email (guest_email),
    INDEX idx_bookings (total_bookings),
    INDEX idx_revenue (total_revenue),
    INDEX idx_segment (guest_segment)
);

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Show all created tables
SELECT '=== ENHANCED DATABASE SCHEMA CREATED ===' as status;
SHOW TABLES;

SELECT '=== TABLE COUNTS ===' as info;
SELECT 
    table_name as 'Table Name',
    table_rows as 'Row Count',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'booking_engine'
ORDER BY table_name;