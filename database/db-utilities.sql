-- ===================================================================
-- DATABASE MANAGEMENT UTILITIES
-- Quick commands for managing the dummy database
-- ===================================================================

USE booking_engine;

-- ===================================================================
-- QUICK STATUS CHECK
-- ===================================================================

-- Overall database status
SELECT '=== CURRENT DATABASE STATUS ===' as info;

SELECT 
    'rooms' as table_name, 
    COUNT(*) as total_records,
    'PRODUCTION READY' as status
FROM rooms
UNION ALL
SELECT 
    'packages', 
    COUNT(*), 
    'PRODUCTION READY'
FROM packages
UNION ALL
SELECT 
    'bookings', 
    COUNT(*), 
    CASE 
        WHEN COUNT(*) > 0 THEN 'HAS DUMMY DATA'
        ELSE 'EMPTY'
    END
FROM bookings
UNION ALL
SELECT 
    'villa_info', 
    COUNT(*), 
    CASE 
        WHEN COUNT(*) > 0 THEN 'HAS CONTENT'
        ELSE 'EMPTY'
    END
FROM villa_info
UNION ALL
SELECT 
    'admin_users', 
    COUNT(*), 
    CASE 
        WHEN COUNT(*) > 0 THEN 'HAS ACCOUNTS'
        ELSE 'NO ADMIN ACCOUNTS'
    END
FROM admin_users;

-- Booking status breakdown
SELECT '=== BOOKING STATUS BREAKDOWN ===' as info;
SELECT 
    status,
    COUNT(*) as count,
    SUM(total_price) as total_revenue
FROM bookings 
GROUP BY status
ORDER BY count DESC;

-- Upcoming bookings (next 30 days)
SELECT '=== UPCOMING BOOKINGS (Next 30 Days) ===' as info;
SELECT 
    CONCAT(first_name, ' ', last_name) as guest_name,
    room_id,
    check_in,
    check_out,
    guests,
    total_price,
    status
FROM bookings 
WHERE check_in BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY check_in;

-- Room occupancy analysis
SELECT '=== ROOM OCCUPANCY ANALYSIS ===' as info;
SELECT 
    r.name as room_name,
    r.price as nightly_rate,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
    COALESCE(SUM(b.total_price), 0) as total_revenue
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id
GROUP BY r.id, r.name, r.price
ORDER BY total_revenue DESC;

-- Admin accounts summary
SELECT '=== ADMIN ACCOUNTS SUMMARY ===' as info;
SELECT 
    username,
    CONCAT(first_name, ' ', last_name) as full_name,
    email,
    role,
    CASE WHEN active = 1 THEN 'Active' ELSE 'Inactive' END as status,
    created_at
FROM admin_users
ORDER BY role, username;

-- ===================================================================
-- MAINTENANCE COMMANDS (Commented for safety)
-- ===================================================================

/*
-- Clear all dummy bookings (CAUTION!)
DELETE FROM bookings WHERE email NOT LIKE '%@villadaisycantik.com';

-- Reset to production state (CAUTION!)
DELETE FROM bookings;
DELETE FROM admin_users WHERE role != 'admin';
UPDATE villa_info SET 
    name = 'Your Villa Name',
    description = 'Update with real description',
    phone = '',
    email = '',
    website = '';

-- Create single admin account (CAUTION!)
INSERT INTO admin_users (username, password_hash, email, first_name, last_name, role) 
VALUES ('admin', '$2y$10$your_secure_hash_here', 'admin@yourdomain.com', 'Admin', 'User', 'admin');
*/

SELECT '=== DATABASE UTILITIES LOADED ===' as final_status;