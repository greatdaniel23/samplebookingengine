-- =====================================================
-- Package-Room Relationships Database Schema
-- Villa Booking Engine - Multi-Room Package Support
-- =====================================================

-- -----------------------------------------------------
-- 1. Create package_rooms junction table (idempotent)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `package_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `room_id` varchar(50) NOT NULL,
  `is_default` tinyint(1) DEFAULT 0 COMMENT 'Default room for this package',
  `price_adjustment` decimal(10,2) DEFAULT 0.00 COMMENT 'Price difference from base package price',
  `adjustment_type` enum('fixed', 'percentage') DEFAULT 'fixed' COMMENT 'How price adjustment is calculated',
  `max_occupancy_override` int(11) NULL COMMENT 'Override package max occupancy for this room',
  `availability_priority` int(11) DEFAULT 1 COMMENT 'Room selection priority (1=highest)',
  `is_active` tinyint(1) DEFAULT 1,
  `description` text NULL COMMENT 'Room-specific package description',
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_package_room` (`package_id`, `room_id`),
  KEY `idx_package_id` (`package_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_active_priority` (`is_active`, `availability_priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign keys if they don't exist (safer approach)
SET @fk_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'package_rooms' 
                AND CONSTRAINT_NAME = 'package_rooms_ibfk_1');
                
SET @sql = IF(@fk_check = 0,
  'ALTER TABLE `package_rooms` ADD FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON DELETE CASCADE',
  'SELECT "Foreign key package_rooms_ibfk_1 already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'package_rooms' 
                AND CONSTRAINT_NAME = 'package_rooms_ibfk_2');
                
SET @sql = IF(@fk_check = 0,
  'ALTER TABLE `package_rooms` ADD FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE',
  'SELECT "Foreign key package_rooms_ibfk_2 already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------
-- 2. Enhance packages table with new fields (idempotent)
-- -----------------------------------------------------
-- Add room_selection_type column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND COLUMN_NAME = 'room_selection_type');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `packages` ADD COLUMN `room_selection_type` enum(''single'', ''multiple'', ''upgrade'') DEFAULT ''single'' COMMENT ''single=one room only, multiple=choose from options, upgrade=base+upgrades'' AFTER `base_room_id`',
  'SELECT "Column room_selection_type already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add allow_room_upgrades column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND COLUMN_NAME = 'allow_room_upgrades');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `packages` ADD COLUMN `allow_room_upgrades` tinyint(1) DEFAULT 0 COMMENT ''Allow customers to upgrade rooms'' AFTER `room_selection_type`',
  'SELECT "Column allow_room_upgrades already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add upgrade_price_calculation column if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND COLUMN_NAME = 'upgrade_price_calculation');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `packages` ADD COLUMN `upgrade_price_calculation` enum(''fixed'', ''percentage'', ''per_night'') DEFAULT ''fixed'' COMMENT ''How upgrade prices are calculated'' AFTER `allow_room_upgrades`',
  'SELECT "Column upgrade_price_calculation already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------
-- 3. Add indexes for performance (idempotent)
-- -----------------------------------------------------
-- Add idx_room_selection index if it doesn't exist
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND INDEX_NAME = 'idx_room_selection');

SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE `packages` ADD INDEX `idx_room_selection` (`room_selection_type`)',
  'SELECT "Index idx_room_selection already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add idx_allow_upgrades index if it doesn't exist
SET @idx_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                  WHERE TABLE_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'packages' 
                  AND INDEX_NAME = 'idx_allow_upgrades');

SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE `packages` ADD INDEX `idx_allow_upgrades` (`allow_room_upgrades`)',
  'SELECT "Index idx_allow_upgrades already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- SAMPLE DATA INSERTION (CONDITIONAL)
-- =====================================================

-- -----------------------------------------------------
-- First, create sample packages if they don't exist
-- -----------------------------------------------------

-- Sample Romance Package
INSERT IGNORE INTO `packages` (`id`, `name`, `description`, `package_type`, `base_price`, `min_nights`, `max_nights`, `max_guests`, `is_active`, `available`, `featured`) VALUES
(1, 'Romance Package', 'Perfect romantic getaway for couples with special amenities and intimate atmosphere', 'Romance', 450.00, 2, 7, 2, 1, 1, 1);

-- Sample Family Package
INSERT IGNORE INTO `packages` (`id`, `name`, `description`, `package_type`, `base_price`, `min_nights`, `max_nights`, `max_guests`, `is_active`, `available`, `featured`) VALUES
(2, 'Family Package', 'Complete family vacation package with activities and amenities for all ages', 'Family', 350.00, 3, 14, 8, 1, 1, 1);

-- Sample Business Package
INSERT IGNORE INTO `packages` (`id`, `name`, `description`, `package_type`, `base_price`, `min_nights`, `max_nights`, `max_guests`, `is_active`, `available`, `featured`) VALUES
(3, 'Business Package', 'Professional accommodation with business amenities and services', 'Business', 400.00, 1, 30, 2, 1, 1, 0);

-- Sample Wellness Package
INSERT IGNORE INTO `packages` (`id`, `name`, `description`, `package_type`, `base_price`, `min_nights`, `max_nights`, `max_guests`, `is_active`, `available`, `featured`) VALUES
(4, 'Wellness Package', 'Rejuvenating wellness retreat with spa treatments and healthy activities', 'Wellness', 500.00, 3, 10, 4, 1, 1, 1);

-- -----------------------------------------------------
-- Sample package-room relationships (only if packages exist)
-- -----------------------------------------------------

-- Sample 1: Romance Package with multiple room options (only if package exists)
INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`, `description`)
SELECT 1, 'pool-view-family-villa', 1, 0.00, 'fixed', 1, 'Standard romantic villa with pool view'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 1)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = 'pool-view-family-villa');

INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`, `description`)
SELECT 1, 'deluxe-suite', 0, 25.00, 'fixed', 2, 'Upgraded suite with premium amenities'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 1)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = 'deluxe-suite');

INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`, `description`)
SELECT 1, 'cosy-villa', 0, -15.00, 'fixed', 3, 'Intimate cosy villa for budget-conscious couples'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 1)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = 'cosy-villa');

-- Update Romance Package settings
UPDATE `packages` SET 
  `room_selection_type` = 'upgrade', 
  `allow_room_upgrades` = 1, 
  `upgrade_price_calculation` = 'fixed' 
WHERE `id` = 1;

-- Sample 2: Family Package with room choices (only if package exists)
INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `max_occupancy_override`, `availability_priority`, `description`)
SELECT 2, 'family-room', 1, 0.00, 'fixed', 6, 1, 'Standard family accommodation'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 2)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = 'family-room');

INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `max_occupancy_override`, `availability_priority`, `description`)
SELECT 2, 'pool-view-family-villa', 0, 30.00, 'fixed', 8, 2, 'Spacious villa perfect for larger families'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 2)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = 'pool-view-family-villa');

-- Update Family Package settings
UPDATE `packages` SET 
  `room_selection_type` = 'multiple', 
  `allow_room_upgrades` = 1, 
  `upgrade_price_calculation` = 'fixed' 
WHERE `id` = 2;

-- Sample 3: Business Package with percentage upgrades (only if package exists)
INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`, `description`)
SELECT 3, 'deluxe-suite', 1, 0.00, 'fixed', 1, 'Professional business accommodation'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 3)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = 'deluxe-suite');

INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`, `description`)
SELECT 3, '423523423434', 0, 20.00, 'percentage', 2, 'Premium private pool villa for executives'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 3)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = '423523423434');

-- Update Business Package settings
UPDATE `packages` SET 
  `room_selection_type` = 'upgrade', 
  `allow_room_upgrades` = 1, 
  `upgrade_price_calculation` = 'percentage' 
WHERE `id` = 3;

