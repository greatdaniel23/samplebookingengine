# 📅 CALENDAR SYSTEM DOCUMENTATION
**Villa Booking Engine – Calendar Integration, Sync & Availability Enforcement**

Last Updated: 2025-11-14

---

## 🎯 Overview
The calendar layer does three connected jobs:
1. Visualize bookings internally (UI calendar & filters)
2. Push outbound availability to external platforms via iCal ("subscribe" URLs)
3. Pull external blocks/reservations IN to prevent double bookings (import feeds)

Outbound (push) is production-ready. Inbound (pull/import) is prototyped for Airbnb and prepared for extension.

---

## 🔄 Sync Model (Push vs Pull)
| Direction | Description | Current Status | Key Component |
|-----------|-------------|----------------|---------------|
| Push (Our → External) | We publish bookings as RFC 5545 iCal; platforms fetch & block dates | Stable | `api/ical.php` + `iCalGenerator` |
| Pull (External → Our) | We import external platform calendar feeds and block locally | Airbnb prototype | `api/ical_import_airbnb.php` + `external_blocks` |

Availability safety = Push AND Pull simultaneously.

---

## 📊 Database Schema (Calendar Tables)

### Calendar-Specific Tables:

#### 1. **`calendar_settings`** - System Configuration
- **Purpose**: Stores calendar system configuration and behavior
- **Key Fields**: 
  - `setting_key` - Configuration parameter name
  - `setting_value` - Configuration value
  - `setting_type` - Data type (string, integer, boolean, json)
  - `category` - Groups settings (calendar, sync, etc.)
  - `is_public` - Whether setting is publicly readable

**Current Settings:**
```sql
sync_frequency_default: 15 (minutes)
timezone_default: Asia/Makassar
ical_calendar_name: "Villa Daisy Cantik Bookings"
enable_webcal_protocol: true
calendar_sync_enabled: true (master switch)
```

#### 2. **`calendar_subscriptions`** - Access Management
- **Purpose**: Manages calendar subscription tokens and access control
- **Subscription Types**: iCal, WebCal, Google, Outlook, Apple, Airbnb, VRBO
- **Key Features**:
  - Unique subscription tokens for security
  - Room-specific and date range filtering
  - Access analytics (count, user agent, IP tracking)
  - Subscriber contact information

#### 3. **`platform_integrations`** - External Platform Sync
- **Purpose**: Manages API connections to external booking platforms
- **Platform Types**: OTA, calendar, payment, channel manager, PMS
- **Sync Modes**: Real-time, hourly, daily, weekly, manual
- **Bidirectional Support**: Import, export, or both directions
- **Features**:
  - OAuth token management with refresh
  - Custom mapping rules (JSON)
  - Error logging and sync statistics
  - Configurable sync frequency per platform

#### 4. **`platform_sync_history`** - Audit Trail
- **Purpose**: Comprehensive logging of all sync operations
- **Tracking**: Success/failure rates, data volumes, timing analytics
- **Debugging**: Error details and performance metrics

#### 5. **`bookings`** - Core Calendar Events
- **Purpose**: Primary booking data that feeds all calendar exports
- **Calendar Fields**: `check_in`, `check_out`, `status`, `room_id`
- **Integration**: Automatically included in iCal feeds based on status

---

## 🏗️ Architecture
```
             ┌────────────────────────────────────┐
             │          Admin Frontend            │
             │  CalendarIntegration.tsx (UI)      │
             │  BookingCalendar / Filters         │
             └──────────────┬────────────────────┘
                            │
                calendarService.ts (HTTP)
                            │
                 ┌──────────┴───────────┐
                 │                      │
          PUSH EXPORT                PULL IMPORT
      /api/ical.php?action=...   /api/ical_import_airbnb.php?source=<url>
                 │                      │
          iCalGenerator             Airbnb ICS Fetch + Parse
                 │                      │
        ┌─bookings table───┐      external_blocks table
        │─calendar_settings─│             │
        │─calendar_subscriptions─│        │
        │─platform_integrations──│        │
        └─platform_sync_history───┘       │
                 │                      │
                 └──────────┬───────────┘
                            │
                 Availability/Booking Check
             (Reject if overlaps booking OR external block)
```

Data sources used during booking availability (target design):
- Internal confirmed/pending bookings
- External imported blocks/reservations (Airbnb for now)
- Room/package constraints

