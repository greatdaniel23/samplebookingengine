-- Marketing Categories Table for Package Management
-- This table stores marketing categories that can be assigned to packages for better organization

CREATE TABLE IF NOT EXISTS `marketing_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL UNIQUE,
  `description` text DEFAULT NULL,
  `color` varchar(7) DEFAULT '#6B7280', -- Hex color for UI display
  `icon` varchar(50) DEFAULT NULL, -- Icon class or name
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default marketing categories
INSERT INTO `marketing_categories` (`name`, `slug`, `description`, `color`, `icon`, `sort_order`) VALUES
('Romance', 'romance', 'Romantic packages for couples and special occasions', '#e91e63', '💕', 1),
('Family', 'family', 'Family-friendly packages with activities for all ages', '#2196f3', '👨‍👩‍👧‍👦', 2),
('Adventure', 'adventure', 'Adventure and outdoor activity packages', '#ff9800', '🏔️', 3),
('Wellness', 'wellness', 'Spa, wellness, and relaxation focused packages', '#4caf50', '🧘‍♀️', 4),
('Business', 'business', 'Corporate and business travel packages', '#607d8b', '💼', 5),
('Luxury', 'luxury', 'Premium and luxury experience packages', '#9c27b0', '✨', 6),
('Cultural', 'cultural', 'Cultural immersion and local experience packages', '#795548', '🎭', 7),
('Seasonal', 'seasonal', 'Holiday and seasonal special packages', '#f44336', '🎄', 8);