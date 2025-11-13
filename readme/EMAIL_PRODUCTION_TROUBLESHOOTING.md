# 📧 EMAIL SERVICE PRODUCTION DEPLOYMENT GUIDE

## 🚨 **Common Production Email Issues & Fixes**

### **Issue 1: PHPMailer Path Problems**
**Problem**: `require 'PHPMailer/src/PHPMailer.php'` fails in production
**Solution**: ✅ Fixed with dynamic path resolution

### **Issue 2: File Structure Differences** 
**Local Structure:**
```
email-service.php
PHPMailer/
├── src/
│   ├── PHPMailer.php
│   ├── SMTP.php
│   └── Exception.php
email-templates/
├── booking-confirmation.html
└── admin-notification.html
```

**Production Requirements:**
- Upload `email-service.php` to your booking domain root
- Upload `PHPMailer/` folder to same directory as email-service.php
- Upload `email-templates/` folder (optional, for professional templates)

### **Issue 3: Missing Dependencies**
**Check these files exist on production:**
```bash
# Required files on https://booking.rumahdaisycantik.com/
├── email-service.php ✅ REQUIRED
├── PHPMailer/ ✅ REQUIRED
│   └── src/
│       ├── PHPMailer.php
│       ├── SMTP.php
│       └── Exception.php
└── email-templates/ ❓ OPTIONAL
    ├── booking-confirmation.html
    ├── booking-confirmation.txt
    ├── admin-notification.html
    └── admin-notification.txt
```

## 🔧 **Production Deployment Steps**

### **Step 1: Upload Email Service Files**
Upload these to `https://booking.rumahdaisycantik.com/`:
- `email-service.php` (main file)
- `PHPMailer/` (entire folder)
- `email-templates/` (optional)

### **Step 2: Test Email Service**
```bash
# Test from browser or curl
curl -X POST https://booking.rumahdaisycantik.com/email-service.php \
  -H "Content-Type: application/json" \
  -d '{"action": "test_booking"}'
```

### **Step 3: Verify SMTP Configuration**
Current SMTP settings in email-service.php:
```php
$smtp_username = 'danielsantosomarketing2017@gmail.com'
$smtp_password = 'araemhfoirpelkiz' // App password, not Gmail password
Host: smtp.gmail.com
Port: 587
Security: STARTTLS
```

### **Step 4: Check Server Requirements**
Production server must have:
- ✅ PHP 7.4+ 
- ✅ OpenSSL extension
- ✅ Socket extension
- ✅ cURL extension (for SMTP)

## 🧪 **Testing Commands**

### **Test 1: Basic Connectivity**
```bash
curl https://booking.rumahdaisycantik.com/email-service.php
# Should return: Method not allowed (need POST)
```

### **Test 2: Email Functionality**
```bash
curl -X POST https://booking.rumahdaisycantik.com/email-service.php \
  -H "Content-Type: application/json" \
  -d '{"action": "test_booking"}'

# Expected response:
{
  "guest_email": {"success": true, "message": "Email sent successfully"},
  "admin_email": {"success": true, "message": "Email sent successfully"},
  "test_data": { ... }
}
```

### **Test 3: From Frontend**
```javascript
// Test from your booking app
fetch('https://booking.rumahdaisycantik.com/email-service.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'test_booking' })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🚨 **Common Error Messages & Solutions**

### **Error: "Class 'PHPMailer\PHPMailer\PHPMailer' not found"**
**Cause**: PHPMailer files not uploaded or wrong path
**Solution**: 
1. Upload PHPMailer folder to production
2. Verify file structure matches local setup

### **Error: "SMTP connect() failed"**
**Cause**: Server firewall blocking SMTP or wrong credentials
**Solution**:
1. Contact hosting provider about SMTP port 587
2. Verify Gmail app password is correct
3. Check if server allows external SMTP

### **Error: "file_get_contents failed to open stream"**
**Cause**: Email templates folder missing or wrong permissions
**Solution**:
1. Upload email-templates folder
2. Set folder permissions to 755
3. Use fallback templates (already implemented)

## 📂 **File Permissions**
Set these permissions on production:
```bash
email-service.php → 644
PHPMailer/ → 755
PHPMailer/src/*.php → 644
email-templates/ → 755
email-templates/*.html → 644
```

## 🎯 **Verification Checklist**

- [ ] email-service.php uploaded to booking domain
- [ ] PHPMailer folder uploaded with all files
- [ ] SMTP credentials correct (Gmail app password)
- [ ] Server allows outbound SMTP on port 587
- [ ] Test email returns success response
- [ ] Actual emails received in inbox
- [ ] Both guest and admin emails working

## 📞 **If Emails Still Don't Work**

### **Alternative 1: Use Hosting SMTP**
```php
// Replace Gmail SMTP with hosting provider SMTP
$mail->Host = 'mail.yourdomain.com';  // Your hosting SMTP
$mail->Username = 'noreply@rumahdaisycantik.com';
$mail->Password = 'your_email_password';
$mail->Port = 587; // or 465 for SSL
```

### **Alternative 2: Use PHP mail() Function**
```php
// Fallback to PHP mail() if SMTP fails
$headers = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
$headers .= 'From: Villa Daisy Cantik <noreply@rumahdaisycantik.com>' . "\r\n";

mail($to_email, $subject, $html_body, $headers);
```

---

**💡 Most common issue: PHPMailer folder not uploaded to production server!**

Make sure the folder structure on production exactly matches your local setup.