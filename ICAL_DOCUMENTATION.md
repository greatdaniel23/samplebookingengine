# 📅 iCal Calendar Integration Documentation

## Overview

The Villa Booking System now includes comprehensive iCal (iCalendar) integration, allowing seamless synchronization with external calendar platforms like Google Calendar, Outlook, Apple Calendar, Airbnb, Booking.com, and other booking platforms.

## Features

### ✨ Core Capabilities
- **📤 Calendar Export**: Download bookings as standard .ics files
- **🔗 Live Synchronization**: Real-time calendar subscription URLs
- **🌐 Platform Integration**: Compatible with all major calendar and booking platforms
- **📱 Multi-Device Support**: Works on desktop, mobile, and web applications
- **🔄 Automatic Updates**: Live sync keeps calendars up-to-date
- **🎯 Filtered Exports**: Export by booking status (all, confirmed, pending, etc.)

### 🏢 Platform Compatibility
- **Google Calendar** - Full integration support
- **Microsoft Outlook** - Web and desktop versions
- **Apple Calendar** - Mac, iPhone, iPad support
- **Airbnb** - External calendar import
- **Booking.com** - Calendar synchronization
- **VRBO/Expedia** - Availability sync
- **Any iCal-compatible application**

## API Endpoints

### Base URL
```
http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api/ical.php
```

### Available Actions

#### 1. Get Subscription URLs
```http
GET /ical.php?action=subscribe
```

**Response:**
```json
{
  "success": true,
  "subscribe_url": "http://localhost/.../ical.php?action=calendar&format=ics",
  "webcal_url": "webcal://localhost/.../ical.php?action=calendar&format=ics",
  "instructions": {
    "google_calendar": "Add by URL in Google Calendar",
    "outlook": "Subscribe to calendar in Outlook",
    "apple_calendar": "Subscribe in Apple Calendar app",
    "airbnb": "Use as external calendar URL in Airbnb"
  }
}
```

#### 2. Export Calendar (.ics format)
```http
GET /ical.php?action=calendar&format=ics
```

**Optional Parameters:**
- `status`: Filter by booking status (all, confirmed, pending, cancelled, checked_in, checked_out)
- `from_date`: Start date filter (YYYY-MM-DD)
- `to_date`: End date filter (YYYY-MM-DD)

**Response:** 
- Content-Type: `text/calendar; charset=utf-8`
- Downloads as .ics file

#### 3. Get Calendar Data (JSON format)
```http
GET /ical.php?action=calendar&format=json
```

**Response:**
```json
{
  "success": true,
  "ical": "BEGIN:VCALENDAR\r\nVERSION:2.0...",
  "count": 11
}
```

## Implementation

### Backend (PHP)

The iCal system consists of:

1. **`/api/ical.php`** - Main API endpoint
2. **`iCalGenerator` class** - Handles calendar generation
3. **Database integration** - Fetches booking data with room/villa info

### Frontend Integration

#### Admin Dashboard
- **Export Buttons**: Direct download of calendar files
- **Sync URLs Modal**: Generate and copy subscription URLs
- **Platform Instructions**: Step-by-step integration guides

#### React Components
- **`CalendarIntegration.tsx`** - Complete calendar management UI
- **`calendarService.ts`** - Frontend service for API calls

### JavaScript Service Usage

```typescript
import { calendarService } from '../services/calendarService';

// Export calendar
await calendarService.exportCalendar({ status: 'confirmed' });

// Get subscription URLs
const urls = await calendarService.getSubscriptionUrls();

// Copy URL to clipboard
await calendarService.copyToClipboard(urls.subscribe_url);
```

## Platform Integration Guides

### 🗓️ Google Calendar

1. Open Google Calendar in your browser
2. Click the "+" button next to "Other calendars"
3. Select "From URL"
4. Paste the **Standard Calendar URL**
5. Click "Add calendar"
6. Your villa bookings will appear in Google Calendar

**Pro Tip:** Set up email notifications in Google Calendar for booking reminders.

### 📧 Microsoft Outlook

#### Web Version:
1. Open Outlook Calendar online
2. Click "Add calendar" → "Subscribe from web"
3. Paste the **Standard Calendar URL**
4. Give your calendar a name (e.g., "Villa Bookings")
5. Click "Import"

#### Desktop Version:
1. Open Outlook desktop app
2. Go to Calendar view
3. Home tab → "Open Calendar" → "From Internet"
4. Paste the **Standard Calendar URL**
5. Click "OK"

### 🍎 Apple Calendar

#### Mac:
1. Open Calendar app
2. File → New Calendar Subscription
3. Paste the **Webcal URL**
4. Configure refresh frequency (recommended: Every hour)
5. Click "OK"

#### iPhone/iPad:
1. Settings → Calendar → Accounts → Add Account
2. Select "Other" → "Add Subscribed Calendar"
3. Paste the **Webcal URL**
4. Configure sync settings
5. Save

### 🏠 Airbnb Integration

