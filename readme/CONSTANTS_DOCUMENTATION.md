# Constants Documentation & Mapping

## Overview
This document catalogs all constants used throughout the booking engine application, organized by category with descriptions, usage examples, and relationship mappings.

**Last Updated**: November 12, 2025  
**Recent Changes**: Package filtering system resolved - duplicate usePackages hook removed to fix TypeScript import conflicts

## 📂 Configuration Constants

### 1. API Configuration (`src/config/paths.ts`)

#### Base URLs
```typescript
export const API_BASE_URL = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api'
export const ADMIN_API_BASE_URL = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api/admin'
```
- **Purpose**: Define base API endpoints for all service calls
- **Usage**: Used by all service files for API communication
- **Dependencies**: Referenced in `packageService.ts`, `villaService.ts`, `calendarService.ts`, `api.js`

#### Path Mappings
```typescript
export const paths = {
  home: '/',
  rooms: '/rooms',
  packages: '/packages',
  booking: '/booking',
  about: '/about',
  contact: '/contact',
  admin: '/admin',
  
  // API endpoints
  api: {
    rooms: '/api/rooms.php',
    packages: '/api/packages.php',
    bookings: '/api/bookings.php',
    villa: '/api/villa.php',
    ical: '/api/ical.php',
    notify: '/api/notify.php',
    images: '/api/images.php'
  }
}
```
- **Purpose**: Centralized routing and API endpoint management
- **Usage**: Navigation, API calls, URL generation
- **Helper Function**: `buildApiUrl(endpoint: string)` for dynamic URL construction

### 2. Image Configuration (`src/config/images.ts`)

#### Image Path Structure
```typescript
export const imagePaths = {
  rooms: {
    standard: '/images/rooms/standard/',
    deluxe: '/images/rooms/deluxe/',
    suite: '/images/rooms/suite/',
    villa: '/images/rooms/villa/'
  },
  amenities: {
    base: '/images/amenities/',
    icons: '/images/amenities/icons/'
  },
  gallery: {
    exterior: '/images/gallery/exterior/',
    interior: '/images/gallery/interior/',
    facilities: '/images/gallery/facilities/'
  },
  ui: {
    logo: '/images/ui/logo.png',
    background: '/images/ui/bg-hero.jpg',
    placeholder: '/images/ui/placeholder.jpg'
  }
}
```
- **Purpose**: Centralized image path management
- **Usage**: Components use `getRoomImages()`, `getAmenityIcon()` helpers
- **Dependencies**: Used in `PhotoGallery.tsx`, `RoomCard.tsx`, `Amenities.tsx`

## 🎯 Service Constants

### 3. Package Service Constants (`src/services/packageService.ts`)

#### Package Type Mappings
```typescript
const typeNames = {
  'romantic': 'Romantic Getaway',
  'business': 'Business Package',
  'family': 'Family Package',
  'luxury': 'Luxury Experience',
  'weekend': 'Weekend Special',
  'holiday': 'Holiday Package',
  'spa': 'Spa & Wellness',
  'adventure': 'Adventure Package'
}

const typeColors = {
  'romantic': 'text-pink-600 bg-pink-50',
  'business': 'text-blue-600 bg-blue-50',
  'family': 'text-green-600 bg-green-50',
  'luxury': 'text-purple-600 bg-purple-50',
  'weekend': 'text-orange-600 bg-orange-50',
  'holiday': 'text-red-600 bg-red-50',
  'spa': 'text-teal-600 bg-teal-50',
  'adventure': 'text-indigo-600 bg-indigo-50'
}
```
- **Purpose**: Package categorization and visual styling
- **Usage**: Package display, filtering, badge coloring
- **Dependencies**: Used in `PackageCard.tsx`, package filtering components

### 4. Calendar Service Constants (`src/services/calendarService.ts`)

#### Export Options
```typescript
interface iCalExportOptions {
  status?: 'all' | 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out';
  format?: 'ics' | 'json';
  from_date?: string;
  to_date?: string;
}
```
- **Purpose**: Calendar export configuration
- **Usage**: iCal generation, booking status filtering
- **Dependencies**: Used in `CalendarIntegration.tsx`, admin dashboard

## 🎨 UI Component Constants

