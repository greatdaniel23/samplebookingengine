-- ===================================================================
-- CLEAR EXISTING DUMMY DATA
-- ===================================================================
-- This script safely removes existing dummy/test data while preserving
-- the production-ready rooms and packages data

USE booking_engine;

-- Clear existing dummy bookings (keep rooms and packages)
DELETE FROM bookings WHERE email LIKE '%@email.com' OR email LIKE '%@example%';

-- Clear default/insecure admin accounts
DELETE FROM admin_users WHERE username = 'admin' OR password_hash = 'admin123';

-- Clear any placeholder villa info (optional - uncomment if needed)
-- DELETE FROM villa_info WHERE name LIKE '%placeholder%' OR name LIKE '%sample%';

-- Show what's left
SELECT 'Remaining Data After Cleanup:' as status;
SELECT 'rooms' as table_name, COUNT(*) as records FROM rooms
UNION SELECT 'packages', COUNT(*) FROM packages  
UNION SELECT 'bookings', COUNT(*) FROM bookings
UNION SELECT 'villa_info', COUNT(*) FROM villa_info
UNION SELECT 'admin_users', COUNT(*) FROM admin_users;