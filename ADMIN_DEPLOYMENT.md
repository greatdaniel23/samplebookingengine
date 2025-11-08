# Hotel Admin Panel Deployment Guide

## 🚀 Admin Panel Deployment Options

You now have a standalone admin system that can be deployed separately from your main booking site for better security.

### Option 1: Subdomain Deployment (Recommended)
Deploy admin to: `admin.yourdomain.com`

**Setup:**
1. Create subdomain `admin` in your hosting control panel
2. Point subdomain to `/admin` folder
3. Upload admin files to subdomain directory:
   ```
   admin.yourdomain.com/
   ├── admin-login.html
   ├── admin-dashboard.html
   └── api/
       └── admin/
           └── auth.php
   ```

### Option 2: Separate Domain
Deploy to completely separate domain: `yourdomain-admin.com`

### Option 3: Protected Path
Deploy to: `yourdomain.com/admin` with .htaccess protection

**Files Created:**
- `admin-login.html` - Secure login page
- `admin-dashboard.html` - Admin dashboard overview  
- `api/admin/auth.php` - Authentication API
- `src/pages/AdminManagement.tsx` - Full React admin interface

## 🔐 Security Features Added

### Authentication System
- **Session-based login** with PHP backend
- **Password hashing** using PHP's password_verify()
- **Auto logout** on session expiry
- **Role-based access** (admin/manager/staff)

### Default Admin Credentials
- **Username:** admin
- **Password:** admin123
- **Role:** admin

⚠️ **IMPORTANT:** Change default credentials in production!

## 🛠 Admin Access Methods

### Method 1: Direct Admin URLs
- Login: `admin.yourdomain.com/admin-login.html`
- Dashboard: `admin.yourdomain.com/admin-dashboard.html`

### Method 2: React Admin Interface
- Full management: Access via `/admin/management` route in React app
- Advanced CRUD operations
- Real-time data management

## 📁 Folder Structure for Admin Deployment

```
/public_html/admin/           # Subdomain folder
├── admin-login.html          # Login page
├── admin-dashboard.html      # Dashboard overview
├── .htaccess                 # Security rules (create this)
└── api/
    ├── admin/
    │   └── auth.php          # Authentication API
    ├── index.php             # Main API router
    ├── controllers/          # CRUD controllers
    ├── models/              # Database models
    └── config/
        └── database.php     # DB config
```

## 🔒 .htaccess Security (Create this file)

```apache
# Protect admin directory
<RequireAll>
    Require all denied
    Require ip YOUR_IP_ADDRESS
</RequireAll>

# Or use basic auth
AuthType Basic
AuthName "Admin Area"
AuthUserFile /path/to/.htpasswd
Require valid-user

# Prevent direct access to PHP files
<Files "*.php">
    Order Deny,Allow
    Deny from all
    Allow from YOUR_IP_ADDRESS
</Files>
```

## 🌐 DNS Configuration

For subdomain setup, add DNS record:
```
Type: A Record
Name: admin
Value: YOUR_SERVER_IP
TTL: 3600
```

## 🚦 Production Checklist

- [ ] Change default admin password
- [ ] Set up subdomain/separate domain
- [ ] Configure .htaccess protection
- [ ] Enable HTTPS for admin area
- [ ] Set up IP whitelisting
- [ ] Configure session security
- [ ] Set up backup authentication
- [ ] Test all admin functions
- [ ] Monitor admin access logs

## 📊 Admin Features Available

### Standalone Dashboard
- Overview with statistics
- Quick action buttons
- User session management
- Clean, professional interface

### Full React Admin (via /admin/management)
- **Room Management:** Add/edit/delete rooms
- **Package Management:** Manage packages and pricing
- **Booking Management:** View/edit/cancel bookings
- **User Management:** Admin user controls
- **Real-time Updates:** Live data synchronization

## 🔧 API Endpoints for Admin

```
POST /api/admin/auth - Login/logout
GET  /api/admin/auth - Check auth status
GET  /api/rooms - List rooms
POST /api/rooms - Create room
PUT  /api/rooms/{id} - Update room
DELETE /api/rooms/{id} - Delete room
[Similar for packages and bookings]
```

## 🎯 Next Steps

1. **Deploy admin files** to subdomain or separate domain
2. **Configure authentication** and change default password
3. **Set up security measures** (.htaccess, IP restrictions)
4. **Test admin functionality** in production environment
5. **Train admin users** on the interface

Your admin system is now completely separate from the main booking site and ready for secure deployment!