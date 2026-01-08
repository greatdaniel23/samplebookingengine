# 📅 Calendar Widget Integration Guide

**For Third-Party Websites & Influencer Platforms**

This guide explains how to integrate our booking calendar widget into your website, allowing visitors to search dates and be redirected directly to available packages on our booking platform.

---

## 🎯 **Use Case**

> **Scenario:** An influencer or partner website wants to embed our calendar widget so their visitors can:
> 1. Search for available dates
> 2. Get redirected to our booking engine with pre-selected dates
> 3. See available packages for those specific dates

---

## 🔗 **API Endpoints & URL Structure**

### **Base URLs**
```
Widget API:  https://widget.rumahdaisycantik.com
Frontend:    https://rumahdaisycantik.com
```

### **Calendar Widget Endpoints**

#### 1. **Get Available Dates**
```http
GET /widget/api/availability
```

**Parameters:**
- `month` (optional): YYYY-MM format (default: current month)
- `year` (optional): YYYY format (default: current year)

**Response:**
```json
{
  "success": true,
  "data": {
    "2025-12-15": {
      "available": true,
      "packages": [
        {
          "id": 1,
          "name": "Romance Package",
          "price": 450,
          "available_rooms": 3
        }
      ]
    },
    "2025-12-16": {
      "available": false,
      "reason": "fully_booked"
    }
  }
}
```

#### 2. **Get Packages for Specific Date**
```http
GET /widget/api/packages?date=2025-12-15
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Romance Package",
      "type": "Romance",
      "price": 450,
      "description": "Perfect for couples...",
      "available": true,
      "max_guests": 2
    }
  ]
}
```

---

## 🌐 **Deep Link URL Structure**

### **Direct Booking Links**

#### **Search by Date Range**
```
https://rumahdaisycantik.com/?checkin=2025-12-15&checkout=2025-12-17&guests=2
```

#### **Pre-select Package**
```
https://rumahdaisycantik.com/?checkin=2025-12-15&checkout=2025-12-17&package=1&guests=2
```

#### **Package Category Filter**
```
https://rumahdaisycantik.com/?checkin=2025-12-15&category=Romance&guests=2
```

### **URL Parameters**

| Parameter | Description | Example | Required |
|-----------|-------------|---------|----------|
| `checkin` | Check-in date (YYYY-MM-DD) | `2025-12-15` | ✅ |
| `checkout` | Check-out date (YYYY-MM-DD) | `2025-12-17` | ✅ |
| `guests` | Number of guests | `2` | ❌ |
| `package` | Package ID | `1` | ❌ |
| `category` | Package category slug | `romance` | ❌ |
| `room` | Room ID | `deluxe-suite` | ❌ |
| `utm_source` | Tracking source | `influencer-blog` | ❌ |
| `utm_campaign` | Campaign name | `holiday-promo` | ❌ |

---

## 📋 **Widget Integration Methods**

### **Method 1: Simple Calendar Widget (Recommended)**

#### **HTML Embed Code**
```html
<div id="booking-calendar-widget" 
     data-utm-source="your-website-name">
</div>

<script src="https://widget.rumahdaisycantik.com/embed.js"></script>
```

#### **JavaScript Configuration**
```javascript
window.BookingWidget.init({
  container: '#booking-calendar-widget',
  theme: 'light', // 'light' or 'dark'
  language: 'en', // 'en' or 'id'
  utm_source: 'your-website-name',
  utm_campaign: 'calendar-widget',
  onDateSelect: function(checkin, checkout, packages) {
    // Custom handling when dates are selected
    console.log('Selected:', checkin, checkout, packages);
  }
});
```

### **Method 2: iFrame Embed**
```html
<iframe 
  src="https://widget.rumahdaisycantik.com/calendar?utm_source=your-site" 
  width="100%" 
  height="400"
  frameborder="0">
</iframe>
```

### **Method 3: Custom Implementation**

#### **Fetch Available Dates**
```javascript
async function getAvailableDates(month = null) {
  const url = month 
    ? `https://widget.rumahdaisycantik.com/api/availability?month=${month}`
    : `https://widget.rumahdaisycantik.com/api/availability`;
    
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
```

#### **Generate Booking Link**
```javascript
function generateBookingLink(checkin, checkout, options = {}) {
  const baseUrl = 'https://rumahdaisycantik.com';
  const params = new URLSearchParams({
    checkin: checkin,
    checkout: checkout,
    ...options
  });
  
  return `${baseUrl}/?${params.toString()}`;
}

