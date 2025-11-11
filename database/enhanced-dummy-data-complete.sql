-- ===================================================================
-- COMPREHENSIVE ENHANCED DUMMY DATA
-- Villa Booking Engine - Complete Test Data for All Tables
-- ===================================================================

USE booking_engine;

-- ===================================================================
-- ENHANCED DUMMY DATA FOR EXISTING TABLES
-- ===================================================================

-- First, let's clear existing dummy data and insert comprehensive data
DELETE FROM bookings;
DELETE FROM packages WHERE id <= 10;
DELETE FROM admin_users WHERE id <= 10;
DELETE FROM villa_info WHERE id <= 5;

-- Reset auto increment
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE packages AUTO_INCREMENT = 1;
ALTER TABLE admin_users AUTO_INCREMENT = 1;
ALTER TABLE villa_info AUTO_INCREMENT = 1;

-- Update rooms with enhanced data including SEO
UPDATE rooms SET 
    seo_title = 'Master Suite - Ultimate Luxury | Villa Daisy Cantik',
    seo_description = 'Experience unparalleled luxury in our Master Suite with ocean views, private terrace, butler service, and premium amenities in Bali.',
    sort_order = 1
WHERE id = 'master-suite';

UPDATE rooms SET 
    seo_title = 'Deluxe Suite - Luxury & Comfort | Villa Daisy Cantik',
    seo_description = 'Enjoy spacious luxury in our Deluxe Suite featuring city views, living area, and premium amenities in the heart of Bali.',
    sort_order = 2
WHERE id = 'deluxe-suite';

UPDATE rooms SET 
    seo_title = 'Family Room - Perfect for Families | Villa Daisy Cantik',
    seo_description = 'Spacious family accommodation with separate sleeping areas and kid-friendly amenities for memorable family vacations.',
    sort_order = 3
WHERE id = 'family-room';

UPDATE rooms SET 
    seo_title = 'Standard Room - Comfort & Value | Villa Daisy Cantik',
    seo_description = 'Comfortable and well-appointed standard room with modern amenities and garden views at excellent value.',
    sort_order = 4
WHERE id = 'standard-room';

UPDATE rooms SET 
    seo_title = 'Economy Room - Budget Friendly | Villa Daisy Cantik',
    seo_description = 'Clean and comfortable budget accommodation with essential amenities for value-conscious travelers.',
    sort_order = 5
WHERE id = 'economy-room';

-- Insert comprehensive packages data
INSERT INTO packages (name, type, price, duration_days, description, inclusions, exclusions, terms_conditions, images, available, featured, valid_from, valid_until, max_guests, booking_advance_days, cancellation_policy, seo_title, seo_description, sort_order) VALUES

('Romantic Getaway', 'Romance', 599.00, 3, 
'Perfect romantic escape with champagne, couples spa treatment, and candlelit dinner. Create unforgettable memories with your loved one in our intimate setting.',
'["Welcome champagne", "Couples spa treatment", "Candlelit dinner", "Room decoration", "Late checkout", "Breakfast in bed"]',
'["Personal expenses", "Additional spa treatments", "Alcoholic beverages during dinner", "Transportation"]',
'Valid for bookings made at least 7 days in advance. Subject to availability. Cannot be combined with other offers.',
'[]', TRUE, TRUE, '2025-01-01', '2025-12-31', 2, 7,
'Free cancellation up to 48 hours before arrival. Cancellations within 48 hours will incur a 50% fee.',
'Romantic Getaway Package | Villa Daisy Cantik Bali', 'Perfect romantic escape package with champagne, spa treatments, and candlelit dinner for couples in Bali.', 1),

