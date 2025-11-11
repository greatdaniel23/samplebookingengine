-- ===================================================================
-- COMPREHENSIVE DUMMY DATABASE SETUP
-- Villa Booking Engine - Complete Sample Data
-- ===================================================================
-- This script creates a fully populated database with realistic dummy data
-- Perfect for development, testing, and demonstration purposes

-- Use the existing database
USE booking_engine;

-- Clear existing data (keeping structure)
DELETE FROM bookings;
DELETE FROM admin_users; 
DELETE FROM villa_info;
-- Keep rooms and packages as they are production-ready

-- ===================================================================
-- VILLA INFORMATION - Complete Property Details
-- ===================================================================

INSERT INTO villa_info (
    id, name, location, description, rating, reviews, 
    phone, email, website, address, city, state, zip_code, country,
    check_in_time, check_out_time, max_guests, bedrooms, bathrooms,
    price_per_night, currency, cancellation_policy, house_rules,
    images, amenities, social_media
) VALUES (
    1,
    'Villa Daisy Cantik',
    'Ubud, Bali',
    'Experience the ultimate tropical luxury at Villa Daisy Cantik, a stunning contemporary villa nestled in the heart of Ubud. Surrounded by lush rice terraces and tropical gardens, our villa offers an authentic Balinese experience with modern comfort. Perfect for families, couples, or groups seeking tranquility and adventure in paradise.',
    4.9,
    127,
    '+62 361 234 5678',
    'info@villadaisycantik.com',
    'https://www.villadaisycantik.com',
    'Jl. Raya Ubud No. 123, Sayan Village',
    'Ubud',
    'Bali',
    '80571',
    'Indonesia',
    '15:00',
    '11:00',
    12,
    5,
    4,
    285.00,
    'USD',
    'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours are subject to a one-night charge. No-shows will be charged the full booking amount. Special rates and packages may have different cancellation policies.',
    'Check-in: 3:00 PM - 10:00 PM | Check-out: by 11:00 AM | No smoking inside the villa | No parties or events | Pets not allowed | Children must be supervised at all times | Pool area closes at 10:00 PM | Quiet hours: 10:00 PM - 7:00 AM | Maximum occupancy strictly enforced',
    JSON_ARRAY(
        'https://images.villadaisycantik.com/villa-exterior-sunset.jpg',
        'https://images.villadaisycantik.com/infinity-pool-day.jpg',
        'https://images.villadaisycantik.com/master-bedroom-view.jpg',
        'https://images.villadaisycantik.com/living-area-evening.jpg',
        'https://images.villadaisycantik.com/dining-pavilion.jpg',
        'https://images.villadaisycantik.com/rice-terrace-view.jpg',
        'https://images.villadaisycantik.com/spa-treatment-room.jpg',
        'https://images.villadaisycantik.com/kitchen-modern.jpg'
    ),
    JSON_ARRAY(
        'Infinity Swimming Pool',
        'Private Spa Treatment Room',
        'Fully Equipped Modern Kitchen',
        'High-Speed WiFi Throughout',
        'Air Conditioning in All Rooms',
        'Private Butler Service',
        'Daily Housekeeping',
        'Complimentary Breakfast',
        'Airport Transfer Available',
        'Yoga Pavilion',
        'BBQ Area',
        'Library & Games Room',
        'Safe Parking',
        'Garden & Rice Field Views',
        'Outdoor Dining Area'
    ),
    JSON_OBJECT(
        'instagram', '@villadaisycantik',
        'facebook', 'VillaDaisyCantikUbud',
        'youtube', 'VillaDaisyCantik',
        'tiktok', '@villadaisycantik'
    )
);

-- ===================================================================
-- REALISTIC BOOKING DATA - 30 Days of Sample Bookings
-- ===================================================================

-- Clear any existing bookings first
DELETE FROM bookings;

-- Insert realistic booking data spanning different periods
INSERT INTO bookings (
    room_id, first_name, last_name, email, phone, 
    check_in, check_out, guests, total_price, 
    special_requests, status, created_at
) VALUES

-- November 2025 Bookings
('deluxe-suite', 'Emma', 'Thompson', 'emma.thompson@protonmail.com', '+44 20 7946 0958', 
 '2025-11-15', '2025-11-18', 2, 750.00, 
 'Celebrating our 5th anniversary. Would love champagne and rose petals if possible.', 
 'confirmed', '2025-11-01 09:15:22'),

('family-room', 'Carlos', 'Rodriguez', 'carlos.rod.family@outlook.com', '+34 91 123 4567', 
 '2025-11-20', '2025-11-25', 4, 900.00, 
 'Traveling with 2 children (ages 8 and 12). Need extra towels and kid-friendly amenities.', 
 'confirmed', '2025-11-02 14:30:45'),

