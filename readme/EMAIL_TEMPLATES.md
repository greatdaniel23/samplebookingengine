# 📧 EMAIL TEMPLATE SYSTEM DOCUMENTATION
**Villa Booking Engine - Email Template Management**

**Created**: November 13, 2025  
**Status**: ✅ **PRODUCTION READY**  
**Location**: `/email-templates/` directory

---

## 🎯 **EMAIL TEMPLATE OVERVIEW**

The Villa Booking Engine now includes a comprehensive email template system with:
- 📁 **Organized Templates**: Separate HTML and text templates for easy editing
- 🎨 **Professional Design**: Modern, responsive email layouts
- 🔧 **Template Engine**: Dynamic variable substitution with conditional blocks
- 📱 **Mobile Responsive**: Templates work perfectly on all devices
- ✨ **Easy Customization**: Modify templates without touching PHP code

---

## 📁 **TEMPLATE FILE STRUCTURE**

```
email-templates/
├── booking-confirmation.html    ✅ Guest confirmation (HTML)
├── booking-confirmation.txt     ✅ Guest confirmation (Text)  
├── admin-notification.html      ✅ Admin alert (HTML)
├── admin-notification.txt       ✅ Admin alert (Text)
└── [custom-templates...]        🔮 Future templates

email-template-manager.php       ✅ Template processing engine
email-service.php               ✅ Main email service (uses templates)
```

---

## 🎨 **TEMPLATE FILES OVERVIEW**

### **1. Guest Booking Confirmation Templates**

#### **`booking-confirmation.html`** - Professional HTML Email
- **Design**: Modern gradient header with Villa Daisy Cantik branding
- **Responsive**: Mobile-optimized layout with flexible grid system
- **Features**: 
  - Professional Villa branding with green gradient header
  - Complete booking details in organized cards
  - Total amount highlighting with visual emphasis
  - Contact information and what-to-expect sections
  - Conditional special requests section
  - Footer with company information

#### **`booking-confirmation.txt`** - Plain Text Alternative
- **Format**: Clean, structured plain text format
- **Compatible**: Works with any email client
- **Features**:
  - All booking information clearly organized
  - Easy-to-read section headers with separators
  - Includes all essential booking details
  - Contact information and policies

### **2. Admin Notification Templates**

#### **`admin-notification.html`** - Admin Dashboard Style
- **Design**: Orange/red alert colors for admin attention
- **Features**:
  - Urgent alert styling to grab admin attention
  - Complete guest and booking information
  - Revenue highlighting for business insights
  - Action buttons for admin dashboard integration
  - System information and next steps
  - Statistics cards with booking metrics

#### **`admin-notification.txt`** - Admin Text Alert
- **Format**: Alert-style text format for admin systems
- **Features**:
  - Clear action items and urgent formatting
  - Complete booking and guest details
  - Revenue and business metrics
  - System information and status tracking

---

## 🔧 **TEMPLATE ENGINE FEATURES**

### **Variable Substitution**
Templates use `{{variable_name}}` syntax for dynamic content:

```html
<h1>Welcome {{guest_name}}!</h1>
<p>Your booking reference is {{booking_reference}}</p>
<p>Total amount: ${{total_amount}}</p>
```

### **Conditional Blocks**
Show/hide content based on data availability:

```html
{{#if special_requests}}
<div class="special-requests">
    <h4>Special Requests</h4>
    <p>{{special_requests}}</p>
</div>
{{/if}}
```

### **Automatic Calculations**
The template engine automatically calculates:
- `{{nights_count}}` - Number of nights from check-in/out dates
- `{{avg_per_night}}` - Average cost per night
- `{{days_until_checkin}}` - Days from now until check-in
- `{{booking_timestamp}}` - Current date/time

---

## 📊 **AVAILABLE TEMPLATE VARIABLES**

### **Guest Information**
- `{{guest_name}}` - Full guest name
- `{{guest_email}}` - Guest email address
- `{{guest_phone}}` - Guest phone (defaults to "Not provided")

