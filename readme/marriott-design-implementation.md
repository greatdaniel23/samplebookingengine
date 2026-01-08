# Marriott Design Implementation Guide

## 🎨 Design Analysis

Based on the Marriott booking interface, here are the key design elements to implement:

### **Color Palette**
- **Primary Blue**: `#1f2937` (dark gray-blue)
- **Secondary Blue**: `#3b82f6` (bright blue for CTAs)
- **Background Gray**: `#f9fafb` (light gray)
- **Card White**: `#ffffff` (pure white)
- **Text Primary**: `#111827` (dark gray)
- **Text Secondary**: `#6b7280` (medium gray)
- **Text Muted**: `#9ca3af` (light gray)
- **Border Gray**: `#e5e7eb` (border color)
- **Success Green**: `#10b981` (for positive actions)
- **Warning Red**: `#ef4444` (for discounts/alerts)

### **Typography Scale**
- **Hero Title**: `text-2xl md:text-3xl font-semibold`
- **Section Headers**: `text-lg font-medium`
- **Card Titles**: `text-base font-medium`
- **Body Text**: `text-sm text-gray-600`
- **Labels**: `text-xs text-gray-500 uppercase tracking-wide`
- **Prices**: `text-2xl md:text-3xl font-bold`

## 📋 Files to Prepare/Modify

### **1. Core Component Files**
```
src/pages/
├── PackageDetails.tsx ✅ (Already updated)
├── Packages.tsx (to be updated)
├── HomePage.tsx (to be updated)
└── BookingPage.tsx (to be updated)
```

### **2. Component Library Files**
```
src/components/
├── ui/
│   ├── card.tsx (may be deprecated)
│   ├── button.tsx (to be updated)
│   ├── badge.tsx (to be updated)
│   └── carousel.tsx (new - for image galleries)
├── PackageCard.tsx (to be updated)
├── RoomCard.tsx (new component)
├── ImageCarousel.tsx (new component)
├── PriceDisplay.tsx (new component)
└── RatingDisplay.tsx (new component)
```

### **3. Layout & Navigation Files**
```
src/components/
├── layout/
│   ├── Header.tsx (to be updated)
│   ├── Navigation.tsx (to be updated)
│   └── Footer.tsx (to be updated)
└── breadcrumb/
    └── Breadcrumb.tsx (new component)
```

### **4. Styling Files**
```
src/styles/
├── globals.css (to be updated)
├── marriott-theme.css (new)
└── components.css (new)

tailwind.config.ts (to be updated)
```

### **5. Asset Files**
```
public/images/
├── rooms/ (new folder)
├── packages/ (existing)
├── amenities/ (new folder)
└── ui/ (existing)
```
### **5. Room-Package Integration Files**
```
api/
├── packages.php (handles room_options and base_room_id)
├── rooms.php (room inventory management)
└── bookings.php (package + room booking logic)

database/
├── packages.sql (room_options JSON field)
├── rooms.sql (room inventory structure)
└── package_rooms.sql (future mapping table)
```
## � Multiple Rooms in Packages

### **Business Logic Overview**
Your system implements a sophisticated **Package-Room Relationship** where:
- **Packages are Marketing Sales Tools** - not separate inventory
- **Rooms are Real Inventory** - the actual bookable accommodation
- **Package Availability = Room Availability** - packages depend on underlying room availability

### **Key Features Implemented**

#### **1. Package-Room Mapping**
```typescript
interface PackageRoomOption {
  name: string;
  price_override: number | null;
  priority: number;
}

interface Package {
  room_options: PackageRoomOption[];  // Multiple room choices
  base_room_id: string;               // Primary room for availability
  // ... other fields
}
```

#### **2. Room Selection in Packages**
- **PackageDetails Page**: Shows all available rooms for a package
- **Room Grid Display**: Each room shows pricing and "Select Room" button
- **Automatic Assignment**: Default room assigned if no selection made
- **Price Override**: Room-specific pricing within package context

#### **3. Admin Management**
- **Base Room Selection**: Each package must have a base room for availability control
- **Room Options**: Packages can include multiple room types with custom pricing
- **Inventory Control**: Package availability tied to base room availability

### **Implementation Files**

#### **Frontend Components**
```
src/pages/PackageDetails.tsx     - Room selection interface
src/components/PackageCard.tsx   - Shows room options in cards
src/pages/Booking.tsx           - Handles room-package booking
src/components/admin/PackagesSection.tsx - Admin room management
```

