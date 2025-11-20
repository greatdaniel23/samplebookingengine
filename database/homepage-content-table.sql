-- Homepage Content Management - Database Schema
-- This table stores all homepage content that can be managed through the admin panel

CREATE TABLE homepage_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Hero Section Content
  hero_title VARCHAR(255) NOT NULL DEFAULT 'Serene Mountain Retreat',
  hero_subtitle VARCHAR(255) DEFAULT 'Luxury Villa Experience',
  hero_description TEXT,
  
  -- Basic Property Information
  property_name VARCHAR(255) NOT NULL,
  property_location VARCHAR(255),
  property_description TEXT,
  property_rating DECIMAL(2,1) DEFAULT 4.8,
  property_reviews INT DEFAULT 127,
  
  -- Contact Information
  contact_phone VARCHAR(50),
  contact_email VARCHAR(100),
  contact_website VARCHAR(255),
  
  -- Address Details
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_country VARCHAR(100),
  address_zipcode VARCHAR(20),
  
  -- Property Specifications
  spec_max_guests INT DEFAULT 8,
  spec_bedrooms INT DEFAULT 4,
  spec_bathrooms INT DEFAULT 3,
  spec_base_price DECIMAL(10,2) DEFAULT 350.00,
  
  -- Check-in/Check-out Times
  timing_check_in VARCHAR(20) DEFAULT '3:00 PM',
  timing_check_out VARCHAR(20) DEFAULT '11:00 AM',
  
  -- Property Policies
  policy_cancellation TEXT,
  policy_house_rules TEXT,
  policy_terms_conditions TEXT,
  
  -- Social Media Links
  social_facebook VARCHAR(255),
  social_instagram VARCHAR(255),
  social_twitter VARCHAR(255),
  
  -- Media Content (JSON stored as TEXT for compatibility)
  images_json TEXT, -- Array of image URLs: ["url1", "url2", ...]
  amenities_json TEXT, -- Array of amenities: [{"name": "Pool", "icon": "Pool"}, ...]
  
  -- Meta Information
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(100) DEFAULT 'admin'
);

-- Create index for performance
CREATE INDEX idx_homepage_active ON homepage_content(is_active);

-- Insert default homepage content
INSERT INTO homepage_content (
  hero_title,
  hero_subtitle, 
  hero_description,
  property_name,
  property_location,
  property_description,
  contact_phone,
  contact_email,
  contact_website,
  address_street,
  address_city,
  address_state,
  address_country,
  address_zipcode,
  spec_max_guests,
  spec_bedrooms,
  spec_bathrooms,
  spec_base_price,
  timing_check_in,
  timing_check_out,
  policy_cancellation,
  policy_house_rules,
  social_facebook,
  social_instagram,
  images_json,
  amenities_json
) VALUES (
  'Serene Mountain Retreat',
  'Luxury Villa Experience',
  'Experience unparalleled luxury and comfort at our prestigious mountain retreat. Perfect for creating unforgettable memories in the heart of nature.',
  'Serene Mountain Retreat',
  'Aspen, Colorado',
  'Escape to this stunning mountain retreat where modern luxury meets rustic charm. Nestled in the heart of the Rockies, this villa offers breathtaking views, world-class amenities, and unmatched privacy for the ultimate getaway experience.',
  '+1 (555) 123-4567',
  'info@sereneretreat.com',
  'https://sereneretreat.com',
  '123 Luxury Mountain Lane',
  'Aspen', 
  'Colorado',
  'United States',
  '81611',
  8,
  4,
  3,
  350.00,
  '3:00 PM',
  '11:00 AM',
  'Cancellations must be made at least 48 hours before check-in for a full refund. Cancellations within 48 hours will incur a one-night charge.',
  'No smoking indoors, No pets allowed, Quiet hours from 10 PM to 8 AM, Maximum occupancy strictly enforced',
  'https://facebook.com/sereneretreat',
  'https://instagram.com/sereneretreat',
  '["/images/hero/DSC05979.JPG", "/images/hero/DSC05990.JPG", "/images/hero/DSC06008.JPG", "/images/hero/DSC06013.JPG", "/images/hero/DSC06023.JPG"]',
  '[{"name": "Swimming Pool", "icon": "Pool"}, {"name": "High-Speed WiFi", "icon": "Wifi"}, {"name": "Mountain Views", "icon": "Mountain"}, {"name": "Hot Tub", "icon": "Waves"}, {"name": "Full Kitchen", "icon": "ChefHat"}, {"name": "Fireplace", "icon": "Flame"}, {"name": "Parking", "icon": "Car"}, {"name": "Air Conditioning", "icon": "Snowflake"}]'
);

-- Verify insertion
SELECT 
  id,
  hero_title,
  property_name,
  property_location,
  contact_phone,
  contact_email,
  spec_max_guests,
  spec_bedrooms,
  spec_bathrooms,
  spec_base_price,
  is_active,
  created_at
FROM homepage_content 
WHERE is_active = TRUE;