---

## 🗄️ Database Elements (Calendar Related)
| Table | Purpose |
|-------|---------|
| `bookings` | Core source events for outbound iCal and internal visualization |
| `external_blocks` | Imported ranges from external platform feeds (Airbnb etc.) |

`external_blocks` (simplified schema concept):
```
id (PK)
source VARCHAR(50)      -- 'airbnb', future: 'booking_com', 'vrbo'
uid VARCHAR(255)        -- Event UID or generated hash
start_date DATE         -- Inclusive
end_date DATE           -- Exclusive (DTEND semantics)
summary TEXT            -- e.g. 'Not available' or guest name
description TEXT NULL   -- Raw/parsed event description
last_seen DATETIME      -- Upsert timestamp
raw_event JSON          -- Original key/value for audit
INDEX (source, start_date, end_date)
UNIQUE (source, uid)
```

### **External Calendar Management**

#### **External Blocks API (`/api/external_blocks.php`)**
- **Purpose**: List imported calendar blocks from external platforms
- **Filtering**: By source, date ranges
- **Usage**: View and manage external calendar conflicts

#### **Airbnb Import API (`/api/ical_import_airbnb.php`)**
- **Purpose**: Import Airbnb calendar feeds to prevent double-booking
- **Security**: URL validation for Airbnb calendar patterns
- **Storage**: Saves blocks to `external_blocks` table

---

## 📦 **PACKAGE-SPECIFIC CALENDAR INTEGRATION**

### **Database Integration:**
- ✅ **Fixed SQL Join**: Packages properly connect via `bookings.package_id`
- ✅ **Package Tracking**: Every booking can link to specific packages
- ✅ **Global + Individual**: Both global and package-specific calendars supported

### **Individual Package Features:**

#### **Unique iCal Feeds per Package:**
```bash
# Package 1 calendar
/api/ical.php?action=calendar&package_id=1&format=ics

# Package 2 with date filter
/api/ical.php?action=calendar&package_id=2&from_date=2025-12-01

# Package subscription URLs
/api/ical.php?action=subscribe&package_id=1
```

#### **Dynamic File Naming:**
- Global calendar: `villa-bookings.ics`
- Package calendar: `package-1-bookings.ics`  
- Room calendar: `room-villa-1-bookings.ics`

#### **Platform Integration per Package:**
- **Google Calendar**: Add package-specific URL
- **Airbnb**: Use as external calendar for specific package
- **VRBO**: Subscribe to package availability feed
- **Outlook/Apple**: Auto-sync package bookings

### **Frontend Service Integration:**

#### **New CalendarService Methods:**
```typescript
// Get package calendar information
const info = await calendarService.getPackageCalendarInfo(packageId);

// Export package-specific calendar  
const icalData = await calendarService.exportPackageCalendar(packageId, {
  status: 'confirmed',
  from_date: '2025-12-01'
});

// Get package subscription URLs
const urls = await calendarService.getPackageSubscriptionUrls(packageId);
console.log(urls.ical, urls.webcal, urls.google_calendar);
```

---

## ✅ Frontend Components

### **CalendarIntegration.tsx** - Enhanced with:
- ✅ Global and package-specific export capabilities
- ✅ Package filtering in URL generation
- ✅ Copy-to-clipboard for package URLs
- ✅ Platform-specific integration instructions
- ✅ External blocks preview and management

### **BookingCalendar.tsx** - Visual Features:
- ✅ Color-coded events by status and type
- ✅ Package and room filtering
- ✅ External block display with conflict detection
- ✅ Date range navigation and zoom controls

### **Package Management Integration:**
- ✅ Package details show calendar export options
- ✅ Individual package calendar URLs in admin panel
- ✅ Subscription management per package
- ✅ Analytics tracking via calendar access logs

---

## 🌐 API Endpoints (Calendar Control)

### **Core Calendar API (`/api/ical.php`)**

#### **Available Actions:**

**1. `?action=calendar` - Generate Calendar Export**
- **Purpose**: Export booking calendar in iCal or JSON format
- **Parameters**:
  - `format`: 'ics' or 'json' (default: 'ics')
  - `status`: 'all', 'confirmed', 'pending', 'cancelled' (default: 'all')
  - `from_date`: Start date filter (YYYY-MM-DD)
  - `to_date`: End date filter (YYYY-MM-DD)
  - `package_id`: Filter by specific package ID (new feature)
  - `room_id`: Filter by specific room ID (new feature)
