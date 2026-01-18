# Frontend Documentation

## Overview
The frontend is a modern Single Page Application (SPA) built with React, TypeScript, and Vite. It serves as the user-facing booking engine and includes the admin dashboard.

## Tech Stack
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Project Structure
```
src/
├── components/         # Reusable UI components
│   ├── ui/             # shadcn/ui primitives
│   └── admin/          # Admin-specific components
├── pages/             # Page components (Booking, Admin, etc.)
├── hooks/             # Custom React hooks
├── services/          # API client services
├── types/             # TypeScript definitions
└── config/            # App configuration
```

## Key Features
1. **Booking Engine**: Multi-step booking flow with calendar and payment integration.
2. **Admin Dashboard**: Integrated management interface (see `dashboard_admin.md`).
3. **Responsive Design**: Mobile-first approach using Tailwind CSS.
4. **Dynamic Content**: Content loaded from API/JSON for easy updates.

## Setup & Development

### Prerequisite
- Node.js (Latest LTS recommended)
- NPM or Bun

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Access at `http://localhost:5173`

### Build
```bash
npm run build
```
Creates a production build in `dist/`.

## Configuration
Environment variables typically include:
- `VITE_API_BASE_URL`: URL of the backend API.
- `VITE_IMAGE_BUCKET_URL`: URL for R2 image storage.

## API Integration
The frontend communicates with a Cloudflare Worker backend. API clients are located in `src/services/` or configured via `apiClient` pattern.

Key API services:
- **Bookings**: `/api/bookings`
- **Rooms**: `/api/rooms`
- **Payments**: `/api/payment`

## Service Layer (`src/services/cloudflareApi.ts`)
The frontend uses a centralized `CloudflareApiClient` class to handle all API requests.

### Core Client
- **`request(endpoint, options)`**: Wrapper around `fetch` that handles timeouts, headers, and error parsing.
- **`health()`**: Checks API health status (`/health`).

### Booking Services
- **`getBookings(limit, offset)`**: Fetches paginated list of bookings.
- **`getBooking(id)`**: Fetches details for a single booking.
- **`createBooking(data)`**: Submits a new booking.
- **`updateBookingStatus(id, status, paymentStatus)`**: Updates booking workflow state.
- **`searchBookingsByDates(checkIn, checkOut)`**: Finds bookings in a date range.

### Amenity Services
- **`getAmenities()`**: Fetches all available amenities.
- **`getFeaturedAmenities()`**: Fetches amenities marked as featured.
- **`getAmenitiesByCategory(category)`**: Filters amenities by category (e.g., 'Wellness').

### Authentication Services
- **`login(username, password)`**: Authenticates user and sets token.
- **`verifyToken(token)`**: Validates current session token.
- **`logout()`**: Clears local session data.

### Image Services
- **`uploadImage(file, directory)`**: Uploads image to R2 storage.
- **`getImages()`**: Lists available images.
- **`deleteImage(key)`**: Removes an image from storage.

## Assets
- Images are primarily hosted on Cloudflare R2 and referenced via URL.
- Static assets are located in `public/`.
