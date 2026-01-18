# 🏨 Villa Booking Engine

A modern, full-stack villa booking and management system featuring a React/TypeScript frontend, a PHP REST API backend, and a comprehensive admin dashboard with **Enhanced Database System v2.0**.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

> 🚀 **System Status**: ✅ **95% Production Ready** with recent package filtering improvements (Nov 12, 2025)

## 📚 **COMPLETE DOCUMENTATION**

### **🎯 Quick Start Documentation**
- 📖 **[Master Documentation Index](readme/MASTER_DOCUMENTATION_INDEX.md)** - Complete documentation overview
- 🏗️ **[System Architecture](readme/SYSTEM_ARCHITECTURE_LAYERS.md)** - 5-layer system breakdown  
- 🔧 **[Setup Guide](readme/SETUP_COMPLETE.md)** - Installation and configuration
- ⚡ **[Quick Reference](readme/DATABASE_QUICK_REF.md)** - Developer quick reference

### **🔥 Recent Updates (Dec 29, 2025)**
- ✅ **Page Structure Reorganization**: Separated admin/user pages into dedicated folders
- ✅ **Code Cleanup**: Removed 6 unused files (~153 KB of dead code)
- ✅ **Improved Maintainability**: Clear separation of admin, user, shared, and debug pages

### **Previous Updates (Nov 19, 2025)**
- ✅ **Documentation Cleanup**: Removed 9 duplicate files, optimized from 182 to 173 unique docs
- ✅ **Amenities System**: Simplified API endpoint, comprehensive admin interface ready
- ✅ **Package Filtering Fixed**: Admin changes now sync instantly with customer interface
- ✅ **Complete Constants Audit**: 200+ constants documented across 30+ categories
- ✅ **Hook Architecture Cleanup**: Resolved TypeScript import conflicts

- ✅ **Optimized Documentation**: 173 unique documentation files (duplicates removed Nov 19)

> 📋 **Full Documentation**: See **[readme/MASTER_DOCUMENTATION_INDEX.md](readme/MASTER_DOCUMENTATION_INDEX.md)** for complete system documentation with 170+ detailed guides covering architecture, database, APIs, constants, debugging, and more.
> 
> 🧹 **Documentation Quality**: Recent cleanup removed 9 duplicate files, reducing redundancy from 20% to under 2% for improved navigation and maintenance.

## ✨ Key Features

### 🏡 Public Website
- **Dynamic Villa Content**: View villa details, photo gallery, and amenities loaded from the database.
- **Room & Package Showcase**: Browse available rooms and special packages.
- **Interactive Room Filtering**: Filter rooms by type (Suite, Deluxe, etc.).
- **Multi-Step Booking Flow**: A seamless, 3-step booking process.
- **Offline Booking Support**: Bookings are saved locally if the network is down and synced later.
- **Email Notifications**: Automatic booking confirmation emails sent to the guest.

### 🔐 Admin Dashboard
- **Booking Management**: Full CRUD (Create, Read, Update, Delete) operations for all bookings.
- **Room & Package Management**: Manage room inventory, pricing, and promotional packages.
- **Villa Information Management**: Update site-wide details like contact info and amenities.
- **Secure Authentication**: Session-based login system for administrators.
- **Real-time Integration**: Changes made in the admin dashboard are instantly reflected on the public website.
### 🧩 Amenities System (Nov 19 2025 Update)
- **Normalized Amenity Catalog**: 26 amenities across 16 categories (rooms, packages, property-wide).
- **Simplified Base Endpoint**: `GET /api/amenities.php` now returns the amenities list without needing `?endpoint=amenities`.
- **Relationship Endpoints**:
   - `GET /api/amenities.php/room-amenities/{room_id}` → Amenities mapped to a room
   - `GET /api/amenities.php/package-amenities/{package_id}` → Perks mapped to a package
   - `GET /api/amenities.php/sales-tool/{package_id}?room_id={roomId}` → Combined sales presentation
- **Planned Mutations** (use query style until method branching added):
   - `POST /api/amenities.php?endpoint=amenities` (create)
   - `PUT /api/amenities.php?endpoint=amenities&id={id}` (update)
   - `DELETE /api/amenities.php?endpoint=amenities&id={id}` (delete)
