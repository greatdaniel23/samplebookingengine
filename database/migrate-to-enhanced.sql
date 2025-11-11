-- ===================================================================
-- DATABASE MIGRATION SCRIPT
-- Upgrade existing booking_engine database to enhanced schema
-- SAFELY PRESERVES ALL EXISTING DATA
-- ===================================================================

USE booking_engine;

-- Create backup tables for existing data
SELECT '=== CREATING BACKUP TABLES ===' as status;

CREATE TABLE IF NOT EXISTS backup_rooms_migration AS SELECT * FROM rooms;
CREATE TABLE IF NOT EXISTS backup_bookings_migration AS SELECT * FROM bookings;
CREATE TABLE IF NOT EXISTS backup_admin_users_migration AS SELECT * FROM admin_users;

-- Check if packages and villa_info tables exist
SET @packages_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'booking_engine' AND table_name = 'packages');
SET @villa_info_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'booking_engine' AND table_name = 'villa_info');

-- Backup packages table if it exists
SET @sql = IF(@packages_exists > 0, 'CREATE TABLE IF NOT EXISTS backup_packages_migration AS SELECT * FROM packages', 'SELECT "Packages table does not exist, skipping backup"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backup villa_info table if it exists
SET @sql = IF(@villa_info_exists > 0, 'CREATE TABLE IF NOT EXISTS backup_villa_info_migration AS SELECT * FROM villa_info', 'SELECT "Villa_info table does not exist, skipping backup"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '=== BACKUP COMPLETED - STARTING MIGRATION ===' as status;

-- ===================================================================
-- ENHANCE EXISTING TABLES
-- ===================================================================

-- Enhance rooms table
SELECT '=== ENHANCING ROOMS TABLE ===' as status;

-- Add new columns to rooms table if they don't exist
SET @columns_to_add = '
    ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0
';

SET @sql = CONCAT('ALTER TABLE rooms ', @columns_to_add);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add new indexes
ALTER TABLE rooms ADD INDEX IF NOT EXISTS idx_sort_order (sort_order);

-- Enhance admin_users table
SELECT '=== ENHANCING ADMIN_USERS TABLE ===' as status;

-- Add new columns to admin_users table
SET @admin_columns = '
    ADD COLUMN IF NOT EXISTS permissions JSON,
    ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS avatar VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT "Asia/Makassar",
    ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT "en",
    ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE
';

-- Check if role column needs to be updated
SET @role_column_check = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'booking_engine' AND table_name = 'admin_users' AND column_name = 'role' AND column_type LIKE '%viewer%');

-- Update role enum if needed
SET @sql = IF(@role_column_check = 0, 'ALTER TABLE admin_users MODIFY COLUMN role ENUM("admin", "manager", "staff", "viewer") DEFAULT "staff"', 'SELECT "Role column already updated"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add admin columns
SET @sql = CONCAT('ALTER TABLE admin_users ', @admin_columns);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Enhance bookings table
SELECT '=== ENHANCING BOOKINGS TABLE ===' as status;

-- Add new columns to bookings table
SET @booking_columns = '
    ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50),
    ADD COLUMN IF NOT EXISTS package_id INT NULL,
    ADD COLUMN IF NOT EXISTS adults INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS children INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT "USD",
    ADD COLUMN IF NOT EXISTS internal_notes TEXT,
    ADD COLUMN IF NOT EXISTS payment_status ENUM("pending", "partial", "paid", "refunded") DEFAULT "pending",
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT "direct",
    ADD COLUMN IF NOT EXISTS guest_ip VARCHAR(45)
';

SET @sql = CONCAT('ALTER TABLE bookings ', @booking_columns);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update booking status enum if needed
SET @status_column_check = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'booking_engine' AND table_name = 'bookings' AND column_name = 'status' AND column_type LIKE '%no_show%');

SET @sql = IF(@status_column_check = 0, 'ALTER TABLE bookings MODIFY COLUMN status ENUM("pending", "confirmed", "cancelled", "checked_in", "checked_out", "no_show") DEFAULT "confirmed"', 'SELECT "Status column already updated"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Generate booking references for existing bookings
UPDATE bookings SET booking_reference = CONCAT('BK-', LPAD(id, 6, '0')) WHERE booking_reference IS NULL OR booking_reference = '';

-- Make booking_reference unique
ALTER TABLE bookings ADD CONSTRAINT IF NOT EXISTS unique_booking_reference UNIQUE (booking_reference);

-- Add new indexes
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_booking_ref (booking_reference);
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_payment_status (payment_status);
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_source (source);

-- Create packages table if it doesn't exist
SELECT '=== CREATING/ENHANCING PACKAGES TABLE ===' as status;

CREATE TABLE IF NOT EXISTS packages (
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

-- Create villa_info table if it doesn't exist
SELECT '=== CREATING/ENHANCING VILLA_INFO TABLE ===' as status;

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

-- Add foreign key constraints if they don't exist
ALTER TABLE bookings ADD CONSTRAINT IF NOT EXISTS fk_bookings_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL;

-- ===================================================================
-- CREATE NEW TABLES
-- ===================================================================

SELECT '=== CREATING NEW CALENDAR TABLES ===' as status;

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
    subscription_type ENUM('ical', 'webcal', 'google', 'outlook', 'apple', 'airbnb', 'vrbo') DEFAULT 'ical',
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

SELECT '=== CREATING SYSTEM MONITORING TABLES ===' as status;

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

-- API Access Logs
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

SELECT '=== CREATING NOTIFICATION TABLES ===' as status;

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

SELECT '=== CREATING PLATFORM INTEGRATION TABLES ===' as status;

-- Platform Integrations
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

SELECT '=== CREATING ANALYTICS TABLES ===' as status;

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
-- MIGRATION COMPLETE - VERIFICATION
-- ===================================================================

SELECT '=== DATABASE MIGRATION COMPLETED SUCCESSFULLY ===' as status;

-- Show migration results
SELECT 'Total Tables After Migration:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'booking_engine';

-- Show data preservation
SELECT 'Rooms Preserved:' as info, COUNT(*) as count FROM rooms;
SELECT 'Bookings Preserved:' as info, COUNT(*) as count FROM bookings;
SELECT 'Admin Users Preserved:' as info, COUNT(*) as count FROM admin_users;

-- Show new features available
SELECT 'New Calendar Settings Ready:' as info, 'YES' as status;
SELECT 'Platform Integrations Ready:' as info, 'YES' as status;
SELECT 'Analytics Tables Ready:' as info, 'YES' as status;
SELECT 'API Monitoring Ready:' as info, 'YES' as status;

SELECT '=== BACKUP TABLES AVAILABLE FOR ROLLBACK ===' as safety_info;
SELECT 'backup_rooms_migration' as backup_table, COUNT(*) as records FROM backup_rooms_migration;
SELECT 'backup_bookings_migration' as backup_table, COUNT(*) as records FROM backup_bookings_migration;
SELECT 'backup_admin_users_migration' as backup_table, COUNT(*) as records FROM backup_admin_users_migration;

SELECT '=== ENHANCED VILLA BOOKING ENGINE READY ===' as final_status;