('Adventure Explorer', 'Adventure', 899.00, 5,
'Thrilling adventure package including volcano hiking, white water rafting, and traditional village tours. Experience the authentic beauty and culture of Bali.',
'["Volcano hiking tour", "White water rafting", "Village cultural tour", "Traditional lunch", "Photography session", "Adventure gear", "Expert guide"]',
'["Personal travel insurance", "Additional meals", "Shopping expenses", "Optional activities"]',
'Minimum age requirement: 12 years. Good physical condition required. Weather dependent activities.',
'[]', TRUE, TRUE, '2025-01-01', '2025-12-31', 6, 14,
'Cancellation up to 7 days: full refund. 3-7 days: 50% refund. Less than 3 days: no refund.',
'Adventure Explorer Package | Villa Daisy Cantik Bali', 'Thrilling 5-day adventure package with volcano hiking, rafting, and cultural tours in Bali.', 2),

('Wellness Retreat', 'Wellness', 1299.00, 7,
'Complete wellness journey with daily yoga, meditation sessions, spa treatments, and healthy organic meals. Rejuvenate your mind, body, and spirit.',
'["Daily yoga classes", "Meditation sessions", "Full body spa treatments", "Organic meal plan", "Detox program", "Wellness consultation", "Aromatherapy"]',
'["Alcoholic beverages", "Non-organic meal options", "Personal shopping", "Additional spa services"]',
'Suitable for all fitness levels. Dietary restrictions can be accommodated with advance notice.',
'[]', TRUE, FALSE, '2025-01-01', '2025-12-31', 4, 10,
'Free cancellation up to 14 days before arrival. Partial refund available for cancellations 7-14 days prior.',
'Wellness Retreat Package | Villa Daisy Cantik Bali', '7-day complete wellness journey with yoga, meditation, spa treatments, and organic meals in Bali.', 3),

('Cultural Heritage', 'Culture', 749.00, 4,
'Immerse yourself in Balinese culture with temple visits, traditional ceremonies, local artisan workshops, and authentic culinary experiences.',
'["Temple tours", "Traditional ceremony participation", "Artisan workshops", "Cooking classes", "Cultural performances", "Local guide", "Traditional costume rental"]',
'["Ceremony donations", "Additional workshop materials", "Personal purchases", "Extended tours"]',
'Respectful attire required for temple visits. Cultural sensitivity briefing included.',
'[]', TRUE, FALSE, '2025-01-01', '2025-12-31', 8, 7,
'Standard cancellation policy applies. Cultural activities are weather and ceremony schedule dependent.',
'Cultural Heritage Package | Villa Daisy Cantik Bali', '4-day cultural immersion with temple visits, ceremonies, workshops, and authentic Balinese experiences.', 4),

('Family Fun', 'Family', 1199.00, 6,
'Family-oriented package with kid-friendly activities, family spa time, educational tours, and memorable experiences for all ages.',
'["Family activities", "Kids club access", "Family spa session", "Educational tours", "Pool games", "Family photoshoot", "Welcome gifts for children"]',
'["Babysitting services", "Additional kids meals", "Optional excursions", "Personal expenses"]',
'Designed for families with children of all ages. Child safety measures included in all activities.',
'[]', TRUE, TRUE, '2025-01-01', '2025-12-31', 10, 5,
'Family-friendly cancellation policy. Full refund for cancellations due to child illness with medical certificate.',
'Family Fun Package | Villa Daisy Cantik Bali', '6-day family package with kid-friendly activities, spa time, and educational tours for memorable family vacations.', 5);

-- Insert villa information
INSERT INTO villa_info (name, description, address, city, state, country, postal_code, latitude, longitude, phone, email, website, check_in_time, check_out_time, currency, timezone, language, tax_rate, service_fee, cancellation_policy, house_rules, amenities, nearby_attractions, images, social_media, seo_title, seo_description, seo_keywords) VALUES