// Usage
const bookingUrl = generateBookingLink('2025-12-15', '2025-12-17', {
  guests: 2,
  category: 'romance',
  utm_source: 'influencer-blog'
});
```

---

## 🔄 **Redirect Flow & Implementation**

### **Complete Widget Implementation Example**

Here's a complete example showing how the widget should handle date selection and redirect users to the main booking site:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Villa Booking Calendar Widget</title>
    <style>
        .booking-widget {
            max-width: 450px;
            margin: 20px auto;
            padding: 25px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-family: 'Inter', -apple-system, sans-serif;
            background: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .widget-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .widget-title {
            color: #1f2937;
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 8px 0;
        }
        
        .widget-subtitle {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
        
        .date-selection {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 20px 0;
        }
        
        .date-group {
            display: flex;
            flex-direction: column;
        }
        
        .date-label {
            font-size: 12px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .date-input {
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            background: #f9fafb;
            transition: all 0.2s;
        }
        
        .date-input:focus {
            outline: none;
            border-color: #dc2626;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
        
        .guest-selector {
            margin: 20px 0;
        }
        
        .guest-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            background: #f9fafb;
        }
        
        .booking-button {
            width: 100%;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 14px 20px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .booking-button:hover {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        
        .booking-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .error-message {
            color: #dc2626;
            font-size: 12px;
            margin-top: 8px;
            padding: 8px;
            background: #fef2f2;
            border-radius: 6px;
            border-left: 3px solid #dc2626;
        }
        
        .widget-footer {
            text-align: center;
            margin-top: 15px;
            font-size: 11px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="booking-widget">
        <div class="widget-header">
            <h3 class="widget-title">🏖️ Check Villa Availability</h3>
            <p class="widget-subtitle">Select your dates and book directly</p>
        </div>
        
        <div class="date-selection">
            <div class="date-group">
                <label class="date-label">Check-In</label>
                <input type="date" id="checkinDate" class="date-input" required>
            </div>
            <div class="date-group">
                <label class="date-label">Check-Out</label>
                <input type="date" id="checkoutDate" class="date-input" required>
            </div>
        </div>
        
        <div class="guest-selector">
            <label class="date-label">Number of Guests</label>
            <select id="guestCount" class="guest-input">
                <option value="1">1 Guest</option>
                <option value="2" selected>2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
            </select>
        </div>
        
        <button id="bookingBtn" class="booking-button" onclick="handleBookingRedirect()">
            Check Availability & Book Now
        </button>
        
        <div id="errorMessage" class="error-message" style="display: none;"></div>
        
        <div class="widget-footer">
            Powered by Rumah Daisy Cantik Villa
        </div>
    </div>

    <script>
        // Configuration - Replace with your actual influencer ID
        const INFLUENCER_CONFIG = {
            id: 'YOUR_INFLUENCER_ID',
            source: 'influencer-website',
            campaign: 'calendar-widget'
        };
        
        // Set minimum dates to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkinDate').min = today;
        document.getElementById('checkoutDate').min = today;
        
        // Update checkout minimum when checkin changes
        document.getElementById('checkinDate').addEventListener('change', function() {
            const checkinDate = this.value;
            const checkoutInput = document.getElementById('checkoutDate');
            
            if (checkinDate) {
                // Set checkout minimum to day after checkin
                const nextDay = new Date(checkinDate);
                nextDay.setDate(nextDay.getDate() + 1);
                checkoutInput.min = nextDay.toISOString().split('T')[0];
                
                // Clear checkout if it's now invalid
                if (checkoutInput.value && checkoutInput.value <= checkinDate) {
                    checkoutInput.value = '';
                }
            }
            
            validateDates();
        });
        
        // Validate dates on checkout change
        document.getElementById('checkoutDate').addEventListener('change', validateDates);
        
        function validateDates() {
            const checkin = document.getElementById('checkinDate').value;
            const checkout = document.getElementById('checkoutDate').value;
            const bookingBtn = document.getElementById('bookingBtn');
            const errorMsg = document.getElementById('errorMessage');
            
            // Reset error state
            errorMsg.style.display = 'none';
            bookingBtn.disabled = false;
            
            if (!checkin || !checkout) {
                if (checkin || checkout) {
                    showError('Please select both check-in and check-out dates');
                }
                return false;
            }
            
            const checkinDate = new Date(checkin);
            const checkoutDate = new Date(checkout);
            
            if (checkoutDate <= checkinDate) {
                showError('Check-out date must be after check-in date');
                return false;
            }
            
            if (checkinDate < new Date(today)) {
                showError('Check-in date cannot be in the past');
                return false;
            }
            
            return true;
        }
        
        function showError(message) {
            const errorMsg = document.getElementById('errorMessage');
            const bookingBtn = document.getElementById('bookingBtn');
            
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            bookingBtn.disabled = true;
        }
        
        async function checkAvailability(checkin, checkout) {
            try {
                const response = await fetch(
                    `https://widget.rumahdaisycantik.com/api/availability?checkin=${checkin}&checkout=${checkout}`
                );
                const data = await response.json();
                return data.success && data.available;
            } catch (error) {
                console.warn('Availability check failed, proceeding anyway:', error);
                return true; // Assume available if check fails
            }
        }
        
        async function handleBookingRedirect() {
            if (!validateDates()) return;
            
            const checkin = document.getElementById('checkinDate').value;
            const checkout = document.getElementById('checkoutDate').value;
            const guests = document.getElementById('guestCount').value;
            const bookingBtn = document.getElementById('bookingBtn');
            
            // Show loading state
            const originalText = bookingBtn.textContent;
            bookingBtn.textContent = 'Checking availability...';
            bookingBtn.disabled = true;
            
            try {
                // Optional: Check availability first
                const isAvailable = await checkAvailability(checkin, checkout);
                
                if (!isAvailable) {
                    showError('No rooms available for selected dates. Please try different dates.');
                    bookingBtn.textContent = originalText;
                    return;
                }
                
                // Build booking URL with all parameters
                const bookingParams = new URLSearchParams({
                    checkin: checkin,
                    checkout: checkout,
                    guests: guests,
                    source: INFLUENCER_CONFIG.source,
                    campaign: INFLUENCER_CONFIG.campaign,
                    ref: INFLUENCER_CONFIG.id,
                    utm_source: INFLUENCER_CONFIG.source,
                    utm_medium: 'widget',
                    utm_campaign: INFLUENCER_CONFIG.campaign
                });
                
                const bookingUrl = `https://booking.rumahdaisycantik.com?${bookingParams.toString()}`;
                
                // Track the redirect (optional analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'widget_booking_redirect', {
                        'event_category': 'booking',
                        'event_label': INFLUENCER_CONFIG.id,
                        'checkin_date': checkin,
                        'checkout_date': checkout,
                        'guest_count': guests
                    });
                }
                
                // Open booking page in new tab
                window.open(bookingUrl, '_blank');
                
                // Reset button after short delay
                setTimeout(() => {
                    bookingBtn.textContent = 'Book Another Date';
                    bookingBtn.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('Booking redirect error:', error);
                showError('Unable to process booking. Please try again.');
                bookingBtn.textContent = originalText;
                bookingBtn.disabled = false;
            }
        }
        
        // Initialize widget
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-set checkout to tomorrow if checkin is today
            const checkinInput = document.getElementById('checkinDate');
            if (!checkinInput.value) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                document.getElementById('checkoutDate').min = tomorrow.toISOString().split('T')[0];
            }
        });
    </script>