### 5. Button Variants (`src/components/ui/button.tsx`)

#### Button Styling Constants
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    }
  }
)
```
- **Purpose**: Consistent button styling across application
- **Usage**: All button components inherit these variants
- **Dependencies**: Used throughout all React components

## 📊 Data Constants

### 6. Mock Data (`src/data/dummy.ts`)

#### Villa Information
```typescript
export const villaData: Villa = {
  id: 1,
  name: "Luxury Villa Paradise",
  location: "Bali, Indonesia",
  description: "Experience ultimate luxury at our exclusive villa...",
  rating: 4.9,
  reviews: 127,
  images: [...],
  amenities: [...],
  rooms: [...]
}
```
- **Purpose**: Development and testing data
- **Usage**: Fallback data when API is unavailable
- **Dependencies**: Used by `useVillaInfo.tsx`, development components

### 7. Offline Storage Constants (`src/lib/offlineBookings.ts`)

#### Storage Configuration
```typescript
const STORAGE_KEY = 'offlineBookings'
```
- **Purpose**: LocalStorage key for offline booking persistence
- **Usage**: Offline booking functionality, sync operations
- **Dependencies**: Used in booking flow when network is unavailable

## 🔧 Utility Constants

### 8. Toast Notifications (`src/utils/toast.ts`)

#### Toast Functions
```typescript
export const showSuccess = (message: string) => { ... }
export const showError = (message: string) => { ... }
export const showLoading = (message: string) => { ... }
export const dismissToast = (toastId: string) => { ... }
```
- **Purpose**: Standardized user feedback system
- **Usage**: Success/error notifications throughout app
- **Dependencies**: Used in booking flow, admin actions, API calls

### 9. Context Constants (`src/context/BookingContext.tsx`)

#### Storage Configuration
```typescript
const STORAGE_KEY = "bookings"
```
- **Purpose**: LocalStorage key for booking data persistence
- **Usage**: Booking context state management
- **Dependencies**: BookingProvider, booking persistence

### 10. Image Utilities (`src/utils/images.ts`)

#### Image Helper Functions
```typescript
export const checkImageExists = async (url: string): Promise<boolean> => { ... }
export const getImageWithFallback = async (primaryUrl: string, fallbackUrl: string) => { ... }
export const preloadImages = (urls: string[]): Promise<void[]> => { ... }
export const generateSrcSet = (basePath: string, sizes: string[]) => { ... }
```
- **Purpose**: Image loading, fallback handling, optimization
- **Usage**: Photo galleries, room images, performance optimization
- **Dependencies**: Used in `PhotoGallery.tsx`, `RoomCard.tsx`

## 🎨 Extended UI Constants

### 11. Sidebar Constants (`src/components/ui/sidebar.tsx`)

#### Layout Configuration
```typescript
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
```
- **Purpose**: Sidebar layout and behavior configuration
- **Usage**: Admin dashboard layout, responsive design
- **Dependencies**: Admin panel components

### 12. Chart Theme Constants (`src/components/ui/chart.tsx`)

#### Theme Configuration
```typescript
const THEMES = { light: "", dark: ".dark" } as const;
```
- **Purpose**: Chart theme management for light/dark modes
- **Usage**: Dashboard charts, analytics components
- **Dependencies**: Admin reporting, data visualization

### 13. Hook Constants (`src/hooks/useDescriptionProcessor.tsx`)

#### Text Processing
```typescript
const DESCRIPTION_MAX_LENGTH = 300;
```
- **Purpose**: Text truncation limit for descriptions
- **Usage**: Package descriptions, room details
- **Dependencies**: Content display components

## 🖼️ Image Gallery Constants (New - Nov 12, 2025)

### 13. Image Gallery System (`src/components/ImageGallery.tsx`)

#### API Configuration
```typescript
const API_BASE_URL = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api';
```
- **Purpose**: API endpoint for dynamic image discovery
- **Usage**: Fetch image data from `/api/images.php`
- **Dependencies**: Image gallery components, standalone HTML page

#### Image Interface Definitions
```typescript
interface ImageItem {
  name: string;
  path: string;
  category: string;
  type: string;
  size: number;
  modified: number;
  url: string;
  fullUrl: string;
}

