# Customer Booking Flow - Complete Activity Documentation

**Villa Booking System - Rumah Daisy Cantik**  
**Documentation Version:** 1.0  
**Date:** November 25, 2025  

---

## 📋 Overview

This document outlines the complete customer journey from initial visit to booking confirmation for the Rumah Daisy Cantik villa booking system.

---

## 🎯 Customer Activity Flow

### **Phase 1: Initial Discovery & Landing**

#### 1.1 Customer Arrives at Website
- **Entry Point:** `https://booking.rumahdaisycantik.com`
- **Landing Page:** `index.html`
- **First Impression:** Hero section with villa images and booking widget

#### 1.2 Website Exploration
- **Villa Gallery:** Browse through villa images and amenities
- **Location Info:** View villa location and nearby attractions  
- **Room Types:** Explore available room configurations
- **Pricing:** Check rates and availability

---

### **Phase 2: Availability Check & Selection**

#### 2.1 Date Selection
```
Customer Action: Select check-in and check-out dates
├── Frontend: Date picker validation
├── API Call: GET /api/rooms.php?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
└── Response: Available rooms with pricing
```

#### 2.2 Room Selection
- **Available Options Display:** Real-time room availability
- **Room Details:** Capacity, amenities, pricing breakdown
- **Special Offers:** Seasonal rates, discounts (if any)

#### 2.3 Guest Count Selection
- **Input:** Number of adults and children
- **Validation:** Room capacity limits
- **Price Update:** Dynamic pricing based on occupancy

---

### **Phase 3: Booking Form Completion**

#### 3.1 Customer Information Entry
**Required Fields:**
- Full Name
- Email Address
- Phone Number (with country code)
- Nationality/Country

**Optional Fields:**
- Special Requests
- Dietary Requirements
- Arrival Time Preferences

#### 3.2 Form Validation
```javascript
Frontend Validation:
├── Email format validation
├── Phone number format check
├── Required field completion
├── Date logic validation (check-out > check-in)
└── Guest count vs room capacity
```

---

### **Phase 4: Booking Submission & Processing**

#### 4.1 Booking Submission
```
Customer Action: Click "Submit Booking"
├── Frontend: Final form validation
├── Loading State: Show processing indicator
├── API Call: POST /api/bookings.php
└── Data Sent: Complete booking information
```

#### 4.2 Server-Side Processing
```
Backend Processing Flow:
├── 1. Receive booking data
├── 2. Validate all input fields
├── 3. Check room availability (double-check)
├── 4. Generate unique booking reference
├── 5. Calculate total pricing
├── 6. Save to database with PENDING status
├── 7. Prepare email notifications
└── 8. Send response to frontend
```

#### 4.3 Database Storage
**Tables Updated:**
- `bookings` - Main booking record
- `booking_details` - Room and pricing details
- `external_blocks` - Mark dates as booked

---

### **Phase 5: Email Notifications**

#### 5.1 Customer Confirmation Email
```
Email Service Flow:
├── Template: booking-confirmation.html/txt
├── Variables: Booking details, villa info, contact details
├── SMTP: Gmail SMTP service
├── Recipient: Customer email
└── Content: Booking summary, check-in instructions, contact info
```

**Email Contains:**
- Booking reference number
- Guest details and dates
- Room information and pricing
- Villa contact information (phone: 0822-2119-3425)
- Pending status notification and next steps
- 24-hour confirmation timeline
- Villa website and location details

#### 5.2 Admin Notification Email
```
Admin Notification Flow:
├── Template: admin-notification.html/txt
├── Variables: Customer details, booking summary
├── SMTP: Same Gmail service
├── Recipient: rumahdaisycantikreservations@gmail.com
└── Content: New booking alert with all customer details
```

**Admin Email Contains:**
- New booking request alert (PENDING status)
- Complete customer information including phone number
- Booking details and special requests
- Action required: Confirm within 24 hours
- Customer contact details for follow-up

---