</body>
</html>
```

### **Key Implementation Points**

1. **Date Validation**
   - Minimum date is today
   - Checkout must be after checkin
   - Clear validation messages

2. **Booking URL Structure**
   ```javascript
   const bookingUrl = `https://booking.rumahdaisycantik.com?checkin=${checkin}&checkout=${checkout}&guests=${guests}&source=influencer&ref=${influencerId}`;
   ```

3. **Tracking Parameters**
   - `source`: Identifies traffic source
   - `ref`: Influencer/partner ID for commission tracking
   - `utm_*`: Marketing analytics parameters

4. **Error Handling**
   - API availability checks (optional)
   - User-friendly error messages
   - Graceful fallbacks

### **URL Parameters Explanation**

When users click "Book Now", they are redirected to:
```
https://booking.rumahdaisycantik.com?checkin=2025-12-15&checkout=2025-12-17&guests=2&source=influencer&ref=INFLUENCER_ID
```

This URL will:
1. Pre-fill the booking form with selected dates
2. Show only available packages for those dates  
3. Track the influencer for commission purposes
4. Provide seamless user experience

---

## 🎨 **Styling & Customization**

### **CSS Classes for Custom Styling**
```css
/* Calendar container */
.booking-calendar {
  font-family: 'Inter', sans-serif;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

/* Available date */
.calendar-date.available {
  background-color: #10b981;
  color: white;
  cursor: pointer;
}

/* Unavailable date */
.calendar-date.unavailable {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Selected date range */
.calendar-date.selected {
  background-color: #3b82f6;
  color: white;
}

/* Booking button */
.booking-btn {
  background-color: #dc2626;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
```

### **Theme Options**
```javascript
const themes = {
  light: {
    primary: '#dc2626',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb'
  },
  dark: {
    primary: '#ef4444',
    background: '#1f2937',
    text: '#f9fafb',
    border: '#374151'
  }
};
```

---

## 📊 **Analytics & Tracking**

### **UTM Parameters for Tracking**
```javascript
// Recommended UTM structure
const utmParams = {
  utm_source: 'influencer-website',      // Your website name
  utm_medium: 'calendar-widget',         // Always 'calendar-widget'
  utm_campaign: 'holiday-promotion',     // Your campaign name
  utm_content: 'sidebar-widget',         // Widget placement
  utm_term: 'date-search'               // User action
};
```

### **Event Tracking**
```javascript
// Track widget interactions
function trackWidgetEvent(event, data) {
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', event, {
      event_category: 'booking_widget',
      event_label: data.source || 'widget',
      custom_parameter: data
    });
  }
  
  // Facebook Pixel
  if (typeof fbq !== 'undefined') {
    fbq('trackCustom', 'BookingWidget', {
      event_type: event,
      ...data
    });
  }
}

