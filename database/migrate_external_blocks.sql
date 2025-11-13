-- Migration: external_blocks table for inbound calendar synchronization
-- Run after base schema (schema.sql)
USE booking_engine;

CREATE TABLE IF NOT EXISTS external_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(50) NOT NULL,          -- e.g. 'airbnb'
  uid VARCHAR(255) NOT NULL,            -- ICS UID or generated hash
  start_date DATE NOT NULL,             -- Inclusive
  end_date DATE NOT NULL,               -- Exclusive (DTEND semantics)
  summary TEXT NULL,                    -- 'Not available' or guest name
  description TEXT NULL,                -- Raw description when present
  last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  raw_event JSON NULL,                  -- Original parsed data for audit
  UNIQUE KEY uniq_source_uid (source, uid),
  KEY idx_source_range (source, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
