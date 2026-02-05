# Function Documentation

This document provides an overview of the key functions and API endpoints in the project, covering both the Cloudflare Worker backend and the Frontend services.

## Backend Functions (Cloudflare Worker)

The backend logic is primarily located in `src/workers/`.

### Entry Point
- **`src/workers/index.ts`**: Contains the main `handleRequest` function which acts as the router for the Worker. It dispatches requests to internal handlers or imported route modules.

### API Endpoints

#### Bookings
**Handler**: `handleBookings` (`src/workers/routes/bookings.ts`)
- `GET /api/bookings` or `/api/bookings/list`: List all bookings (paginated).
- `GET /api/bookings/:id`: Get details of a specific booking.
- `GET /api/bookings/ref/:reference`: Get booking by reference code.
- `POST /api/bookings/create`: Create a new booking.
- `PUT /api/bookings/:id/status`: Update booking status and payment status.
- `GET /api/bookings/dates/search`: Search bookings within a date range.

#### Rooms
**Handler**: `handleRooms` (`src/workers/routes/rooms.ts`)
- `GET /api/rooms`: List all rooms (supports `?all=true` for admin).
- `GET /api/rooms/:id`: Get single room details.
- `POST /api/rooms`: Create a new room.
- `PUT /api/rooms/:id`: Update an existing room.
- `DELETE /api/rooms/:id`: Soft delete a room.

#### Packages
**Handler**: `handlePackages` (`src/workers/routes/packages.ts`)
- `GET /api/packages`: List all packages.
- `GET /api/packages/:id`: Get single package details.
- `POST /api/packages`: Create a new package.
- `PUT /api/packages`: Update a package.
- `DELETE /api/packages`: Soft delete a package.
- **Sub-routes**:
    - `GET/POST/PUT/DELETE /api/packages/:id/rooms`: Manage rooms associated with a package.
    - `GET/POST/DELETE /api/packages/:id/inclusions`: Manage inclusions for a package.
    - `GET/POST/DELETE /api/packages/:id/amenities`: Manage amenities for a package.

#### Villa Information
**Handler**: `handleVilla` (`src/workers/routes/villa.ts`)
- `GET /api/villa`: Get general villa information (name, location, policies, etc.).
- `PUT /api/villa`: Update villa information.

#### Payment (DOKU Integration)
**Handler**: `handlePayment` (`src/workers/routes/payment.ts`)
- `POST /api/payment/create`: Initiate a DOKU payment page.
- `POST /api/payment/callback`: Webhook for DOKU payment notifications.
- `GET /api/payment/status/:invoiceNumber`: Check the status of a payment.

#### Amenities
**Handler**: `handleAmenities` (Internal in `index.ts`)
- `GET /api/amenities` (or `/list`): List all active amenities.
- `GET /api/amenities/featured`: List featured amenities.
- `GET /api/amenities/category/:name`: List amenities by category.
- `GET /api/amenities/:id`: Get single amenity.
- `POST /api/amenities`: Create an amenity.
- `PUT /api/amenities/:id`: Update an amenity.
- `DELETE /api/amenities/:id`: Delete an amenity.

#### Inclusions
**Handler**: `handleInclusions` (Internal in `index.ts`)
- `GET /api/inclusions`: List all inclusions.
- `GET /api/inclusions/category/:type`: List inclusions by package type.
- `GET /api/inclusions/package/:id`: Get inclusions linked to a package.
- `GET /api/inclusions/room/:id`: Get inclusions linked to a room.
- `POST /api/inclusions`: Create an inclusion.
- `PUT /api/inclusions/:id`: Update an inclusion.
- `DELETE /api/inclusions/:id`: Delete an inclusion.
- `POST /api/inclusions/link-package`: Link inclusion to package.
- `DELETE /api/inclusions/unlink-package`: Unlink inclusion from package.
- `POST /api/inclusions/link-room`: Link inclusion to room.
- `DELETE /api/inclusions/unlink-room`: Unlink inclusion from room.

#### Authentication
**Handler**: `handleAuth` (Internal in `index.ts`)
- `POST /api/auth/login`: Authenticate user and receive JWT.
- `POST /api/auth/verify`: Verify a JWT token.

#### Images (R2 Storage)
**Handler**: `handleImages` (Internal in `index.ts`)
- `GET /api/images/list`: List stored images (supports prefix).
- `POST /api/images/upload`: Upload an image to R2.
- `DELETE /api/images/:key`: Delete an image.
- `GET /api/images/:key`: Serve an image directly.

#### Admin Dashboard
**Handler**: `handleAdmin` (Internal in `index.ts`)
- `GET /api/admin/dashboard`: Get dashboard statistics (counts, revenue).
- `GET /api/admin/analytics`: Get daily analytics data.

#### Settings
**Handler**: `handleSettings` (Internal in `index.ts`)
- `GET /api/settings`: Get global application settings (KV storage).
- `GET /api/settings/:key`: Get a specific setting.
- `POST /api/settings`: Update multiple settings.
- `PUT /api/settings/:key`: Update a specific setting.

#### GTM (Google Tag Manager)
**Handler**: `handleGTM` (Internal in `index.ts`)
- `GET /api/gtm`: List managed GTM containers.
- `POST /api/gtm`: Add a new GTM container.
- `PUT /api/gtm/:id`: Update a GTM container.
- `DELETE /api/gtm/:id`: Remove a GTM container.

#### Email (Resend)
**Handler**: `handleEmail` (Internal in `index.ts`)
- `POST /api/email/booking-confirmation`: Send booking confirmation email to guest.
- `POST /api/email/admin-notification`: Send new booking alert to admin.
- `POST /api/email/status-change`: Send status update notification.

---

## Frontend Functions

The frontend uses services to communicate with the backend API.

### Cloudflare API Client
**File**: `src/services/cloudflareApi.ts`
- `cloudflareApi.getBookings(limit, offset)`
- `cloudflareApi.getBooking(id)`
- `cloudflareApi.createBooking(data)`
- `cloudflareApi.updateBookingStatus(id, status, paymentStatus)`
- `cloudflareApi.getAmenities()`
- `cloudflareApi.login(username, password)`
- `cloudflareApi.uploadImage(file, directory)`
- `cloudflareApi.getDashboard()`
- *...and others mirroring the backend endpoints.*

### Package Service
**File**: `src/services/packageService.ts`
- `packageService.getPackages(filters)`: Fetch packages with filtering.
- `packageService.getPackageById(id)`: Fetch detailed package info.
- `packageService.getPackagesByRoom(roomId)`: Get packages available for a room.
- `packageService.calculatePackagePrice(packageId, roomId, nights, guests)`: Server-side price calculation.
- `packageService.getPackageTypes()`: Get available package categories.

### Villa Service
**File**: `src/services/villaService.ts`
- `villaService.getVillaInfo()`: Fetch villa details.
- `villaService.updateVillaInfo(data)`: Update villa details.

### Utilities
Key utility files in `src/utils/`:
- `currency.ts`: Currency formatting helpers.
- `ga4Analytics.ts`: Google Analytics 4 integration.
- `debugLogger.ts`: logging utilities.
- `toast.ts`: UI notification helpers.
