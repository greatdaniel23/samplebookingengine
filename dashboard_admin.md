# Admin Dashboard Documentation

## Overview
The Admin Dashboard is a comprehensive management interface built into the main React application. It provides control over bookings, rooms, packages, amenities, and property details.

- **URL**: `/admin`
- **Login**: `/admin/login`
- **Framework**: React + shadcn/ui + Tailwind CSS

## Features

### 1. Dashboard Overview
- Real-time system metrics.
- Quick actions for common tasks.
- Navigation to all management sections.

### 2. Booking Management
- **Full CRUD**: View, create, update, and delete bookings.
- **Status Control**: Manage confirmation and payment statuses.
- **Filtering**: Search and filter bookings by date or status.

### 3. Room Inventory
- Manage room details, pricing, and availability.
- Update room images and descriptions.

### 4. Packages & Sales Tools
- Create and manage special offers and packages.
- configuration of package inclusions and pricing.

### 5. Amenities Management
- **Categories**: Room Features, Bathroom, Kitchen, Entertainment, Services.
- **Assignment**: Assign amenities to specific rooms or packages.

### 6. Property Management
- Update general villa information.
- Manage homepage content and images.

### 7. Analytics
- Revenue and occupancy reports.
- Visual data representation (charts/graphs).

### 8. Settings
- System configuration and admin user preferences.

## Authentication & Security
- **Component**: `AdminGuard.tsx`
- **Mechanism**: Session-based authentication.
- **Protection**: All `/admin/*` routes are protected. Unauthenticated users are redirected to login.
- **Credentials**: (Development) `admin` / `admin123`. **Change for production.**

## Architecture
The admin panel is built as a modular React component structure:

```
src/pages/AdminPanel.tsx                 # Main Container
├── src/components/admin/
│   ├── BookingsSection.tsx             # Booking CRUD
│   ├── RoomsSection.tsx                # Room Management
│   ├── PackagesSection.tsx             # Package Management
│   ├── PropertySection.tsx             # Property Details
│   ├── AmenitiesSection.tsx            # Amenities System
│   └── HomepageContentManager.tsx      # Content Management
└── src/components/AdminGuard.tsx       # Route Protection
```

## Component Functions

### 1. BookingsSection (`src/components/admin/BookingsSection.tsx`)
| Function | Purpose | Connection |
|----------|---------|------------|
| `fetchBookings()` | Loads all bookings from API. | `GET /api/bookings/list` |
| `handleAddBooking(e)` | Submits new booking form. | `POST /api/bookings/create` |
| `handleEditBooking(e)` | Updates existing booking details. | `PUT /api/bookings/:id` |
| `deleteBooking(id)` | Removes a booking. | `DELETE /api/bookings/:id` |
| `getStatusVariant(status)` | Returns UI badge variant for status. | Client-side Helper |

### 2. RoomsSection (`src/components/admin/RoomsSection.tsx`)
| Function | Purpose | Connection |
|----------|---------|------------|
| `fetchRooms()` | Loads all rooms. | `GET /api/rooms` |
| `handleCreateRoom(e)` | Creates a new room. | `POST /api/rooms` |
| `handleEditRoom(e)` | Updates room details. | `PUT /api/rooms/:id` |
| `deleteRoom(id)` | Deletes a room. | `DELETE /api/rooms/:id` |
| `fetchAmenities()` | Loads amenities for selection. | `GET /api/amenities/list` |
| `addRoomAmenity(roomId, amenityId)` | Links amenity to room. | `POST /api/rooms/:id/amenities` |

### 3. PackagesSection (`src/components/admin/PackagesSection.tsx`)
| Function | Purpose | Connection |
|----------|---------|------------|
| `fetchPackages()` | Loads all packages. | `GET /api/packages` |
| `handleCreatePackage(e)` | Creates a new package. | `POST /api/packages` |
| `handleUpdatePackage(e)` | Updates package details. | `PUT /api/packages/:id` |
| `deletePackage(id)` | Deletes a package. | `DELETE /api/packages/:id` |
| `addAmenityToPackage(...)` | Adds amenity to package. | `POST /api/packages/:id/amenities` |
| `fetchMarketingCategories()` | Loads marketing tags. | `GET /api/packages/categories` |

### 4. AmenitiesSection (`src/components/admin/AmenitiesSection.tsx`)
| Function | Purpose | Connection |
|----------|---------|------------|
| `fetchAmenities()` | Loads all amenities. | `GET /api/amenities/list` |
| `handleCreateAmenity(e)` | Creates new amenity. | `POST /api/amenities` |
| `handleUpdateAmenity(e)` | Updates amenity details. | `PUT /api/amenities/:id` |
| `handleDeleteAmenity(id)` | Deletes amenity. | `DELETE /api/amenities/:id` |
| `fetchUsageStats(...)` | Calculates usage count. | Client-side Logic |

### 5. GTMSettingsSection (`src/components/admin/GTMSettingsSection.tsx`)
| Function | Purpose | Connection |
|----------|---------|------------|
| `fetchGTMCodes()` | Loads all GTM codes. | `GET /api/gtm` |
| `handleAddCode(e)` | Adds a new GTM container. | `POST /api/gtm` |
| `handleToggleEnabled(code)` | Toggles GTM code enabled state. | `PUT /api/gtm/:id` |
| `handleDelete(id)` | Deletes a GTM code. | `DELETE /api/gtm/:id` |
| `handleSaveEdit()` | Saves edits to GTM code. | `PUT /api/gtm/:id` |

## Setup & Deployment
- The admin dashboard is deployed as part of the main frontend application.
- API endpoints are configured to communicate with `https://api.rumahdaisycantik.com` (or your configured API base).
- Ensure `VITE_API_BASE_URL` is set correctly in your environment.