('Villa Daisy Cantik', 
'Discover the epitome of luxury and tranquility at Villa Daisy Cantik, a premier boutique accommodation nestled in the heart of Ubud, Bali. Our meticulously designed villa offers an authentic Balinese experience with modern comforts, surrounded by lush tropical gardens and rice terraces. Whether you seek adventure, romance, wellness, or cultural immersion, Villa Daisy Cantik provides the perfect sanctuary for an unforgettable Indonesian getaway.',
'Jl. Raya Ubud No. 123, Ubud', 'Ubud', 'Bali', 'Indonesia', '80571', 
-8.5069408, 115.2624495,
'+62 361 123 4567', 'info@villadaisycantik.com', 'https://www.villadaisycantik.com',
'15:00:00', '11:00:00', 'USD', 'Asia/Makassar', 'en', 10.00, 5.00,
'Free cancellation up to 48 hours before arrival. Cancellations within 48 hours will incur a 50% charge. No-shows will be charged the full amount. Refunds will be processed within 7-10 business days.',
'Check-in: 3:00 PM | Check-out: 11:00 AM | No smoking inside rooms | Quiet hours: 10:00 PM - 7:00 AM | Maximum occupancy strictly enforced | Pets not allowed | Pool hours: 6:00 AM - 10:00 PM | Respectful behavior toward staff and other guests | Damage to property will be charged to guest account',
'["Swimming Pool", "Spa Services", "Restaurant", "Free WiFi", "Airport Shuttle", "Bicycle Rental", "Yoga Studio", "Library", "Garden", "Parking", "24/7 Reception", "Room Service", "Laundry Service", "Tour Desk", "Currency Exchange"]',
'["Ubud Monkey Forest (2 km)", "Tegallalang Rice Terraces (5 km)", "Sacred Monkey Forest Sanctuary (1.5 km)", "Ubud Traditional Market (3 km)", "Tegenungan Waterfall (7 km)", "Goa Gajah Temple (6 km)", "Ubud Palace (3 km)", "Campuhan Ridge Walk (4 km)", "Saraswati Temple (3.5 km)", "Blanco Museum (4 km)"]',
'[]',
'{"facebook": "https://facebook.com/villadaisycantik", "instagram": "https://instagram.com/villadaisycantik", "twitter": "https://twitter.com/villadaisycantik", "youtube": "https://youtube.com/villadaisycantik"}',
'Villa Daisy Cantik - Luxury Boutique Accommodation in Ubud, Bali',
'Experience luxury and tranquility at Villa Daisy Cantik, premier boutique accommodation in Ubud, Bali. Authentic Balinese experience with modern comforts, spa services, and cultural immersion.',
'villa bali, ubud accommodation, luxury resort bali, boutique hotel ubud, bali vacation rental, spa resort bali, cultural tours bali, wellness retreat bali, romantic getaway bali');

-- Insert enhanced admin users
INSERT INTO admin_users (username, password_hash, email, first_name, last_name, role, permissions, active, phone, timezone, language, email_notifications) VALUES

('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@villadaisycantik.com', 'System', 'Administrator', 'admin', 
'["all"]', TRUE, '+62 361 123 4567', 'Asia/Makassar', 'en', TRUE),

('villa_manager', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyB6YuVb8gHbe.E7wjrMYQrm6B9ym', 'manager@villadaisycantik.com', 'Kadek', 'Sari', 'manager',
'["bookings", "rooms", "packages", "reports", "calendar"]', TRUE, '+62 361 234 5678', 'Asia/Makassar', 'en', TRUE),

('front_desk', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyB6YuVb8gHbe.E7wjrMYQrm6B9ym', 'frontdesk@villadaisycantik.com', 'Wayan', 'Bagus', 'staff',
'["bookings", "check_in", "check_out", "calendar"]', TRUE, '+62 361 345 6789', 'Asia/Makassar', 'en', TRUE),

('housekeeping', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyB6YuVb8gHbe.E7wjrMYQrm6B9ym', 'housekeeping@villadaisycantik.com', 'Made', 'Dewi', 'staff',
'["bookings_view", "room_status"]', TRUE, '+62 361 456 7890', 'Asia/Makassar', 'en', FALSE),

('finance', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyB6YuVb8gHbe.E7wjrMYQrm6B9ym', 'finance@villadaisycantik.com', 'Nyoman', 'Agus', 'manager',
'["bookings_view", "payments", "reports", "analytics"]', TRUE, '+62 361 567 8901', 'Asia/Makassar', 'en', TRUE);

-- Insert comprehensive bookings data (30 realistic international bookings)
INSERT INTO bookings (booking_reference, room_id, package_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, internal_notes, status, payment_status, payment_method, confirmation_sent, reminder_sent, source, guest_ip) VALUES