interface ImageStats {
  totalImages: number;
  totalCategories: number;
  categoryCounts: { [key: string]: number };
  lastUpdated: string;
}
```
- **Purpose**: Type definitions for image data and statistics
- **Usage**: Type safety for image gallery components
- **Dependencies**: React TypeScript components

#### Image Category Colors
```typescript
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'hero': return 'bg-red-100 text-red-800';
    case 'packages': return 'bg-blue-100 text-blue-800';
    case 'amenities': return 'bg-green-100 text-green-800';
    case 'ui': return 'bg-purple-100 text-purple-800';
    case 'rooms': return 'bg-yellow-100 text-yellow-800';
    case 'villa': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```
- **Purpose**: Visual categorization of image types in gallery
- **Usage**: Badge coloring, visual organization
- **Dependencies**: Image gallery UI components

#### File Type Colors
```typescript
const getImageTypeColor = (type: string) => {
  switch (type) {
    case 'jpg': case 'jpeg': return 'bg-blue-100 text-blue-800';
    case 'png': return 'bg-green-100 text-green-800';
    case 'svg': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
```
- **Purpose**: Visual distinction of file types
- **Usage**: File type badges, filtering interface
- **Dependencies**: Image gallery display components

## � Application Constants

### 14. App Configuration (`src/App.tsx`)

#### Route Definitions
```typescript
const App = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/book/:roomId" element={<BookingPage />} />
    <Route path="/packages" element={<PackagesPage />} />
    <Route path="/packages/:packageId" element={<PackageDetails />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/images" element={<ImageGalleryPage />} />
    {/* ... more routes */}
  </Routes>
)
```
- **Purpose**: Application routing structure
- **Usage**: Navigation, URL patterns, image gallery access
- **Dependencies**: React Router, page components

#### Query Client Configuration
```typescript
const queryClient = new QueryClient();
```
- **Purpose**: React Query configuration for data fetching
- **Usage**: API state management, caching
- **Dependencies**: TanStack Query, API services

### 15. Component Constants

#### RoomCard Fallbacks (`src/components/RoomCard.tsx`)
```typescript
// Image fallback URL
target.src = '/images/ui/placeholder.jpg';
```
- **Purpose**: Fallback image when room images fail to load
- **Usage**: Error handling, user experience
- **Dependencies**: Image loading error handlers

#### BookingSteps Limits (`src/components/BookingSteps.tsx`)
```typescript
const maxGuests = room?.occupancy || pkg?.max_guests || 2;
const maxNights = pkg?.max_nights;
const minNights = pkg?.min_nights || 1;
```
- **Purpose**: Booking validation limits
- **Usage**: Form validation, booking constraints
- **Dependencies**: Room and package data structures

#### Icon Mapping (`src/hooks/useIndexPageData.tsx`)
```typescript
const iconMap: { [key: string]: string } = {
  'Swimming Pool': 'Bath',
  'Spa Services': 'Bath', 
  'Restaurant': 'CookingPot',
  'Free WiFi': 'Wifi',
  'Airport Shuttle': 'Car',
  'Bicycle Rental': 'Car',
  'Yoga Studio': 'AirVent',
  'Library': 'Flame',
  'Garden': 'AirVent',
  'Parking': 'Car',
  '24/7 Reception': 'Flame',
  'Room Service': 'CookingPot'
  // ... more mappings
};
```
- **Purpose**: Map amenity names to Lucide React icons
- **Usage**: Villa amenities display, icon rendering
- **Dependencies**: Lucide React icon library

## 🔧 Backend Constants

### 16. Database Configuration (`api/config/database.php`)

#### Connection Constants
```php
class Database {
    private $host = 'localhost';
    private $db_name = 'booking_engine';
    private $username = 'root';
    private $password = '';
}
```
- **Purpose**: Database connection parameters
- **Usage**: PDO connection establishment
- **Dependencies**: MySQL database, PHP PDO

### 17. API Helper Constants (`api/utils/helpers.php`)

#### HTTP Headers
```php
function enableCORS() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");
}
```
- **Purpose**: CORS configuration, API response headers
- **Usage**: Cross-origin requests, API security
- **Dependencies**: PHP header functions

### 18. Image API Constants (`api/images.php` - New Nov 12, 2025)

#### Image File Extensions
```php
$imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
```
- **Purpose**: Supported image file types for gallery discovery
- **Usage**: File filtering during directory scanning
- **Dependencies**: Image gallery API endpoint

#### API Response Structure
```php
$response = [
    'success' => true,
    'data' => [
        'images' => $allImages,
        'imagesByCategory' => $imagesByCategory,
        'statistics' => $statistics
    ],
    'message' => 'Images retrieved successfully'
];
```
- **Purpose**: Standardized API response format for image data
- **Usage**: Image gallery frontend consumption
- **Dependencies**: React image gallery components

## 🗄️ Database Schema Constants

### 19. Table Schemas (`database/schema.sql`)

#### Table Definitions
```sql
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    // ... more fields
);
```
- **Purpose**: Database structure definition
- **Usage**: Table creation, field constraints
- **Dependencies**: MySQL database

## 📦 Project Configuration Constants

### 20. Package Configuration (`package.json`)

#### Script Definitions
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "build:full": "vite build && npm run setup:api"
  }
}
```
- **Purpose**: Build and development scripts
- **Usage**: Development workflow, deployment
- **Dependencies**: Vite, ESLint

