-- =============================================================
-- Incremental Upgrade Script - 2025-11-19
-- Target DB: u289291769_booking (Production)
-- Purpose: Add new feature tables (amenities system, calendar, integrations,
--          analytics) and constraints WITHOUT removing existing data.
-- Safety: Uses IF NOT EXISTS and conditional adds where supported (MariaDB 11.x)
-- =============================================================

START TRANSACTION;

-- 1. AMENITIES SYSTEM -------------------------------------------------
CREATE TABLE IF NOT EXISTS amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  description TEXT,
  icon VARCHAR(100),
  display_order INT DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_name_category (name, category),
  INDEX idx_category (category),
  INDEX idx_featured (is_featured),
  INDEX idx_active (is_active),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room_amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(50) NOT NULL,
  amenity_id INT NOT NULL,
  is_highlighted TINYINT(1) DEFAULT 0,
  custom_note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_room_amenity (room_id, amenity_id),
  INDEX idx_room_id (room_id),
  INDEX idx_amenity_id (amenity_id),
  INDEX idx_highlighted (is_highlighted),
  CONSTRAINT fk_room_amenities_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_room_amenities_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS package_amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  amenity_id INT NOT NULL,
  is_highlighted TINYINT(1) DEFAULT 0,
  custom_note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_package_amenity (package_id, amenity_id),
  INDEX idx_package_id (package_id),
  INDEX idx_amenity_id (amenity_id),
  INDEX idx_highlighted (is_highlighted),
  CONSTRAINT fk_package_amenities_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  CONSTRAINT fk_package_amenities_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CALENDAR SUPPORT --------------------------------------------------
CREATE TABLE IF NOT EXISTS calendar_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string','integer','boolean','json') DEFAULT 'string',
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_public TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calendar_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscription_token VARCHAR(255) UNIQUE NOT NULL,
  subscriber_email VARCHAR(255),
  subscriber_name VARCHAR(255),
  subscription_type ENUM('ical','webcal','google','outlook','apple') DEFAULT 'ical',
  filter_status VARCHAR(50) DEFAULT 'all',
  filter_room_id VARCHAR(50),
  date_from DATE,
  date_to DATE,
  last_accessed TIMESTAMP NULL,
  access_count INT DEFAULT 0,
  user_agent TEXT,
  ip_address VARCHAR(45),
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_token (subscription_token),
  INDEX idx_type (subscription_type),
  INDEX idx_active (active),
  INDEX idx_last_accessed (last_accessed),
  CONSTRAINT fk_calendar_sub_room FOREIGN KEY (filter_room_id) REFERENCES rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SYSTEM CONFIG (if not present) -----------------------------------
CREATE TABLE IF NOT EXISTS system_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  config_type ENUM('string','integer','boolean','json','encrypted') DEFAULT 'string',
  description TEXT,
  category VARCHAR(50) DEFAULT 'system',
  is_sensitive TINYINT(1) DEFAULT 0,
  environment ENUM('all','development','production') DEFAULT 'all',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_environment (environment),
  INDEX idx_sensitive (is_sensitive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. INTEGRATIONS ------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_integrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform_name VARCHAR(50) NOT NULL,
  platform_type ENUM('ota','calendar','payment','channel_manager','pms') NOT NULL,
  integration_key VARCHAR(255) UNIQUE NOT NULL,
  api_endpoint VARCHAR(255),
  api_key VARCHAR(255),
  api_secret VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP NULL,
  sync_frequency ENUM('realtime','hourly','daily','weekly','manual') DEFAULT 'daily',
  last_sync_at TIMESTAMP NULL,
  sync_status ENUM('active','paused','error','disabled') DEFAULT 'active',
  sync_direction ENUM('import','export','bidirectional') DEFAULT 'export',
  config_data JSON,
  mapping_rules JSON,
  error_log TEXT,
  sync_stats JSON,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_platform (platform_name),
  INDEX idx_type (platform_type),
  INDEX idx_sync_status (sync_status),
  INDEX idx_active (active),
  INDEX idx_last_sync (last_sync_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_sync_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  integration_id INT NOT NULL,
  sync_type ENUM('full','incremental','manual') DEFAULT 'incremental',
  direction ENUM('import','export') NOT NULL,
  entity_type ENUM('booking','availability','rates','property','reviews') NOT NULL,
  entity_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  status ENUM('running','completed','failed','cancelled') DEFAULT 'running',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  error_details JSON,
  sync_summary JSON,
  INDEX idx_integration (integration_id),
  INDEX idx_type (sync_type),
  INDEX idx_entity (entity_type),
  INDEX idx_status (status),
  INDEX idx_started (started_at),
  CONSTRAINT fk_sync_history_integration FOREIGN KEY (integration_id) REFERENCES platform_integrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ANALYTICS ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
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
  UNIQUE KEY uniq_daily (date, room_id, package_id, source),
  INDEX idx_date (date),
  INDEX idx_room (room_id),
  INDEX idx_package (package_id),
  INDEX idx_source (source),
  CONSTRAINT fk_booking_analytics_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_booking_analytics_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS guest_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  guest_email VARCHAR(255) NOT NULL,
  total_bookings INT DEFAULT 1,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  total_nights INT DEFAULT 0,
  favorite_room_type VARCHAR(100),
  avg_advance_booking_days INT DEFAULT 0,
  last_booking_date DATE,
  guest_segment ENUM('new','returning','vip','frequent') DEFAULT 'new',
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_guest_email (guest_email),
  INDEX idx_segment (guest_segment),
  INDEX idx_bookings (total_bookings),
  INDEX idx_revenue (total_revenue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. OPTIONAL INDEX TUNING (SAFE ADDITIONS) ---------------------------
-- Composite index to speed availability searches
ALTER TABLE bookings
  ADD INDEX IF NOT EXISTS idx_room_status_dates (room_id, status, check_in, check_out);

-- 7. SEED INITIAL AMENITIES (only if table is empty) ------------------
INSERT INTO amenities (name, category, description, icon, display_order, is_featured)
SELECT 'Free WiFi','connectivity','High-speed wireless internet access','wifi',1,1
WHERE NOT EXISTS (SELECT 1 FROM amenities LIMIT 1);

-- Additional seed (example) - remove or expand as needed
INSERT INTO amenities (name, category, description, icon, display_order, is_featured)
SELECT 'Air Conditioning','comfort','Climate-controlled comfort','snowflake',2,1
WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name='Air Conditioning');

COMMIT;

-- === Verification Queries (Run Manually After) ===
-- SHOW TABLES LIKE 'amenities';
-- DESCRIBE amenities;
-- SELECT COUNT(*) FROM amenities;
-- SELECT table_name, engine FROM information_schema.tables WHERE table_schema = DATABASE();