('master-suite', 'Hiroshi', 'Tanaka', 'h.tanaka.business@gmail.com', '+81 3 1234 5678', 
 '2025-11-22', '2025-11-26', 2, 1800.00, 
 'Business trip. Need early check-in at 12 PM if possible. Quiet room preferred.', 
 'confirmed', '2025-11-03 16:45:12'),

('standard-room', 'Sophie', 'Dubois', 'sophie.dubois@free.fr', '+33 1 23 45 67 89', 
 '2025-11-28', '2025-12-01', 2, 360.00, 
 'First time in Bali. Would appreciate local restaurant recommendations.', 
 'confirmed', '2025-11-05 11:20:33'),

-- December 2025 Bookings (Holiday Season)
('master-suite', 'Alexander', 'Petrov', 'alex.petrov.moscow@yandex.ru', '+7 495 123 4567', 
 '2025-12-01', '2025-12-05', 3, 1800.00, 
 'New Year celebration trip. Need late checkout on departure day.', 
 'confirmed', '2025-11-10 08:45:15'),

('economy-room', 'Priya', 'Sharma', 'priya.sharma.delhi@gmail.com', '+91 11 2345 6789', 
 '2025-12-03', '2025-12-06', 2, 255.00, 
 'Budget travelers. Interested in local cultural tours and cooking classes.', 
 'confirmed', '2025-11-07 13:25:44'),

('deluxe-suite', 'James', 'Mitchell', 'j.mitchell.architect@icloud.com', '+1 415 555 0192', 
 '2025-12-08', '2025-12-12', 2, 1000.00, 
 'Architect studying Balinese design. Would love to photograph the villa architecture.', 
 'confirmed', '2025-11-08 10:15:30'),

('family-room', 'Ana', 'Silva', 'ana.silva.familia@hotmail.com', '+55 11 9876 5432', 
 '2025-12-10', '2025-12-15', 5, 900.00, 
 'Family vacation with grandparents. Need ground floor access and wheelchair accessibility.', 
 'confirmed', '2025-11-09 15:40:18'),

('standard-room', 'Mohammed', 'Al-Rashid', 'm.alrashid@emirates.net.ae', '+971 4 123 4567', 
 '2025-12-15', '2025-12-18', 2, 360.00, 
 'Honeymoon trip. Prefer quiet room with garden view. Halal food options needed.', 
 'confirmed', '2025-11-10 12:55:27'),

('master-suite', 'Isabella', 'Rossi', 'isabella.rossi.milano@libero.it', '+39 02 1234 5678', 
 '2025-12-20', '2025-12-27', 2, 3150.00, 
 'Christmas and New Year celebration. VIP treatment requested. Dietary restrictions: vegetarian.', 
 'confirmed', '2025-11-11 09:30:45'),

-- January 2026 Bookings
('economy-room', 'Lars', 'Nielsen', 'lars.nielsen.copenhagen@gmail.com', '+45 32 12 34 56', 
 '2026-01-05', '2026-01-08', 1, 255.00, 
 'Solo traveler. Interested in meditation retreats and yoga classes.', 
 'confirmed', '2025-11-12 14:20:12'),

('deluxe-suite', 'Sarah', 'Chen', 'sarah.chen.toronto@rogers.com', '+1 416 555 0123', 
 '2026-01-10', '2026-01-14', 2, 1000.00, 
 'Winter escape from Canada. Love spicy food and adventure activities.', 
 'confirmed', '2025-11-13 16:45:33'),

('family-room', 'Hans', 'Mueller', 'h.mueller.family@t-online.de', '+49 89 1234 5678', 
 '2026-01-15', '2026-01-20', 4, 900.00, 
 'Family with teenagers. Need WiFi for remote schooling. Interested in surfing lessons.', 
 'confirmed', '2025-11-14 11:10:55'),

('standard-room', 'Maria', 'Gonzalez', 'maria.gonzalez.madrid@yahoo.es', '+34 91 987 6543', 
 '2026-01-22', '2026-01-25', 2, 360.00, 
 'Art enthusiasts. Want to visit local galleries and meet Balinese artists.', 
 'confirmed', '2025-11-15 13:35:18'),

-- February 2026 Bookings (Valentine Season)
('master-suite', 'Robert', 'Johnson', 'rob.johnson.miami@gmail.com', '+1 305 555 0987', 
 '2026-02-12', '2026-02-16', 2, 1800.00, 
 'Valentine surprise for wife. Need romantic setup and private dinner arrangement.', 
 'confirmed', '2025-11-16 10:25:40'),