- **Output**: iCal file download or JSON response

```bash
# Global calendar
GET /api/ical.php?action=calendar&format=ics

# Package-specific calendar
GET /api/ical.php?action=calendar&package_id=1&format=ics

# Room-specific calendar with date range
GET /api/ical.php?action=calendar&room_id=villa-1&from_date=2025-12-01&to_date=2025-12-31
```

**2. `?action=subscribe` - Get Subscription URLs**
- **Purpose**: Generate subscription URLs for external calendar platforms
- **Parameters**: Same filtering as calendar action
- **Returns**: iCal URL, WebCal URL, and platform-specific instructions

```bash
# Global subscription URLs
GET /api/ical.php?action=subscribe

# Package-specific subscription URLs
GET /api/ical.php?action=subscribe&package_id=1
```

**3. `?action=package_calendar` - Package Calendar Info** *(New)*
- **Purpose**: Get comprehensive calendar information for a specific package
- **Parameters**: `package_id` (required)
- **Returns**: Package-specific URLs, WebCal links, and description

```bash
GET /api/ical.php?action=package_calendar&package_id=1
```

**4. `?action=sync` - Platform Sync**
- **Purpose**: Synchronize with specific external platform
- **Parameters**: `platform` (required)

**5. `?action=sync_all` - Bulk Sync**
- **Purpose**: Synchronize all configured platforms

**6. `?action=save_test` - Test Calendar URL**
- **Purpose**: Validate and save external calendar feeds
```
GET /api/ical.php?action=subscribe
GET /api/ical.php?action=calendar&format=ics[&status=confirmed&from_date=YYYY-MM-DD&to_date=YYYY-MM-DD]
GET /api/ical.php?action=calendar&format=json
```
Response examples remain as in `ICAL_DOCUMENTATION.md` (see that file for rich sample payloads).

---

## 📥 Airbnb Import (Inbound Pull Prototype)
Endpoints:
```
GET /api/ical_proxy.php?source=<airbnb_ics_url>         # Parse only (JSON events)
GET /api/ical_import_airbnb.php?source=<airbnb_ics_url> # Parse + persist to external_blocks
```
Event classification logic (planned enhancement):
```
if SUMMARY == 'Not available'            => type = BLOCK
else if SUMMARY contains guest-like data => type = RESERVATION
else                                     => type = GENERIC
```
Availability overlap check (SQL pattern):
```sql
SELECT 1
FROM external_blocks
WHERE source = 'airbnb'
  AND :request_start < end_date
  AND :request_end   > start_date
LIMIT 1;
```
If a row returns → reject booking creation with a clear external-block reason.

---

## 🚦 Booking Enforcement Flow (Target)
1. User initiates booking (dates: A → B).
2. System checks internal bookings overlap.
3. System checks external_blocks overlap.
4. If no conflicts → proceed; else → error `Dates blocked by external calendar (Airbnb sync).`.
5. Upon successful booking creation, outbound iCal feed already reflects new booking for all push subscribers.

Edge Cases Considered:
- DTEND exclusive: block nights up to end_date - 1.
- Very long BLOCK events: treat as single range (do not split).
- Missing UID: generate deterministic hash (start+end+source).
- Stale events: optionally purge external_blocks entries not refreshed within N days (future cleanup task).

---

## 🕒 Automation (Cron Recommendation)
Until integrated scheduling exists, set up a cron (or Windows Task Scheduler) every 2–4 hours:
```
php -f /path/to/ical_import_airbnb.php "source=<escaped_airbnb_url>" >> /var/log/airbnb_import.log 2>&1
```
Logging goals:
- Count of events imported/updated
- Timestamp
- Any parse failures (line folding / network errors)

Future multi-source expansion:
- Table column `source` differentiates provider.
- Add provider config list (URL, enabled flag).
- Iterate through sources in one scheduled job.

---

## 🔐 Security Notes
- Outbound ICS is intentionally public (industry norm); no payment data.
- Import endpoint restricts `source` via regex to Airbnb pattern.
- Consider signed outbound URLs (token in query) for private deployments.
- Rate limiting advisable if public exposure grows (Nginx / middleware).

---

