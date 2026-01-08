# Calendar Implementation Setup Guide

## Overview
This document provides the technical setup requirements for implementing the calendar dashboard functionality in the booking engine. It covers constants, database endpoints, configuration paths, and data structures needed for calendar integration.

## 1. Constants and Configuration

### 1.1 Calendar API Endpoints
```javascript
// Add to src/config/api.js or create new calendar config file
export const CALENDAR_ENDPOINTS = {
  // Main calendar data (existing endpoints)
  BOOKINGS: 'bookings.php',
  EXTERNAL_BLOCKS: 'external_blocks.php',
  ROOMS: 'rooms.php',
  
  // Calendar-specific endpoints (to be created)
  CALENDAR_VIEW: 'calendar/view.php',
  AVAILABILITY: 'calendar/availability.php',
  BLOCK_DATES: 'calendar/block.php',
  
  // Integration endpoints (existing)
  ICAL_IMPORT: 'ical_import_airbnb.php',
  ICAL_PROXY: 'ical_proxy.php',
  EXTERNAL_SYNC: 'calendar/sync.php'
};

// Calendar view types
export const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  AGENDA: 'agenda'
};

// Booking status constants
export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
  MAINTENANCE: 'maintenance'
};

// Room availability status
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  BLOCKED: 'blocked',
  MAINTENANCE: 'maintenance'
};
```

### 1.2 Calendar Configuration Constants
```javascript
// Add to src/config/calendar.js
export const CALENDAR_CONFIG = {
  // Date formats
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_FORMAT: 'DD/MM/YYYY',
  
  // Calendar settings
  DEFAULT_VIEW: 'month',
  WEEK_START: 1, // Monday = 1, Sunday = 0
  BUSINESS_HOURS: {
    start: '09:00',
    end: '18:00'
  },
  
  // Color schemes for different booking types
  COLORS: {
    confirmed: '#10B981', // Green
    pending: '#F59E0B',   // Yellow
    cancelled: '#EF4444', // Red
    blocked: '#6B7280',   // Gray
    maintenance: '#8B5CF6' // Purple
  },
  
  // Refresh intervals
  AUTO_REFRESH: 300000, // 5 minutes in milliseconds
  SYNC_INTERVAL: 1800000, // 30 minutes for external sync
  
  // Pagination
  EVENTS_PER_PAGE: 50,
  MAX_EVENTS: 1000
};
```

## 2. Database Structure and Endpoints

### 2.1 Required Database Tables
Based on existing schema, ensure these tables are properly configured:

```sql
-- Bookings table (primary calendar data)
-- File: database/enhanced-schema.sql (already exists)
bookings (
  id, booking_reference, room_id, package_id,
  first_name, last_name, email, phone,
  check_in, check_out,  -- Note: check_in/check_out (not check_in_date)
  guests, adults, children,
  total_price, paid_amount, currency,
  special_requests, internal_notes, status,
  payment_status, payment_method,
  confirmation_sent, reminder_sent, source,
  guest_ip, created_at, updated_at,
  room_name, room_type, room_price  -- Joined fields
)

-- External blocks table (for blocked dates)
-- NOTE: This table does NOT exist yet - needs to be created
-- File: database/external_blocks.sql (to be created)
external_blocks (
  id, room_id, start_date, end_date,
  block_type, notes, source,
  created_at, updated_at
)

-- Rooms table (calendar room selection)
-- File: database/enhanced-schema.sql (already exists)
rooms (
  id, name, type, price, capacity,
  description, size, beds,
  features, amenities, images,  -- JSON fields
  available, featured, valid_from, valid_until,
  booking_advance_days, cancellation_policy,
  seo_title, seo_description, sort_order,
  created_at, updated_at
)
```

### 2.2 API Endpoint Paths
All endpoints use the production base URL: `https://api.rumahdaisycantik.com` (NO /api path needed)

#### Existing Endpoints (Ready to Use)
```javascript
// These endpoints are already implemented and tested
const EXISTING_ENDPOINTS = {
  // Booking management
  GET_BOOKINGS: 'GET bookings.php',
  CREATE_BOOKING: 'POST bookings.php',
  UPDATE_BOOKING: 'PUT bookings.php?id={id}',
  DELETE_BOOKING: 'DELETE bookings.php?id={id}',
  
  // Room data
  GET_ROOMS: 'GET rooms.php',
  
  // External blocks (NOT WORKING - table missing)
  // GET_BLOCKS: 'GET external_blocks.php',  // ❌ Fails: table doesn't exist
  // CREATE_BLOCK: 'POST external_blocks.php',  // ❌ Fails: table doesn't exist
  
  // iCal integration
  IMPORT_ICAL: 'POST ical_import_airbnb.php',
  PROXY_ICAL: 'GET ical_proxy.php?url={ical_url}',
  
  // Packages (working)
  GET_PACKAGES: 'GET packages.php',
  
  // Health check
  HEALTH: 'GET health.php'
};
```