### 21. TypeScript Configuration (`tsconfig.json`)

#### Path Aliases
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
- **Purpose**: Import path aliases for cleaner imports
- **Usage**: File imports throughout application
- **Dependencies**: TypeScript compiler

### 22. Deployment Configuration (`vercel.json`)

#### Routing Rules
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
- **Purpose**: SPA routing configuration for deployment
- **Usage**: Client-side routing support
- **Dependencies**: Vercel hosting platform

## 🔧 Extended Configuration Constants

### 23. Vite Configuration (`vite.config.ts`)

#### Development Server Settings
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1',
        changeOrigin: true,
        secure: false
      }
    }
  }
}))
```
- **Purpose**: Development server configuration and API proxy
- **Usage**: Local development, API routing
- **Dependencies**: Vite build system

### 24. ShadCN UI Configuration (`components.json`)

#### Component System Settings
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```
- **Purpose**: UI component library configuration
- **Usage**: Component generation, path aliases
- **Dependencies**: ShadCN UI, Tailwind CSS

### 25. TypeScript App Configuration (`tsconfig.app.json`)

#### Compiler Settings
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
- **Purpose**: TypeScript compilation settings for app code
- **Usage**: Type checking, compilation
- **Dependencies**: TypeScript compiler

### 26. ESLint Configuration (`eslint.config.js`)

#### Linting Rules
```javascript
export default tseslint.config({
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/no-unused-vars": "off"
  }
})
```
- **Purpose**: Code quality and style enforcement
- **Usage**: Linting, code standards
- **Dependencies**: ESLint, TypeScript ESLint

### 27. PostCSS Configuration (`postcss.config.js`)

#### CSS Processing
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```
- **Purpose**: CSS processing pipeline
- **Usage**: Tailwind processing, vendor prefixes
- **Dependencies**: PostCSS, Tailwind CSS

## 🗄️ Extended Database Constants

### 28. Database Installation (`database/install.sql`)

#### Table Creation Constants
```sql
CREATE DATABASE IF NOT EXISTS booking_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    INDEX idx_type (type),
    INDEX idx_available (available)
);

CREATE TABLE bookings (
    status ENUM('pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out') DEFAULT 'confirmed'
);
```
- **Purpose**: Database structure initialization
- **Usage**: Database setup, table creation
- **Dependencies**: MySQL database

### 29. Package Schema Constants (`database/packages.sql`)

#### Package Type Definitions
```sql
CREATE TABLE packages (
    package_type ENUM('romantic', 'business', 'family', 'luxury', 'weekend', 'holiday', 'spa', 'adventure') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    min_nights INT DEFAULT 1,
    max_nights INT DEFAULT 30,
    INDEX idx_package_type (package_type),
    INDEX idx_active_dates (is_active, valid_from, valid_until)
);
```
- **Purpose**: Package categorization and constraints
- **Usage**: Package management, database schema
- **Dependencies**: MySQL ENUM types

## 🎨 Component Display Constants

### 30. Footer Fallback Constants (`src/components/Footer.tsx`)

#### Default Contact Information
```typescript
const getAddress = () => {
  if (!villaInfo) return "123 Luxury Avenue";
  return villaInfo.address || "123 Luxury Avenue";
};