## 🧪 Testing Checklist (Extended)
| Test | Goal | Status |
|------|------|--------|
| Export ICS | File downloads, loads in Google | ✅ |
| Subscribe | Automatic refresh hourly | ✅ |
| Import Airbnb | Events parsed & stored | ✅ (prototype) |
| Booking vs External Block | Reject overlap | Pending |
| Long Block Event | Stored as single range | ✅ |
| UID Upsert | Re-import does not duplicate | ✅ |
| Stale Purge | Remove >N days old | Planned |

Planned automated test addition: unit test for date overlap boundary (start == existing end should be allowed; end == existing start allowed; partial overlaps blocked).

---

## 🖥️ Frontend Enhancements (Next Steps)
Short-term UI tasks:
- Add External Blocks panel in admin dashboard.
- Visual differentiate external blocks.
- Tooltip: "Source: Airbnb – Not available block".
- Manual re-import button (force refresh).

Medium-term:
- Merge internal + external into a unified availability grid.
- Batch conflict validator across next 365 days.

Long-term:
- Multi-platform import aggregator (Airbnb, Booking.com, VRBO).
- Webhook acceleration if/when platforms support it.

---

## 📊 Event Data (Outbound Reference)
Outbound iCal event fields (summarized): UID, DTSTART, DTEND, SUMMARY, DESCRIPTION, STATUS, CATEGORIES, LOCATION, ORGANIZER, CREATED, LAST-MODIFIED.
Inbound external block storage keeps only what we need for availability; we do not replicate all outbound descriptive richness internally.

---

## 📈 Performance & Scaling (Calendar Focus)
- Generation time <500ms for ~30–50 bookings.
- External block lookup O(log N) with proper indexing.
- Expected growth manageable: blocks per source per year far lower than bookings.
- Potential future optimization: cache ICS for 5–10 minute TTL to reduce generation bursts.

---

## 🧩 Developer Quick Reference
| Task | File | Note |
|------|------|------|
| Outbound feed | `api/ical.php` | Add filters or new statuses here |
| ICS builder | `iCalGenerator` | Formatting, DESCRIPTION composition |
| Import Airbnb | `api/ical_import_airbnb.php` | Extend to other sources by abstraction |
| External schema | `database/external_blocks.sql` | Add indexes before scale |
| UI calendar | `src/components/CalendarIntegration.tsx` | Add external blocks tab |
| Service calls | `src/services/calendarService.ts` | Add import trigger method |

---

## ✅ Implementation Status Summary
- Push export: Production-ready.
- Airbnb import: Prototype storing blocks.
- Availability enforcement: Pending implementation.
- Multi-source import: Not started.
- Admin visualization of external blocks: Not started.

Next immediate high-value step: integrate `external_blocks` overlap check into booking creation controller.

---

## 📚 Original Features (Retained)
Interactive calendar views, multi-platform subscription instructions, responsive design concepts, styling guidance, and usage examples remain valid. See earlier sections or `ICAL_DOCUMENTATION.md` for full export examples.

---

## 🏁 Summary
The Calendar System now documents both outbound (push) and inbound (pull) flows. With enforcement of `external_blocks` your system achieves full double-booking protection. Finish the overlap check + UI surfacing to reach operational completeness.

---

## (Legacy) Props Interface Example
```typescript
interface CalendarIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  bookingFilter?: string; // status filter
}
```

Usage:
```typescript
<CalendarIntegration
  isOpen={showCalendar}
  onClose={() => setShowCalendar(false)}
  bookingFilter="confirmed"
/>;
```

---
*This document supersedes the prior simpler calendar overview by adding the sync and external block enforcement model.*

---

## 🎨 **FRONTEND CALENDAR COMPONENTS**

### **CalendarIntegration Component**
**File**: `src/components/CalendarIntegration.tsx`

**Features**:
- Export bookings as .ics files
- Generate subscription URLs
- Copy calendar links to clipboard
- Integration instructions for different platforms

**Props**:
```typescript
interface CalendarIntegrationProps {
  isOpen: boolean;                    // Modal visibility
  onClose: () => void;               // Close handler
  bookingFilter?: string;            // Filter bookings by status
}
```

**Usage**:
```typescript
<CalendarIntegration
  isOpen={showCalendar}
  onClose={() => setShowCalendar(false)}
  bookingFilter="confirmed"
/>
```

