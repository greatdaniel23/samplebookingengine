-- Cloudflare D1 Data Migration Script
-- Load data from your Hostinger database export

-- Insert admin user
INSERT INTO users (id, username, password_hash, email, role, active, timezone, language, email_notifications, created_at, updated_at)
VALUES (1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@bookingengine.com', 'admin', 1, 'UTC', 'en', 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29');

-- Insert amenities (56 total)
INSERT INTO amenities (id, name, category, description, icon, display_order, is_featured, is_active, created_at, updated_at) VALUES
(1, 'Free WiFi', 'connectivity', 'High-speed wireless internet access', 'wifi', 1, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(2, 'Air Conditioning', 'comfort', 'Climate-controlled comfort', 'snowflake', 2, 1, 1, '2025-11-18 17:00:29', '2025-11-22 10:53:54'),
(3, 'Private Bathroom', 'bathroom', 'En-suite bathroom with modern fixtures', 'bath', 3, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(4, 'Flat Screen TV', 'entertainment', 'Smart TV with cable and streaming', 'tv', 4, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(5, 'Mini Fridge', 'appliances', 'Small refrigerator for beverages and snacks', 'refrigerator', 5, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(6, 'Coffee Maker', 'appliances', 'In-room coffee and tea making facilities', 'coffee', 6, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(7, 'Safe Box', 'security', 'Personal secure storage', 'lock', 7, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(8, 'Balcony', 'outdoor', 'Private outdoor space with seating', 'balcony', 8, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(9, 'Ocean View', 'view', 'Beautiful ocean views from room', 'waves', 9, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(10, 'Garden View', 'view', 'Peaceful garden and landscape views', 'tree', 10, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(11, 'Airport Transfer', 'transport', 'Complimentary airport pickup and drop-off', 'car', 11, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(12, 'Daily Housekeeping', 'service', 'Professional daily cleaning service', 'broom', 12, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(13, 'Concierge Service', 'service', '24/7 guest assistance and recommendations', 'bell', 13, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(14, 'Welcome Drinks', 'hospitality', 'Complimentary welcome beverages on arrival', 'cocktail', 14, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(15, 'Breakfast Included', 'dining', 'Daily breakfast service', 'utensils', 15, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(16, 'Spa Treatment', 'wellness', 'Professional spa and massage services', 'spa', 16, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(17, 'Yoga Classes', 'wellness', 'Daily yoga and meditation sessions', 'yoga', 17, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(18, 'Cultural Tours', 'activities', 'Guided local cultural experiences', 'map', 18, 1, 1, '2025-11-18 17:00:29', '2025-12-11 13:20:26'),
(19, 'Cooking Classes', 'activities', 'Learn traditional local cuisine', 'chef', 19, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(20, 'Late Checkout', 'service', 'Extended checkout until 2 PM', 'clock', 20, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(21, 'Swimming Pool', 'recreation', 'Private outdoor swimming pool', 'swimming', 21, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(22, 'BBQ Grill', 'outdoor', 'Outdoor barbecue facilities', 'grill', 22, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(23, 'Garden', 'outdoor', 'Beautifully landscaped gardens', 'garden', 23, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(24, 'Parking', 'transport', 'Free on-site parking', 'parking', 24, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(25, 'Beach Access', 'location', 'Direct access to private beach', 'beach', 25, 1, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(26, 'Gym/Fitness', 'wellness', 'Fully equipped fitness center', 'dumbbell', 26, 0, 1, '2025-11-18 17:00:29', '2025-11-18 17:00:29'),
(27, 'Swimming Pool', 'recreation', 'Outdoor swimming pool with lounge area', 'waves', 1, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(28, 'Spa Access', 'recreation', 'Full-service spa with massage and treatments', 'heart', 2, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(29, 'Fitness Center', 'recreation', '24-hour fitness center with modern equipment', 'zap', 3, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(30, 'Garden Terrace', 'recreation', 'Beautiful garden terrace for relaxation', 'trees', 4, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(31, 'Private Beach Access', 'recreation', 'Exclusive access to private beach area', 'sun', 5, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(32, 'Free WiFi', 'technology', 'High-speed wireless internet throughout property', 'wifi', 10, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(33, 'Smart TV', 'technology', 'Large screen smart TV with streaming services', 'tv', 11, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(34, 'Bluetooth Audio', 'technology', 'Premium sound system with Bluetooth connectivity', 'music', 12, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(35, 'USB Charging Ports', 'technology', 'Convenient USB charging stations', 'battery-charging', 13, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(36, 'Gourmet Kitchen', 'dining', 'Fully equipped kitchen with premium appliances', 'chef-hat', 20, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(37, 'Private Chef Service', 'dining', 'Personal chef available upon request', 'utensils', 21, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(38, 'Mini Bar', 'dining', 'Stocked minibar with premium beverages', 'wine', 22, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(39, 'Room Service', 'dining', '24-hour room service available', 'coffee', 23, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(40, 'BBQ Facilities', 'dining', 'Outdoor barbecue area for grilling', 'flame', 24, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(41, 'Air Conditioning', 'comfort', 'Individual climate control in all rooms', 'wind', 30, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(42, 'Premium Bedding', 'comfort', 'Luxury linens and comfortable mattresses', 'bed', 31, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(43, 'Private Balcony', 'comfort', 'Private balcony with seating area', 'home', 32, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(44, 'Safe Deposit Box', 'comfort', 'In-room security safe for valuables', 'lock', 33, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(45, 'Daily Housekeeping', 'comfort', 'Professional daily cleaning service', 'sparkles', 34, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(46, 'Laundry Service', 'comfort', 'Professional laundry and dry cleaning', 'shirt', 35, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(47, 'Airport Transfer', 'transport', 'Complimentary airport pickup and drop-off', 'plane', 40, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(48, 'Private Parking', 'transport', 'Secure private parking space', 'car', 41, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(49, 'Bicycle Rental', 'transport', 'Free bicycle rental for local exploration', 'bike', 42, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(50, 'Concierge Service', 'transport', 'Personal concierge for arrangements', 'user-check', 43, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(51, 'Child-Friendly', 'family', 'Special amenities and safety features for children', 'baby', 50, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(52, 'Pet-Friendly', 'family', 'Welcome pets with special accommodations', 'heart', 51, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(53, 'Accessibility Features', 'family', 'Wheelchair accessible with special facilities', 'accessibility', 52, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(54, 'Yoga Classes', 'wellness', 'Daily yoga sessions with certified instructor', 'activity', 60, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(55, 'Meditation Garden', 'wellness', 'Peaceful meditation space in garden setting', 'leaf', 61, 0, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47'),
(56, 'Health & Safety', 'wellness', 'Enhanced cleaning and safety protocols', 'shield-check', 62, 1, 1, '2025-12-11 13:27:47', '2025-12-11 13:27:47');

-- Insert marketing categories (7 total)
INSERT INTO marketing_categories (id, name, slug, description, color, icon, is_active, sort_order, created_at, updated_at) VALUES
(1, 'Romance', 'romance', 'Romantic packages for couples and special occasions', '#e91e63', '💕', 1, 1, '2025-12-13 07:59:02', '2025-12-13 07:59:02'),
(2, 'Family', 'family', 'Family-friendly packages with activities for all ages', '#2196f3', '👨‍👩‍👧‍👦', 1, 2, '2025-12-13 07:59:02', '2025-12-13 07:59:02'),
(3, 'Adventure', 'adventure', 'Adventure and outdoor activity packages', '#ff9800', '🏔️', 1, 3, '2025-12-13 07:59:02', '2025-12-13 07:59:02'),
(4, 'Wellness', 'wellness', 'Spa, wellness, and relaxation focused packages', '#4caf50', '🧘‍♀️', 1, 4, '2025-12-13 07:59:02', '2025-12-13 07:59:02'),
(5, 'Business', 'business', 'Corporate and business travel packages', '#607d8b', '💼', 1, 5, '2025-12-13 07:59:02', '2025-12-13 07:59:02'),
(6, 'Luxury', 'luxury', 'Premium and luxury experience packages', '#9c27b0', '✨', 1, 6, '2025-12-13 07:59:02', '2025-12-13 07:59:02'),
(7, 'Cultural', 'cultural', 'Cultural immersion and local experience packages', '#795548', '🎭', 1, 7, '2025-12-13 07:59:02', '2025-12-13 07:59:02'),
(9, 'Room & Breakfast', 'room-breakfast', NULL, '#6B7280', NULL, 1, 0, '2025-12-13 08:11:53', '2025-12-22 15:35:33');

-- Insert homepage settings
INSERT INTO homepage_settings (id, hero_title, hero_subtitle, hero_description, property_name, property_location, property_description, property_rating, property_reviews, contact_phone, contact_email, contact_website, address_street, address_city, address_state, address_country, address_zipcode, spec_max_guests, spec_bedrooms, spec_bathrooms, spec_base_price, timing_check_in, timing_check_out, policy_cancellation, policy_house_rules, images_json, amenities_json, is_active, last_updated, created_at, updated_by) VALUES
(1, 'Serene Mountain Retreat', 'Luxury Villa Experience', 'Experience unparalleled luxury and comfort at our prestigious mountain retreat. Perfect for creating unforgettable memories in the heart of nature.', 'Serene Mountain Retreat', 'Aspen, Colorado', 'Escape to this stunning mountain retreat where modern luxury meets rustic charm. Nestled in the heart of the Rockies, this villa offers breathtaking views, world-class amenities, and unmatched privacy for the ultimate getaway experience.', 4.8, 127, '+1 (555) 123-4567', 'info@sereneretreat.com', 'https://sereneretreat.com', '123 Luxury Mountain Lane', 'Aspen', 'Colorado', 'United States', '81611', 8, 4, 3, 350.00, '3:00 PM', '11:00 AM', 'Cancellations must be made at least 48 hours before check-in for a full refund. Cancellations within 48 hours will incur a one-night charge.', 'No smoking indoors, No pets allowed, Quiet hours from 10 PM to 8 AM, Maximum occupancy strictly enforced', '["/images/hero/DSC05979.JPG", "/images/hero/DSC05990.JPG", "/images/hero/DSC06008.JPG", "/images/hero/DSC06013.JPG", "/images/hero/DSC06023.JPG"]', '[{"name": "Swimming Pool", "icon": "Pool"}, {"name": "High-Speed WiFi", "icon": "Wifi"}, {"name": "Mountain Views", "icon": "Mountain"}, {"name": "Hot Tub", "icon": "Waves"}, {"name": "Full Kitchen", "icon": "ChefHat"}, {"name": "Fireplace", "icon": "Flame"}, {"name": "Parking", "icon": "Car"}, {"name": "Air Conditioning", "icon": "Snowflake"}]', 1, '2025-11-20 08:41:26', '2025-11-20 08:41:26', 'admin');

-- Insert bookings (24 total)
INSERT INTO bookings (id, booking_reference, room_id, package_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, internal_notes, status, payment_status, payment_method, confirmation_sent, reminder_sent, source, guest_ip, created_at, updated_at) VALUES
(45, 'BK-999256', 'villa-1', 17, 'Test', 'User', 'test@example.com', '+1234567890', '2025-12-20', '2025-12-23', 2, 2, 0, 150.00, 0.00, 'USD', 'Terminal test booking', NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-18 09:27:20', '2025-12-18 09:27:20'),
(46, 'BK-150559', 'villa-3', 15, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-19', '2025-12-20', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-18 14:02:47', '2025-12-18 14:02:47'),
(47, 'BK-214199', 'villa-3', 15, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-19', '2025-12-20', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-18 16:19:11', '2025-12-18 16:19:11'),
(48, 'BK-199540', 'villa-3', 15, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-19', '2025-12-20', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-18 16:34:28', '2025-12-18 16:34:28'),
(49, 'BK-214583', 'villa-3', 15, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-19', '2025-12-20', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'confirmed', 'paid', NULL, 0, 0, 'direct', NULL, '2025-12-18 16:35:05', '2025-12-18 17:27:08'),
(50, 'BK-473191', 'villa-1', 17, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-18', '2025-12-19', 2, 2, 0, 48.00, 0.00, 'USD', NULL, NULL, 'confirmed', 'paid', NULL, 0, 0, 'direct', NULL, '2025-12-18 17:28:09', '2025-12-18 17:28:21'),
(51, 'BK-664799', 'villa-1', NULL, 'tes', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-19 19:50:55', '2025-12-19 19:50:55'),
(52, 'BK-158813', 'villa-1', NULL, 'dadfadf', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-19', '2025-12-20', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-19 19:54:05', '2025-12-19 19:54:05'),
(53, 'BK-577833', 'villa-2', 14, 'tes', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 90.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-19 20:29:50', '2025-12-19 20:29:50'),
(54, 'BK-889903', 'villa-3', 15, 'tes', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-20 04:31:28', '2025-12-20 04:31:28'),
(55, 'BK-709048', 'villa-3', 15, 'dadfadf', 'dafasdfa', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-20 04:37:13', '2025-12-20 04:37:13'),
(56, 'BK-852775', 'villa-3', 15, 'tes', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-20 04:40:14', '2025-12-20 04:40:14'),
(57, 'BK-835057', 'villa-2', 14, 'tes', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 90.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-20 04:41:43', '2025-12-20 04:41:43'),
(58, 'BK-232045', 'villa-2', 14, 'tes', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 90.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-20 04:43:04', '2025-12-20 04:43:04'),
(59, 'BK-842271', 'villa-2', 14, 'tes', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 90.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-20 04:46:53', '2025-12-20 04:46:53'),
(60, 'BK-607526', 'villa-2', 14, 'tes', 'test', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-20', '2025-12-21', 2, 2, 0, 90.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-20 05:06:51', '2025-12-20 05:06:51'),
(61, 'BK-380504', 'villa-3', 15, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-22', '2025-12-23', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-22 08:11:20', '2025-12-22 08:11:20'),
(62, 'BK-294668', 'villa-3', 15, 'dadfadf', 'dafasdfa', 'greatdaniel87@gmail.com', '0895368707977', '2025-12-23', '2025-12-24', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'confirmed', 'paid', NULL, 0, 0, 'direct', NULL, '2025-12-23 15:04:12', '2025-12-23 15:05:15'),
(63, 'BK-176087', 'villa-1', 17, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-29', '2025-12-30', 2, 2, 0, 102.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-29 02:18:08', '2025-12-29 02:18:08'),
(64, 'BK-253704', 'villa-1', 17, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-29', '2025-12-30', 2, 2, 0, 102.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-29 03:12:00', '2025-12-29 03:12:00'),
(65, 'BK-214235', 'villa-3', 15, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-30', '2025-12-31', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-30 17:44:47', '2025-12-30 17:44:47'),
(66, 'BK-304550', 'villa-3', 15, 'Daniel', 'Santoso', 'greatdaniel87@gmail.com', '08814802249', '2025-12-30', '2025-12-31', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-30 18:20:53', '2025-12-30 18:20:53'),
(67, 'BK-772019', 'villa-3', 15, 'Bandu', 'Tramiadji', 'greatdaniel87@gmail.com', '083847611945', '2025-12-30', '2025-12-31', 2, 2, 0, 72.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2025-12-30 18:24:47', '2025-12-30 18:24:47'),
(68, 'BK-467566', 'villa-1', 17, 'Josua ', 'Arya', '6285333309954', '+6281937946193', '2026-01-08', '2026-01-09', 2, 2, 0, 102.00, 0.00, 'USD', NULL, NULL, 'pending', 'pending', NULL, 0, 0, 'direct', NULL, '2026-01-08 08:54:23', '2026-01-08 08:54:23');
