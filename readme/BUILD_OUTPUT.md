# Build Output and Deployment Guide

This document lists exactly which files are included in the production build (`npm run build`) and what should be deployed to your hosting.

## 🏗️ Production Build Process

When you run `npm run build`, Vite processes your source files and creates optimized production assets in the `/dist` directory.

### ✅ Files INCLUDED in Production Build (`/dist` folder):

#### Core Build Output:
```
/dist/
├── index.html                    # Main entry point (optimized)
├── robots.txt                    # SEO robots file
├── assets/
│   ├── index-[hash].js          # Bundled JavaScript (React app)
│   ├── index-[hash].css         # Bundled CSS (Tailwind + custom)
│   └── [other-assets]-[hash].*  # Other optimized assets
└── images/                      # Static images (if any in public/)
```

#### What Gets Bundled Into `/dist/assets/index-[hash].js`:
- All React components (`src/components/`)
- All pages (`src/pages/`)
- All hooks (`src/hooks/`)
- All services (`src/services/`)  
- All utilities (`src/utils/`)
- Main App.tsx and routing
- TypeScript configurations compiled to JavaScript
- Environment-aware configuration (paths.ts with production URLs)

#### What Gets Bundled Into `/dist/assets/index-[hash].css`:
- Tailwind CSS framework
- Custom CSS from `src/App.css`
- Component-specific styles
- All CSS optimized and minified

### ❌ Files EXCLUDED from Production Build:

#### Development-Only Files (NOT in `/dist`):
```
❌ admin-dashboard.html           # Development admin tool
❌ admin-login.html              # Standalone login (use React app instead)
❌ admin-reports.html            # Development reporting tool
❌ api-test.html                 # API testing interface
❌ config-manager.html           # Configuration management tool
❌ debug-database.php            # Database debugging script
❌ direct-test.html              # Direct booking test
❌ double-page-fix-test.html     # Development fix testing
❌ frontend-test.html            # Frontend testing page
❌ ical-test.html               # iCal testing interface
❌ test-*.html                   # All test files (API testing, connection tests)
❌ test-api-url.html            # API URL configuration testing
❌ test-connection.html         # Database connection testing
❌ villa-update-test.html        # Villa update testing
❌ image-gallery.html           # Standalone image gallery test
❌ admin-debug.html             # Admin dashboard debugging
❌ admin-api-test.html          # Admin API testing
❌ debug-ical-booking.html      # iCal and booking testing
❌ test-*.js                     # JavaScript test files
❌ *.md files                    # Documentation (except README)
❌ src/ folder                   # Source files (compiled into /dist)
❌ node_modules/                 # Dependencies (bundled into /dist)
❌ .env files                    # Environment files
❌ vite.config.ts               # Build configuration
❌ tsconfig.*.json              # TypeScript configuration
❌ tailwind.config.ts           # Tailwind configuration
❌ postcss.config.js            # PostCSS configuration
❌ eslint.config.js             # ESLint configuration
❌ package.json                 # Package management
❌ pnpm-lock.yaml               # Lock file
```

#### Configuration Files (Build-time only):
```
❌ config.js                     # Build-time configuration (values compiled into bundle)
❌ components.json               # shadcn/ui configuration
❌ vercel.json                   # Deployment configuration (for Vercel only)
```

## 🚀 What to Deploy to Production Hosting

### Deploy to `booking.rumahdaisycantik.com`:
```
✅ /dist/index.html
✅ /dist/robots.txt  
✅ /dist/assets/     (entire folder)
✅ /dist/images/     (if exists)
```

### Deploy to `api.rumahdaisycantik.com`:
```
✅ /api/             (entire folder - PHP backend)
✅ /database/        (SQL files for database setup)
```

## 🔍 Build Verification Commands

To verify your build output:

```bash
# 1. Create production build
npm run build

# 2. Check build output
ls -la dist/

# 3. Verify no localhost references in compiled code
cd dist/assets
findstr /i "localhost" *.js *.css

# 4. Check bundle sizes
ls -lh dist/assets/
```

## 📊 Current Build Statistics

Last verified build (November 15, 2025):
- **Build time**: 11.18s
- **JavaScript bundle**: ~581.62 kB
- **CSS bundle**: ~75.21 kB
- **HTML**: ~417 bytes
- **Environment**: Production (api.rumahdaisycantik.com)
- **Localhost references**: ✅ 0 found

## 🎯 Key Points

1. **Only `/dist` contents** go to frontend hosting
2. **All development HTML files** stay local for testing
3. **React app handles all routing** including admin pages
4. **API endpoints** correctly configured for cross-domain setup
5. **Build process** automatically optimizes and bundles everything

## 🔗 Production URLs

- **Frontend**: https://booking.rumahdaisycantik.com
- **Admin Panel**: https://booking.rumahdaisycantik.com/admin/login
- **API Backend**: https://api.rumahdaisycantik.com
- **Booking Flow**: https://booking.rumahdaisycantik.com/book

## 🔐 Admin Access in Production

### ✅ **How to Access Admin Dashboard:**

Your React app includes a **full admin system** that IS included in the production build:

1. **Login URL**: `https://booking.rumahdaisycantik.com/admin/login`
2. **Credentials**: 
   - Username: `admin`
   - Password: `admin123`
3. **Admin Management**: `https://booking.rumahdaisycantik.com/admin/management`

### 🛠️ **Admin Features Available:**
- **Room Management** - Add/edit/delete rooms
- **Package Management** - Manage packages and pricing  
- **Booking Management** - View/edit customer bookings
- **Villa Information** - Update villa details and amenities
- **Secure Authentication** - Protected routes with AdminGuard

### 📱 **Admin Routes (All Included in Build):**
```
✅ /admin/login        → AdminLogin.tsx (secure login)
✅ /admin/management   → AdminManagement.tsx (main dashboard)
✅ /admin/bookings     → AdminBookings.tsx (booking management)
✅ /admin/villa        → Admin.tsx (villa information)
```

### ❌ **Development Files (NOT Deployed):**
```
❌ admin-dashboard.html    → Local development tool only
❌ admin-login.html        → Standalone login (not needed)
❌ admin-reports.html      → Development reporting
```

**Important**: The React admin system is secure, modern, and fully integrated - use this instead of standalone HTML files!

---

**Note**: This file serves as documentation and should not be deployed to production hosting.