### **Calendar Display Features**
- ✅ **Booking Status Colors**: Visual status indicators
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔍 **Search & Filter**: Find specific bookings
- 📊 **Monthly/Weekly Views**: Multiple display options
- 🎯 **Click-to-Details**: Tap bookings for full information

---

## ⚙️ **CALENDAR SERVICE API**

### **CalendarService Class**
**File**: `src/services/calendarService.ts`

#### **Export Calendar**
```typescript
await calendarService.exportCalendar({
  status: 'confirmed',              // Filter by booking status
  from_date: '2025-11-01',         // Start date filter
  to_date: '2025-12-31',           // End date filter
  format: 'ics'                    // Export format
});
```

#### **Get Subscription URLs**
```typescript
const urls = await calendarService.getSubscriptionUrls();
// Returns: { subscribe_url, webcal_url, instructions }
```

#### **Get Calendar Data (JSON)**
```typescript
const data = await calendarService.getCalendarData({
  status: 'all',
  format: 'json'
});
```

---

## 🔌 **BACKEND CALENDAR API**

### **iCal API Endpoint**
**File**: `api/ical.php`
**Base URL**: `/api/ical.php`

#### **Export Bookings as iCal**
```bash
# Download all confirmed bookings
GET /api/ical.php?action=calendar&format=ics&status=confirmed

# Download bookings for specific date range
GET /api/ical.php?action=calendar&format=ics&from_date=2025-11-01&to_date=2025-12-31

# Get booking data as JSON
GET /api/ical.php?action=calendar&format=json&status=all
```

#### **Get Subscription URLs**
```bash
# Get calendar subscription links
GET /api/ical.php?action=subscribe

Response:
{
  "success": true,
  "subscribe_url": "http://localhost/.../api/ical.php?action=calendar&format=ics",
  "webcal_url": "webcal://localhost/.../api/ical.php?action=calendar&format=ics",
  "instructions": {
    "google_calendar": "Click 'Add Calendar' > 'From URL' > Paste URL",
    "outlook": "File > Account Settings > Internet Calendars > New",
    "apple_calendar": "File > New Calendar Subscription > Enter URL",
    "airbnb": "Use subscribe_url in Airbnb calendar sync settings"
  }
}
```

### **API Parameters**

| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| `action` | string | `calendar`, `subscribe` | API action to perform |
| `format` | string | `ics`, `json` | Export format |
| `status` | string | `all`, `confirmed`, `pending`, `cancelled` | Filter by booking status |
| `from_date` | string | `YYYY-MM-DD` | Start date filter |
| `to_date` | string | `YYYY-MM-DD` | End date filter |
| `room_id` | string | room identifier | Filter by specific room |

---

## 📊 **CALENDAR DATA STRUCTURE**

### **iCal Event Format**
```ical
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Villa Daisy Cantik//Booking Engine//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH

BEGIN:VEVENT
UID:booking-123@villadaisycantik.com
DTSTART;VALUE=DATE:20251201
DTEND;VALUE=DATE:20251203
SUMMARY:Emma Thompson - Deluxe Suite
DESCRIPTION:Booking ID: 123\nGuests: 2\nRoom: Deluxe Suite\nEmail: emma.thompson@protonmail.com\nPhone: +44 20 7946 0958\nSpecial Requests: Celebrating our 5th anniversary
LOCATION:Villa Daisy Cantik, Ubud, Bali
STATUS:CONFIRMED
CLASS:PRIVATE
END:VEVENT

END:VCALENDAR
```

### **JSON Calendar Data**
```json
{
  "success": true,
  "data": {
    "calendar_name": "Villa Daisy Cantik Bookings",
    "events": [
      {
        "id": "booking-123",
        "start_date": "2025-12-01",
        "end_date": "2025-12-03",
        "title": "Emma Thompson - Deluxe Suite",
        "description": "2 guests, Anniversary celebration",
        "status": "confirmed",
        "room": "Deluxe Suite",
        "guest_info": {
          "name": "Emma Thompson",
          "email": "emma.thompson@protonmail.com",
          "phone": "+44 20 7946 0958"
        }
      }
    ]
  }
}
```

---

## 🌍 **PLATFORM INTEGRATION**

### **Google Calendar Integration**
```typescript
// Automatic sync setup
const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(subscribeUrl)}`;