// Usage examples
trackWidgetEvent('date_selected', {
  checkin: '2025-12-15',
  checkout: '2025-12-17',
  source: 'influencer-blog'
});

trackWidgetEvent('booking_initiated', {
  package_id: 1,
  package_name: 'Romance Package',
  total_price: 450
});
```

---

## 🔧 **Implementation Examples**

### **Example 1: Blog Post Integration**
```html
<!-- In your blog post -->
<div class="booking-widget-container">
  <h3>Check Availability & Book Now</h3>
  <p>Select your preferred dates below:</p>
  
  <div id="villa-calendar" 
       data-utm-source="travel-blog"
       data-utm-campaign="bali-guide-2025">
  </div>
  
  <script>
    BookingWidget.init({
      container: '#villa-calendar',
      utm_source: 'travel-blog',
      utm_campaign: 'bali-guide-2025'
    });
  </script>
</div>
```

### **Example 2: Sidebar Widget**
```html
<!-- Sidebar widget -->
<div class="sidebar-booking">
  <h4>Book Villa Daisy Cantik</h4>
  <div id="quick-booking" data-compact="true"></div>
</div>

<script>
  BookingWidget.init({
    container: '#quick-booking',
    compact: true, // Smaller version
    utm_source: 'sidebar-widget'
  });
</script>
```

### **Example 3: Instagram Bio Link Page**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Book Villa Daisy Cantik</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div class="container">
    <h1>🏝️ Villa Daisy Cantik</h1>
    <p>Select your dates and book instantly!</p>
    
    <div id="instagram-calendar"></div>
  </div>
  
  <script src="https://rumahdaisycantik.com/widget/calendar.js"></script>
  <script>
    BookingWidget.init({
      container: '#instagram-calendar',
      utm_source: 'instagram',
      utm_campaign: 'bio-link',
      fullWidth: true
    });
  </script>
</body>
</html>
```

---

## 🚀 **Quick Start Checklist**

### **For Website Owners:**
- [ ] 1. Copy the embed code above
- [ ] 2. Replace `your-website-name` with your actual site name
- [ ] 3. Add UTM parameters for tracking
- [ ] 4. Test the calendar widget
- [ ] 5. Verify booking redirects work
- [ ] 6. Set up analytics tracking (optional)

### **For Developers:**
- [ ] 1. Review API endpoints documentation
- [ ] 2. Test API responses in development
- [ ] 3. Implement custom calendar if needed
- [ ] 4. Add proper error handling
- [ ] 5. Set up CORS if using direct API calls
- [ ] 6. Implement analytics tracking

---

## 📞 **Support & Contact**

**Technical Support:**
- Email: `dev@rumahdaisycantik.com`
- Documentation: `https://docs.rumahdaisycantik.com`

**Partnership Inquiries:**
- Email: `partnerships@rumahdaisycantik.com`
- Affiliate Program: `https://rumahdaisycantik.com/affiliates`

**Widget Issues:**
- Report bugs: `https://github.com/rumahdaisycantik/widget-issues`
- Feature requests: `https://feedback.rumahdaisycantik.com`

---

## 📝 **Changelog**

### **v1.2.0** (2025-12-13)
- Added marketing category filtering
- Improved mobile responsiveness
- Added dark theme support

### **v1.1.0** (2025-11-15)
- Added package pre-selection
- UTM parameter support
- Analytics integration

### **v1.0.0** (2025-10-01)
- Initial widget release
- Basic calendar functionality
- Deep link integration