-- Sample 4: Wellness Package with multiple options (only if package exists)
INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`, `description`)
SELECT 4, 'cosy-villa', 1, 0.00, 'fixed', 1, 'Peaceful retreat for wellness focused stays'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 4)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = 'cosy-villa');

INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`, `description`)
SELECT 4, 'pool-view-family-villa', 0, 40.00, 'fixed', 2, 'Spacious villa with dedicated wellness area'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 4)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = 'pool-view-family-villa');

INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`, `description`)
SELECT 4, '423523423434', 0, 15.00, 'percentage', 3, 'Luxury private pool villa with premium spa access'
WHERE EXISTS (SELECT 1 FROM `packages` WHERE `id` = 4)
  AND EXISTS (SELECT 1 FROM `rooms` WHERE `id` = '423523423434');

-- Update Wellness Package settings
UPDATE `packages` SET 
  `room_selection_type` = 'multiple', 
  `allow_room_upgrades` = 1, 
  `upgrade_price_calculation` = 'fixed' 
WHERE `id` = 4;

-- =====================================================
-- DATA MIGRATION FROM EXISTING STRUCTURE
-- =====================================================

-- -----------------------------------------------------
-- Migrate existing base_room_id relationships
-- -----------------------------------------------------
INSERT INTO `package_rooms` (`package_id`, `room_id`, `is_default`, `price_adjustment`, `adjustment_type`, `availability_priority`)
SELECT 
  `id` as `package_id`, 
  `base_room_id` as `room_id`, 
  1 as `is_default`, 
  0.00 as `price_adjustment`, 
  'fixed' as `adjustment_type`, 
  1 as `availability_priority`
FROM `packages` 
WHERE `base_room_id` IS NOT NULL 
  AND `base_room_id` != ''
  AND NOT EXISTS (
    SELECT 1 FROM `package_rooms` pr 
    WHERE pr.`package_id` = `packages`.`id` 
    AND pr.`room_id` = `packages`.`base_room_id`
  );

-- -----------------------------------------------------
-- Update existing packages to use new system
-- -----------------------------------------------------
UPDATE `packages` 
SET 
  `room_selection_type` = 'single', 
  `allow_room_upgrades` = 0,
  `upgrade_price_calculation` = 'fixed'
WHERE `base_room_id` IS NOT NULL 
  AND `room_selection_type` IS NULL;

-- =====================================================
-- USEFUL VIEWS FOR REPORTING
-- =====================================================

-- -----------------------------------------------------
-- View: Package Room Options Summary
-- -----------------------------------------------------
CREATE OR REPLACE VIEW `package_room_options` AS
SELECT 
  p.`id` as `package_id`,
  p.`name` as `package_name`,
  p.`base_price`,
  p.`room_selection_type`,
  p.`allow_room_upgrades`,
  r.`id` as `room_id`,
  r.`name` as `room_name`,
  r.`type` as `room_type`,
  pr.`is_default`,
  pr.`price_adjustment`,
  pr.`adjustment_type`,
  CASE 
    WHEN pr.`adjustment_type` = 'fixed' THEN p.`base_price` + pr.`price_adjustment`
    WHEN pr.`adjustment_type` = 'percentage' THEN p.`base_price` * (1 + pr.`price_adjustment` / 100)
    ELSE p.`base_price`
  END as `final_price`,
  pr.`max_occupancy_override`,
  COALESCE(pr.`max_occupancy_override`, r.`capacity`) as `effective_max_occupancy`,
  pr.`availability_priority`,
  pr.`is_active`
FROM `packages` p
JOIN `package_rooms` pr ON p.`id` = pr.`package_id`
JOIN `rooms` r ON pr.`room_id` = r.`id`
WHERE p.`is_active` = 1 AND pr.`is_active` = 1 AND r.`available` = 1
ORDER BY p.`id`, pr.`availability_priority`;

-- -----------------------------------------------------
-- View: Package Statistics
-- -----------------------------------------------------
CREATE OR REPLACE VIEW `package_room_stats` AS
SELECT 
  p.`id` as `package_id`,
  p.`name` as `package_name`,
  COUNT(pr.`id`) as `total_room_options`,
  COUNT(CASE WHEN pr.`is_default` = 1 THEN 1 END) as `default_rooms`,
  MIN(CASE 
    WHEN pr.`adjustment_type` = 'fixed' THEN p.`base_price` + pr.`price_adjustment`
    WHEN pr.`adjustment_type` = 'percentage' THEN p.`base_price` * (1 + pr.`price_adjustment` / 100)
    ELSE p.`base_price`
  END) as `min_price`,
  MAX(CASE 
    WHEN pr.`adjustment_type` = 'fixed' THEN p.`base_price` + pr.`price_adjustment`
    WHEN pr.`adjustment_type` = 'percentage' THEN p.`base_price` * (1 + pr.`price_adjustment` / 100)
    ELSE p.`base_price`
  END) as `max_price`,
  MAX(COALESCE(pr.`max_occupancy_override`, r.`capacity`)) as `max_occupancy`
FROM `packages` p
LEFT JOIN `package_rooms` pr ON p.`id` = pr.`package_id` AND pr.`is_active` = 1
LEFT JOIN `rooms` r ON pr.`room_id` = r.`id` AND r.`available` = 1
WHERE p.`is_active` = 1
GROUP BY p.`id`, p.`name`;

-- =====================================================
-- CLEANUP AND MAINTENANCE QUERIES
-- =====================================================

-- -----------------------------------------------------
-- Remove duplicate package-room relationships
-- -----------------------------------------------------
DELETE pr1 FROM `package_rooms` pr1
INNER JOIN `package_rooms` pr2 
WHERE pr1.`id` > pr2.`id` 
  AND pr1.`package_id` = pr2.`package_id` 
  AND pr1.`room_id` = pr2.`room_id`;

-- -----------------------------------------------------
-- Ensure each package has at least one default room
-- -----------------------------------------------------
UPDATE `package_rooms` pr1
SET `is_default` = 1
WHERE pr1.`availability_priority` = (
  SELECT MIN(pr2.`availability_priority`)
  FROM `package_rooms` pr2
  WHERE pr2.`package_id` = pr1.`package_id`
  AND pr2.`is_active` = 1
)
AND pr1.`package_id` NOT IN (
  SELECT DISTINCT `package_id` 
  FROM `package_rooms` 
  WHERE `is_default` = 1 AND `is_active` = 1
);

-- -----------------------------------------------------
-- Performance optimization indexes (conditional)
-- -----------------------------------------------------
-- Add idx_package_default index if it doesn't exist
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'package_rooms' AND INDEX_NAME = 'idx_package_default') = 0,
  'ALTER TABLE `package_rooms` ADD INDEX `idx_package_default` (`package_id`, `is_default`)',
  'SELECT "Index idx_package_default already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add idx_package_active_priority index if it doesn't exist
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'package_rooms' AND INDEX_NAME = 'idx_package_active_priority') = 0,
  'ALTER TABLE `package_rooms` ADD INDEX `idx_package_active_priority` (`package_id`, `is_active`, `availability_priority`)',
  'SELECT "Index idx_package_active_priority already exists" as info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- EXAMPLE QUERIES FOR APPLICATION USE
-- =====================================================

-- Get all room options for a specific package
SELECT * FROM `package_room_options` WHERE `package_id` = 1 ORDER BY `availability_priority`;

-- Get default room for each package
SELECT * FROM `package_room_options` WHERE `is_default` = 1;

-- Get packages with upgrade options
SELECT DISTINCT `package_id`, `package_name` 
FROM `package_room_options` 
WHERE `package_id` IN (
  SELECT `package_id` FROM `package_room_options` 
  GROUP BY `package_id` HAVING COUNT(*) > 1
);

-- Get price range for packages
SELECT `package_id`, `package_name`, `min_price`, `max_price`, 
       (`max_price` - `min_price`) as `price_range`
FROM `package_room_stats` 
WHERE `total_room_options` > 1;

-- =====================================================
-- END OF SCRIPT
-- =====================================================