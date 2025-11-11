# 📅 CALENDAR SYSTEM DOCUMENTATION
**Villa Booking Engine - Calendar Integration & Management**

---

## 🎯 **CALENDAR SYSTEM OVERVIEW**

The Villa Booking Engine includes a comprehensive calendar system that provides:
- 📊 **Booking Visualization**: Interactive calendar views
- 📤 **iCal Export**: Download bookings as .ics files
- 🔗 **Calendar Sync**: Subscribe to real-time booking updates
- 🌍 **Multi-Platform Support**: Google Calendar, Outlook, Apple Calendar
- 📱 **Responsive Design**: Works on desktop and mobile

---

## 🏗️ **SYSTEM ARCHITECTURE**

```
📅 Calendar System
├── 🎨 Frontend Components
│   ├── CalendarIntegration.tsx     # Main calendar UI
│   ├── BookingCalendar.tsx         # Calendar view component
│   └── DatePicker components       # Date selection
│
├── ⚙️ Services
│   ├── calendarService.ts          # Calendar API calls
│   └── dateUtils.ts                # Date manipulation helpers
│
├── 🔌 Backend API
│   ├── ical.php                    # iCal generation & export
│   └── calendar endpoints          # Calendar data API
│
└── 🗄️ Database Integration
    └── booking_engine.bookings     # Source booking data
```

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