-- Room Image Selection System - Database Schema
-- Add image columns to rooms table for room image management

-- Add room image columns to existing rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_image VARCHAR(500) NULL 
    COMMENT 'Relative path to room image (e.g., packages/romantic-escape.jpg)';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_folder VARCHAR(100) NULL 
    COMMENT 'Source folder for the image (hero, packages, amenities, ui, uploads)';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_selected_at TIMESTAMP NULL 
    COMMENT 'When the image was assigned to this room';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_selected_by VARCHAR(100) NULL 
    COMMENT 'User ID who assigned the image';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_image ON rooms(room_image);
CREATE INDEX IF NOT EXISTS idx_rooms_folder ON rooms(image_folder);

-- Optional: Track image usage across rooms (for analytics)
CREATE TABLE IF NOT EXISTS room_image_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    image_folder VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_usage_room (room_id),
    INDEX idx_usage_image (image_path),
    INDEX idx_usage_folder (image_folder)
);

-- Insert sample data for testing (optional)
-- UPDATE rooms SET 
--     room_image = 'packages/romantic-escape.jpg',
--     image_folder = 'packages',
--     image_selected_at = CURRENT_TIMESTAMP,
--     image_selected_by = 'admin'
-- WHERE id = 1 LIMIT 1;