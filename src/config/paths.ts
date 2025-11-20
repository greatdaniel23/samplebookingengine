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
// at http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/
// Adjust API_BASE if the PHP API lives in that same folder under /api.
// ALWAYS use production API - no local development API
const DEFAULT_LOCAL_API = 'https://api.rumahdaisycantik.com'; // Force production API in development too
const DEFAULT_PRODUCTION_API = 'https://api.rumahdaisycantik.com';

// Always use production API URL regardless of environment
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_PRODUCTION_API;

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
    bookings: buildApiUrl('bookings.php'),
    bookingById: (id) => buildApiUrl(`bookings.php?id=${id}`),
    rooms: buildApiUrl('rooms.php')
  },
  frontendBase: PUBLIC_BASE,
  adminBase: ADMIN_BASE,
  assets: {
    images: `${PUBLIC_BASE.replace(/\/$/, '')}/images`
  },
  buildApiUrl
};

// Debug logging for production troubleshooting
if (typeof window !== 'undefined' && env === 'production') {
  console.log('🔧 Production API Configuration:');
  console.log('   Environment:', env);
  console.log('   VITE_API_BASE:', import.meta.env.VITE_API_BASE);
  console.log('   API_BASE resolved to:', API_BASE);
  console.log('   Current domain:', window.location.origin);
}

// Convenience re-exports for common usage
export const API_BASE_URL = paths.apiBase;
export const BOOKINGS_ENDPOINT = paths.api.bookings;
export const FRONTEND_BASE = paths.frontendBase;
export const ADMIN_BASE_ROUTE = paths.adminBase;

// Example usage:
// import { paths } from '@/config/paths';
// fetch(paths.api.bookings).then(...);
// navigate(`${paths.adminBase}/rooms`);