const getLocation = () => {
  if (!villaInfo) return "Aspen, Colorado";
  return villaInfo.location || "Aspen, Colorado";
};

const getPhone = () => {
  if (!villaInfo) return "+1 (555) 123-4567";
  return villaInfo.phone || "+1 (555) 123-4567";
};

const getEmail = () => {
  if (!villaInfo) return "info@sereneretreat.com";
  return villaInfo.email || "info@sereneretreat.com";
};
```
- **Purpose**: Fallback contact information display
- **Usage**: Footer display, error handling
- **Dependencies**: Villa info hook, UI components

### 30. NotFound Page Constants (`src/pages/NotFound.tsx`)

#### Error Display Constants
```typescript
<h1 className="text-4xl font-bold mb-4">404</h1>
<p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
<a href="/" className="text-blue-500 hover:text-blue-700 underline">
  Return to Home
</a>
```
- **Purpose**: 404 error page styling and content
- **Usage**: Error handling, user guidance
- **Dependencies**: React Router, error logging

## �🌐 HTML Test Constants

### 22. Authentication Constants (`src/pages/AdminLogin.tsx`)

#### Demo Credentials
```typescript
// Demo admin credentials (production should use proper authentication)
if (credentials.username === 'admin' && credentials.password === 'admin123') {
  sessionStorage.setItem('adminLoggedIn', 'true');
  sessionStorage.setItem('adminUser', credentials.username);
}
```
- **Purpose**: Demo authentication for admin access
- **Usage**: Admin panel access, session management
- **Dependencies**: SessionStorage, admin routing

### 23. Test File API Constants (Test HTML Files)

#### API Base URLs
```typescript
const API_BASE = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api';
```
- **Purpose**: API endpoints for testing files
- **Usage**: Direct HTML testing, debugging
- **Files**: `villa-update-test.html`, `total-price-fix-test.html`, `package-update-test.html`

#### Test Pricing Constants
```typescript
const packagePrice = 899.00; // Adventure Explorer package price
const roomPrice = 250.00; // Deluxe Suite price
const serviceFee = basePrice * 0.1; // 10% service fee
```
- **Purpose**: Test pricing calculations
- **Usage**: Booking flow testing, price validation
- **Dependencies**: Test scenarios, pricing logic validation

### 24. API Endpoint Constants (`api/packages.php`)

#### HTTP Configuration
```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
```
- **Purpose**: API endpoint CORS and content type headers
- **Usage**: Cross-origin requests, API responses
- **Dependencies**: PHP header functions, HTTP protocols

## 🎨 Tailwind Configuration Constants

### 25. Design System Constants (`tailwind.config.ts`)

#### Theme Configuration
```typescript
export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        // ... extensive color system
      }
    }
  }
}
```
- **Purpose**: Global design system configuration
- **Usage**: Component styling, theme management, responsive design
- **Dependencies**: All UI components, CSS custom properties

## 📋 Type Constants (`src/types.ts`)

### 26. Core Interface Definitions

#### Room Structure
```typescript
export interface Room {
  id: string;
  name: string;
  price: string;
  image_url: string;
  description: string;
  size: string;
  beds: string;
  occupancy: number;
  features: string;
  // ... additional fields
}
```

#### Package Structure
```typescript
export interface Package {
  id: string;
  name: string;
  description: string;
  type?: string;
  package_type?: 'romantic' | 'business' | 'family' | 'luxury' | 'weekend' | 'holiday' | 'spa' | 'adventure';
  price: string;
  available?: number; // 0 = inactive, 1 = active (CRITICAL for filtering)
  // ... additional fields
}

