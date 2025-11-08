// Centralized path & endpoint configuration
// -----------------------------------------
// This file standardizes how the frontend refers to API endpoints,
// the public site base URL, and the admin panel location.
// Adjust values here instead of scattering hard-coded strings.

export interface AppPaths {
  env: 'development' | 'production';
  host: string;             // Browser-visible host
  apiBase: string;          // Base URL for API requests
  api: {
    bookings: string;       // /bookings collection endpoint
    bookingById: (id: number | string) => string; // Single booking
    rooms: string;          // Rooms listing (placeholder)
  };
  frontendBase: string;     // Public site root
  adminBase: string;        // Admin dashboard base route
  assets: {
    images: string;         // Image base path
  };
  buildApiUrl: (path: string) => string; // Helper to combine apiBase + path
}

// Detect environment
const env: AppPaths['env'] = import.meta.env.PROD ? 'production' : 'development';

// HOST / BASE SETTINGS -------------------------------------------------------
// If deploying to a subfolder (e.g., /fontend-bookingengine-100/frontend-booking-engine/)
// you can set VITE_PUBLIC_BASE in a .env file. Fallback to '/' if not provided.
const PUBLIC_BASE = import.meta.env.VITE_PUBLIC_BASE || '/';

// For local development under XAMPP the Apache document root might expose the project
// at http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/
// Adjust API_BASE if the PHP API lives in that same folder under /api.
const DEFAULT_LOCAL_API = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine/frontend-booking-engine/api';
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_LOCAL_API;

// Optional admin panel route root (could be protected by auth in future)
const ADMIN_BASE = import.meta.env.VITE_ADMIN_BASE || '/admin';

// HOST determination (use window.location if available in browser context)
let host = 'http://localhost:5173'; // Vite default fallback
if (typeof window !== 'undefined') {
  host = window.location.origin;
}

// Helper to safely build API URLs
const buildApiUrl = (path: string) => `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;

export const paths: AppPaths = {
  env,
  host,
  apiBase: API_BASE,
  api: {
    bookings: buildApiUrl('bookings'),
    bookingById: (id) => buildApiUrl(`bookings/${id}`),
    rooms: buildApiUrl('rooms') // Placeholder; implement in backend
  },
  frontendBase: PUBLIC_BASE,
  adminBase: ADMIN_BASE,
  assets: {
    images: `${PUBLIC_BASE.replace(/\/$/, '')}/images`
  },
  buildApiUrl
};

// Convenience re-exports for common usage
export const API_BASE_URL = paths.apiBase;
export const BOOKINGS_ENDPOINT = paths.api.bookings;
export const FRONTEND_BASE = paths.frontendBase;
export const ADMIN_BASE_ROUTE = paths.adminBase;

// Example usage:
// import { paths } from '@/config/paths';
// fetch(paths.api.bookings).then(...);
// navigate(`${paths.adminBase}/rooms`);
