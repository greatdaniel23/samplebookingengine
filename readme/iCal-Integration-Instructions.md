# iCal Integration Instructions

## 🎯 What's Been Implemented

Your Admin Panel now has a **simple and functional** iCal integration system that allows you to:

1. **Add iCal URLs** from Airbnb, Booking.com, and VRBO
2. **Save and Test** the URLs to verify they work
3. **Sync calendars** manually or automatically
4. **Export your calendar** for other platforms to use

## 📍 Where to Find It

1. Go to your **Admin Panel** (http://localhost:5175/admin)
2. Click on the **"Calendar & Availability"** tab
3. Click on **"🔗 Integration & Sync"** sub-tab

## 🚀 How to Use

### Adding Your Airbnb iCal URL

1. In the **red Airbnb section**, paste your iCal URL
2. Click **"Save & Test"** - this will:
   - Save the URL to your system
   - Test it immediately 
   - Show you how many events were found
3. Use **"Sync Now"** to manually sync anytime

### Finding Your iCal URLs

**Airbnb:**
- Go to your Airbnb hosting dashboard
- Calendar → Export Calendar
- Copy the iCal URL

**Booking.com:**
- Go to your Booking.com extranet
- Calendar → Synchronization
- Copy the iCal URL

**VRBO:**
- Go to your VRBO dashboard
- Calendar → Import/Export
- Copy the iCal URL

## 🔧 API Integration

The system connects to your **`/api/ical.php`** endpoint with these actions:

### Save & Test URL
```json
{
  "platform": "airbnb|booking|vrbo",
  "url": "your-ical-url",
  "action": "save_test"
}
```

### Sync Platform
```json
{
  "platform": "airbnb|booking|vrbo", 
  "action": "sync"
}
```

### Sync All Platforms
```json
{
  "action": "sync_all"
}
```

## 📤 Sharing Your Calendar

Your calendar is available at:
- **URL:** `https://api.rumahdaisycantik.com/ical.php`
- Use this URL in other platforms to sync your bookings to them

## ✨ Features

- **Simple Interface:** Just paste URLs and click buttons
- **Real Feedback:** Get immediate success/error messages
- **Platform-Specific:** Each platform has its own colored section
- **Copy to Clipboard:** Easy sharing of your calendar URL
- **Visual Status:** See which platforms are configured

## 🔄 Automatic Sync

The system also includes automatic background syncing every 30 minutes through the `icalService.ts` that was implemented.

---

**Note:** This system is designed to be simple and functional as you requested - no complex state management, just working buttons that connect to your API!