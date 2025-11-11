-- ===================================================================
-- CALENDAR & SYSTEM TABLES WITH INITIAL DATA
-- Villa Booking Engine Enhanced Database Part 2
-- ===================================================================

USE booking_engine;

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

-- Insert calendar settings
INSERT INTO calendar_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('sync_frequency_default', '15', 'integer', 'Default calendar sync frequency in minutes', 'calendar', TRUE),
('timezone_default', 'Asia/Makassar', 'string', 'Default timezone for calendar events', 'calendar', TRUE),
('ical_calendar_name', 'Villa Daisy Cantik Bookings', 'string', 'Default calendar name for iCal exports', 'calendar', TRUE),
('enable_webcal_protocol', 'true', 'boolean', 'Enable WebCal protocol for calendar subscriptions', 'calendar', TRUE),
('calendar_sync_enabled', 'true', 'boolean', 'Master switch for calendar synchronization', 'calendar', FALSE),
('export_guest_details', 'true', 'boolean', 'Include guest details in calendar exports', 'calendar', FALSE),
('event_duration_buffer', '30', 'integer', 'Buffer time in minutes for calendar events', 'calendar', TRUE),
('calendar_color_scheme', '{"confirmed": "#22c55e", "pending": "#f59e0b", "cancelled": "#ef4444"}', 'json', 'Color scheme for different booking statuses', 'calendar', TRUE);

-- Calendar Subscriptions tracking
CREATE TABLE calendar_subscriptions (
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

-- Insert sample calendar subscriptions
INSERT INTO calendar_subscriptions (subscription_token, subscriber_email, subscriber_name, subscription_type, filter_status, active) VALUES
('cal_sub_admin_123456789', 'admin@villadaisycantik.com', 'System Administrator', 'ical', 'all', TRUE),
('cal_sub_manager_987654321', 'manager@villadaisycantik.com', 'Villa Manager', 'google', 'confirmed', TRUE),
('cal_sub_airbnb_abc123def456', 'sync@airbnb.com', 'Airbnb Integration', 'airbnb', 'confirmed', TRUE);

-- ===================================================================
-- API & SYSTEM MONITORING TABLES
-- ===================================================================

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

-- Insert system configuration
INSERT INTO system_config (config_key, config_value, config_type, description, category, is_sensitive, environment) VALUES
('app_name', 'Villa Daisy Cantik Booking Engine', 'string', 'Application name', 'general', FALSE, 'all'),
('app_version', '2.0.0', 'string', 'Current application version', 'general', FALSE, 'all'),
('debug_mode_dev', 'true', 'boolean', 'Enable debug mode', 'system', FALSE, 'development'),
('debug_mode_prod', 'false', 'boolean', 'Disable debug mode', 'system', FALSE, 'production'),
('max_booking_advance_days', '365', 'integer', 'Maximum days in advance for bookings', 'booking', FALSE, 'all'),
('min_booking_advance_hours', '24', 'integer', 'Minimum hours in advance for bookings', 'booking', FALSE, 'all'),
('default_currency', 'USD', 'string', 'Default currency for prices', 'payment', FALSE, 'all'),
('supported_currencies', '["USD", "EUR", "IDR", "GBP", "AUD"]', 'json', 'List of supported currencies', 'payment', FALSE, 'all'),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', 'notifications', FALSE, 'all'),
('smtp_host', 'smtp.gmail.com', 'string', 'SMTP server host', 'email', TRUE, 'all'),
('smtp_port', '587', 'integer', 'SMTP server port', 'email', FALSE, 'all'),
('api_rate_limit_requests', '1000', 'integer', 'API rate limit requests per hour', 'api', FALSE, 'all'),
('session_timeout_minutes', '30', 'integer', 'Admin session timeout in minutes', 'security', FALSE, 'all'),
('backup_retention_days', '30', 'integer', 'Database backup retention period', 'backup', FALSE, 'all');

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

-- Insert sample platform integrations
INSERT INTO platform_integrations (platform_name, platform_type, integration_key, api_endpoint, sync_frequency, sync_status, sync_direction, config_data, mapping_rules, active) VALUES

('Airbnb', 'ota', 'airbnb_villa_daisy_001', 'https://api.airbnb.com/v2/', 'hourly', 'active', 'bidirectional',
'{"property_id": "12345678", "host_id": "87654321", "calendar_sync": true, "pricing_sync": false}',
'{"room_mapping": {"master-suite": "room_1", "deluxe-suite": "room_2", "family-room": "room_3"}}', TRUE),

('Booking.com', 'ota', 'booking_com_villa_001', 'https://distribution-xml.booking.com/2.6/', 'daily', 'active', 'export',
'{"hotel_id": "1234567", "username": "villa_daisy", "password": "encrypted_password"}',
'{"status_mapping": {"confirmed": "OK", "cancelled": "CANCELLED"}}', TRUE),

('Google Calendar', 'calendar', 'google_calendar_main', 'https://www.googleapis.com/calendar/v3/', 'realtime', 'active', 'export',
'{"calendar_id": "primary", "client_id": "google_client_id", "client_secret": "encrypted_secret"}',
'{"event_mapping": {"title": "guest_name_room", "description": "booking_details"}}', TRUE),

('VRBO', 'ota', 'vrbo_villa_daisy_001', 'https://ws.homeaway.com/public/', 'daily', 'paused', 'export',
'{"property_id": "9876543", "account_id": "1357911"}',
'{"availability_mapping": {"available": "Y", "booked": "N"}}', FALSE);

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
    
    UNIQUE KEY unique_guest (guest_email),
    INDEX idx_email (guest_email),
    INDEX idx_bookings (total_bookings),
    INDEX idx_revenue (total_revenue),
    INDEX idx_segment (guest_segment)
);

-- ===================================================================
-- SUMMARY AND VERIFICATION
-- ===================================================================

SELECT '=== ENHANCED DATABASE INSTALLATION COMPLETE ===' as status;

-- Show all created tables
SELECT 'Created Tables:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'booking_engine';

-- Show table sizes
SELECT 
    table_name as 'Table Name',
    table_rows as 'Rows',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Size (MB)',
    table_comment as 'Comment'
FROM information_schema.tables 
WHERE table_schema = 'booking_engine'
ORDER BY table_name;

-- Show foreign key relationships
SELECT 
    TABLE_NAME as 'Child Table',
    COLUMN_NAME as 'Foreign Key',
    REFERENCED_TABLE_NAME as 'Parent Table',
    REFERENCED_COLUMN_NAME as 'Referenced Column'
FROM information_schema.KEY_COLUMN_USAGE 
WHERE table_schema = 'booking_engine' 
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

SELECT '=== SYSTEM READY FOR ENHANCED FEATURES ===' as final_status;