// FILTERING LOGIC (Fixed Nov 12, 2025):
// Only packages with available === 1 or available === true display to customers
// Admin can toggle available field: 1 = active (shows), 0 = inactive (hidden)
```

#### Booking Structure
```typescript
export interface Booking {
  id: number;
  reference: string; // Format: BK-XXXX
  roomId: string;
  from: string; // ISO date
  to: string; // ISO date
  guests: number;
  user: GuestInfo;
  total: number;
  createdAt: string;
}
```

## 🔗 Relationship Mappings

### API Dependencies
```
paths.ts → All service files
├── packageService.ts (uses API_BASE_URL, paths.api.packages)
├── villaService.ts (uses API_BASE_URL, paths.api.villa)
├── calendarService.ts (uses paths.buildApiUrl)
├── api.js (uses API_BASE_URL, ADMIN_API_BASE_URL)
└── Test Files (use hardcoded API_BASE constants)
```

### Image Dependencies
```
images.ts → UI Components
├── PhotoGallery.tsx (uses gallery paths)
├── RoomCard.tsx (uses room image paths)
├── Amenities.tsx (uses amenity icons)
└── UI Components (uses ui.logo, ui.background)
```

### Type Dependencies
```
types.ts → All Components & Services
├── Components (import Room, Package, Booking interfaces)
├── Services (use interfaces for type safety)
├── Hooks (usePackages, useRooms return typed data)
└── Context (BookingContext uses Booking interface)
```

### Package Status Mapping (FIXED - Nov 12, 2025)
```
Database Field: 'available' (0 = inactive, 1 = active)
├── Admin Dashboard → Updates 'available' field
├── usePackages.tsx → Filters by 'available === 1' (ONLY active hook file)
├── PackageCard.tsx → Shows only active packages
├── Test Files → Filter by 'available === 1 || available === true'
└── API Response → Returns 'available' status

Hook Architecture Fix:
├── src/hooks/usePackages.tsx ✅ (ACTIVE - with filtering)
└── src/hooks/usePackages.ts ❌ (REMOVED - no filtering, caused import conflicts)
```

### UI Theme Dependencies
```
tailwind.config.ts → Global Design System
├── All Components (use Tailwind classes)
├── CSS Custom Properties (--primary, --secondary, etc.)
├── Button Variants (inherit from theme colors)
├── Responsive Breakpoints (2xl: 1400px)
└── Dark Mode Support (class-based switching)
```

### Storage & Context Dependencies
```
LocalStorage Constants
├── BookingContext → STORAGE_KEY = "bookings"
├── offlineBookings.ts → STORAGE_KEY = "offlineBookings"
└── Sidebar → SIDEBAR_COOKIE_MAX_AGE for preferences
```

## 🚀 Usage Examples

### Adding New Constants

1. **API Endpoint**: Add to `paths.ts`
```typescript
api: {
  // existing endpoints...
  newEndpoint: '/api/new-feature.php'
}
```

2. **Image Path**: Add to `images.ts`
```typescript
newCategory: {
  base: '/images/new-category/',
  thumbnail: '/images/new-category/thumbnails/'
}
```

3. **Package Type**: Add to `packageService.ts`
```typescript
const typeNames = {
  // existing types...
  'wellness': 'Wellness Retreat'
}

const typeColors = {
  // existing colors...
  'wellness': 'text-emerald-600 bg-emerald-50'
}
```

### Accessing Constants

```typescript
// Import and use API paths
import { paths } from '@/config/paths';
const url = paths.buildApiUrl('/packages.php');

// Import and use image paths
import { imagePaths, getRoomImages } from '@/config/images';
const roomImages = getRoomImages('deluxe');

