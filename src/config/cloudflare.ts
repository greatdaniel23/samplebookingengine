/**
 * Cloudflare Worker API Configuration
 * Production API for Booking Engine
 */

export const API_CONFIG = {
  // Main Worker API
  WORKER_API_BASE: 'https://booking-engine-api-production.danielsantosomarketing2017.workers.dev/api',

  // R2 Image Storage
  IMAGE_BUCKET_URL: 'https://image.alphadigitalagency.id',

  // Endpoints
  BOOKINGS: '/bookings',
  AMENITIES: '/amenities',
  AUTH: '/auth',
  IMAGES: '/images',
  ADMIN: '/admin',
  HEALTH: '/health',

  // Timeouts
  REQUEST_TIMEOUT: 30000,
};

/**
 * Get full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.WORKER_API_BASE}${endpoint}`;
};

/**
 * Get image URL from R2
 */
export const getImageUrl = (key: string | null | undefined): string => {
  if (!key) return '';
  return `${API_CONFIG.IMAGE_BUCKET_URL}/${key}`;
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Store auth token
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

/**
 * Remove auth token
 */
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};
