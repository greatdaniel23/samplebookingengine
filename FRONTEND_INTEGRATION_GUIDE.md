# Frontend Integration Guide

## Quick Start - Update Your React App

### Step 1: Update API Base URL

In your frontend config (e.g., `src/config.ts` or `src/services/api.ts`):

```typescript
export const API_BASE_URL = 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api';

// Example API client
export const apiClient = {
  bookings: {
    list: () => fetch(`${API_BASE_URL}/bookings/list`),
    get: (id) => fetch(`${API_BASE_URL}/bookings/${id}`),
    getByRef: (ref) => fetch(`${API_BASE_URL}/bookings/reference/${ref}`),
    create: (data) => fetch(`${API_BASE_URL}/bookings/create`, { method: 'POST', body: JSON.stringify(data) }),
  },
  amenities: {
    list: () => fetch(`${API_BASE_URL}/amenities/list`),
    featured: () => fetch(`${API_BASE_URL}/amenities/featured`),
    byCategory: (cat) => fetch(`${API_BASE_URL}/amenities/category/${cat}`),
  },
  health: () => fetch(`${API_BASE_URL}/health`),
};
```

### Step 2: Update Image URLs

Replace `public/images/` paths with R2 URLs:

```typescript
// Old
const imageUrl = `/images/hero/DSC05979.JPG`;

// New
const imageUrl = `https://imageroom.${ACCOUNT_ID}.r2.cloudflarestorage.com/hero/DSC05979.JPG`;

// Or set up image base URL
const IMAGE_BASE = `https://imageroom.${ACCOUNT_ID}.r2.cloudflarestorage.com`;
```

### Step 3: Test API Connection

```typescript
// In your app initialization
useEffect(() => {
  fetch(`${API_BASE_URL}/health`)
    .then(r => r.json())
    .then(data => console.log('API healthy:', data))
    .catch(err => console.error('API error:', err));
}, []);
```

---

## Common API Calls

### Get All Bookings
```typescript
const fetchBookings = async () => {
  const response = await fetch(`${API_BASE_URL}/bookings/list`);
  const { results } = await response.json();
  return results; // Array of 24 bookings
};
```

### Create a Booking
```typescript
const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE_URL}/bookings/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_reference: 'BK-XXXXX',
      room_id: 'villa-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      check_in: '2026-01-20',
      check_out: '2026-01-23',
      guests: 2,
      adults: 2,
      children: 0,
      total_price: 300.00,
    }),
  });
  return response.json();
};
```

### Get All Amenities
```typescript
const fetchAmenities = async () => {
  const response = await fetch(`${API_BASE_URL}/amenities/list`);
  const { results } = await response.json();
  return results; // Array of 56 amenities
};
```

### Get Featured Amenities
```typescript
const fetchFeaturedAmenities = async () => {
  const response = await fetch(`${API_BASE_URL}/amenities/featured`);
  const { results } = await response.json();
  return results; // Only featured amenities
};
```

### Get Amenities by Category
```typescript
const fetchByCategory = async (category) => {
  const response = await fetch(`${API_BASE_URL}/amenities/category/${category}`);
  const { results } = await response.json();
  return results; // e.g., category = 'wellness'
};
```

---

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "meta": {
    "served_by": "v3-prod",
    "served_by_region": "APAC",
    "served_by_colo": "SIN",
    "duration": 0.4848,
    "rows_read": 48,
    "size_after": 163840
  },
  "results": [
    {
      "id": 68,
      "booking_reference": "BK-467566",
      ...
    }
  ]
}
```

Extract data:
```typescript
const response = await fetch(`${API_BASE_URL}/bookings/list`);
const { results } = await response.json();
const bookings = results;
```

---

## Environment Variables

Create `.env` file:
```env
REACT_APP_API_URL=https://booking-engine-api.danielsantosomarketing2017.workers.dev/api
REACT_APP_IMAGE_BUCKET=https://imageroom.${ACCOUNT_ID}.r2.cloudflarestorage.com
```

Use in code:
```typescript
const API_URL = process.env.REACT_APP_API_URL;
const IMAGE_BUCKET = process.env.REACT_APP_IMAGE_BUCKET;
```

---

## Error Handling

```typescript
const apiCall = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(error.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    // Handle error in UI
    return null;
  }
};
```

---

## Performance Tips

1. **Cache responses** - Use React Query or SWR for caching
2. **Batch requests** - Group multiple API calls
3. **Use pagination** - API returns paginated results
4. **Implement retry logic** - Retry failed requests
5. **Monitor performance** - Log API response times

Example with React Query:
```typescript
import { useQuery } from '@tanstack/react-query';

function Bookings() {
  const { data, isLoading, error } = useQuery(
    ['bookings'],
    () => fetch(`${API_BASE_URL}/bookings/list`).then(r => r.json()),
    { staleTime: 60000 } // 1 minute cache
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data.results.map(booking => (
        <div key={booking.id}>{booking.booking_reference}</div>
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### API Returns 404
Check the endpoint URL and path

### CORS Errors
The API needs CORS headers added (to be implemented)

### Database Errors
Check D1 is responding:
```bash
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/test/bookings
```

### R2 Errors
Check bucket is accessible:
```bash
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/test/r2
```

---

## Testing

Quick test with curl:
```bash
# Health check
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/health

# Get bookings
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/bookings/list

# Get amenities
curl https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/amenities/list
```

---

## Production Checklist

- [ ] Update all API URLs
- [ ] Update image paths
- [ ] Add error handling
- [ ] Implement caching
- [ ] Add loading states
- [ ] Test all endpoints
- [ ] Test on different networks
- [ ] Test on mobile devices
- [ ] Set up error logging
- [ ] Deploy to Cloudflare Pages

---

**API Status:** ✅ LIVE  
**Last Updated:** January 8, 2026