- **Migration SQL**: Run `database/amenities-table.sql` to create amenity + mapping tables.
- **Frontend Integration**: Admin React component now fetches via `fetch(buildApiUrl('amenities.php'))`.
- **Legacy Compatibility**: `?endpoint=amenities` still accepted for backward compatibility.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: PHP (procedural REST API)
- **Database**: MySQL
- **Local Server Environment**: XAMPP (Apache & MySQL)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites

- **Node.js**: v18 or later.
- **pnpm**: `npm install -g pnpm`
- **XAMPP**: A web server solution to run the PHP backend and MySQL database.

### 2. Backend & Enhanced Database Setup

1.  **Place the Project**: Clone or move the entire project folder into your XAMPP `htdocs` directory.
    -   Example path: `C:/xampp/htdocs/frontend-booking-engine/`
2.  **Start XAMPP**: Open the XAMPP Control Panel and start the **Apache** and **MySQL** services.
3.  **Install Enhanced Database System** (Recommended - PowerShell method):
    ```powershell
    # Navigate to project directory
    cd "C:\xampp\htdocs\frontend-booking-engine-1"
    
    # Install enhanced database with 17 tables
    Get-Content "database\enhanced-install-complete.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root
    Get-Content "database\enhanced-install-part2.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root
    
    # Add realistic international booking data (30 bookings from 15+ countries)
    Get-Content "database\enhanced-dummy-data-complete.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root
    Get-Content "database\enhanced-dummy-data-part2.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root
    ```
    
    **Alternative (Basic Setup)**:
    -   Navigate to `http://localhost/phpmyadmin`.
    -   Create a new database named `booking_engine`.
    -   Import `database/install.sql` for basic 5-table setup.

    > 📊 **Enhanced System Includes**: 17 tables, calendar integration, platform sync, payment gateways, analytics, and 30 international bookings ready for testing!

### 3. Frontend Setup & Configuration

1.  **Install Dependencies**: Open your terminal in the project directory and run:
    ```bash
    pnpm install
    ```
2.  **Configure API URL**: Ensure the API URL in `src/config/paths.ts` correctly points to your local PHP server. The default should work if you've placed the project in `htdocs`.
    ```typescript
    // src/config/paths.ts
    export const API_BASE_URL = 'http://localhost/frontend-booking-engine/api';
    ```

### 4. Running the Application

1.  **Start the Frontend**: Run the following command to start the Vite development server:
    ```bash
    pnpm run dev
    ```
2.  **Access the Application**:
    -   **Public Website**: `http://localhost:5173` (or whichever port Vite assigns).
    -   **Admin Dashboard**: `http://localhost/frontend-booking-engine/admin-dashboard.html`
    -   **API Endpoints**: `http://localhost/frontend-booking-engine/api/`

    > **Default Admin Login**: `admin` / `admin123`

## 📦 Available Scripts

-   `pnpm dev`: Starts the frontend development server.
-   `pnpm build`: Builds the frontend for production.
-   `pnpm lint`: Runs the ESLint linter to check for code quality issues.

## 🌐 Production Deployment

### Prerequisites for Production

- **Web Server**: Apache or Nginx with PHP support (7.4+)
- **Database**: MySQL 5.7+ or MariaDB 10.3+
- **SSL Certificate**: For HTTPS (recommended)
- **Domain**: Your production domain name

### 1. Server Setup

#### Option A: Shared Hosting (cPanel/WHM)

1. **Upload Files**:
   ```bash
   # Build the frontend first
   pnpm build
   
   # Upload the entire project to your hosting's public_html folder
   # Or to a subdirectory like public_html/booking/
   ```

2. **Database Setup**:
   - Create a MySQL database through cPanel
   - Import `database/schema.sql` via phpMyAdmin
   - Note the database credentials (host, name, username, password)

#### Option B: VPS/Dedicated Server (Ubuntu/CentOS)

