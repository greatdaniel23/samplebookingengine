-- External Calendar Blocks (Airbnb / VRBO / Booking.com)
-- Create table to store imported blocked periods from external iCal feeds.

CREATE TABLE IF NOT EXISTS external_blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(50) NOT NULL, -- e.g. 'airbnb'
    uid VARCHAR(255) NULL,       -- event UID from external calendar
    summary VARCHAR(255) NULL,   -- event summary/title
    description TEXT NULL,       -- raw description
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,      -- last day blocked (exclusive if needed)
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- updated when re-imported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    raw_event JSON NULL,
    UNIQUE KEY uniq_source_uid (source, uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional index for date range queries
CREATE INDEX idx_external_blocks_dates ON external_blocks (start_date, end_date);
