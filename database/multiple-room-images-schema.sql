-- Multiple Room Images System - Database Schema Update
-- Modify rooms table to support multiple images per room using JSON

-- Add multiple images column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_images JSON NULL 
    COMMENT 'JSON array of room images with metadata [{"filename": "image.webp", "folder": "Villa1", "is_primary": true, "caption": "description"}]';

-- Add image metadata columns
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images_count INT DEFAULT 0 
    COMMENT 'Count of assigned images for quick filtering';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS primary_image VARCHAR(500) NULL 
    COMMENT 'Primary image filename for quick access';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images_updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    COMMENT 'When the images were last updated';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images_updated_by VARCHAR(100) NULL 
    COMMENT 'User who last updated the images';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_images_count ON rooms(images_count);
CREATE INDEX IF NOT EXISTS idx_rooms_primary_image ON rooms(primary_image);
CREATE INDEX IF NOT EXISTS idx_rooms_images_updated ON rooms(images_updated_at);

-- Migration script to convert existing single images to multiple images format
-- This will convert existing room_image and image_folder to the new JSON format
UPDATE rooms 
SET room_images = JSON_ARRAY(
    JSON_OBJECT(
        'filename', room_image,
        'folder', COALESCE(image_folder, 'Villa1'),
        'is_primary', true,
        'caption', CONCAT('Primary image for ', name),
        'added_at', COALESCE(image_selected_at, NOW()),
        'added_by', COALESCE(image_selected_by, 'system')
    )
),
images_count = 1,
primary_image = room_image,
images_updated_at = COALESCE(image_selected_at, NOW()),
images_updated_by = COALESCE(image_selected_by, 'migration')
WHERE room_image IS NOT NULL AND room_image != '';

-- Sample data structure for room_images JSON:
-- [
--   {
--     "filename": "villa1_bedroom.webp",
--     "folder": "Villa1", 
--     "is_primary": true,
--     "caption": "Spacious bedroom with ocean view",
--     "added_at": "2024-12-16T10:30:00",
--     "added_by": "admin"
--   },
--   {
--     "filename": "villa1_bathroom.webp",
--     "folder": "Villa1",
--     "is_primary": false, 
--     "caption": "Modern bathroom with marble finishes",
--     "added_at": "2024-12-16T10:31:00",
--     "added_by": "admin"
--   }
-- ]