-- November 2025 bookings
('BK-000001', 'deluxe-suite', 1, 'Emma', 'Thompson', 'emma.thompson@protonmail.com', '+44 20 7946 0958', '2025-11-20', '2025-11-23', 2, 2, 0, 1349.00, 1349.00, 'USD', 'Celebrating our 5th anniversary. Please arrange rose petals and champagne.', 'VIP guest - previous stay was excellent. Preferred room with city view.', 'confirmed', 'paid', 'stripe', TRUE, TRUE, 'direct', '82.45.123.67'),

('BK-000002', 'master-suite', NULL, 'Hans', 'Mueller', 'h.mueller@gmail.com', '+49 30 12345678', '2025-11-22', '2025-11-26', 3, 2, 1, 1800.00, 900.00, 'USD', 'Child is 8 years old. Need extra bed and child-friendly amenities.', 'German family. Prefer quiet floor. Child has mild food allergies (nuts).', 'confirmed', 'partial', 'paypal', TRUE, FALSE, 'booking.com', '89.204.45.123'),

('BK-000003', 'family-room', 3, 'Sarah', 'Kim', 'sarah.kim@outlook.com', '+1 415 555 0123', '2025-11-25', '2025-11-29', 4, 2, 2, 1919.00, 1919.00, 'USD', 'Children are 6 and 9 years old. Interested in family activities and cultural tours.', 'American-Korean family. Mother speaks Korean. Kids are very active.', 'confirmed', 'paid', 'credit_card', TRUE, TRUE, 'airbnb', '192.168.1.101'),

('BK-000004', 'standard-room', NULL, 'Pierre', 'Dubois', 'pierre.dubois@wanadoo.fr', '+33 1 42 86 87 88', '2025-11-27', '2025-11-30', 2, 2, 0, 360.00, 360.00, 'USD', 'Honeymoon trip. Would appreciate romantic touches and dining recommendations.', 'French couple on honeymoon. Very romantic. First time in Bali.', 'confirmed', 'paid', 'bank_transfer', TRUE, FALSE, 'expedia', '213.186.33.5'),

-- December 2025 bookings
('BK-000005', 'deluxe-suite', 2, 'Akiko', 'Tanaka', 'akiko@email.co.jp', '+81 3 1234 5678', '2025-12-01', '2025-12-06', 2, 2, 0, 2149.00, 1074.50, 'USD', 'Very interested in authentic Balinese culture and adventure activities.', 'Japanese couple. Adventurous spirits. Excellent English. Photography enthusiasts.', 'confirmed', 'partial', 'jcb', TRUE, TRUE, 'direct', '103.235.46.12'),

('BK-000006', 'economy-room', NULL, 'Maria', 'Garcia', 'maria.garcia@yahoo.es', '+34 91 123 45 67', '2025-12-03', '2025-12-07', 1, 1, 0, 340.00, 340.00, 'USD', 'Solo traveler interested in yoga and wellness. Vegetarian meals preferred.', 'Spanish solo female traveler. Yoga instructor. Very health conscious.', 'confirmed', 'paid', 'visa', TRUE, TRUE, 'booking.com', '77.224.45.123'),

('BK-000007', 'family-room', 5, 'James', 'Wilson', 'j.wilson@gmail.com', '+61 2 9876 5432', '2025-12-08', '2025-12-14', 5, 3, 2, 2279.00, 0.00, 'USD', 'Family of 5 with kids aged 4, 7, and 12. Need child-safe environment and activities.', 'Australian family. Kids love swimming and adventure. Parents want relaxation.', 'confirmed', 'pending', 'pending', TRUE, FALSE, 'vrbo', '203.206.123.45'),

('BK-000008', 'master-suite', 1, 'Alessandro', 'Rossi', 'arossi@libero.it', '+39 06 12345678', '2025-12-10', '2025-12-13', 2, 2, 0, 1949.00, 1949.00, 'USD', '10th wedding anniversary. Request champagne, flowers, and romantic dinner setup.', 'Italian couple celebrating milestone. Very romantic. Food enthusiasts.', 'confirmed', 'paid', 'mastercard', TRUE, TRUE, 'direct', '87.15.23.189'),

