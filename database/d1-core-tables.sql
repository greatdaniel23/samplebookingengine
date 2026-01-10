-- Add missing core tables for D1 database

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  max_occupancy INTEGER DEFAULT 2,
  base_price REAL DEFAULT 0,
  size_sqm REAL,
  bed_type TEXT,
  view_type TEXT,
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  package_type TEXT,
  base_price REAL DEFAULT 0,
  discount_percentage REAL DEFAULT 0,
  duration_days INTEGER DEFAULT 1,
  max_guests INTEGER DEFAULT 2,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  terms_conditions TEXT,
  cancellation_policy TEXT,
  marketing_category_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marketing_category_id) REFERENCES marketing_categories(id)
);

-- Villa info table
CREATE TABLE IF NOT EXISTS villa_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  tagline TEXT,
  location TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  check_in_time TEXT DEFAULT '14:00',
  check_out_time TEXT DEFAULT '12:00',
  min_stay_nights INTEGER DEFAULT 1,
  max_guests INTEGER DEFAULT 10,
  total_rooms INTEGER DEFAULT 5,
  total_bathrooms INTEGER DEFAULT 5,
  property_size_sqm REAL,
  year_built INTEGER,
  amenities_summary TEXT,
  policies TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Package rooms relationships
CREATE TABLE IF NOT EXISTS package_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  is_default INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  price_adjustment REAL DEFAULT 0,
  adjustment_type TEXT CHECK(adjustment_type IN ('fixed', 'percentage')) DEFAULT 'fixed',
  availability_priority INTEGER DEFAULT 1,
  max_occupancy_override INTEGER,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Package inclusions relationships
CREATE TABLE IF NOT EXISTS package_inclusions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  inclusion_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  custom_description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (inclusion_id) REFERENCES inclusions(id) ON DELETE CASCADE
);

-- Room amenities relationships
CREATE TABLE IF NOT EXISTS room_amenities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  amenity_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Package amenities relationships  
CREATE TABLE IF NOT EXISTS package_amenities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  amenity_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Room images table
CREATE TABLE IF NOT EXISTS room_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
