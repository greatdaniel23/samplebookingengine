-- Samudra seed — 2026-05-17 — fresh DB, no prior data to clear.

-- Villa info: ONE row
INSERT INTO villa_info (name, tagline, location, description, address, phone, email, website, check_in_time, check_out_time, min_stay_nights, max_guests, total_rooms, total_bathrooms) VALUES (
  'Samudra',
  'A clifftop sanctuary on the southern tip of Bali',
  'Uluwatu, Bali',
  'A clifftop sanctuary on the southern tip of Bali. Four suite categories from $1,840 per night, with private dining, spa, and curated experiences.',
  'Uluwatu, Pecatu, Bali, Indonesia',
  '+62 361 000 0000',
  'reservations@samudra.id',
  'https://villa-landing.pages.dev',
  '14:00',
  '12:00',
  1,
  8,
  5,
  5
);

-- Rooms: 5 suites
INSERT INTO rooms (name, description, max_occupancy, base_price, size_sqm, bed_type, view_type, is_active, display_order) VALUES
  (
    'Ocean Suite',
    'A corner of the headland, opened to the trade winds. Sixty-two square metres of interior, fifty-two of private terrace. A king bed set on the diagonal, framed by a wall of folding bronze-glazed doors. A deep limestone soaking tub, an outdoor shower under a frangipani canopy, and a daybed positioned for the late afternoon light.',
    2,
    1840,
    62,
    'King',
    'Ocean',
    1,
    1
  ),
  (
    'Pool Suite',
    'Eighty steps below the ridgeline, a private pool runs to the edge. Each suite has a private 9-metre plunge pool finished in hand-set black volcanic stone and a wide terrace that ends in air. The interior is a single elongated room with a bed turned to face the water, a writing desk, and a small private bar.',
    2,
    2640,
    96,
    'King',
    'Garden',
    1,
    2
  ),
  (
    'Garden Pavilion',
    'Set back from the cliff, in the shade of the old frangipani. Built around a private walled court planted with frangipani, jasmine, and water lilies. The bedroom opens to the court; the bathroom opens to the sky.',
    2,
    2120,
    78,
    'King',
    'Garden',
    1,
    3
  ),
  (
    'Cliff Villa',
    'A two-bedroom pavilion with a quiet butler and an infinite pool. Detached pavilions arranged along the southernmost ridge. Each has two bedrooms in separate wings, an open-air living pavilion at the centre, a 14-metre infinity pool, a private kitchen, and the services of a butler trained at the Mandapa.',
    4,
    5200,
    240,
    'King x2',
    'Clifftop',
    1,
    4
  ),
  (
    'The Cliff House',
    'A three-bedroom residence on its own promontory. The southernmost point of the property — an entire promontory set apart from the rest of the resort. The ocean is visible on three sides. A staff of seven includes a private chef, a sommelier, a butler, and a security detail. Available from four nights minimum.',
    8,
    14800,
    620,
    'King x3',
    'Promontory',
    1,
    5
  );

-- Room images (picsum.photos placeholders)
INSERT INTO room_images (room_id, image_url, caption, display_order, is_primary, is_active) VALUES
  (1, 'https://picsum.photos/seed/samudra-ocean-1/1600/900',  'Ocean Suite — corner terrace',     0, 1, 1),
  (1, 'https://picsum.photos/seed/samudra-ocean-2/1600/900',  'Ocean Suite — limestone soaking tub', 1, 0, 1),
  (2, 'https://picsum.photos/seed/samudra-pool-1/1600/900',   'Pool Suite — plunge pool',         0, 1, 1),
  (2, 'https://picsum.photos/seed/samudra-pool-2/1600/900',   'Pool Suite — terrace at dusk',     1, 0, 1),
  (3, 'https://picsum.photos/seed/samudra-garden-1/1600/900', 'Garden Pavilion — walled court',   0, 1, 1),
  (4, 'https://picsum.photos/seed/samudra-cliff-1/1600/900',  'Cliff Villa — master pavilion',    0, 1, 1),
  (4, 'https://picsum.photos/seed/samudra-cliff-2/1600/900',  'Cliff Villa — infinity pool',      1, 0, 1),
  (5, 'https://picsum.photos/seed/samudra-house-1/1600/900',  'The Cliff House — promontory',     0, 1, 1),
  (5, 'https://picsum.photos/seed/samudra-house-2/1600/900',  'The Cliff House — ocean exposure', 1, 0, 1);