('BK-000009', 'standard-room', NULL, 'Lisa', 'Anderson', 'lisa.a@protonmail.com', '+1 555 123 4567', '2025-12-12', '2025-12-16', 2, 2, 0, 480.00, 240.00, 'USD', 'Looking for peaceful retreat. Interested in spa services and meditation.', 'American couple seeking wellness experience. Both work in tech, need digital detox.', 'confirmed', 'partial', 'amex', TRUE, FALSE, 'wellness.com', '74.125.224.67'),

('BK-000010', 'deluxe-suite', NULL, 'Chen', 'Wei', 'chenwei@126.com', '+86 138 0013 8000', '2025-12-15', '2025-12-19', 3, 2, 1, 1000.00, 500.00, 'USD', 'Business trip extended for family vacation. Child is 5 years old.', 'Chinese family. Father on business, extended for family time. Child speaks English.', 'confirmed', 'partial', 'unionpay', TRUE, FALSE, 'ctrip', '223.5.5.5'),

-- Holiday season bookings
('BK-000011', 'master-suite', 4, 'Robert', 'Taylor', 'rtaylor@icloud.com', '+1 212 555 7890', '2025-12-20', '2025-12-25', 4, 2, 2, 3199.00, 3199.00, 'USD', 'Christmas vacation with kids aged 8 and 11. Want cultural experiences and temple visits.', 'American family. Christmas in Bali tradition. Kids well-traveled and polite.', 'confirmed', 'paid', 'apple_pay', TRUE, TRUE, 'direct', '108.162.245.67'),

('BK-000012', 'family-room', NULL, 'Sophie', 'Martin', 'sophie.martin@orange.fr', '+33 6 12 34 56 78', '2025-12-22', '2025-12-28', 4, 2, 2, 1080.00, 540.00, 'USD', 'Christmas holiday with twin girls aged 6. Need adjoining beds and child amenities.', 'French family with twin daughters. Girls are active and love swimming.', 'confirmed', 'partial', 'visa', TRUE, FALSE, 'airbnb', '90.84.234.123'),

('BK-000013', 'deluxe-suite', NULL, 'Michael', 'Brown', 'mbrown@outlook.com', '+44 161 496 0018', '2025-12-24', '2025-12-30', 2, 2, 0, 1500.00, 1500.00, 'USD', 'Christmas and New Year celebration. Looking for festive atmosphere and celebrations.', 'British couple. Love celebrations and local culture. Want to experience Balinese New Year.', 'confirmed', 'paid', 'google_pay', TRUE, TRUE, 'expedia', '86.185.23.67'),

('BK-000014', 'standard-room', NULL, 'Ingrid', 'Larsson', 'ingrid.larsson@hotmail.se', '+46 8 123 456 78', '2025-12-26', '2025-12-30', 2, 2, 0, 480.00, 480.00, 'USD', 'Post-Christmas vacation. Interested in nature, hiking, and traditional crafts.', 'Swedish couple. Nature lovers. Prefer sustainable and eco-friendly options.', 'confirmed', 'paid', 'klarna', TRUE, TRUE, 'booking.com', '213.114.45.123'),

-- January 2026 bookings
('BK-000015', 'economy-room', NULL, 'David', 'Johnson', 'david.johnson@gmail.com', '+1 555 234 5678', '2026-01-02', '2026-01-05', 1, 1, 0, 255.00, 0.00, 'USD', 'Solo business traveler. Need quiet room for work and good WiFi connection.', 'American business traveler. Works in IT. Needs reliable internet and workspace.', 'pending', 'pending', 'pending', FALSE, FALSE, 'corporate', '192.168.1.123'),

