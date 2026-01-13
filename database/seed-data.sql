-- Seed Data for Booking Engine
-- Run with: npx wrangler d1 execute booking-engine --remote --file=database/seed-data.sql

-- =====================
-- ROOMS (5 types)
-- =====================

INSERT INTO rooms (name, type, description, price_per_night, max_guests, is_active, amenities, images) VALUES 
('Deluxe Ocean Suite', 'Suite', 'Luxurious ocean-facing suite with private balcony, king-size bed, and stunning sea views. Features modern amenities and elegant decor. 45 sqm.', 250, 2, 1, '[1,2,3,4,8,9]', '["images/hero/DSC02132.JPG"]');

INSERT INTO rooms (name, type, description, price_per_night, max_guests, is_active, amenities, images) VALUES 
('Family Villa', 'Villa', 'Spacious 2-bedroom villa perfect for families. Includes private pool, full kitchen, and garden terrace with tropical landscaping. 120 sqm.', 450, 6, 1, '[1,2,3,4,21,22,23]', '["images/hero/DSC02125.JPG"]');

INSERT INTO rooms (name, type, description, price_per_night, max_guests, is_active, amenities, images) VALUES 
('Honeymoon Retreat', 'Suite', 'Romantic private suite with outdoor bathtub, champagne on arrival, and breathtaking sunset views. Perfect for couples. 55 sqm.', 350, 2, 1, '[1,2,3,4,8,9,14,16]', '["images/hero/DSC06769.JPG"]');

INSERT INTO rooms (name, type, description, price_per_night, max_guests, is_active, amenities, images) VALUES 
('Garden Bungalow', 'Bungalow', 'Charming standalone bungalow surrounded by lush tropical gardens. Features traditional Balinese design with modern comforts. 35 sqm.', 180, 2, 1, '[1,2,3,4,10,23]', '["images/hero/DSC02176.JPG"]');

INSERT INTO rooms (name, type, description, price_per_night, max_guests, is_active, amenities, images) VALUES 
('Presidential Suite', 'Suite', 'Our most exclusive accommodation with panoramic ocean views, private infinity pool, butler service, and luxury amenities throughout. 150 sqm.', 800, 4, 1, '[1,2,3,4,8,9,11,13,14,15,16,21]', '["images/hero/DSC06826.JPG"]');

-- =====================
-- PACKAGES (8 packages)
-- =====================

INSERT INTO packages (name, description, package_type, base_price, discount_percentage, duration_days, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) VALUES 
('Romantic Escape', 'Perfect getaway for couples featuring candlelit dinners, couples spa treatment, and private beach picnic. Create unforgettable memories together.', 'Romance', 599, 15, 3, 2, 7, 2, 3, 1, 1, '["Couples spa massage","Candlelit dinner for 2","Private beach picnic","Champagne on arrival","Rose petal turndown","Late checkout"]', '["Airfare","Travel insurance","Personal expenses"]', '["images/packages/romantic-escape.jpg"]', '2026-01-01', '2026-12-31', 'Non-refundable. Must be booked 7 days in advance.');

INSERT INTO packages (name, description, package_type, base_price, discount_percentage, duration_days, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) VALUES 
('Family Fun Adventure', 'Action-packed family vacation with kids activities, water sports, and cultural tours. Fun for all ages guaranteed!', 'Family', 899, 10, 5, 3, 10, 6, 2, 1, 1, '["Daily breakfast for family","Kids club access","2 water sports sessions","Cultural village tour","BBQ dinner","Airport transfer"]', '["Airfare","Travel insurance","Extra meals"]', '["images/hero/DSC02125.JPG"]', '2026-01-01', '2026-12-31', 'Children under 5 stay free. Subject to availability.');

INSERT INTO packages (name, description, package_type, base_price, discount_percentage, duration_days, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) VALUES 
('Wellness Retreat', 'Rejuvenate mind, body and soul with daily yoga, meditation sessions, healthy cuisine, and holistic spa treatments.', 'Wellness', 749, 20, 4, 3, 14, 2, 4, 1, 1, '["Daily yoga sessions","Meditation classes","3 spa treatments","Healthy meal plan","Wellness consultation","Herbal tea ceremony"]', '["Airfare","Personal treatments","Shopping"]', '["images/hero/DSC02188.JPG"]', '2026-01-01', '2026-12-31', 'Advance booking required. Dietary requirements must be notified.');

INSERT INTO packages (name, description, package_type, base_price, discount_percentage, duration_days, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) VALUES 
('Business Elite', 'Premium business travel package with executive amenities, meeting facilities, and seamless connectivity for the modern professional.', 'Business', 450, 0, 2, 1, 30, 2, 1, 1, 0, '["High-speed WiFi","Business center access","Express laundry","Airport transfer","Daily breakfast","Late checkout"]', '["Conference room rental","Printing services","Mini bar"]', '["images/packages/business-elite.jpg"]', '2026-01-01', '2026-12-31', 'Corporate rates available. Invoice billing accepted.');

INSERT INTO packages (name, description, package_type, base_price, discount_percentage, duration_days, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) VALUES 
('Adventure Seeker', 'Thrilling outdoor adventures including surfing, hiking, snorkeling, and jungle trekking for the adrenaline enthusiast.', 'Adventure', 699, 10, 4, 3, 7, 4, 4, 1, 1, '["Surfing lesson","Jungle trekking tour","Snorkeling trip","Mountain bike rental","Adventure gear","Daily breakfast"]', '["Travel insurance","Personal equipment","Tips"]', '["images/hero/DSC06793.JPG"]', '2026-01-01', '2026-12-31', 'Physical fitness required. Age 12+ recommended.');

INSERT INTO packages (name, description, package_type, base_price, discount_percentage, duration_days, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) VALUES 
('Cultural Immersion', 'Deep dive into local culture with temple visits, traditional cooking classes, artisan workshops, and authentic village experiences.', 'Culture', 549, 15, 4, 3, 7, 2, 4, 1, 0, '["Temple tour with guide","Cooking class","Batik workshop","Village visit","Traditional dance show","Daily breakfast"]', '["Donations at temples","Shopping","Personal expenses"]', '["images/hero/DSC02199.JPG"]', '2026-01-01', '2026-12-31', 'Modest dress required for temple visits.');

INSERT INTO packages (name, description, package_type, base_price, discount_percentage, duration_days, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) VALUES 
('Luxury Escape', 'The ultimate indulgence featuring our finest suite, private butler, gourmet dining, and exclusive experiences.', 'Luxury', 1499, 0, 3, 2, 14, 4, 5, 1, 1, '["Presidential Suite","Private butler service","Gourmet dinner for 2","Helicopter tour","Private yacht cruise","VIP spa package","Champagne daily"]', '["Airfare","Gratuities","Personal shopping"]', '["images/hero/DSC06826.JPG"]', '2026-01-01', '2026-12-31', 'Premium package. 14-day cancellation policy.');

INSERT INTO packages (name, description, package_type, base_price, discount_percentage, duration_days, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) VALUES 
('Weekend Getaway', 'Quick escape from the city with relaxation, good food, and beautiful surroundings. Perfect for a short break.', 'Relaxation', 299, 5, 2, 2, 3, 2, 1, 1, 0, '["2 nights accommodation","Daily breakfast","Welcome drink","Pool access","Late checkout"]', '["Spa treatments","Tours","Airport transfer"]', '["images/hero/DSC02140.JPG"]', '2026-01-01', '2026-12-31', 'Weekend rates apply Fri-Sun. Subject to availability.');