1. **Install LAMP Stack**:
   ```bash
   # Ubuntu
   sudo apt update
   sudo apt install apache2 mysql-server php php-mysql php-curl php-json
   
   # Enable Apache modules
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

2. **Configure Virtual Host**:
   ```apache
   # /etc/apache2/sites-available/villa-booking.conf
   <VirtualHost *:80>
       ServerName yourdomain.com
       DocumentRoot /var/www/html/villa-booking
       
       <Directory /var/www/html/villa-booking>
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

3. **Enable Site**:
   ```bash
   sudo a2ensite villa-booking.conf
   sudo systemctl reload apache2
   ```

### 2. Frontend Production Build

1. **Unified Configuration System** - The project uses a dual configuration approach:

   **Modern React Components** (Auto-switching)
   ```typescript
   // src/config/paths.ts - Used by React components
   // ✅ Automatically detects production vs development
   // ✅ No manual changes needed
   
   import { API_BASE_URL } from '@/config/paths';
   // Development: http://localhost/fontend-bookingengine-100/.../api  
   // Production:  https://api.rumahdaisycantik.com
   ```

   **Admin Dashboard & HTML Files** (Manual switching)
   ```javascript
   // config.js - Used by admin dashboard
   // ⚙️ Manually change environment for admin panel
   
   CONFIG.API.ENVIRONMENT = 'production'; // Change this for admin
   // Then uses: https://api.rumahdaisycantik.com
   ```

   **Production URLs:**
   - **Frontend App**: `https://booking.rumahdaisycantik.com/`
   - **API Endpoint**: `https://api.rumahdaisycantik.com/`

2. **Build for Production**:
   ```bash
   pnpm build
   ```
   The build process automatically configures the app to use production API endpoints.

   **For Admin Dashboard Users:**
   ```javascript
   // Before using admin dashboard in production:
   // 1. Edit config.js file
   CONFIG.API.ENVIRONMENT = 'production'; // Change from 'local' to 'production'
   
   // 2. Or use the config manager interface:
   // Open: config-manager.html → Select "Production" environment
   ```

   **Optional: Override with Environment Variables**
   ```bash
   # Create .env.production file (optional)
   VITE_API_BASE=https://api.rumahdaisycantik.com
   VITE_PUBLIC_BASE=/
   ```

3. **Deploy Built Files**:
   - Upload the contents of the `dist/` folder to your web server
   - Upload the `api/` folder to the same directory
   - Upload the `database/` folder (for reference)

### 3. Backend Configuration

1. **Database Configuration** - Now Environment-Aware:
   ```php
   // api/config/database.php - Auto-detects environment
   // ✅ Development: Uses villa_booking database with root user
   // ✅ Production: Uses u289291769_booking with your credentials
   // ✅ No manual changes needed - detects rumahdaisycantik.com domain
   
   // Your production credentials are already configured:
   // Database: u289291769_booking
   // Username: u289291769_booking  
   // Password: Kanibal123!!!
   ```

2. **Secure the API** (Create `.htaccess` in api folder):
   ```apache
   # api/.htaccess
   RewriteEngine On
   
   # Enable CORS for your domain
   Header always set Access-Control-Allow-Origin "https://yourdomain.com"
   Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
   Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
   
   # Security headers
   Header always set X-Content-Type-Options nosniff
   Header always set X-Frame-Options DENY
   Header always set X-XSS-Protection "1; mode=block"
   ```

### 4. SSL Certificate Setup

#### Using Let's Encrypt (Free SSL):
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Get certificate
sudo certbot --apache -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Using Commercial SSL:
- Purchase SSL certificate from your provider
- Follow their installation instructions for Apache/Nginx

### 5. Performance Optimization

1. **Enable Gzip Compression** (Add to `.htaccess`):
   ```apache
   # .htaccess in document root
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

2. **Browser Caching**:
   ```apache
   <IfModule mod_expires.c>
       ExpiresActive On
       ExpiresByType text/css "access plus 1 month"
       ExpiresByType application/javascript "access plus 1 month"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
   </IfModule>
   ```

### 6. Security Considerations

1. **Change Default Admin Credentials**:
   - Update admin login credentials in the database
   - Use strong passwords

2. **Database Security**:
   ```sql
   -- Create dedicated database user with limited privileges
   CREATE USER 'villa_app'@'localhost' IDENTIFIED BY 'strong_password_here';
   GRANT SELECT, INSERT, UPDATE, DELETE ON villa_booking.* TO 'villa_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **File Permissions**:
   ```bash
   # Set appropriate permissions
   find /var/www/html/villa-booking -type f -exec chmod 644 {} \;
   find /var/www/html/villa-booking -type d -exec chmod 755 {} \;
   
   # Secure config files
   chmod 600 api/config/database.php
   ```