### **Phase 6: Booking Confirmation & Follow-up**

#### 6.1 Frontend Success Response
```
Success Flow:
├── API Response: 200 OK with booking details
├── Frontend: Show success message
├── Display: Booking reference and next steps
├── Action: Redirect to confirmation page (optional)
└── User Experience: Clear success indication
```

#### 6.2 Customer Receives Notification
- **Email Delivery:** Immediate booking request confirmation email
- **Booking Reference:** Unique identifier for future reference
- **Status:** Pending confirmation within 24 hours
- **Next Steps:** Await confirmation and payment instructions

#### 6.3 Villa Team Processing
- **Admin Alert:** Immediate notification of new booking request
- **Review Required:** Team reviews booking within 24 hours
- **Confirmation Process:** Approve or decline booking request
- **Calendar Update:** Confirmed bookings appear in admin calendar
- **Customer Follow-up:** Send confirmation and payment instructions

---

## 🔧 Technical Implementation Details

### **Frontend Components**
- **Framework:** Vanilla JavaScript with modern ES6+
- **Styling:** Tailwind CSS for responsive design
- **Validation:** Real-time form validation
- **API Communication:** Fetch API for backend calls

### **Backend Services**
- **Language:** PHP 7.4+
- **Database:** MySQL with PDO
- **Email Service:** PHPMailer 6.8.0 with Gmail SMTP
- **Security:** Input validation, SQL injection prevention

### **Key API Endpoints**
```
GET  /api/rooms.php          - Room availability check
POST /api/bookings.php       - Create new booking  
GET  /api/villa.php          - Villa information
POST /api/email-service.php  - Email notifications
```

---

## 📊 Data Flow Architecture

```
Customer Browser
        ↓
Frontend Form (index.html)
        ↓
API Layer (bookings.php)
        ↓
Database (MySQL)
        ↓
Email Service (PHPMailer)
        ↓
Confirmation Emails
```

---

## ✅ Success Criteria

### **Customer Experience**
- ✅ Intuitive booking process (< 5 minutes)
- ✅ Real-time availability checking
- ✅ Immediate booking confirmation
- ✅ Clear communication and next steps

### **System Performance**
- ✅ Form validation prevents errors
- ✅ Database integrity maintained
- ✅ Email delivery reliability
- ✅ Admin notification system working
- ✅ Default booking status: PENDING (requires manual confirmation)

### **Business Value**
- ✅ Complete customer data capture
- ✅ Automated booking management
- ✅ Professional communication
- ✅ Streamlined villa operations

---

## 🚨 Error Handling & Fallbacks

### **Frontend Error Handling**
- Form validation messages
- Network error notifications
- Loading states and user feedback
- Graceful degradation for older browsers

### **Backend Error Handling**
- Input sanitization and validation
- Database connection error handling
- Email service fallback mechanisms
- Comprehensive error logging

### **Fallback Systems**
- Villa information fallback data
- Email template backup systems
- Manual booking process (if system fails)
- Direct contact information always available

---

## 📞 Customer Support Integration

### **Contact Information**
- **Email:** rumahdaisycantikreservations@gmail.com
- **Phone:** 0822-2119-3425 (WhatsApp available)
- **Website:** https://rumahdaisycantik.com/
- **Booking Platform:** https://booking.rumahdaisycantik.com

### **Support Channels**
- Email confirmation includes all contact details
- Phone number displayed prominently in all communications
- WhatsApp available for instant messaging
- Direct email support for booking inquiries

---

## 🔄 Continuous Improvements

### **Monitoring & Analytics**
- Booking conversion rates
- Form abandonment tracking
- Email delivery success rates
- Customer feedback collection

### **Future Enhancements**
- Online payment integration
- Real-time calendar synchronization
- Multi-language support
- Mobile app development
- SMS notifications

---

**End of Document**

*This documentation serves as the complete reference for understanding the customer booking journey from initial website visit to confirmed reservation at Rumah Daisy Cantik villa.*