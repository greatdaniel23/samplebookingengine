/**
 * Cloudflare Worker API Service
 * Complete API client for Booking Engine Worker
 */

import { API_CONFIG, getApiUrl, getAuthToken, setAuthToken, getImageUrl } from '@/config/cloudflare';

// Type definitions
export interface Booking {
  id: number;
  booking_reference: string;
  room_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  check_in: string;
  check_out: string;
  guests: number;
  adults: number;
  children: number;
  total_price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: string;
  is_featured: number;
  is_active: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API Client class
class CloudflareApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.WORKER_API_BASE;
    this.timeout = API_CONFIG.REQUEST_TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data.data || data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        console.error(`API Request Failed: ${endpoint}`, error);
        throw error;
      }
      throw new Error('Unknown API error');
    }
  }

  // Health Check
  async health() {
    return this.request('/health');
  }

  // ==================== BOOKINGS ====================

  async getBookings(limit = 50, offset = 0): Promise<Booking[]> {
    return this.request(`/bookings/list?limit=${limit}&offset=${offset}`);
  }

  async getBooking(id: number): Promise<Booking> {
    return this.request(`/bookings/${id}`);
  }

  async getBookingByReference(reference: string): Promise<Booking> {
    return this.request(`/bookings/ref/${reference}`);
  }

  async createBooking(data: Partial<Booking>): Promise<any> {
    return this.request('/bookings/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBookingStatus(
    id: number,
    status: string,
    paymentStatus?: string
  ): Promise<any> {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, payment_status: paymentStatus }),
    });
  }

  async searchBookingsByDates(
    checkInBefore: string,
    checkOutAfter: string
  ): Promise<Booking[]> {
    return this.request(
      `/bookings/dates/search?check_in_before=${checkInBefore}&check_out_after=${checkOutAfter}`
    );
  }

  // ==================== AMENITIES ====================

  async getAmenities(): Promise<Amenity[]> {
    return this.request('/amenities/list');
  }

  async getFeaturedAmenities(): Promise<Amenity[]> {
    return this.request('/amenities/featured');
  }

  async getAmenitiesByCategory(category: string): Promise<Amenity[]> {
    return this.request(`/amenities/category/${category}`);
  }

  async getAmenity(id: number): Promise<Amenity> {
    return this.request(`/amenities/${id}`);
  }

  // ==================== AUTHENTICATION ====================

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user: User }> {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }

  // ==================== IMAGES ====================

  async getImages(): Promise<any[]> {
    return this.request('/images/list');
  }

  async uploadImage(file: File, directory = 'uploads'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);

    const url = `${this.baseUrl}/images/upload`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: HeadersInit = {};
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async deleteImage(key: string): Promise<any> {
    return this.request(`/images/${key}`, {
      method: 'DELETE',
    });
  }

  // ==================== ADMIN ====================

  async getDashboard(): Promise<any> {
    return this.request('/admin/dashboard');
  }

  async getAnalytics(): Promise<any> {
    return this.request('/admin/analytics');
  }
}

// Export singleton instance
export const cloudflareApi = new CloudflareApiClient();

// Export convenience functions
export const bookingsApi = {
  getAll: (limit?: number, offset?: number) => cloudflareApi.getBookings(limit, offset),
  getById: (id: number) => cloudflareApi.getBooking(id),
  getByReference: (ref: string) => cloudflareApi.getBookingByReference(ref),
  create: (data: Partial<Booking>) => cloudflareApi.createBooking(data),
  updateStatus: (id: number, status: string, paymentStatus?: string) =>
    cloudflareApi.updateBookingStatus(id, status, paymentStatus),
  searchDates: (checkInBefore: string, checkOutAfter: string) =>
    cloudflareApi.searchBookingsByDates(checkInBefore, checkOutAfter),
};

export const amenitiesApi = {
  getAll: () => cloudflareApi.getAmenities(),
  getFeatured: () => cloudflareApi.getFeaturedAmenities(),
  getByCategory: (category: string) => cloudflareApi.getAmenitiesByCategory(category),
  getById: (id: number) => cloudflareApi.getAmenity(id),
};

export const authApi = {
  login: (username: string, password: string) => cloudflareApi.login(username, password),
  verify: (token: string) => cloudflareApi.verifyToken(token),
  logout: () => cloudflareApi.logout(),
};

export const imagesApi = {
  getAll: () => cloudflareApi.getImages(),
  upload: (file: File, directory?: string) => cloudflareApi.uploadImage(file, directory),
  delete: (key: string) => cloudflareApi.deleteImage(key),
};

export const adminApi = {
  getDashboard: () => cloudflareApi.getDashboard(),
  getAnalytics: () => cloudflareApi.getAnalytics(),
};
