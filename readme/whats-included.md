# What's Included in Your Villa Stay

This document details what guests can expect to be included in their villa booking package.

## Standard Inclusions

### Accommodation Features
- ✅ Private villa accommodation
- ✅ Fully furnished living spaces
- ✅ Air conditioning in all rooms
- ✅ Private bathroom with hot water
- ✅ Complimentary WiFi access
- ✅ Daily housekeeping service
- ✅ Fresh linens and towels
- ✅ Basic toiletries

### Kitchen & Dining
- ✅ Fully equipped kitchen
- ✅ Refrigerator and freezer
- ✅ Cooking utensils and cookware
- ✅ Dining table and chairs
- ✅ Coffee and tea making facilities
- ✅ Complimentary welcome drinks

### Pool & Outdoor Areas
- ✅ Access to swimming pool (private or shared)
- ✅ Pool towels provided
- ✅ Outdoor furniture
- ✅ Garden or pool view
- ✅ BBQ facilities (where available)

### Services Included
- ✅ 24/7 security
- ✅ Parking space
- ✅ Concierge assistance
- ✅ Local area information
- ✅ Emergency contact support

## Package-Specific Inclusions

### Romance Package
- 🌹 Welcome flowers and champagne
- 🕯️ Romantic dinner setup
- 🛁 Rose petal bath arrangement
- 💑 Couples spa treatment voucher
- 📸 Professional photo session

### Family Package
- 👶 Baby cot (upon request)
- 🎮 Kids entertainment area
- 🏊 Children's pool access
- 🚗 Family-size vehicle rental discount
- 🎯 Family activity recommendations

### Luxury Package
- 🥂 Premium welcome amenities
- 🧖‍♀️ Personal butler service
- 🚗 Airport transfer included
- 🍽️ Private chef service
- 🧘‍♀️ In-villa spa treatments

### Extended Stay Package
- 🧺 Weekly laundry service
- 🛒 Grocery shopping assistance
- 📱 Local SIM card provided
- 🚲 Bicycle rental included
- 📋 Monthly villa maintenance

## Additional Services (Extra Cost)

### Transportation
- 🚖 Airport transfer (premium vehicles)
- 🚗 Car rental arrangements
- 🏍️ Motorbike rental
- 🚌 Tour bus booking

### Dining & Catering
- 👨‍🍳 Private chef services
- 🍽️ In-villa dining setup
- 🥘 Local cuisine cooking classes
- 🛒 Grocery delivery service

### Wellness & Recreation
- 💆‍♀️ Spa and massage treatments
- 🧘‍♀️ Yoga instructor sessions
- 🏊‍♀️ Swimming lessons
- 🎣 Fishing trip arrangements

### Special Occasions
- 🎂 Birthday celebration setup
- 💒 Wedding ceremony arrangements
- 🎉 Anniversary packages
- 👶 Baby shower setup

## Seasonal Inclusions

### High Season (Dec - Feb, Jul - Aug)
- 🎄 Holiday decorations (December)
- 🎆 New Year celebration package
- 🌞 Peak season activity access
- 🏖️ Premium beach club access

### Low Season (Mar - Jun, Sep - Nov)
- 💰 Extended stay discounts
- 🌧️ Rainy day activity packages
- 🕰️ Flexible check-in/out times
- 📚 Cultural experience programs

## Booking Terms

### Inclusions Policy
- All standard inclusions are provided at no extra cost
- Package-specific inclusions vary by booking type
- Some amenities subject to availability
- Advanced booking required for certain services

### Guest Responsibilities
- Respect for property and facilities
- Adherence to villa rules and regulations
- Proper use of included amenities
- Prompt reporting of any issues

### Cancellation Impact
- Standard inclusions: No refund for unused items
- Special packages: Subject to individual terms
- Service bookings: May have separate cancellation policies
- Seasonal offers: Terms apply as per booking

## Technical Implementation

### Database Schema
```sql
-- Package inclusions table
CREATE TABLE package_inclusions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  inclusion_type ENUM('standard', 'package_specific', 'seasonal', 'additional') NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  icon VARCHAR(100),
  is_included BOOLEAN DEFAULT 1,
  extra_cost DECIMAL(10,2) DEFAULT 0.00,
  seasonal_availability JSON,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Booking inclusions tracking
CREATE TABLE booking_inclusions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  inclusion_id INT NOT NULL,
  quantity INT DEFAULT 1,
  total_cost DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('included', 'added', 'removed', 'pending') DEFAULT 'included',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (inclusion_id) REFERENCES package_inclusions(id) ON DELETE CASCADE
);
```

### API Endpoints

#### GET /package-inclusions.php?package_id=X
Returns all inclusions for a package:
```json
{
  "success": true,
  "data": {
    "standard": [...],
    "package_specific": [...],
    "seasonal": [...],
    "additional": [...]
  }
}
```

#### POST /booking-inclusions.php
Add/modify booking inclusions:
```json
{
  "booking_id": 123,
  "inclusion_id": 45,
  "quantity": 2,
  "notes": "Special dietary requirements"
}
```

### Business Logic
- Automatic inclusion assignment based on package type
- Seasonal availability checks
- Cost calculation for additional services
- Booking modification tracking
- Guest communication automation

### Admin Interface
- Package inclusion management in admin panel
- Real-time availability updates
- Cost management and pricing rules
- Seasonal configuration tools
- Booking inclusion tracking dashboard

## Contact Information

For questions about inclusions or to request additional services:
- 📧 Email: reservations@rumahdaisycantik.com
- 📞 Phone: +62 xxx xxx xxxx
- 💬 WhatsApp: +62 xxx xxx xxxx
- 🌐 Website: www.rumahdaisycantik.com

---

*This document is updated regularly. Please check with reception for the most current information about your specific booking inclusions.*