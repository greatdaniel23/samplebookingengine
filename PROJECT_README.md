# � Villa Management System - Complete Full-Stack Application

A modern, comprehensive villa management system built with React, TypeScript, PHP, and MySQL. Features a beautiful public villa showcase, secure admin panel, and complete villa information management.

## 🚀 Features

### Public Villa Website
- ✅ **3-Step Booking Flow** - Date selection, guest info, and confirmation
- ✅ **Dynamic Villa Showcase** - Real-time villa information display
- ✅ **Photo Gallery** - Beautiful image carousel with villa photos
- ✅ **Villa Amenities** - Comprehensive amenity listings
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Real-time Updates** - Content changes instantly from admin panel

### Secure Admin Panel
- ✅ **Authentication System** - Secure login with credentials (admin/admin123)
- ✅ **Villa Information Management** - Complete control over all villa data
- ✅ **Contact Management** - Phone, email, website administration
- ✅ **Address Management** - Street, city, state, country, zipcode
- ✅ **Villa Specifications** - Guests, bedrooms, bathrooms, pricing
- ✅ **Policy Management** - Cancellation policy, house rules
- ✅ **Social Media Integration** - Facebook, Instagram, Twitter links
- ✅ **Real-time Preview** - Changes reflect immediately on main site

### Technical Features
- ✅ **Database Integration** - PHP REST API with MySQL backend
- ✅ **Modern UI** - React + TypeScript + Tailwind CSS + Shadcn/ui
- ✅ **Real-time Validation** - Form validation with error handling
- ✅ **API Documentation** - Complete REST API endpoints
- ✅ **Security** - Protected admin routes, discrete access
- ✅ **CORS Support** - Proper cross-origin resource sharing

## 📁 Project Structure

```
frontend-booking-engine/
├── src/                    # React Frontend
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Shadcn/ui components
│   │   ├── BookingSteps.tsx # 3-step booking component
│   │   ├── PhotoGallery.tsx # Villa photo carousel
│   │   ├── Amenities.tsx    # Villa amenity display
│   │   └── AdminLogin.tsx   # Admin authentication
│   ├── pages/             # Main page components
│   │   ├── Index.tsx      # Villa showcase page
│   │   ├── Booking.tsx    # Room booking page
│   │   ├── Admin.tsx      # Admin management panel
│   │   ├── AdminBookings.tsx # Booking management
│   │   └── NotFound.tsx   # 404 page
│   ├── services/          # API service layer
│   │   └── api.js         # API communication
│   ├── hooks/             # Custom React hooks
│   │   ├── useRooms.tsx   # Room data management
│   │   └── useVillaInfo.tsx # Villa information hook
│   ├── context/           # React context providers
│   │   └── BookingContext.tsx # Booking state management
│   ├── lib/               # Utilities and configurations
│   ├── utils/             # Helper functions
│   └── types.ts           # TypeScript definitions
├── api/                   # PHP REST API
│   ├── controllers/       # API controllers
│   │   ├── BookingController.php
│   │   └── RoomController.php
│   ├── models/           # Database models
│   │   ├── Booking.php
│   │   └── Room.php
│   ├── config/           # Database configuration
│   │   └── database.php
│   ├── utils/            # Helper functions
│   │   └── helpers.php
│   ├── villa.php         # Villa information API
│   └── index.php         # Main API router
├── database/             # Database schema and migrations
│   ├── schema.sql        # Database setup
│   ├── migrate-db.php    # Database migration script
│   └── init-data.php     # Sample data initialization
├── public/               # Static assets
│   └── images/           # Villa photos and assets
└── dist/                 # Production build output
```

## 🛠️ Installation

### Prerequisites
- **XAMPP** (Apache + MySQL + PHP 8.0+)
- **Node.js** 18.0+
- **pnpm** or npm

### 1. Clone & Setup
```bash
git clone <repository-url>
cd frontend-booking-engine
pnpm install
```

