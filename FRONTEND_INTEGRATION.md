# Frontend Integration Guide

## Setup Instructions

### 1. Update API Configuration

Create or update `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api',
  IMAGE_BUCKET_URL: 'https://imageroom.s3.us-east-1.amazonaws.com',
  TIMEOUT: 30000,
};

export const getImageUrl = (key: string): string => {
  return `${API_CONFIG.IMAGE_BUCKET_URL}/${key}`;
};
```

### 2. Create API Service Layer

```typescript
// src/services/api.ts
import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.client.get<{ success: boolean; data: T }>(
      endpoint,
      { params }
    );
    if (!response.data.success) {
      throw new Error('API request failed');
    }
    return response.data.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.post<{ success: boolean; data: T }>(
      endpoint,
      data
    );
    if (!response.data.success) {
      throw new Error('API request failed');
    }
    return response.data.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.client.put<{ success: boolean; data: T }>(
      endpoint,
      data
    );
    if (!response.data.success) {
      throw new Error('API request failed');
    }
    return response.data.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.client.delete<{ success: boolean; data: T }>(
      endpoint
    );
    if (!response.data.success) {
      throw new Error('API request failed');
    }
    return response.data.data;
  }
}

export const apiService = new ApiService();
```

### 3. Create Resource Services

```typescript
// src/services/bookings.ts
import { apiService } from './api';

export interface Booking {
  id: number;
  booking_reference: string;
  room_id: string;
  first_name: string;
  last_name: string;
  email: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
}

export const bookingsService = {
  async getList(limit = 50, offset = 0): Promise<Booking[]> {
    return apiService.get('/bookings/list', { limit, offset });
  },

  async getById(id: number): Promise<Booking> {
    return apiService.get(`/bookings/${id}`);
  },

  async getByReference(reference: string): Promise<Booking> {
    return apiService.get(`/bookings/ref/${reference}`);
  },

  async create(data: Partial<Booking>): Promise<any> {
    return apiService.post('/bookings/create', data);
  },

  async updateStatus(
    id: number,
    status: string,
    payment_status?: string
  ): Promise<any> {
    return apiService.put(`/bookings/${id}/status`, {
      status,
      payment_status,
    });
  },

  async searchByDates(
    checkInBefore: string,
    checkOutAfter: string
  ): Promise<Booking[]> {
    return apiService.get('/bookings/dates/search', {
      check_in_before: checkInBefore,
      check_out_after: checkOutAfter,
    });
  },
};

// src/services/amenities.ts
import { apiService } from './api';

export interface Amenity {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: string;
  is_featured: boolean;
  is_active: boolean;
}

export const amenitiesService = {
  async getList(): Promise<Amenity[]> {
    return apiService.get('/amenities/list');
  },

  async getFeatured(): Promise<Amenity[]> {
    return apiService.get('/amenities/featured');
  },

  async getByCategory(category: string): Promise<Amenity[]> {
    return apiService.get(`/amenities/category/${category}`);
  },

  async getById(id: number): Promise<Amenity> {
    return apiService.get(`/amenities/${id}`);
  },
};

// src/services/images.ts
import { apiService } from './api';

export interface Image {
  key: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export const imagesService = {
  async getList(): Promise<Image[]> {
    return apiService.get('/images/list');
  },

  async upload(file: File, directory = 'uploads'): Promise<Image> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);

    return apiService.client.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async delete(key: string): Promise<any> {
    return apiService.delete(`/images/${key}`);
  },
};

// src/services/auth.ts
import { apiService } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await apiService.post('/auth/login', { username, password });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async verify(token: string): Promise<{ valid: boolean; user: User }> {
    return apiService.post('/auth/verify', { token });
  },

  logout(): void {
    localStorage.removeItem('auth_token');
  },

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};
```

### 4. React Hooks