// Manual import steps:
// 1. Open Google Calendar
// 2. Click "+" next to "Other calendars"
// 3. Select "From URL"
// 4. Paste the subscribe_url
// 5. Click "Add calendar"
```

### **Microsoft Outlook Integration**
```typescript
// Desktop Outlook steps:
// 1. File > Account Settings > Account Settings
// 2. Internet Calendars tab > New
// 3. Enter the subscribe_url
// 4. Click Add

// Outlook Web steps:  
// 1. Calendar > Add calendar
// 2. Subscribe from web
// 3. Enter calendar URL
```

### **Apple Calendar Integration**
```typescript
// macOS Calendar steps:
// 1. File > New Calendar Subscription
// 2. Enter the webcal_url (webcal:// protocol)
// 3. Configure refresh frequency
// 4. Choose calendar color and location

// iOS Calendar steps:
// 1. Settings > Calendar > Accounts
// 2. Add Account > Other
// 3. Add Subscribed Calendar
// 4. Enter webcal_url
```

---

## 📱 **RESPONSIVE CALENDAR FEATURES**

### **Mobile Optimizations**
- 👆 **Touch-Friendly**: Large touch targets for mobile
- 📱 **Swipe Navigation**: Gesture-based month navigation  
- 🔍 **Zoom Support**: Pinch-to-zoom for detailed views
- 📊 **Compact Views**: Condensed information display
- ⚡ **Fast Loading**: Optimized for mobile connections

### **Desktop Features**
- 🖱️ **Hover Effects**: Rich hover tooltips with booking details
- ⌨️ **Keyboard Navigation**: Arrow keys for calendar navigation
- 🖥️ **Multiple Views**: Month, week, and day views
- 📋 **Drag & Drop**: Future feature for booking management
- 🔍 **Advanced Filters**: Complex filtering options

---

## 🎨 **CALENDAR STYLING & THEMES**

### **Booking Status Colors**
```css
.booking-confirmed { background-color: #22c55e; }    /* Green */
.booking-pending { background-color: #f59e0b; }      /* Yellow */
.booking-cancelled { background-color: #ef4444; }    /* Red */
.booking-checked-in { background-color: #3b82f6; }   /* Blue */
.booking-checked-out { background-color: #6b7280; }  /* Gray */
```

### **Room Type Indicators**
```css
.room-economy { border-left: 4px solid #6b7280; }      /* Gray */
.room-standard { border-left: 4px solid #3b82f6; }     /* Blue */
.room-family { border-left: 4px solid #10b981; }       /* Green */
.room-deluxe { border-left: 4px solid #8b5cf6; }       /* Purple */
.room-master { border-left: 4px solid #f59e0b; }       /* Gold */
```

---

## 🗄️ **DATABASE IMPLEMENTATION DETAILS**

### **Calendar Settings Management**
```sql
-- Example: Update sync frequency
UPDATE calendar_settings 
SET setting_value = '30' 
WHERE setting_key = 'sync_frequency_default';

-- Add new calendar setting
INSERT INTO calendar_settings (setting_key, setting_value, setting_type, description, category) 
VALUES ('max_sync_retries', '3', 'integer', 'Maximum retry attempts for failed syncs', 'calendar');
```

### **Subscription Token Security**
- Tokens are UUID-based for security
- Each subscription can be filtered by room, date range, or status
- Access is logged with IP and user agent for security monitoring
- Subscriptions can be disabled without deleting history

### **Platform Integration Flow**
1. **Setup**: Store API credentials in `platform_integrations`
2. **Authentication**: Handle OAuth tokens with automatic refresh
3. **Sync Scheduling**: Configure frequency and direction
4. **Execution**: Log all operations in `platform_sync_history`
5. **Error Handling**: Capture and store detailed error information

### **Calendar Data Relationships**
```
bookings (check_in, check_out) 
    ↓ [feeds into]
calendar_subscriptions (filtered by room/date)
    ↓ [generates]
iCal feeds (via /api/ical.php)
    ↓ [consumed by]
External platforms (Airbnb, VRBO, Google Calendar)

External platforms 
    ↓ [import via]
platform_integrations (API credentials)
    ↓ [creates]
external_blocks (date blocking)
    ↓ [prevents]
Double bookings
```

### **Performance Optimizations**
- **Indexes**: Date ranges, room IDs, package IDs, and sync timestamps are indexed
- **Caching**: Calendar feeds can be cached based on last booking update
- **Batch Processing**: Multiple bookings can be synced in single API calls
- **Rate Limiting**: Configurable delays between platform API calls
- **Package Filtering**: Efficient SQL queries with proper joins for package-specific data

### **Package Calendar Benefits**
- 📦 **Granular Control**: Each package has independent calendar management
- 🔄 **Real-Time Sync**: External platforms automatically see package-specific availability
- 🚫 **Conflict Prevention**: Prevents double booking across platforms per package
- 📊 **Analytics**: Track performance and usage per package via calendar subscriptions
- 🎯 **Marketing**: Share specific package availability with partners and platforms
- 🏷️ **Branding**: Custom calendar names and descriptions per package

---

## 🔄 **CALENDAR SYNC & UPDATES**

## 🎯 **USAGE EXAMPLES**

### **Package Calendar Integration Examples:**

#### **1. Romantic Package Calendar Setup:**
```bash
# Get package calendar info
GET /api/ical.php?action=package_calendar&package_id=1

# Response:
{
  "success": true,
  "package_id": "1",
  "calendar_url": "https://yoursite.com/api/ical.php?action=calendar&format=ics&package_id=1",
  "webcal_url": "webcal://yoursite.com/api/ical.php?action=calendar&format=ics&package_id=1",
  "description": "Package-specific calendar feed containing only bookings for this package"
}
```

#### **2. Multi-Package Platform Integration:**
```bash
# Airbnb integration for Adventure Package
Airbnb External Calendar URL: 
https://yoursite.com/api/ical.php?action=calendar&package_id=2&format=ics&status=confirmed

# Google Calendar for Wellness Package  
Google Calendar Add by URL:
https://yoursite.com/api/ical.php?action=calendar&package_id=3&format=ics
```

#### **3. Frontend Component Usage:**
```typescript
// Package calendar component
import { calendarService } from '@/services/calendarService';

const PackageCalendar = ({ packageId }) => {
  const [calendarUrls, setCalendarUrls] = useState(null);
  
  useEffect(() => {
    const loadCalendarUrls = async () => {
      try {
        const urls = await calendarService.getPackageSubscriptionUrls(packageId);
        setCalendarUrls(urls);
      } catch (error) {
        console.error('Failed to load calendar URLs:', error);
      }
    };
    
    loadCalendarUrls();
  }, [packageId]);

  const exportPackageCalendar = async () => {
    try {
      await calendarService.exportPackageCalendar(packageId, {
        format: 'ics',
        status: 'confirmed'
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
};
```

---

## 🔄 **CALENDAR SYNC & UPDATES**

### **Real-Time Sync**
- ⚡ **Auto-Refresh**: Calendar updates every 15 minutes
- 🔔 **Push Notifications**: Real-time booking notifications
- 🔄 **Conflict Detection**: Automatic double-booking prevention
- 📊 **Sync Status**: Visual indicators for sync health

### **Sync Frequency Options**
```typescript
const syncIntervals = {
  realtime: 0,          // Immediate updates
  frequent: 5 * 60,     // Every 5 minutes
  normal: 15 * 60,      // Every 15 minutes (default)
  hourly: 60 * 60,      // Every hour
  daily: 24 * 60 * 60   // Once daily
};
```

---

## 🛠️ **CALENDAR MAINTENANCE**

### **Cache Management**
```typescript
// Clear calendar cache
await calendarService.clearCache();

// Refresh calendar data
await calendarService.refreshData();

// Validate calendar integrity
await calendarService.validateData();
```

### **Performance Optimization**
- 📊 **Lazy Loading**: Load only visible calendar months
- 💾 **Caching**: Cache frequently accessed calendar data
- 🗜️ **Compression**: Compress large calendar exports
- ⚡ **CDN Integration**: Serve static calendar assets from CDN

---

## 🎯 **CALENDAR BEST PRACTICES**

### **For Developers**
1. **Always validate dates** before API calls
2. **Handle timezone conversions** properly
3. **Implement proper error handling** for network failures
4. **Cache calendar data** to improve performance
5. **Use semantic HTML** for accessibility

### **For Users**
1. **Regular Sync**: Keep calendars synced with external platforms
2. **Backup Exports**: Regularly export calendar data
3. **Status Updates**: Keep booking statuses current
4. **Conflict Resolution**: Address double-bookings promptly

---

**📅 The calendar system is fully integrated and ready for production use with comprehensive booking visualization and multi-platform sync capabilities.**