#### **Backend Integration**
```
api/packages.php    - Package CRUD with room relationships
api/rooms.php       - Room inventory management
database/packages.sql - Package-room mapping tables
```

#### **Database Structure**
```sql
-- Package room options (JSON field)
packages.room_options = [
  {"name": "Deluxe Suite", "price_override": 150, "priority": 1},
  {"name": "Master Suite", "price_override": 200, "priority": 2}
]

-- Base room for availability
packages.base_room_id -> rooms.id
```

### **User Experience Flow**
1. **Customer browses packages** → Sees attractive bundled offers
2. **Selects package** → Views available room options with pricing
3. **Chooses room** → Proceeds to booking with selected room + package benefits
4. **Booking confirmation** → Books specific room with package inclusions

## �🎯 CSS Variables to Define

### **1. Color Variables**
```css
:root {
  /* Primary Colors */
  --color-primary: #1f2937;
  --color-primary-light: #374151;
  --color-primary-dark: #111827;
  
  /* Secondary Colors */
  --color-secondary: #3b82f6;
  --color-secondary-light: #60a5fa;
  --color-secondary-dark: #2563eb;
  
  /* Background Colors */
  --color-background: #f9fafb;
  --color-surface: #ffffff;
  --color-surface-alt: #f3f4f6;
  
  /* Text Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-text-inverse: #ffffff;
  
  /* Border Colors */
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-border-dark: #d1d5db;
  
  /* Status Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### **2. Spacing Variables**
```css
:root {
  /* Spacing Scale */
  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
  --space-2xl: 3rem;      /* 48px */
  --space-3xl: 4rem;      /* 64px */
  
  /* Container Sizes */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
}
```

### **3. Typography Variables**
```css
:root {
  /* Font Families */
  --font-primary: 'Inter', system-ui, sans-serif;
  --font-secondary: 'Roboto', system-ui, sans-serif;
  
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### **4. Shadow Variables**
```css
:root {
  /* Shadow Styles */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
}
```

## 🏗️ Component Structure Templates

### **1. Image Carousel Component**
```typescript
interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showThumbnails?: boolean;
  autoPlay?: boolean;
}

export const ImageCarousel: React.FC<ImageCarouselProps>
```

### **2. Room Card Component**
```typescript
interface RoomCardProps {
  room: {
    id: string;
    name: string;
    images: string[];
    description: string;
    amenities: string[];
    maxOccupancy: number;
    rates: RoomRate[];
  };
  onSelect: (roomId: string, rateId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps>
```

### **3. Rate Display Component**
```typescript
interface RateDisplayProps {
  rate: {
    name: string;
    description: string;
    price: number;
    currency: string;
    isPackage?: boolean;
    inclusions?: string[];
    restrictions?: string[];
  };
  onSelect: () => void;
  isSelected?: boolean;
}

export const RateDisplay: React.FC<RateDisplayProps>
```

## 🎨 Tailwind Configuration Updates

### **1. Extended Color Palette**
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'marriott': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        'gold': {
          50: '#fefdf8',
          100: '#fef7cd',
          200: '#feecab',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        }
      }
    }
  }
}
```

### **2. Custom Component Classes**
```css
/* src/styles/components.css */
@layer components {
  .marriott-card {
    @apply bg-white border border-gray-200 rounded-lg shadow-sm;
  }
  
  .marriott-card-header {
    @apply p-6 border-b border-gray-100;
  }
  
  .marriott-card-content {
    @apply p-6;
  }
  
  .marriott-button-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors;
  }
  
  .marriott-button-secondary {
    @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors;
  }
  
  .marriott-badge {
    @apply px-2 py-1 text-xs font-medium rounded-full;
  }
  
  .marriott-badge-primary {
    @apply marriott-badge bg-blue-100 text-blue-800;
  }
  
  .marriott-badge-success {
    @apply marriott-badge bg-green-100 text-green-800;
  }
  
  .marriott-badge-warning {
    @apply marriott-badge bg-yellow-100 text-yellow-800;
  }
}
```

## 📱 Responsive Breakpoints

### **1. Mobile-First Approach**
```css
/* Mobile (default) */
@media (min-width: 320px) { /* styles */ }

/* Tablet */
@media (min-width: 768px) { /* md: */ }

/* Desktop */
@media (min-width: 1024px) { /* lg: */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl: */ }

