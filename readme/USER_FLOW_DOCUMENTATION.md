# 🏨 Villa Booking Engine - Complete User Flow Documentation

## 📋 **Document Overview**
- **Purpose**: Complete user journey from homepage to payment completion
- **Scope**: End-to-end customer booking experience
- **Last Updated**: December 15, 2025
- **Flow Type**: Villa Booking Engine User Experience

---

## 🎯 **User Flow Summary**

```
Homepage → Package Browse → Package Details → Room Selection → 
Date Selection → Guest Details → Payment → Confirmation
```

---

## 📱 **Step-by-Step User Journey**

### **Step 1: Homepage Entry** 
**Route**: `/` (http://localhost:5173)

**User Actions**:
- Views hero section with villa images
- Reads villa description and amenities
- Sees featured packages/promotions
- Can use quick search (dates + guests)

**Technical Components**:
- `src/pages/Homepage.tsx`
- Hero image carousel
- Package preview cards
- Quick search form

**User Decisions**:
- Browse all packages → Click "View All Packages"
- Select specific package → Click package card
- Use quick search → Enter dates/guests

---

### **Step 2: Package Browse Page**
**Route**: `/packages` or `/packages?checkin=DATE&checkout=DATE&adults=N`

**User Actions**:
- Views all available packages
- Filters by dates, guests, marketing category
- Compares package features and prices
- Reads package descriptions

**Technical Components**:
- `src/pages/PackagesPage.tsx`
- Package grid/list view
- Search filters
- Price display (USD)

**API Calls**:
- `GET /api/packages.php` - Load all packages
- `GET /api/packages.php?marketing_category=honeymoon` - Filtered results

**User Decisions**:
- Select package for details → Click "View Details"
- Refine search → Adjust filters
- Return to homepage → Navigation

---

### **Step 3: Package Details Page**
**Route**: `/packages/:id` (e.g., `/packages/11`)

**User Actions**:
- Views detailed package information
- Sees package amenities and inclusions
- Reviews package images/gallery
- Checks base price and what's included
- **Selects preferred room type from available options**

**Technical Components**:
- `src/pages/PackageDetails.tsx`
- Dynamic theming system (database-driven styling)
- Package information display
- **Room selection component with live pricing**
- Amenities list
- Image gallery

**API Calls**:
- `GET /api/packages.php?id=11&include_rooms=true` - Package details
- `GET /api/package-rooms.php?package_id=11` - Available room options

**User Decisions**:
- **Choose room type → Select from dropdown/cards (price updates dynamically)**
- Proceed to booking → Click "Book Now" button
- Return to browse → Back navigation
- View more images → Gallery interaction

**🔥 Key Feature**: Room selection updates price in real-time without page navigation

---

### **Step 4: Booking Form - Date Selection**
**Route**: `/book?package_id=11&room_id=5` (or similar booking route)

**User Actions**:
- Selects check-in date
- Selects check-out date  
- Confirms number of guests
- Reviews selected package + room combination
- Sees total price calculation

**Technical Components**:
- Date picker components
- Guest counter
- Price calculation display
- Package + room summary

**Validation**:
- Minimum stay requirements
- Room availability for dates
- Maximum guest capacity

**User Decisions**:
- Confirm dates → Proceed to guest details
- Change dates → Adjust calendar
- Change room → Return to package details

---

### **Step 5: Guest Information**
**Route**: `/book/details` (continuing booking flow)

**User Actions**:
- Enters primary guest name
- Provides email address
- Enters phone number
- Adds special requests/notes
- Reviews booking summary

**Technical Components**:
- Guest information form
- Form validation
- Booking summary sidebar
- Price breakdown display

**Validation**:
- Required fields completion
- Email format validation
- Phone number format

**User Decisions**:
- Proceed to payment → Click "Continue to Payment"
- Edit dates/rooms → Back navigation
- Save and continue later → Form persistence

---

### **Step 6: Payment Processing**
**Route**: `/book/payment`

**User Actions**:
- Reviews final booking details
- Sees complete price breakdown
- Selects payment method
- Enters payment information
- Confirms terms and conditions
- Submits payment

**Technical Components**:
- Payment gateway integration
- Secure payment form
- Final booking summary
- Terms and conditions

**API Calls**:
- `POST /api/bookings.php` - Create booking record
- Payment gateway APIs (Stripe/PayPal/etc.)

**User Decisions**:
- Complete payment → Submit payment form
- Edit booking details → Back navigation
- Cancel booking → Exit flow

---

### **Step 7: Booking Confirmation**
**Route**: `/book/confirmation` or `/summary`

**User Actions**:
- Views booking confirmation details
- Receives booking reference number
- Downloads/emails booking receipt
- Reviews next steps (check-in process)

**Technical Components**:
- Confirmation page
- Email service integration
- PDF generation (optional)
- Booking reference display

**API Calls**:
- `GET /api/bookings.php?id=BOOKING_ID` - Booking details
- `POST /api/email-service.php` - Send confirmation email

**User Actions**:
- Print confirmation → Print page
- Email receipt → Send email
- Make another booking → Return to homepage
- View booking history → Account area

---

## 🎨 **Visual Flow Diagram**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Homepage   │───▶│  Packages   │───▶│ Package     │
│  Landing    │    │  Browse     │    │ Details     │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Confirmation│◀───│  Payment    │◀───│ Date & Room │
│   Receipt   │    │ Processing  │    │ Selection   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                      ┌─────────────┐
                                      │ Guest Info  │
                                      │ & Details   │
                                      └─────────────┘
```

---

## 🔧 **Technical Integration Points**

### **Frontend Routes & Components**
```typescript
// React Router Configuration
Routes:
- `/` → Homepage.tsx
- `/packages` → PackagesPage.tsx  
- `/packages/:id` → PackageDetails.tsx
- `/book` → BookingForm.tsx
- `/book/payment` → PaymentPage.tsx
- `/summary` → ConfirmationPage.tsx
```

### **API Endpoints Used**
```php
// Core API Endpoints
GET /api/packages.php - Package listings
GET /api/packages.php?id=X&include_rooms=true - Package details
GET /api/package-rooms.php?package_id=X - Room options
POST /api/bookings.php - Create booking
GET /api/bookings.php?id=X - Booking details
POST /api/email-service.php - Send notifications
```

### **Database Tables Involved**
- `packages` - Package information
- `rooms` - Room inventory
- `package_rooms` - Package-room relationships
- `bookings` - Booking records
- `amenities` - Package features
- `package_amenities` - Package-amenity links

---

## 🚨 **Critical User Experience Points**

### **Must-Have Features**
1. **Room Selection with Live Pricing** - Price updates without page refresh
2. **Date Availability Checking** - Real-time room availability
3. **Mobile Responsive** - Works on all devices
4. **Clear Price Breakdown** - Transparent pricing at each step
5. **Booking Persistence** - Save progress if user leaves
6. **Error Handling** - Graceful failures with clear messages

### **Performance Requirements**
- Page load times < 3 seconds
- API response times < 1 second
- Mobile-first responsive design
- Offline form data preservation

### **Accessibility Requirements**
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Clear focus indicators

---

## 📊 **User Drop-off Analysis Points**

### **High-Risk Drop-off Stages**
1. **Package Browse → Package Details** (33% typical drop-off)
2. **Package Details → Booking Form** (45% typical drop-off)
3. **Guest Details → Payment** (25% typical drop-off)

### **Optimization Strategies**
- **Clear pricing** throughout the flow
- **Trust signals** (security badges, reviews)
- **Progress indicators** showing booking steps
- **Easy back navigation** to previous steps
- **Mobile optimization** for on-the-go booking

---

## 🔍 **Testing Scenarios**

### **Happy Path Testing**
1. Homepage → Browse packages → Select package → Choose room → Enter dates → Guest info → Payment → Confirmation
2. Homepage quick search → Filtered results → Package selection → Booking completion

### **Error Path Testing**
1. No room availability for selected dates
2. Payment processing failures
3. Network connectivity issues
4. Invalid form data submissions
5. Session timeout during booking

### **Edge Cases**
1. Same-day bookings
2. Group bookings (max capacity)
3. Package/room price changes during booking
4. Multiple browser tabs/sessions

---

## 🎯 **Success Metrics**

### **Conversion Tracking**
- **Homepage to Browse**: % of visitors who view packages
- **Browse to Details**: % who select specific package  
- **Details to Booking**: % who click "Book Now"
- **Booking to Payment**: % who complete guest info
- **Payment to Confirmation**: % successful payments

### **User Experience Metrics**
- Average time to complete booking
- Form abandonment rates by step
- Mobile vs desktop completion rates
- Error rate by form field

---

## 🚨 **Critical Deployment Reminders**

### **🔥 BEFORE Testing User Flow:**
- [ ] **Upload ALL PHP files** to api.rumahdaisycantik.com
- [ ] **Test all API endpoints** on production server
- [ ] **Verify database** has current schema
- [ ] **Check room-package** relationships are populated

### **🔥 API Files to Deploy:**
- `api/packages.php` - Package data with room support
- `api/package-rooms.php` - Room selection options  
- `api/bookings.php` - Booking creation
- `api/email-service.php` - Confirmation emails

---

## 📚 **Related Documentation**
- [WORKFLOW_DOCUMENTATION.md](WORKFLOW_DOCUMENTATION.md) - Development workflow
- [PACKAGES_SYSTEM.md](PACKAGES_SYSTEM.md) - Package system details
- [packages-api-documentation.md](packages-api-documentation.md) - API reference

---

**Last Updated**: December 15, 2025  
**Flow Version**: 1.0  
**Key Feature**: Dynamic room selection with real-time pricing