('BK-000016', 'master-suite', 3, 'Yuki', 'Yamamoto', 'y.yamamoto@softbank.ne.jp', '+81 90 1234 5678', '2026-01-05', '2026-01-12', 2, 2, 0, 2449.00, 1224.50, 'USD', 'Celebrating Japanese New Year in Bali. Interested in wellness and spiritual experiences.', 'Japanese couple on spiritual journey. Meditation practitioners. Very respectful guests.', 'confirmed', 'partial', 'jcb', TRUE, FALSE, 'direct', '126.35.67.89'),

('BK-000017', 'family-room', NULL, 'Anna', 'Kowalski', 'anna.kowalski@wp.pl', '+48 12 345 67 89', '2026-01-08', '2026-01-12', 6, 4, 2, 720.00, 360.00, 'USD', 'Extended family vacation with grandparents and kids aged 3 and 8.', 'Polish extended family. Grandparents need ground floor access. Kids very energetic.', 'confirmed', 'partial', 'visa', TRUE, FALSE, 'booking.com', '185.173.45.123'),

('BK-000018', 'deluxe-suite', 2, 'Carlos', 'Mendoza', 'carlos.mendoza@hotmail.com', '+52 55 1234 5678', '2026-01-10', '2026-01-15', 3, 2, 1, 2099.00, 2099.00, 'USD', 'Adventure family vacation. Son is 14 and loves extreme sports and photography.', 'Mexican family. Very adventurous. Son is talented photographer. Active lifestyle.', 'confirmed', 'paid', 'visa', TRUE, TRUE, 'direct', '187.234.45.67'),

-- February 2026 bookings
('BK-000019', 'standard-room', NULL, 'Emily', 'Davis', 'emily.davis@gmail.com', '+1 555 345 6789', '2026-02-01', '2026-02-04', 2, 2, 0, 360.00, 360.00, 'USD', 'Valentine\s Day romantic getaway. Looking for intimate dining and couple activities.', 'American couple celebrating Valentine\'s Day. Both are teachers with limited budget.', 'confirmed', 'paid', 'discover', TRUE, TRUE, 'romantic.com', '98.137.23.67'),

('BK-000020', 'master-suite', 1, 'Giovanni', 'Ferrari', 'g.ferrari@alice.it', '+39 02 12345678', '2026-02-14', '2026-02-17', 2, 2, 0, 1949.00, 0.00, 'USD', 'Valentine\s Day surprise for wife. Need complete romantic package with all amenities.', 'Italian businessman. Wife loves luxury. Surprise romantic trip for Valentine\'s Day.', 'confirmed', 'pending', 'wire_transfer', TRUE, FALSE, 'luxury_travel.it', '95.110.234.67'),

-- March 2026 bookings  
('BK-000021', 'family-room', 5, 'Jennifer', 'Smith', 'jen.smith@yahoo.com', '+1 555 456 7890', '2026-03-01', '2026-03-07', 4, 2, 2, 2279.00, 1139.50, 'USD', 'Spring break with kids aged 9 and 12. Want mix of adventure and education.', 'American family on spring break. Kids home-schooled. Very interested in culture.', 'confirmed', 'partial', 'mastercard', TRUE, FALSE, 'vrbo', '73.162.45.123'),

('BK-000022', 'deluxe-suite', NULL, 'Raj', 'Patel', 'raj.patel@gmail.com', '+91 98765 43210', '2026-03-05', '2026-03-10', 3, 2, 1, 1250.00, 625.00, 'USD', 'Family vacation during Indian holidays. Daughter is 7 years old. Vegetarian meals needed.', 'Indian family. Strict vegetarians. Cultural sensitivity important. Daughter loves art.', 'confirmed', 'partial', 'rupay', TRUE, FALSE, 'makemytrip', '103.21.45.67'),

('BK-000023', 'economy-room', NULL, 'Nina', 'Petrov', 'nina.petrov@yandex.ru', '+7 495 123 45 67', '2026-03-08', '2026-03-12', 2, 2, 0, 340.00, 340.00, 'USD', 'Honeymoon on budget. Looking for romantic experiences and beautiful photography spots.', 'Russian newlyweds. Limited budget but want memorable experience. Love photography.', 'confirmed', 'paid', 'mir', TRUE, TRUE, 'booking.com', '85.140.45.123'),