```typescript
// src/hooks/useBookings.ts
import { useState, useEffect } from 'react';
import { bookingsService, Booking } from '../services/bookings';

export const useBookings = (limit = 50, offset = 0) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingsService.getList(limit, offset);
        setBookings(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [limit, offset]);

  return { bookings, loading, error };
};

// src/hooks/useAmenities.ts
import { useState, useEffect } from 'react';
import { amenitiesService, Amenity } from '../services/amenities';

export const useAmenities = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        setLoading(true);
        const data = await amenitiesService.getList();
        setAmenities(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load amenities');
      } finally {
        setLoading(false);
      }
    };

    loadAmenities();
  }, []);

  return { amenities, loading, error };
};

// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService, User } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getStoredToken();
        if (token) {
          const result = await authService.verify(token);
          if (result.valid) {
            setUser(result.user);
            setAuthenticated(true);
          } else {
            authService.logout();
          }
        }
      } catch (err) {
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    setUser(result.user);
    setAuthenticated(true);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setAuthenticated(false);
  };

  return { user, authenticated, loading, login, logout };
};
```

### 5. Component Examples

```typescript
// src/components/BookingsList.tsx
import React from 'react';
import { useBookings } from '../hooks/useBookings';

export const BookingsList: React.FC = () => {
  const { bookings, loading, error } = useBookings(50, 0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Recent Bookings</h2>
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Guest</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.booking_reference}</td>
              <td>{booking.first_name} {booking.last_name}</td>
              <td>{new Date(booking.check_in).toLocaleDateString()}</td>
              <td>{new Date(booking.check_out).toLocaleDateString()}</td>
              <td>
                <span className={`badge badge-${booking.status}`}>
                  {booking.status}
                </span>
              </td>
              <td>${booking.total_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// src/components/AmenitiesList.tsx
import React from 'react';
import { useAmenities } from '../hooks/useAmenities';

export const AmenitiesList: React.FC = () => {
  const { amenities, loading, error } = useAmenities();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="amenities-grid">
      {amenities.map((amenity) => (
        <div key={amenity.id} className="amenity-card">
          <div className="amenity-icon">{amenity.icon}</div>
          <h3>{amenity.name}</h3>
          <p>{amenity.description}</p>
          <span className="badge">{amenity.category}</span>
        </div>
      ))}
    </div>
  );
};
```

### 6. Environment Setup

Create `.env.local`:

```
VITE_API_BASE_URL=https://booking-engine-api.danielsantosomarketing2017.workers.dev/api
VITE_IMAGE_BUCKET_URL=https://imageroom.s3.us-east-1.amazonaws.com
```

Update `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api',
  IMAGE_BUCKET_URL: import.meta.env.VITE_IMAGE_BUCKET_URL || '',
  TIMEOUT: 30000,
};
```

## Migration Checklist

- [ ] Update API configuration with correct Worker URL
- [ ] Create/update API service layer
- [ ] Create resource services (bookings, amenities, auth, images)
- [ ] Create custom React hooks
- [ ] Update React components to use new hooks
- [ ] Update image URLs to use R2 bucket
- [ ] Test authentication flow
- [ ] Test all API endpoints
- [ ] Add error handling and logging
- [ ] Test pagination
- [ ] Test image upload functionality
- [ ] Deploy frontend to Cloudflare Pages

## Testing

```bash
# Test bookings API
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/bookings/list

# Test amenities API
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/amenities/list

# Test authentication
curl -X POST https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Test image list
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/images/list
```

## Troubleshooting

**CORS Errors**: The API includes CORS headers for all requests. If you still see CORS errors:
1. Check browser console for specific error
2. Verify the Worker is deployed correctly
3. Clear browser cache

**404 Errors**: 
1. Verify the API endpoint path is correct
2. Check that the Worker is running
3. Verify database connection

**Authentication Issues**:
1. Verify username/password are correct
2. Check that token is being stored in localStorage
3. Verify token is being sent in Authorization header

**Image Upload Issues**:
1. Check file size limits
2. Verify R2 bucket permissions
3. Check CORS configuration for multipart/form-data

## Performance Tips

1. Implement pagination for bookings list
2. Cache amenities data on client side
3. Use image lazy loading
4. Implement request debouncing for search
5. Monitor API response times with analytics