### 2. XAMPP Setup
1. **Install XAMPP** from https://www.apachefriends.org/
2. **Start Services**: Apache + MySQL
3. **Copy Project**: Place project folder in `C:\xampp\htdocs\`
4. **Verify Access**: http://localhost/your-project-folder/

### 3. Database Setup
1. **Open phpMyAdmin**: http://localhost/phpmyadmin
2. **Create Database**: `booking_engine`
3. **Run Base Schema**: Import `database/schema.sql`
4. **Run Migration**: Navigate to `http://localhost/your-project/database/migrate-db.php`
5. **Initialize Data**: Navigate to `http://localhost/your-project/database/init-data.php`
6. **Verify Tables**: Check `rooms`, `bookings`, `villa_info` tables exist

### 4. Development Server
```bash
# Start frontend development server
pnpm dev
```

### 5. System Architecture
- **Frontend**: http://localhost:3000 (React + Vite)
- **API**: http://localhost/your-project/api/ (PHP)
- **Database**: http://localhost/phpmyadmin (MySQL)
- **Admin Panel**: http://localhost:3000/admin (Secure)

### 6. Production Build
```bash
pnpm run build
pnpm run preview
```

## � Usage Guide

### Public Villa Website
1. **Visit Homepage**: Navigate to http://localhost:3000
2. **Explore Villa**: View dynamic villa information, photos, amenities
3. **Make Booking**: Use 3-step booking process for reservations
4. **Contact Information**: All contact details are dynamically managed

### Admin Panel Access
1. **Discrete Access**: Scroll to footer, click "Staff Portal" 
2. **Login Credentials**:
   - Username: `admin`
   - Password: `admin123`
3. **Admin Dashboard**: Full villa information management
4. **Real-time Updates**: Changes reflect immediately on main site

### Admin Management Features
- **Villa Information**: Name, description, location
- **Contact Management**: Phone, email, website
- **Address Details**: Complete address information
- **Villa Specifications**: Guests, bedrooms, bathrooms, pricing
- **Timing Settings**: Check-in/check-out times
- **Policies**: Cancellation policy, house rules
- **Social Media**: Facebook, Instagram, Twitter links

## �🌐 API Endpoints

Base URL: `http://localhost/your-project/api/`

### Villa Information
- `GET /villa.php` - Get villa information
- `PUT /villa.php` - Update villa information (Admin only)

### Bookings
- `POST /index.php/bookings` - Create new booking
- `GET /index.php/bookings` - Get all bookings  
- `GET /index.php/bookings/{id}` - Get specific booking
- `GET /index.php/bookings?action=availability&room_id={id}&check_in={date}&check_out={date}` - Check availability

### Rooms
- `GET /index.php/rooms` - Get all available rooms
- `GET /index.php/rooms/{id}` - Get specific room

### Testing
- `GET /index.php/test` - Test API connectivity

### Example API Usage
```javascript
// Get villa information
const villaResponse = await fetch('/api/villa.php');
const villaData = await villaResponse.json();

// Update villa information (Admin)
const updateData = {
  name: "Luxury Mountain Villa",
  phone: "+1 (555) 123-4567",
  email: "info@villa.com"
};

const updateResponse = await fetch('/api/villa.php', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updateData)
});

// Create a booking
const bookingData = {
  roomId: 'villa-deluxe',
  from: '2025-11-10',
  to: '2025-11-12', 
  guests: 2,
  user: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  total: 299.99
};

const bookingResponse = await fetch('/api/index.php/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
});
```

## 🎯 3-Step Booking Flow

### Step 1: Date & Guest Selection
- **Calendar picker** with disabled unavailable dates
- **Guest count selector** with room capacity validation
- **Availability checking** against existing bookings
- **Visual confirmation** when valid dates selected

### Step 2: Guest Information  
- **Form validation** with real-time error checking
- **Required fields**: First Name, Last Name, Email, Phone
- **Optional field**: Special Requests
- **Manual progression** - user clicks "Continue to Review"

### Step 3: Review & Confirmation
- **Complete summary** of booking details
- **Price breakdown** with base price + service fee
- **Guest information review**
- **Database persistence** with fallback to localStorage