/* Extra Large */
@media (min-width: 1536px) { /* 2xl: */ }
```

## 🔧 Implementation Steps

### **Phase 1: Foundation (Week 1)**
1. ✅ Update PackageDetails.tsx (Complete)
2. Create CSS variables and Tailwind config
3. Set up component library structure
4. Create base layout components

### **Phase 2: Components (Week 2)**
1. Build ImageCarousel component
2. Create RoomCard component
3. Develop RateDisplay component
4. Update existing PackageCard component

### **Phase 3: Pages (Week 3)**
1. Update Packages listing page
2. Enhance HomePage with new design
3. Rebuild BookingPage interface
4. Add responsive optimizations

### **Phase 4: Polish (Week 4)**
1. Performance optimizations
2. Accessibility improvements
3. Animation and transitions
4. Testing and bug fixes

## 📊 Key Features to Implement

### **1. Image Gallery System**
- Multi-image carousels for rooms/packages
- Thumbnail navigation
- Zoom functionality
- Lazy loading

### **2. Rate Comparison**
- Side-by-side rate display
- Package vs standard rates
- Member vs non-member pricing
- Filtering and sorting

### **3. Enhanced Booking Flow**
- Step-by-step booking process
- Real-time availability
- Dynamic pricing updates
- Guest preferences

### **4. Professional Typography**
- Consistent font hierarchy
- Improved readability
- Brand consistency
- Multi-language support

---

## 📋 Multiple Rooms Documentation Status

### **✅ Completed Features**
- [x] **Package-Room Mapping System** - Packages can include multiple room options
- [x] **Room Selection Interface** - PackageDetails page shows all available rooms  
- [x] **Admin Management** - Package creation with base room and room options
- [x] **Booking Integration** - Room + Package booking flow
- [x] **Price Override System** - Room-specific pricing within packages
- [x] **Inventory Control** - Package availability tied to room availability

### **📚 Existing Documentation Files**
- **[room&package.md](../readme/room&package.md)** - Complete business logic and database structure
- **[BOOKING_FLOW_DOCUMENTATION.md](../readme/BOOKING_FLOW_DOCUMENTATION.md)** - Detailed booking process
- **[PACKAGES_SYSTEM.md](../readme/PACKAGES_SYSTEM.md)** - Package system overview

### **🔧 Implementation Details**

#### **Room Options in PackageCard Component**
```tsx
{showRoomOptions && pkg.room_options && pkg.room_options.length > 0 && (
  <div className="mb-6">
    <h4 className="text-sm font-semibold mb-3 text-gray-900">Available Rooms:</h4>
    <div className="space-y-2">
      {pkg.room_options.slice(0, 2).map((room, index) => (
        <div key={index} className="flex justify-between items-center text-sm">
          <span className="text-gray-700 font-medium">{room.name}</span>
          {room.price_override && (
            <span className="font-semibold text-gray-900">${room.price_override}/night</span>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

#### **Room Selection in PackageDetails**
```tsx
{/* Rooms Section */}
<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
  <div className="p-6 border-b border-gray-100">
    <h3 className="text-lg font-medium text-gray-900">Available Rooms</h3>
  </div>
  <div className="p-6">
    <div className="grid grid-cols-1 gap-4">
      {roomsData?.map((room) => (
        <div key={room.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-gray-900">{room.name}</h4>
              <p className="text-sm text-gray-600">{room.description}</p>
            </div>
            <Button onClick={() => navigate(`/book?package=${pkg.id}&room=${room.id}`)}>
              Select Room
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

### **🎯 Business Logic Summary**
1. **Packages = Sales Tools** that combine room + services
2. **Multiple Room Options** allow flexibility in package booking  
3. **Base Room Controls Availability** - if base room is booked, package shows unavailable
4. **Room-Specific Pricing** enables different rates within same package
5. **Automatic Room Assignment** provides fallback if no selection made

### **🏗️ Database Structure**
```sql
-- Package room options stored as JSON
packages.room_options = [
  {"name": "Deluxe Suite", "price_override": 150, "priority": 1},
  {"name": "Master Suite", "price_override": 200, "priority": 2}
]

-- Base room for availability control
packages.base_room_id -> rooms.id (Foreign Key)

-- Booking records the final selection  
bookings.room_id -> rooms.id
bookings.package_id -> packages.id
```

This implementation will transform your booking system to match Marriott's professional design standards while maintaining all existing functionality and room flexibility.