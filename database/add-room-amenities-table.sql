-- Add room_amenities table for room-amenity relationships
-- Run this SQL to add amenities functionality to rooms

-- Create room_amenities table if it doesn't exist
CREATE TABLE IF NOT EXISTS `room_amenities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `amenity_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_amenity` (`room_id`, `amenity_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_amenity_id` (`amenity_id`),
  FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add some sample room-amenity relationships (optional)
-- Uncomment these lines if you want sample data

-- INSERT IGNORE INTO `room_amenities` (`room_id`, `amenity_id`) VALUES
-- (1, 1), -- Room 1 has amenity 1
-- (1, 2), -- Room 1 has amenity 2
-- (2, 1), -- Room 2 has amenity 1
-- (2, 3); -- Room 2 has amenity 3