### 7. Production Checklist

- [ ] Frontend built and deployed (`pnpm build`)
- [ ] Database created and schema imported
- [ ] API configuration updated with production database credentials
- [ ] Domain DNS pointing to server
- [ ] SSL certificate installed and working
- [ ] Admin credentials changed from defaults
- [ ] Email service configured for booking notifications
- [ ] Cloudflare Secrets configured (RESEND_API_KEY, DOKU_CLIENT_ID, DOKU_SECRET_KEY, JWT_SECRET)
- [ ] Backup strategy implemented
- [ ] Monitoring/analytics setup (optional)

### 🔐 Cloudflare Security (Workers)

The Cloudflare Workers backend has been hardened with the following security measures:
1. **Secrets Management**: Sensitive keys are no longer stored in `wrangler.toml`. You must add them via the CLI:
   ```bash
   wrangler secret put RESEND_API_KEY
   wrangler secret put DOKU_CLIENT_ID
   wrangler secret put DOKU_SECRET_KEY
   wrangler secret put JWT_SECRET
   ```
2. **Restrictive CORS**: The API now only accepts requests from the production domain `https://bookingengine-8g1-boe-kxn.pages.dev`.
3. **Security Headers**: HSTS, CSP, X-Frame-Options, and X-Content-Type-Options are applied to all responses.
4. **Rate Limiting**: Basic rate limiting configuration is included for protection against abuse.


### 8. Maintenance & Updates

1. **Regular Backups**:
   ```bash
   # Database backup
   mysqldump -u username -p villa_booking > backup_$(date +%Y%m%d).sql
   
   # File backup
   tar -czf website_backup_$(date +%Y%m%d).tar.gz /var/www/html/villa-booking
   ```

2. **Updates**:
   ```bash
   # For code updates
   pnpm build
   # Upload new dist/ contents
   # Update API files if needed
   ```

### 9. Troubleshooting Production Issues

**Common Issues:**
- **CORS Errors**: Check `.htaccess` configuration and API domain settings
- **Database Connection**: Verify credentials in `api/config/database.php`
- **404 Errors**: Ensure Apache `mod_rewrite` is enabled
- **Permission Errors**: Check file/folder permissions (644/755)

**Monitoring:**
```bash
# Check Apache error logs
sudo tail -f /var/log/apache2/error.log

# Check PHP error logs
sudo tail -f /var/log/apache2/error.log
```

## 📁 Folder Structure

```
.
├── api/                    # Backend PHP REST API files
│   ├── bookings.php
│   ├── rooms.php
│   ├── packages.php
│   └── config/
├── database/               # Database schema and migration files
│   └── schema.sql
├── public/                 # Static assets (images, icons)
├── src/                    # Frontend React application source code
│   ├── components/         # Reusable React components
│   │   └── admin/          # Admin-specific components
│   ├── hooks/              # Custom React hooks (e.g., useRooms)
│   ├── pages/              # Page components (organized by role)
│   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── AdminLogin.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── user/           # Public user-facing pages
│   │   │   ├── Index.tsx
│   │   │   ├── Booking.tsx
│   │   │   ├── BookingSummary.tsx
│   │   │   ├── Packages.tsx
│   │   │   ├── PackageDetails.tsx
│   │   │   └── RoomDetails.tsx
│   │   ├── shared/         # Shared pages (404, etc.)
│   │   │   └── NotFound.tsx
│   │   └── debug/          # Development/debug pages
│   │       └── ApiDebug.tsx
│   ├── services/           # API service functions
│   └── config/             # Application configuration (e.g., paths)
├── readme/                 # Documentation files (120+ guides)
├── admin-dashboard.html    # Admin panel entry point
├── package.json            # Project dependencies and scripts
└── README.md               # You are here!
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

This project is licensed under the MIT License.