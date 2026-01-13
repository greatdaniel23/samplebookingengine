-- Seed 30 Inclusions for Packages and Rooms
-- Clear existing inclusions first
DELETE FROM package_inclusions;
DELETE FROM inclusions;

-- Reset autoincrement
DELETE FROM sqlite_sequence WHERE name='inclusions';
DELETE FROM sqlite_sequence WHERE name='package_inclusions';

-- Insert 30 Inclusions across different categories
INSERT INTO inclusions (name, description, package_type, is_active) VALUES
-- Meals & Dining (1-6)
('Daily Breakfast', 'Complimentary breakfast buffet with local and international options', 'meals', 1),
('Candlelit Dinner', 'Romantic candlelit dinner for two with 4-course meal', 'dining', 1),
('Welcome Drink', 'Refreshing welcome drink upon arrival', 'dining', 1),
('Afternoon Tea', 'Traditional afternoon tea with pastries and snacks', 'dining', 1),
('BBQ Night', 'Poolside BBQ dinner with live cooking stations', 'dining', 1),
('Room Service Credit', '$50 room service credit during your stay', 'dining', 1),

-- Spa & Wellness (7-12)
('Couples Spa Massage', '60-minute couples massage with aromatherapy oils', 'spa', 1),
('Yoga Session', 'Daily morning yoga class with certified instructor', 'wellness', 1),
('Meditation Class', 'Guided meditation session for inner peace', 'wellness', 1),
('Spa Treatment Credit', '$100 spa treatment credit', 'spa', 1),
('Fitness Center Access', 'Unlimited access to fully-equipped gym', 'wellness', 1),
('Sauna & Steam Room', 'Access to sauna and steam room facilities', 'wellness', 1),

-- Activities & Tours (13-18)
('Sunset Cruise', 'Private sunset cruise with champagne and canapés', 'activity', 1),
('Snorkeling Trip', 'Half-day snorkeling excursion to coral reefs', 'activity', 1),
('Cooking Class', 'Traditional local cuisine cooking class', 'activity', 1),
('Temple Tour', 'Guided tour to ancient temples with local historian', 'activity', 1),
('Beach Picnic', 'Private beach picnic setup with gourmet basket', 'activity', 1),
('Water Sports', 'Kayaking, paddleboarding, and jet ski rentals', 'activity', 1),

-- Transportation (19-22)
('Airport Transfer', 'Round-trip private airport transfers', 'transport', 1),
('Car Rental', 'One day complimentary car rental', 'transport', 1),
('Bike Rental', 'Complimentary bicycle rental during stay', 'transport', 1),
('Shuttle Service', 'Free shuttle to town center and beaches', 'transport', 1),

-- Room Amenities (23-27)
('Late Checkout', 'Complimentary late checkout until 2 PM', 'amenity', 1),
('Room Upgrade', 'Complimentary room upgrade subject to availability', 'amenity', 1),
('Champagne on Arrival', 'Bottle of champagne delivered to your room', 'amenity', 1),
('Fruit Basket', 'Fresh tropical fruit basket daily', 'amenity', 1),
('Turndown Service', 'Nightly turndown service with chocolates', 'amenity', 1),

-- Special Experiences (28-30)
('Photography Session', '30-minute professional photo session', 'special', 1),
('Private Pool Access', 'Exclusive private pool area reservation', 'special', 1),
('VIP Lounge Access', 'Access to exclusive VIP lounge with premium amenities', 'special', 1);

-- Link inclusions to packages based on package type
-- Romantic Escape (Package ID 2) - Romance focused
INSERT INTO package_inclusions (package_id, inclusion_id, quantity) VALUES
(2, 2, 1),   -- Candlelit Dinner
(2, 7, 1),   -- Couples Spa Massage
(2, 17, 1),  -- Beach Picnic
(2, 25, 1),  -- Champagne on Arrival
(2, 23, 1), -- Late Checkout
(2, 27, 1);  -- Turndown Service

-- Family Fun Adventure (Package ID 3) - Family focused
INSERT INTO package_inclusions (package_id, inclusion_id, quantity) VALUES
(3, 1, 1),   -- Daily Breakfast
(3, 5, 1),   -- BBQ Night
(3, 14, 1),  -- Snorkeling Trip
(3, 18, 1),  -- Water Sports
(3, 19, 1),  -- Airport Transfer
(3, 21, 1);  -- Bike Rental

-- Wellness Retreat (Package ID 4) - Wellness focused
INSERT INTO package_inclusions (package_id, inclusion_id, quantity) VALUES
(4, 1, 1),   -- Daily Breakfast
(4, 8, 1),   -- Yoga Session
(4, 9, 1),   -- Meditation Class
(4, 10, 1),  -- Spa Treatment Credit
(4, 12, 1),  -- Sauna & Steam Room
(4, 26, 1);  -- Fruit Basket

-- Business Elite (Package ID 5) - Business focused
INSERT INTO package_inclusions (package_id, inclusion_id, quantity) VALUES
(5, 1, 1),   -- Daily Breakfast
(5, 11, 1),  -- Fitness Center Access
(5, 19, 1),  -- Airport Transfer
(5, 23, 1),  -- Late Checkout
(5, 30, 1),  -- VIP Lounge Access
(5, 6, 1);   -- Room Service Credit

-- Adventure Seeker (Package ID 6) - Adventure focused
INSERT INTO package_inclusions (package_id, inclusion_id, quantity) VALUES
(6, 1, 1),   -- Daily Breakfast
(6, 14, 1),  -- Snorkeling Trip
(6, 18, 1),  -- Water Sports
(6, 21, 1),  -- Bike Rental
(6, 16, 1),  -- Temple Tour
(6, 20, 1);  -- Car Rental

-- Cultural Immersion (Package ID 7) - Culture focused
INSERT INTO package_inclusions (package_id, inclusion_id, quantity) VALUES
(7, 1, 1),   -- Daily Breakfast
(7, 15, 1),  -- Cooking Class
(7, 16, 1),  -- Temple Tour
(7, 22, 1),  -- Shuttle Service
(7, 4, 1),   -- Afternoon Tea
(7, 28, 1);  -- Photography Session

-- Luxury Escape (Package ID 8) - Luxury focused
INSERT INTO package_inclusions (package_id, inclusion_id, quantity) VALUES
(8, 1, 1),   -- Daily Breakfast
(8, 2, 1),   -- Candlelit Dinner
(8, 13, 1),  -- Sunset Cruise
(8, 7, 1),   -- Couples Spa Massage
(8, 24, 1),  -- Room Upgrade
(8, 29, 1),  -- Private Pool Access
(8, 30, 1);  -- VIP Lounge Access

-- Weekend Getaway (Package ID 9) - Quick escape
INSERT INTO package_inclusions (package_id, inclusion_id, quantity) VALUES
(9, 1, 1),   -- Daily Breakfast
(9, 3, 1),   -- Welcome Drink
(9, 23, 1),  -- Late Checkout
(9, 29, 1),  -- Private Pool Access
(9, 26, 1);  -- Fruit Basket