#### New Endpoints to Create
```javascript
// These endpoints need to be created for enhanced calendar functionality
const NEW_ENDPOINTS = {
  // Calendar view aggregation
  CALENDAR_VIEW: 'GET calendar/view.php?start_date={date}&end_date={date}&room_id={id}',
  
  // Availability checking
  CHECK_AVAILABILITY: 'GET calendar/availability.php?start_date={date}&end_date={date}&room_id={id}',
  
  // Batch operations
  BULK_BLOCK: 'POST calendar/bulk-block.php',
  BULK_UNBLOCK: 'POST calendar/bulk-unblock.php',
  
  // Calendar statistics
  OCCUPANCY_STATS: 'GET calendar/stats.php?period={month|year}&room_id={id}',
  
  // External platform sync
  SYNC_EXTERNAL: 'POST calendar/sync.php'
};
```

## 3. Database Connection Configuration

### 3.1 Database Connection Path
```php
// File: api/config/database.php (already exists)
// Production database configuration (Hostinger)
$host = 'localhost';
$dbname = 'u289291769_booking';     // Actual database name
$username = 'u289291769_booking';   // Actual username
$password = 'Kanibal123!!!';        // Actual password (configured)
```

### 3.2 Connection Usage in Calendar APIs
```php
// Standard connection pattern for new calendar endpoints
require_once '../config/database.php';
require_once '../utils/cors.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Calendar-specific queries here
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
```

## 4. Data Structure Formats

### 4.1 Calendar Event Format
```javascript
// Standard calendar event object
const CalendarEvent = {
  id: "string|number",
  title: "string", // Guest name or "Blocked"
  start: "YYYY-MM-DD", // Check-in date
  end: "YYYY-MM-DD",   // Check-out date
  type: "confirmed|pending|cancelled|blocked|maintenance",
  roomId: "number",
  roomName: "string",
  guestEmail: "string|null",
  guestPhone: "string|null",
  totalPrice: "number|null",
  notes: "string|null",
  source: "internal|airbnb|booking.com|manual",
  allDay: true, // Always true for booking dates
  backgroundColor: "string", // Color based on type
  borderColor: "string"
};
```

### 4.2 Availability Response Format
```javascript
// API response for availability checking
const AvailabilityResponse = {
  success: true,
  data: {
    roomId: "number",
    dateRange: {
      start: "YYYY-MM-DD",
      end: "YYYY-MM-DD"
    },
    availability: [
      {
        date: "YYYY-MM-DD",
        status: "available|booked|blocked|maintenance",
        bookingId: "number|null",
        notes: "string|null"
      }
    ],
    summary: {
      totalDays: "number",
      availableDays: "number",
      bookedDays: "number",
      blockedDays: "number"
    }
  }
};
```

### 4.3 Calendar View Response Format
```javascript
// Aggregated calendar data for dashboard
const CalendarViewResponse = {
  success: true,
  data: {
    dateRange: {
      start: "YYYY-MM-DD",
      end: "YYYY-MM-DD"
    },
    rooms: [
      {
        id: "number",
        name: "string",
        events: [CalendarEvent], // Array of calendar events
        statistics: {
          totalDays: "number",
          bookedDays: "number",
          occupancyRate: "number" // Percentage
        }
      }
    ],
    summary: {
      totalBookings: "number",
      confirmedBookings: "number",
      pendingBookings: "number",
      totalRevenue: "number",
      averageOccupancy: "number"
    }
  }
};
```

## 5. File Structure for Implementation

### 5.1 Frontend Calendar Files
```
src/
├── components/
│   ├── CalendarDashboard.tsx             ✅ (exists - 150 lines)
│   ├── CalendarIntegration.tsx           ✅ (exists - 282 lines)
│   ├── calendar/                         📝 (create additional components)
│   │   ├── CalendarView.tsx              📝 (create)
│   │   │   ├── CalendarView.tsx          📝 (create)
│   │   │   ├── EventModal.tsx            📝 (create)
│   │   │   ├── AvailabilityGrid.tsx      📝 (create)
│   │   │   └── CalendarStats.tsx         📝 (create)
├── services/
│   ├── calendarService.ts                ✅ (exists)
│   ├── availabilityService.ts            📝 (create)
│   └── syncService.ts                    📝 (create)
├── config/
│   ├── calendar.js                       📝 (create)
│   └── api.js                           ✅ (update)
└── utils/
    ├── dateUtils.ts                      📝 (create)
    └── calendarHelpers.ts                📝 (create)
```

### 5.2 Backend API Files
```
api/
├── calendar/                             📝 (create directory)
│   ├── view.php                         📝 (create)
│   ├── availability.php                 📝 (create)
│   ├── block.php                        📝 (create)
│   ├── stats.php                        📝 (create)
│   └── sync.php                         📝 (create)
├── bookings.php                         ✅ (exists - working)
├── external_blocks.php                  ❌ (fails - table missing)
├── rooms.php                            ✅ (exists - working)
├── packages.php                         ✅ (exists - working)
├── ical.php                             ✅ (exists - working)
├── ical_import_airbnb.php              ✅ (exists - working, needs params)
└── ical_proxy.php                       ✅ (exists - working, needs params)
```

