-- Migration: add extended columns to package_rooms that exist in MySQL source schema
-- but were missing from the D1 SQLite d1-schema.sql
-- Run: wrangler d1 execute booking-engine --env production --file database/migrations/0002_package_rooms_extended_columns.sql

ALTER TABLE package_rooms ADD COLUMN adjustment_type TEXT DEFAULT 'fixed';
ALTER TABLE package_rooms ADD COLUMN max_occupancy_override INTEGER;
ALTER TABLE package_rooms ADD COLUMN availability_priority INTEGER DEFAULT 1;
ALTER TABLE package_rooms ADD COLUMN description TEXT;
ALTER TABLE package_rooms ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;