('deluxe-suite', 'Yuki', 'Nakamura', 'yuki.nakamura.osaka@docomo.ne.jp', '+81 6 1234 5678', 
 '2026-02-18', '2026-02-22', 2, 1000.00, 
 'Photography enthusiast. Early morning pool access needed for sunrise shots.', 
 'confirmed', '2025-11-17 15:50:22'),

-- Pending and Recent Bookings
('economy-room', 'David', 'Brown', 'david.brown.london@btinternet.com', '+44 20 7123 4567', 
 '2026-02-25', '2026-02-28', 2, 255.00, 
 'Last-minute booking. Flexible with room assignment.', 
 'pending', '2025-11-18 09:15:33'),

('family-room', 'Lisa', 'Wang', 'lisa.wang.sydney@optusnet.com.au', '+61 2 9876 5432', 
 '2026-03-01', '2026-03-06', 6, 900.00, 
 'Multi-generational family trip. Need connecting rooms if available.', 
 'pending', '2025-11-18 14:40:17'),

-- Some cancelled bookings for realistic data
('standard-room', 'Pierre', 'Dubois', 'pierre.dubois.paris@orange.fr', '+33 1 98 76 54 32', 
 '2025-12-05', '2025-12-08', 2, 360.00, 
 'Work commitment changed. Very sorry for cancellation.', 
 'cancelled', '2025-11-05 11:30:22'),

('deluxe-suite', 'Antonio', 'Lopez', 'antonio.lopez.barcelona@telefonica.es', '+34 93 123 4567', 
 '2025-11-25', '2025-11-28', 2, 750.00, 
 'Flight cancelled due to airline strike. Will rebook for next month.', 
 'cancelled', '2025-11-08 16:20:45');

-- ===================================================================
-- ADMIN USERS - Secure Sample Accounts
-- ===================================================================

-- Remove default admin
DELETE FROM admin_users WHERE username = 'admin';

-- Create realistic admin accounts with secure passwords
INSERT INTO admin_users (
    username, password_hash, email, first_name, last_name, 
    role, active, created_at
) VALUES 
-- Villa Manager
('villa_manager', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 'manager@villadaisycantik.com', 'Kadek', 'Sari', 'manager', TRUE, NOW()),

-- System Administrator  
('admin_daisy', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 'admin@villadaisycantik.com', 'Made', 'Wijaya', 'admin', TRUE, NOW()),

-- Front Desk Staff
('frontdesk_staff', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 'frontdesk@villadaisycantik.com', 'Ni Putu', 'Ayu', 'staff', TRUE, NOW()),

-- Backup Admin (Inactive)
('backup_admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
 'backup@villadaisycantik.com', 'Wayan', 'Bagus', 'admin', FALSE, NOW());

-- ===================================================================
-- DATA VERIFICATION QUERIES
-- ===================================================================

-- Show summary of created data
SELECT '=== DATABASE SUMMARY ===' as info;

SELECT 'Villa Information' as category, COUNT(*) as records FROM villa_info
UNION ALL
SELECT 'Room Types', COUNT(*) FROM rooms  
UNION ALL
SELECT 'Packages', COUNT(*) FROM packages
UNION ALL
SELECT 'Total Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Confirmed Bookings', COUNT(*) FROM bookings WHERE status = 'confirmed'
UNION ALL
SELECT 'Pending Bookings', COUNT(*) FROM bookings WHERE status = 'pending'
UNION ALL
SELECT 'Cancelled Bookings', COUNT(*) FROM bookings WHERE status = 'cancelled'
UNION ALL
SELECT 'Admin Users', COUNT(*) FROM admin_users
UNION ALL
SELECT 'Active Admins', COUNT(*) FROM admin_users WHERE active = TRUE;

SELECT '=== BOOKING REVENUE ANALYSIS ===' as info;

SELECT 
    MONTHNAME(check_in) as month,
    COUNT(*) as bookings,
    SUM(total_price) as revenue,
    AVG(total_price) as avg_booking_value
FROM bookings 
WHERE status = 'confirmed'
GROUP BY YEAR(check_in), MONTH(check_in)
ORDER BY check_in;

SELECT '=== ROOM POPULARITY ===' as info;

SELECT 
    r.name as room_type,
    COUNT(b.id) as bookings,
    SUM(b.total_price) as total_revenue,
    AVG(b.total_price) as avg_revenue_per_booking
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id AND b.status = 'confirmed'
GROUP BY r.id, r.name
ORDER BY bookings DESC;

SELECT '=== SETUP COMPLETE ===' as status;