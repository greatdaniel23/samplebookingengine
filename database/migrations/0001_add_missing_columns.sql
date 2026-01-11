-- Migration to add missing columns to rooms and packages tables
-- Based on legacy data requirements and D1 schema alignment

-- Add columns to rooms table
ALTER TABLE rooms ADD COLUMN images TEXT;
ALTER TABLE rooms ADD COLUMN amenities TEXT;
ALTER TABLE rooms ADD COLUMN type TEXT;
ALTER TABLE rooms ADD COLUMN capacity INTEGER;
ALTER TABLE rooms ADD COLUMN features TEXT;
ALTER TABLE rooms ADD COLUMN beds TEXT;
ALTER TABLE rooms ADD COLUMN size TEXT;

-- Add columns to packages table
ALTER TABLE packages ADD COLUMN seo_title TEXT;
ALTER TABLE packages ADD COLUMN seo_description TEXT;
ALTER TABLE packages ADD COLUMN booking_advance_days INTEGER;
ALTER TABLE packages ADD COLUMN room_selection_type TEXT;
ALTER TABLE packages ADD COLUMN allow_room_upgrades INTEGER DEFAULT 0;
ALTER TABLE packages ADD COLUMN upgrade_price_calculation TEXT;