### **Booking Details**
- `{{booking_reference}}` - Unique booking reference (e.g., BK-123456)
- `{{check_in}}` - Check-in date
- `{{check_out}}` - Check-out date
- `{{guests}}` - Total number of guests
- `{{adults}}` - Number of adults
- `{{children}}` - Number of children
- `{{nights_count}}` - Calculated nights stay
- `{{days_until_checkin}}` - Days until arrival

### **Room & Pricing**
- `{{room_id}}` - Room ID (e.g., deluxe-suite)
- `{{room_name}}` - Display name (e.g., Deluxe Suite)
- `{{total_amount}}` - Total booking price
- `{{avg_per_night}}` - Calculated average per night

### **Optional Fields**
- `{{special_requests}}` - Guest special requests (conditional)
- `{{package_id}}` - Package ID if applicable
- `{{villa_name}}` - Villa name (default: Villa Daisy Cantik)
- `{{booking_timestamp}}` - Booking creation time

---

## 🛠️ **HOW TO CUSTOMIZE TEMPLATES**

### **1. Edit Existing Templates**
Simply open the template files and modify:

```html
<!-- In booking-confirmation.html -->
<div class="header" style="background: linear-gradient(135deg, #2E8B57, #3CB371);">
    <h1>🏨 {{villa_name}}</h1>
    <h2>Booking Confirmation</h2>
</div>
```

### **2. Add New Template Variables**
Modify the `EmailTemplateManager` class in `email-template-manager.php`:

```php
// Add new calculated field
$data['custom_field'] = 'Custom Value';
```

### **3. Create New Templates**
1. Create new `.html` and `.txt` files in `/email-templates/`
2. Use existing variable syntax: `{{variable_name}}`
3. Add conditional blocks: `{{#if variable}}content{{/if}}`
4. Update the email service to use new templates

### **4. Modify Styling**
Edit the CSS in the `<style>` section of HTML templates:

```css
/* Change header color scheme */
.header {
    background: linear-gradient(135deg, #YOUR-COLOR-1, #YOUR-COLOR-2);
}

/* Modify button styles */
.btn {
    background: #YOUR-BUTTON-COLOR;
    color: white;
    /* ... more styles */
}
```

---

## 📱 **RESPONSIVE DESIGN FEATURES**

### **Mobile Optimization**
- **Flexible Layout**: Tables and divs adapt to screen size
- **Readable Text**: Font sizes optimize for mobile viewing
- **Touch-Friendly**: Buttons sized for touch interaction
- **Media Queries**: CSS breakpoints for different screen sizes

### **Email Client Compatibility**
- **HTML Templates**: Work in Gmail, Outlook, Apple Mail, etc.
- **Text Alternatives**: Fallback for clients that don't support HTML
- **Inline CSS**: Maximum compatibility across email clients
- **Table-Based Layout**: Ensures consistent rendering

---

## 🚀 **USING THE TEMPLATE SYSTEM**

### **In PHP Code (email-service.php)**
```php
// Load template manager
require_once 'email-template-manager.php';
$templateManager = new EmailTemplateManager();

// Prepare booking data
$bookingData = [
    'guest_name' => 'John Smith',
    'guest_email' => 'john@example.com',
    'booking_reference' => 'BK-123456',
    'check_in' => '2025-12-20',
    'check_out' => '2025-12-23',
    'total_amount' => '750.00'
    // ... more data
];

// Generate HTML email
$htmlContent = $templateManager->loadTemplate('booking-confirmation', $bookingData);

// Generate text email
$textContent = $templateManager->loadTextTemplate('booking-confirmation', $bookingData);
```

### **Template Integration Status**
- ✅ **Template Manager**: `EmailTemplateManager` class created
- ✅ **Guest Templates**: HTML and text booking confirmations
- ✅ **Admin Templates**: HTML and text admin notifications
- ✅ **Variable System**: Dynamic substitution with conditionals
- ✅ **Responsive Design**: Mobile-optimized layouts
- 🔮 **Future Enhancement**: Template selection UI for admin

---

## 🎨 **TEMPLATE CUSTOMIZATION EXAMPLES**

