-- Migration to add base_room_id column to packages table
-- Run this SQL to enable package-room connections
-- Date: November 20, 2025

USE booking_engine;

-- Check if column already exists
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'booking_engine' AND table_name = 'packages' AND column_name = 'base_room_id');

-- Add base_room_id column if it doesn't exist
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE packages ADD COLUMN base_room_id VARCHAR(50) NULL AFTER max_guests', 
    'SELECT "Column base_room_id already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for better performance
SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = 'booking_engine' AND table_name = 'packages' AND index_name = 'idx_base_room_id');

SET @sql = IF(@index_exists = 0 AND @column_exists = 0,
    'ALTER TABLE packages ADD INDEX idx_base_room_id (base_room_id)',
    'SELECT "Index already exists or column does not exist" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing packages with sample room assignments (optional)
-- This connects existing packages to rooms for testing
UPDATE packages SET base_room_id = 'deluxe-suite' WHERE id = 1 AND base_room_id IS NULL;
UPDATE packages SET base_room_id = 'family-room' WHERE id = 2 AND base_room_id IS NULL;  
UPDATE packages SET base_room_id = 'business-room' WHERE id = 3 AND base_room_id IS NULL;
UPDATE packages SET base_room_id = 'luxury-suite' WHERE id = 4 AND base_room_id IS NULL;
UPDATE packages SET base_room_id = 'standard-room' WHERE id = 5 AND base_room_id IS NULL;

-- Display result
SELECT 'Migration completed successfully - packages table now has base_room_id column' as result;

-- Show updated table structure
DESCRIBE packages;