1. Log into your Airbnb host account
2. Navigate to your listing
3. Go to Calendar tab
4. Click "Availability settings"
5. Select "Import calendar"
6. Paste the **Standard Calendar URL**
7. Set sync frequency to "Hourly" or "Daily"
8. Click "Save"

**Result:** Your villa bookings will automatically block dates in Airbnb, preventing double bookings.

### 🌐 Booking.com Integration

1. Log into Booking.com extranet
2. Go to Property → Calendar & Pricing
3. Look for "Calendar sync" or "Import calendar"
4. Add the **Standard Calendar URL**
5. Enable automatic synchronization
6. Save settings

### 🏖️ VRBO/Expedia Integration

1. Log into your VRBO owner account
2. Go to your property dashboard
3. Navigate to Calendar & Availability
4. Find "Import calendar" or "Connect calendar"
5. Add the **Standard Calendar URL**
6. Enable sync to prevent double bookings

## iCal Format Details

### Event Structure
Each booking generates an iCal VEVENT with:

```ical
BEGIN:VEVENT
UID:booking-123@villa-booking-system.com
DTSTART;VALUE=DATE:20251201
DTEND;VALUE=DATE:20251205
SUMMARY:BLOCKED - Room Name
DESCRIPTION:Booking Reference: BK-123\nGuest: John Doe\nEmail: john@example.com...
STATUS:CONFIRMED
TRANSP:OPAQUE
CATEGORIES:BOOKING,ACCOMMODATION
LOCATION:Villa Location
ORGANIZER:mailto:villa@email.com
END:VEVENT
```

### Key Fields:
- **UID**: Unique identifier for each booking
- **DTSTART/DTEND**: Check-in and check-out dates
- **SUMMARY**: Shows as "BLOCKED - Room Name" for availability blocking
- **DESCRIPTION**: Complete booking details (guest info, price, requests)
- **STATUS**: Maps booking status to iCal standards (CONFIRMED, TENTATIVE, CANCELLED)
- **LOCATION**: Villa address/location
- **ORGANIZER**: Villa contact email

## Testing

### Test Page
Access the comprehensive test interface:
```
http://localhost/.../ical-test.html
```

Features:
- **API Testing**: Verify all endpoints work correctly
- **Export Testing**: Download calendar files
- **URL Generation**: Generate and test subscription URLs
- **Platform Links**: Quick access to integration instructions

### Manual Testing

1. **Export Test**: Download .ics file and import into your calendar app
2. **Subscription Test**: Add subscription URL to Google Calendar
3. **Sync Test**: Make a new booking and verify it appears in subscribed calendars
4. **Platform Test**: Try integrating with Airbnb or Booking.com

## Troubleshooting

### Common Issues

#### Calendar Not Updating
- **Cause**: Calendar app cached old data
- **Solution**: Force refresh or re-add subscription URL

#### 403/404 Errors
- **Cause**: Incorrect API URL or server configuration
- **Solution**: Verify XAMPP is running and check API endpoint URLs

#### Events Not Showing
- **Cause**: Date format or timezone issues
- **Solution**: Check server timezone settings and date formats

#### Airbnb Sync Failed
- **Cause**: URL format not compatible
- **Solution**: Use Standard URL (not Webcal) for Airbnb

### Debug Steps

1. **Test API directly**: Visit `ical.php?action=subscribe` in browser
2. **Check logs**: Review browser console for JavaScript errors
3. **Verify data**: Ensure bookings exist in database
4. **Test export**: Try downloading .ics file manually

## Security Considerations

### Public Access
- iCal URLs are publicly accessible (by design for calendar sync)
- URLs contain booking data but no sensitive payment information
- Consider implementing URL tokens for additional security if needed

### Data Included
- Guest names and contact information
- Booking dates and details
- Room/package information
- Special requests
- **Not included**: Payment information, internal notes

## Performance

### Optimization
- Calendar generation is optimized for typical booking volumes
- Database queries include necessary JOINs for complete data
- iCal output is generated on-demand (not cached)

### Scalability
- Suitable for small to medium-sized properties
- For high-volume operations, consider implementing caching
- API responses are lightweight and efficient

## Future Enhancements

### Planned Features
- **🔐 Authentication**: Optional password protection for calendar URLs
- **🎨 Customization**: Configurable event titles and descriptions
- **📊 Analytics**: Track calendar subscription usage
- **🔄 Bidirectional Sync**: Import external calendars to block dates
- **📱 Mobile App**: Dedicated mobile calendar management

### Integration Opportunities
- **Zapier Integration**: Automated workflows
- **Channel Manager**: Integration with property management systems
- **API Keys**: Token-based access control
- **Webhook Notifications**: Real-time sync triggers

## Conclusion

The iCal integration provides a professional, standards-compliant calendar system that seamlessly connects your villa booking system with external platforms. This prevents double bookings, provides real-time availability updates, and offers guests and platform partners accurate booking information.

The system is production-ready and compatible with all major calendar applications and booking platforms, making it an essential feature for modern villa management.