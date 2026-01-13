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
  confirmation: (id: number | string) => string; // Booking confirmation page
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

// PRODUCTION-ONLY CONFIGURATION
// All API calls are routed to Cloudflare Worker
const PRODUCTION_API = 'https://booking-engine-api-production.danielsantosomarketing2017.workers.dev/api';

// Always use production API URL - no local development
let API_BASE = import.meta.env.VITE_API_BASE || PRODUCTION_API;

// DISABLED: Domain detection for relative API switching
// The following code was causing API calls to use /api/* paths which require server proxy
// if (typeof window !== 'undefined') {
//   const hostLower = window.location.host.toLowerCase();
//   const bookingLike = /(^|\.)booking\.rumahdaisycantik\.com$/i.test(hostLower);
//   const forceRelative = import.meta.env.VITE_FORCE_RELATIVE_API === 'true';
//   if (bookingLike || forceRelative) {
//     // Use relative path; server (Nginx/Apache) should proxy /api/* -> https://api.rumahdaisycantik.com/
//     API_BASE = '/api';
//   }
// }

// Force full API URL to ensure proper subdomain usage
API_BASE = import.meta.env.VITE_API_BASE || PRODUCTION_API;

// Optional admin panel route root (could be protected by auth in future)
const ADMIN_BASE = import.meta.env.VITE_ADMIN_BASE || '/admin';

// HOST determination - production-ready only
let host = 'https://booking.rumahdaisycantik.com';
if (typeof window !== 'undefined') {
  host = window.location.origin;
}

// Helper to safely build API URLs
const buildApiUrl = (path: string) => {
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

export const paths: AppPaths = {
  env,
  host,
  apiBase: API_BASE,
  api: {
    bookings: buildApiUrl('bookings'),
    bookingById: (id) => buildApiUrl(`bookings/${id}`),
    rooms: buildApiUrl('rooms')
  },
  confirmation: (id: number | string) => `/confirmation/${id}`,
  frontendBase: PUBLIC_BASE,
  adminBase: ADMIN_BASE,
  assets: {
    images: `${PUBLIC_BASE.replace(/\/$/, '')}/images`
  },
  buildApiUrl
};

// Debug logging for production troubleshooting
// Removed production console info logging to avoid exposing API base.

// Convenience re-exports for common usage
export const API_BASE_URL = paths.apiBase;
export const BOOKINGS_ENDPOINT = paths.api.bookings;
export const FRONTEND_BASE = paths.frontendBase;
export const ADMIN_BASE_ROUTE = paths.adminBase;

// Example usage:
// import { paths } from '@/config/paths';
// fetch(paths.api.bookings).then(...);
// navigate(`${paths.adminBase}/rooms`);
