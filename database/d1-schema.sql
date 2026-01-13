-- Cloudflare D1 Schema (SQLite Compatible)
-- Converted from MySQL/Hostinger database

-- Users/Admin table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK(role IN ('admin', 'user', 'guest')) DEFAULT 'user',
  permissions TEXT,
  active INTEGER DEFAULT 1,
  last_login TEXT,
  login_attempts INTEGER DEFAULT 0,
  locked_until TEXT,
  password_changed_at TEXT,
  must_change_password INTEGER DEFAULT 0,
  avatar TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  email_notifications INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Amenities table
CREATE TABLE IF NOT EXISTS amenities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  icon TEXT,
  display_order INTEGER,
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Inclusions table
CREATE TABLE IF NOT EXISTS inclusions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  package_type TEXT,
  base_price REAL,
  discount_percentage REAL,
  min_nights INTEGER,
  max_nights INTEGER,
  max_guests INTEGER,
  base_room_id TEXT,
  room_selection_type TEXT,
  allow_room_upgrades INTEGER DEFAULT 0,
  upgrade_price_calculation TEXT,
  is_active INTEGER DEFAULT 1,
  includes TEXT,
  exclusions TEXT,
  terms_conditions TEXT,
  images TEXT,
  available INTEGER DEFAULT 1,
  featured INTEGER DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  booking_advance_days INTEGER,
  cancellation_policy TEXT,
  seo_title TEXT,
  seo_description TEXT,
  sort_order INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Categories table
CREATE TABLE IF NOT EXISTS marketing_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table (Physical Inventory)
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

-- Packages Table (Marketing Bundles)
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
  base_room_id INTEGER,
  marketing_category_id INTEGER,
  valid_from TEXT,
  valid_until TEXT,
  min_nights INTEGER,
  max_nights INTEGER,
  images TEXT,
  inclusions TEXT,
  exclusions TEXT,
  terms_conditions TEXT,
  cancellation_policy TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (base_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  FOREIGN KEY (marketing_category_id) REFERENCES marketing_categories(id)
);

-- Room Images Table
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

-- Package-Room Relationship (Many-to-Many)
CREATE TABLE IF NOT EXISTS package_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  is_default INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  price_adjustment REAL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Package Inclusions relationships
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

-- Room Amenities relationships
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

-- Package Amenities relationships  
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

-- Homepage Settings table
CREATE TABLE IF NOT EXISTS homepage_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_description TEXT,
  property_name TEXT,
  property_location TEXT,
  property_description TEXT,
  property_rating REAL,
  property_reviews INTEGER,
  contact_phone TEXT,
  contact_email TEXT,
  contact_website TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_country TEXT,
  address_zipcode TEXT,
  spec_max_guests INTEGER,
  spec_bedrooms INTEGER,
  spec_bathrooms INTEGER,
  spec_base_price REAL,
  timing_check_in TEXT,
  timing_check_out TEXT,
  policy_cancellation TEXT,
  policy_house_rules TEXT,
  policy_terms_conditions TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  images_json TEXT,
  amenities_json TEXT,
  is_active INTEGER DEFAULT 1,
  last_updated TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT UNIQUE NOT NULL,
  room_id TEXT NOT NULL,
  package_id INTEGER,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  guests INTEGER NOT NULL,
  adults INTEGER,
  children INTEGER DEFAULT 0,
  total_price REAL NOT NULL,
  paid_amount REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  special_requests TEXT,
  internal_notes TEXT,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')) DEFAULT 'pending',
  payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  confirmation_sent INTEGER DEFAULT 0,
  reminder_sent INTEGER DEFAULT 0,
  source TEXT DEFAULT 'direct',
  guest_ip TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- API Logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL,
  method TEXT CHECK(method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  request_headers TEXT,
  request_body TEXT,
  response_status INTEGER,
  response_time_ms INTEGER,
  response_size_bytes INTEGER,
  error_message TEXT,
  admin_user_id INTEGER,
  session_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id)
);

-- Blackout Dates table
CREATE TABLE IF NOT EXISTS blackout_dates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  reason TEXT,
  is_available INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Daily Analytics table
CREATE TABLE IF NOT EXISTS daily_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  room_id TEXT,
  package_id INTEGER,
  source TEXT,
  bookings_count INTEGER DEFAULT 0,
  revenue REAL DEFAULT 0,
  guests_count INTEGER DEFAULT 0,
  avg_stay_duration REAL,
  occupancy_rate REAL,
  cancellation_count INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, room_id, package_id)
);

-- Email Notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,
  notification_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  message TEXT,
  template_name TEXT,
  template_data TEXT,
  status TEXT CHECK(status IN ('pending', 'sent', 'failed', 'opened')) DEFAULT 'pending',
  scheduled_at TEXT,
  sent_at TEXT,
  opened_at TEXT,
  clicked_at TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  category TEXT,
  is_public INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- iCal Subscriptions table
CREATE TABLE IF NOT EXISTS ical_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_token TEXT UNIQUE NOT NULL,
  subscriber_email TEXT NOT NULL,
  subscriber_name TEXT,
  subscription_type TEXT,
  filter_status TEXT,
  filter_room_id TEXT,
  date_from TEXT,
  date_to TEXT,
  last_accessed TEXT,
  access_count INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Guest Profiles table
CREATE TABLE IF NOT EXISTS guest_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_email TEXT UNIQUE NOT NULL,
  total_bookings INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  total_nights INTEGER DEFAULT 0,
  favorite_room_type TEXT,
  avg_advance_booking_days REAL,
  last_booking_date TEXT,
  guest_segment TEXT,
  preferences TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions table (DOKU Payment Gateway)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  payment_method TEXT DEFAULT 'doku',
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT CHECK(status IN ('pending', 'paid', 'failed', 'expired', 'refunded')) DEFAULT 'pending',
  transaction_id TEXT,
  payment_url TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  request_data TEXT,
  callback_data TEXT,
  paid_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_amenities_active ON amenities(is_active);
CREATE INDEX IF NOT EXISTS idx_inclusions_active ON inclusions(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_base_room ON packages(base_room_id);
CREATE INDEX IF NOT EXISTS idx_payment_booking_ref ON payment_transactions(booking_reference);
CREATE INDEX IF NOT EXISTS idx_payment_invoice ON payment_transactions(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_transactions(status);