## 6. Environment Configuration

### 6.1 Development Environment
```javascript
// src/config/environment.js
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: 'https://api.rumahdaisycantik.com',  // Always use production API
    DEBUG: true,
    AUTO_REFRESH: false
  },
  production: {
    API_BASE_URL: 'https://api.rumahdaisycantik.com',   // Production API (no /api path)
    DEBUG: false,
    AUTO_REFRESH: true
  }
};
```

### 6.2 Calendar Feature Flags
```javascript
// Feature toggles for gradual rollout
export const CALENDAR_FEATURES = {
  BASIC_VIEW: true,           // Month/week calendar view
  AVAILABILITY_CHECK: true,   // Real-time availability
  EXTERNAL_SYNC: false,      // iCal sync (enable after testing)
  BULK_OPERATIONS: false,    // Bulk block/unblock
  STATISTICS: true,          // Calendar analytics
  MOBILE_VIEW: false         // Mobile-optimized calendar
};
```

## 7. Implementation Checklist

### 7.1 Prerequisites ✅
- [x] Database connection established: `u289291769_booking`
- [x] Basic API endpoints working: bookings.php, rooms.php, packages.php
- [x] Admin authentication system in place
- [x] React admin panel structure ready (9 sections: overview, homepage, bookings, rooms, packages, amenities, property, analytics, settings)
- [x] Production API accessible: `https://api.rumahdaisycantik.com`
- [ ] external_blocks table needs to be created (missing)

### 7.2 Phase 1: Basic Calendar (Required)
- [ ] Create external_blocks table in database
- [ ] Create calendar configuration constants
- [ ] Implement CalendarView.tsx component
- [ ] Create calendar/view.php API endpoint
- [ ] Integrate calendar into AdminPanel.tsx navigation
- [ ] Test basic month view with existing bookings

### 7.3 Phase 2: Enhanced Features (Optional)
- [ ] Add availability checking API
- [ ] Implement date blocking functionality
- [ ] Create calendar statistics dashboard
- [ ] Add external platform sync
- [ ] Mobile responsive calendar view

## 8. Testing Strategy

### 8.1 API Testing
```bash
# Test existing endpoints (working)
curl -X GET "https://api.rumahdaisycantik.com/bookings.php"
curl -X GET "https://api.rumahdaisycantik.com/rooms.php"
curl -X GET "https://api.rumahdaisycantik.com/health.php"

# Test new calendar endpoints (after creation)
curl -X GET "https://api.rumahdaisycantik.com/calendar/view.php?start_date=2024-01-01&end_date=2024-01-31"

# PowerShell testing format
(curl "https://api.rumahdaisycantik.com/bookings.php").Content
```

### 8.2 Frontend Testing
```javascript
// Test calendar service integration
import { calendarService } from '../services/calendarService';

// Test data fetching
const testCalendarData = async () => {
  const events = await calendarService.getEvents('2024-01-01', '2024-01-31');
  console.log('Calendar events:', events);
};
```

## 9. Performance Considerations

### 9.1 Optimization Points
- **Data Caching**: Cache calendar data for frequently accessed date ranges
- **Lazy Loading**: Load calendar events only for visible date range
- **Pagination**: Limit events per request to avoid large payloads
- **Debounced Updates**: Prevent excessive API calls during date navigation

### 9.2 Database Optimization
```sql
-- Add indexes for calendar queries (using actual column names)
ALTER TABLE bookings ADD INDEX idx_calendar_dates (check_in, check_out, room_id);
ALTER TABLE external_blocks ADD INDEX idx_block_dates (start_date, end_date, room_id);
```

## Next Steps

1. **Review existing calendar components** (CalendarDashboard.tsx, CalendarIntegration.tsx)
2. **Create calendar configuration files** following the constants defined above
3. **Implement new API endpoints** for enhanced calendar functionality
4. **Follow the integration guide** from CALENDAR_DASHBOARD_IMPLEMENTATION_GUIDE.md
5. **Test incrementally** starting with basic calendar view

## Notes

- Calendar components exist but need React admin integration
- Most API endpoints are production-ready and tested (external_blocks table missing)
- AdminPanel.tsx has 9 existing sections, calendar would be 10th
- Database structure mostly supports calendar functionality (needs external_blocks table)
- Focus on gradual implementation to minimize risk
- Consider mobile responsiveness from the beginning
- Plan for external platform integration (Airbnb, Booking.com) in future phases

---

**Implementation Time Estimate**: 2-4 hours for basic calendar, 1-2 days for full features
**Priority**: High - Calendar functionality is core to booking management
**Dependencies**: Existing admin system, database structure, API infrastructure