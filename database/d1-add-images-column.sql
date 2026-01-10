-- Add images column to villa_info table
-- Store Cloudflare Images IDs as JSON array
ALTER TABLE villa_info ADD COLUMN images TEXT DEFAULT '[]';

-- Update existing record with empty array
UPDATE villa_info SET images = '[]' WHERE images IS NULL;