### **Change Villa Branding**
Update the header section in templates:
```html
<div class="header">
    <h1>🏖️ Your Villa Name Here</h1>
    <h2>Booking Confirmation</h2>
</div>
```

### **Modify Color Scheme**
Change the CSS color variables:
```css
.header {
    background: linear-gradient(135deg, #YOUR-PRIMARY, #YOUR-SECONDARY);
}
.detail-label {
    color: #YOUR-ACCENT-COLOR;
}
```

### **Add Custom Sections**
Insert new content blocks:
```html
<div class="custom-section">
    <h3>🎉 Special Offer</h3>
    <p>Enjoy 10% off your next booking when you refer a friend!</p>
</div>
```

### **Customize Contact Information**
Update the contact details section:
```html
<div class="contact-info">
    <h4>📞 Contact Information</h4>
    <p><strong>Your Villa Name</strong></p>
    <p>📧 Email: your-email@domain.com</p>
    <p>📞 Phone: your-phone-number</p>
    <p>🌐 Website: your-website.com</p>
    <p>📍 Address: Your Address Here</p>
</div>
```

---

## 🔍 **TESTING TEMPLATES**

### **1. Template Validation**
Test templates with sample data:
```php
$templateManager = new EmailTemplateManager();
$sampleData = [
    'guest_name' => 'Test Guest',
    'booking_reference' => 'BK-TEST-001',
    // ... sample data
];

$html = $templateManager->loadTemplate('booking-confirmation', $sampleData);
echo $html; // Preview in browser
```

### **2. Email Preview**
Use the existing test file:
- **Test Page**: `/test-booking-email.html`
- **Direct Service Test**: `/email-service.php` with test data

### **3. Mobile Testing**
- **Browser Dev Tools**: Test responsive breakpoints
- **Email Testing Tools**: Use Litmus or Email on Acid
- **Real Devices**: Test on actual mobile devices

---

## 📚 **TEMPLATE BEST PRACTICES**

### **1. Design Guidelines**
- ✅ **Keep It Simple**: Clean, professional layouts
- ✅ **Brand Consistency**: Use consistent colors and fonts
- ✅ **Mobile First**: Design for mobile, enhance for desktop
- ✅ **Accessibility**: Ensure good contrast and readable fonts

### **2. Content Guidelines**
- ✅ **Clear Information**: Make booking details easy to find
- ✅ **Call-to-Action**: Include relevant action buttons
- ✅ **Contact Info**: Always provide contact information
- ✅ **Professional Tone**: Maintain professional communication

### **3. Technical Guidelines**
- ✅ **Inline CSS**: Use inline styles for maximum compatibility
- ✅ **Table Layouts**: Use tables for complex layouts
- ✅ **Alt Text**: Include alt text for images
- ✅ **Text Alternatives**: Always provide text versions

---

## 🎯 **TEMPLATE SYSTEM BENEFITS**

### **For Developers**
- ✅ **Separation of Concerns**: Templates separate from PHP logic
- ✅ **Easy Maintenance**: Update designs without touching code
- ✅ **Version Control**: Track template changes separately
- ✅ **Testing**: Easy to test templates in isolation

### **For Villa Owners**
- ✅ **Professional Branding**: Consistent, branded communications
- ✅ **Easy Customization**: Modify templates without programming
- ✅ **Multi-Format**: HTML and text versions for all clients
- ✅ **Mobile Ready**: Perfect display on all devices

### **For Guests**
- ✅ **Clear Information**: Easy-to-read booking confirmations
- ✅ **Professional Experience**: Polished communication
- ✅ **Accessible**: Works on any email client or device
- ✅ **Complete Details**: All booking information in one place

---

**🎯 The Villa Booking Engine email template system provides professional, customizable, and maintainable email communications that enhance the booking experience for both guests and administrators.**

---

*Last Updated: November 13, 2025*  
*Status: ✅ **PRODUCTION READY** - Professional Template System*  
*Location: `/email-templates/` directory with `EmailTemplateManager` class*  
*Integration: Fully integrated with booking system for automatic email generation*