-- Create room_inclusions junction table if not exists
CREATE TABLE IF NOT EXISTS room_inclusions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    inclusion_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    custom_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (inclusion_id) REFERENCES inclusions(id) ON DELETE CASCADE,
    UNIQUE(room_id, inclusion_id)
);

-- Link inclusions to rooms

-- Room 2: Deluxe Ocean Suite (luxury amenities)
INSERT OR IGNORE INTO room_inclusions (room_id, inclusion_id) VALUES
(2, 1),  -- Daily Breakfast
(2, 5),  -- Afternoon Tea
(2, 11), -- Fitness Center Access
(2, 23), -- Late Checkout
(2, 25), -- Champagne on Arrival
(2, 27); -- Turndown Service

-- Room 3: Family Villa (family-friendly inclusions)
INSERT OR IGNORE INTO room_inclusions (room_id, inclusion_id) VALUES
(3, 1),  -- Daily Breakfast
(3, 6),  -- BBQ Night
(3, 14), -- Snorkeling Trip
(3, 18), -- Water Sports
(3, 22), -- Shuttle Service
(3, 26); -- Fruit Basket

-- Room 4: Honeymoon Retreat (romantic inclusions)
INSERT OR IGNORE INTO room_inclusions (room_id, inclusion_id) VALUES
(4, 1),  -- Daily Breakfast
(4, 2),  -- Candlelit Dinner
(4, 3),  -- Welcome Drink
(4, 7),  -- Couples Spa Massage
(4, 17), -- Beach Picnic
(4, 23), -- Late Checkout
(4, 25), -- Champagne on Arrival
(4, 27); -- Turndown Service

-- Room 5: Garden Bungalow (wellness & relaxation)
INSERT OR IGNORE INTO room_inclusions (room_id, inclusion_id) VALUES
(5, 1),  -- Daily Breakfast
(5, 5),  -- Afternoon Tea
(5, 8),  -- Yoga Session
(5, 9),  -- Meditation Class
(5, 12), -- Sauna & Steam Room
(5, 26); -- Fruit Basket

-- Room 6: Presidential Suite (VIP inclusions)
INSERT OR IGNORE INTO room_inclusions (room_id, inclusion_id) VALUES
(6, 1),  -- Daily Breakfast
(6, 2),  -- Candlelit Dinner
(6, 4),  -- Room Service Credit
(6, 7),  -- Couples Spa Massage
(6, 13), -- Sunset Cruise
(6, 19), -- Airport Transfer
(6, 23), -- Late Checkout
(6, 24), -- Room Upgrade
(6, 25), -- Champagne on Arrival
(6, 27), -- Turndown Service
(6, 29), -- Private Pool Access
(6, 30); -- VIP Lounge Access