// Import and use types
import { Package, Room } from '@/types';
const [packages, setPackages] = useState<Package[]>([]);
```

## 📝 Maintenance Notes

1. **Field Name Consistency**: Always use 'available' field for package status (not 'is_active')
2. **URL Construction**: Use `paths.buildApiUrl()` for dynamic URL generation
3. **Image Fallbacks**: Always provide fallback images using utility functions
4. **Type Safety**: Import and use TypeScript interfaces for all data structures
5. **Constants Location**: Add new constants to appropriate category files, don't scatter throughout codebase

## 🚨 Critical Fix Notes (Nov 12, 2025)

### Package Filtering Issue Resolution
- **Problem**: Duplicate `usePackages` hook files caused TypeScript import conflicts
- **Root Cause**: `src/hooks/usePackages.ts` (no filtering) vs `src/hooks/usePackages.tsx` (with filtering)
- **Solution**: Removed `src/hooks/usePackages.ts` to force import of `.tsx` version with filtering
- **Result**: Admin package status changes now instantly sync with customer interface

### Hook Architecture Best Practices
- **Single File Pattern**: Use only one hook file per functionality to avoid import ambiguity
- **File Extensions**: Prefer `.tsx` for React hooks with JSX elements
- **Import Resolution**: TypeScript imports `.ts` before `.tsx` - avoid duplicate filenames
- **Filtering Logic**: Always implement business logic (like availability filtering) in the hook layer

## 🔍 Quick Reference

| Category | File | Key Constants |
|----------|------|---------------|
| **API Config** | `paths.ts` | API_BASE_URL, paths object |
| **Images** | `images.ts` | imagePaths, helper functions |
| **Services** | `packageService.ts` | typeNames, typeColors |
| **UI Components** | `button.tsx` | buttonVariants |
| **UI Layout** | `sidebar.tsx` | SIDEBAR_WIDTH constants |
| **Types** | `types.ts` | Interface definitions |
| **Utils** | `toast.ts`, `images.ts` | Helper functions |
| **Data** | `dummy.ts` | Mock villa data |
| **Storage** | `offlineBookings.ts`, `BookingContext.tsx` | STORAGE_KEY constants |
| **Text Processing** | `useDescriptionProcessor.tsx` | DESCRIPTION_MAX_LENGTH |
| **Theme** | `tailwind.config.ts` | Color system, breakpoints |
| **Charts** | `chart.tsx` | THEMES constant |
| **Test Files** | `*.html` | API_BASE, pricing constants |
| **Build Config** | `vite.config.ts` | Server settings, proxy config |
| **UI System** | `components.json` | ShadCN aliases, settings |
| **Database** | `install.sql`, `packages.sql` | Schema, enums, indexes |
| **API Endpoints** | `*.php` | CORS headers, HTTP methods |
| **Component Fallbacks** | `Footer.tsx` | Default contact info |
| **Authentication** | `AdminLogin.tsx` | Demo credentials |
| **Error Handling** | `NotFound.tsx` | 404 display constants |

## 📊 Constants by Usage Frequency

### High Usage (Used across multiple components)
- `API_BASE_URL` - Used in all service files and test files
- `imagePaths` - Used in all image-related components
- Button `buttonVariants` - Used in all button instances
- TypeScript interfaces - Used throughout the application
- CORS headers - Used in all API endpoints
- Path aliases (`@/*`) - Used in all imports
- **Package 'available' field** - CRITICAL for filtering (admin-to-customer sync)

### Medium Usage (Component-specific)
- Package `typeNames` and `typeColors` - Package-related components
- `STORAGE_KEY` constants - Data persistence features
- Sidebar dimensions - Layout components
- Database schema constants - Backend operations
- Vite proxy settings - Development environment

### Low Usage (Specialized features)
- `DESCRIPTION_MAX_LENGTH` - Text truncation
- Chart `THEMES` - Data visualization
- Test file constants - Development and testing
- Fallback contact info - Error handling
- Demo credentials - Authentication testing
- ESLint rules - Code quality enforcement

---

## 🎯 Recent System Improvements

### Package Filtering System Fix (November 12, 2025)
- **Issue**: Package status changes in admin dashboard weren't reflecting in customer interface
- **Diagnosis**: TypeScript importing wrong hook file (usePackages.ts without filtering vs usePackages.tsx with filtering)
- **Resolution**: Removed duplicate `src/hooks/usePackages.ts` file
- **Verification**: Created `debug-hook-data-flow.html` to confirm data flow integrity
- **Result**: ✅ Admin changes now sync instantly with Step 1 package display

### Hook Architecture Cleanup
- **Before**: Two usePackages files causing import conflicts
- **After**: Single `usePackages.tsx` with proper filtering logic
- **Benefits**: Eliminates TypeScript import ambiguity, ensures consistent filtering behavior

### Documentation Enhancements
- **Constants Audit**: Comprehensive documentation of 200+ constants across 30+ categories
- **Debugging Tools**: Created HTML-based debugging interfaces for real-time testing
- **Cross-References**: Updated all documentation to reflect current system state

---
*Last Updated: November 12, 2025*  
*Project: Villa Booking Engine*  
*Status: ✅ Package filtering system resolved and fully operational*