## 🔧 Configuration

### Database Configuration
`api/config/database.php`:
```php
private $host = 'localhost';
private $db_name = 'booking_engine';  
private $username = 'root';
private $password = '';
```

### CORS Configuration
`api/utils/helpers.php`:
```php
header("Access-Control-Allow-Origin: http://localhost:8080");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

### Vite Configuration
`vite.config.ts`:
```typescript
server: {
  host: "::",
  port: 8080,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api')
    }
  }
}
```

## 📱 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality component library
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **React Router** - Client-side routing
- **Date-fns** - Date manipulation utilities

### Backend
- **PHP 8.0+** - Server-side logic
- **MySQL** - Relational database
- **PDO** - Database abstraction layer
- **JSON API** - RESTful API responses

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting (via editor)
- **TypeScript** - Static type checking
- **Vite HMR** - Hot module replacement

## 🚀 Deployment

### Development Environment
1. **Start XAMPP services** (Apache + MySQL)
2. **Run development server**: `pnpm dev`
3. **Access application**: http://localhost:8080

### Production Deployment
1. **Build frontend**: `pnpm build`
2. **Configure Apache virtual host**:
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       DocumentRoot /path/to/frontend-booking-engine/dist
       
       # API rewrite rules
       RewriteEngine On
       RewriteRule ^api/(.*)$ api/index.php [QSA,L]
       
       # React Router support
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
   </VirtualHost>
   ```
3. **Update database credentials** for production
4. **Configure CORS** for production domain

## 🔍 Troubleshooting

### Common Issues

#### API 404 Errors
- **Check**: `.htaccess` file exists and mod_rewrite is enabled
- **Verify**: API routes in `api/index.php`
- **Test**: Direct access to `api/index.php`

#### Database Connection Issues
- **Verify**: MySQL service is running in XAMPP
- **Check**: Database credentials in `api/config/database.php`
- **Test**: Access phpMyAdmin at http://localhost/phpmyadmin

#### CORS Errors
- **Check**: CORS headers in `api/utils/helpers.php`
- **Verify**: Origin matches development server port
- **Clear**: Browser cache and cookies

#### Build/Dev Server Issues
- **Clear**: `rm -rf node_modules && pnpm install`
- **Check**: Node.js version (18.0+ required)
- **Verify**: Port 8080 is available

### Debug Tools & Endpoints

#### API Testing
- **Test endpoint**: http://localhost:8080/api/test
- **Check rooms**: http://localhost:8080/api/rooms
- **View bookings**: http://localhost:8080/api/bookings

#### Database Verification
- **phpMyAdmin**: http://localhost/phpmyadmin
- **Tables**: Verify `rooms`, `bookings`, `admin_users` exist
- **Data**: Check sample rooms are inserted

#### Frontend Debugging
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Monitor API requests/responses
- **React DevTools**: Inspect component state

## 🎯 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Run ESLint

# Database & API
pnpm setup:db         # Instructions for database setup
pnpm setup:api        # API files are already configured
pnpm build:full       # Build frontend + verify API setup
```

## 🏗️ Architecture

### Data Flow
1. **User interacts** with React components
2. **Form submission** triggers API call
3. **PHP API** validates and processes data
4. **MySQL database** stores booking information
5. **Response** updates UI state
6. **Success/error** feedback to user

### Security Features
- **Input sanitization** on API endpoints
- **SQL prepared statements** prevent injection
- **CORS configuration** restricts origins
- **Form validation** on client and server

### Error Handling
- **API errors** gracefully handled with user feedback
- **Database connection** issues trigger localStorage fallback  
- **Form validation** prevents invalid submissions
- **Network errors** show appropriate messages

## 📄 License
MIT License - feel free to use this project for your own booking engine!

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**🎉 You now have a complete, full-stack hotel booking engine with database persistence, beautiful UI, and professional 3-step booking flow!**

Built with ❤️ using React, TypeScript, PHP, and MySQL