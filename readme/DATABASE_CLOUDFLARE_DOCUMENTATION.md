# 🗄️ DATABASE DOCUMENTATION - CLOUDFLARE EDITION
**Villa Booking Engine - Cloudflare D1 Database**

**Last Updated**: January 9, 2026  
**Platform**: Cloudflare D1 (SQLite)  
**Status**: ✅ **PRODUCTION READY**

---

## 📖 **TABLE OF CONTENTS**

1. [System Overview](#system-overview)
2. [Database Configuration](#database-configuration)
3. [Tables Schema](#tables-schema)
4. [API Endpoints](#api-endpoints)
5. [Field Mapping](#field-mapping)
6. [Quick Reference](#quick-reference)

---

## 🎯 **SYSTEM OVERVIEW** {#system-overview}

### **What Changed from Old System**
| Feature | Old System (MySQL/Hostinger) | New System (Cloudflare D1) |
|---------|------------------------------|----------------------------|
| **Database** | MySQL on Hostinger | Cloudflare D1 (SQLite) |
| **Storage** | Hostinger Servers | Cloudflare Edge Network |
| **API** | PHP REST API | Cloudflare Workers (TypeScript) |
| **Config** | database.php | wrangler-api.toml |
| **Images** | Local uploads | Cloudflare R2 Bucket |
| **Cache** | None | Cloudflare KV |

### **Current Infrastructure**
| Component | Details |
|-----------|---------|
| **D1 Database Name** | `booking-engine` |
| **D1 Database ID** | `71df7f17-943b-46dd-8870-2e7769a3c202` |
| **R2 Bucket** | `imageroom` |
| **KV Namespace (Sessions)** | `91b758e307d8444091e468f6caa9ead3` |
| **KV Namespace (Cache)** | `ec304060e11b4215888430acdee7aafa` |
| **Worker URL** | `https://booking-engine-api.danielsantosomarketing2017.workers.dev` |

---

## 🔧 **DATABASE CONFIGURATION** {#database-configuration}

### **Cloudflare D1 Binding (wrangler-api.toml)**
```toml
[[d1_databases]]
binding = "DB"
database_name = "booking-engine"
database_id = "71df7f17-943b-46dd-8870-2e7769a3c202"
```

### **Access via Wrangler CLI**
```bash
# List tables
npx wrangler d1 execute booking-engine --command "SELECT name FROM sqlite_master WHERE type='table'"

# Query data
npx wrangler d1 execute booking-engine --command "SELECT * FROM bookings LIMIT 5"

# Run SQL file
npx wrangler d1 execute booking-engine --file ./database/schema.sql
```

### **Environment Variables**
```toml
[vars]
RESEND_API_KEY = "re_ggeu4gUr_B5wJcjrNv2zUVSTmGu8t7hhN"
ADMIN_EMAIL = "danielsantosomarketing2017@gmail.com"
VILLA_NAME = "Best Villa Bali"
```

---

## 📊 **TABLES SCHEMA** {#tables-schema}

### **Core Tables (Migrated to D1)**

#### **1. bookings**
```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT UNIQUE,
  room_id TEXT,
  package_id INTEGER,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  adults INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'direct',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. rooms**
```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  price_per_night DECIMAL(10,2),
  capacity INTEGER DEFAULT 2,
  size_sqm INTEGER,
  amenities TEXT,  -- JSON array
  images TEXT,     -- JSON array
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **3. amenities**
```sql
CREATE TABLE amenities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT,
  category TEXT,
  description TEXT,
  is_featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **4. admin_users**
```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Current Data Statistics**
| Table | Record Count |
|-------|--------------|
| bookings | 24 |
| amenities | 56 |
| rooms | 5 |
| admin_users | 1 |

---

## 📡 **API ENDPOINTS** {#api-endpoints}

### **Base URL**
```
https://booking-engine-api.danielsantosomarketing2017.workers.dev
```

### **Bookings API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/list` | List all bookings |
| GET | `/api/bookings/{id}` | Get single booking |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/{id}` | Update booking |
| DELETE | `/api/bookings/{id}` | Delete booking |

### **Amenities API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/amenities` | List all amenities |
| POST | `/api/amenities` | Create amenity |
| PUT | `/api/amenities/{id}` | Update amenity |
| DELETE | `/api/amenities/{id}` | Delete amenity |

### **Auth API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Admin logout |
| GET | `/api/auth/check` | Verify session |

### **Settings API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| POST | `/api/settings` | Update settings |
| PUT | `/api/settings/{key}` | Update single setting |

### **Email API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/booking-confirmation` | Send customer email |
| POST | `/api/email/admin-notification` | Send admin email |

### **Images API**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/images/list` | List R2 images |
| POST | `/api/images/upload` | Upload image to R2 |
| DELETE | `/api/images/{key}` | Delete image |

### **Health Check**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API status check |

---

## 🔍 **FIELD MAPPING** {#field-mapping}

### **Booking Submission Fields**
| Frontend Field | API Field | Database Column | Required |
|----------------|-----------|-----------------|----------|
| `firstName` | `first_name` | `first_name` | ✅ Yes |
| `lastName` | `last_name` | `last_name` | ✅ Yes |
| `email` | `email` | `email` | ✅ Yes |
| `phone` | `phone` | `phone` | ❌ No |
| `checkIn` | `check_in` | `check_in` | ✅ Yes |
| `checkOut` | `check_out` | `check_out` | ✅ Yes |
| `guests` | `guests` | `guests` | ✅ Yes |
| `totalPrice` | `total_price` | `total_price` | ✅ Yes |
| `specialRequests` | `special_requests` | `special_requests` | ❌ No |
| `roomId` | `room_id` | `room_id` | ✅ Yes |
| `packageId` | `package_id` | `package_id` | ❌ No |

### **Auto-Generated Fields**
| Field | Generated By | Format |
|-------|--------------|--------|
| `booking_reference` | API | `BK-XXXXXX` |
| `status` | API Default | `pending` |
| `payment_status` | API Default | `pending` |
| `created_at` | Database | ISO DateTime |

### **Room IDs (Valid Values)**
| Room ID | Room Name | Price/Night |
|---------|-----------|-------------|
| `deluxe-suite` | Deluxe Suite | $450.00 |
| `standard-room` | Standard Room | $120.00 |
| `family-room` | Family Room | $180.00 |
| `master-suite` | Master Suite | $650.00 |
| `economy-room` | Economy Room | $85.00 |

---

## ⚡ **QUICK REFERENCE** {#quick-reference}

### **Deploy Commands**
```bash
# Deploy Worker (MUST use wrangler-api.toml)
npx wrangler deploy --config wrangler-api.toml

# List deployments
npx wrangler deployments list --config wrangler-api.toml
```

### **Database Commands**
```bash
# Query bookings
npx wrangler d1 execute booking-engine --command "SELECT COUNT(*) FROM bookings"

# Query amenities
npx wrangler d1 execute booking-engine --command "SELECT * FROM amenities LIMIT 10"

# Insert data
npx wrangler d1 execute booking-engine --file ./database/seed.sql
```

### **Test API (PowerShell)**
```powershell
# Health check
Invoke-RestMethod "https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/health"

# Get bookings
Invoke-RestMethod "https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/bookings/list"

# Get amenities
Invoke-RestMethod "https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/amenities"

# Get settings
Invoke-RestMethod "https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/settings"
```

### **Admin Credentials**
| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

---

## 🚀 **COMPARISON: OLD vs NEW**

| Feature | Old (MySQL/PHP) | New (D1/Workers) |
|---------|-----------------|------------------|
| **Database Type** | MySQL | SQLite (D1) |
| **Hosting** | Hostinger | Cloudflare Edge |
| **API Language** | PHP | TypeScript |
| **Latency** | ~200ms | ~50ms (edge) |
| **Scaling** | Manual | Auto |
| **Cost** | $10+/mo | Free tier available |
| **Backups** | Manual | Automatic |

---

## 🔗 **QUICK LINKS**

- **Worker**: https://booking-engine-api.danielsantosomarketing2017.workers.dev
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **D1 Console**: https://dash.cloudflare.com → Workers & Pages → D1

---

**Document Version**: 1.0  
**Platform**: Cloudflare D1 + Workers  
**Config File**: `wrangler-api.toml`  
**Last Tested**: January 9, 2026