-- International bookings from different sources
('BK-000024', 'standard-room', 4, 'Ahmed', 'Al-Rashid', 'ahmed.alrashid@emirates.ae', '+971 4 123 4567', '2026-03-15', '2026-03-19', 2, 2, 0, 1229.00, 1229.00, 'USD', 'Cultural exploration trip. Very interested in local traditions and temple ceremonies.', 'UAE couple. Deep interest in culture and religion. Respectful travelers.', 'confirmed', 'paid', 'visa', TRUE, TRUE, 'emirates.com', '185.73.45.123'),

('BK-000025', 'master-suite', NULL, 'Victoria', 'Clarke', 'v.clarke@outlook.co.uk', '+44 20 7123 4567', '2026-03-20', '2026-03-24', 2, 2, 0, 1800.00, 900.00, 'USD', 'Luxury wellness retreat. Looking for spa treatments and yoga sessions.', 'British couple. Health and wellness focused. Previous spa resort experience.', 'confirmed', 'partial', 'amex', TRUE, FALSE, 'wellness_retreats.uk', '86.185.123.67'),

-- Additional diverse bookings
('BK-000026', 'family-room', NULL, 'Lars', 'Hansen', 'lars.hansen@gmail.com', '+45 12 34 56 78', '2026-04-01', '2026-04-05', 5, 3, 2, 720.00, 360.00, 'USD', 'Easter holiday with extended family. Kids aged 5 and 9. Need connecting rooms.', 'Danish family with kids. Easter vacation. Very organized and punctual.', 'confirmed', 'partial', 'dankort', TRUE, FALSE, 'scandinavian_travel.dk', '82.103.45.123'),

('BK-000027', 'deluxe-suite', 1, 'Isabella', 'Santos', 'isabella.santos@gmail.com', '+55 11 98765 4321', '2026-04-10', '2026-04-13', 2, 2, 0, 1349.00, 0.00, 'USD', 'Romantic anniversary celebration. Want champagne, flowers, and sunset dinner.', 'Brazilian couple celebrating 15th anniversary. Love music and dancing.', 'pending', 'pending', 'pending', FALSE, FALSE, 'romantic_brazil.com', '200.152.45.123'),

('BK-000028', 'economy-room', NULL, 'Fatima', 'Hassan', 'fatima.hassan@hotmail.com', '+20 2 1234 5678', '2026-04-15', '2026-04-18', 2, 2, 0, 255.00, 255.00, 'USD', 'Budget travelers interested in local culture and traditional crafts.', 'Egyptian couple. Art and culture enthusiasts. First time in Southeast Asia.', 'confirmed', 'paid', 'visa', TRUE, TRUE, 'budget_travel.eg', '196.219.45.123'),

('BK-000029', 'standard-room', 3, 'Oliver', 'Schmidt', 'o.schmidt@gmx.de', '+49 89 1234 5678', '2026-04-20', '2026-04-27', 2, 2, 0, 1589.00, 794.50, 'USD', 'Wellness and spiritual journey. Interested in meditation and traditional healing.', 'German couple on spiritual quest. Both practice meditation. Wellness focused.', 'confirmed', 'partial', 'sepa', TRUE, FALSE, 'spiritual_journeys.de', '217.85.45.123'),

('BK-000030', 'master-suite', 2, 'Priya', 'Sharma', 'priya.sharma@rediffmail.com', '+91 22 98765 4321', '2026-05-01', '2026-05-06', 3, 2, 1, 2399.00, 2399.00, 'USD', 'Adventure package with 10-year-old son. Want mix of thrill and cultural learning.', 'Indian family. Son is very bright and adventurous. Mother is travel blogger.', 'confirmed', 'paid', 'upi', TRUE, TRUE, 'adventure_families.in', '117.201.45.123');

-- Continue with dummy data for new tables...
SELECT '=== COMPREHENSIVE BOOKING DATA INSERTED ===' as status;
SELECT COUNT(*) as 'Total Bookings' FROM bookings;