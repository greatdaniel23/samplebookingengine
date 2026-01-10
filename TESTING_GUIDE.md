# Testing & Quality Assurance Guide

## Automated Testing Setup

### 1. Install Testing Dependencies

```bash
npm install --save-dev vitest @vitest/ui happy-dom
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev nock  # HTTP mocking
```

### 2. Test Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### 3. API Service Tests

Create `src/services/__tests__/bookings.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import nock from 'nock';
import { bookingsService } from '../bookings';

const API_BASE = 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api';

describe('Bookings Service', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should fetch bookings list', async () => {
    const mockBookings = [
      {
        id: 1,
        booking_reference: 'BK-001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        check_in: '2024-12-20',
        check_out: '2024-12-25',
        guests: 2,
        total_price: 500,
        status: 'pending',
        payment_status: 'pending',
      }
    ];

    nock(API_BASE)
      .get('/bookings/list?limit=50&offset=0')
      .reply(200, { success: true, data: mockBookings });

    const bookings = await bookingsService.getList(50, 0);
    expect(bookings).toHaveLength(1);
    expect(bookings[0].booking_reference).toBe('BK-001');
  });

  it('should fetch single booking by ID', async () => {
    const mockBooking = {
      id: 1,
      booking_reference: 'BK-001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      check_in: '2024-12-20',
      check_out: '2024-12-25',
      guests: 2,
      total_price: 500,
      status: 'pending',
      payment_status: 'pending',
    };

    nock(API_BASE)
      .get('/bookings/1')
      .reply(200, { success: true, data: mockBooking });

    const booking = await bookingsService.getById(1);
    expect(booking.id).toBe(1);
    expect(booking.booking_reference).toBe('BK-001');
  });

  it('should create a new booking', async () => {
    const newBooking = {
      booking_reference: 'BK-002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      check_in: '2024-12-30',
      check_out: '2025-01-05',
      guests: 3,
      total_price: 750,
    };

    nock(API_BASE)
      .post('/bookings/create', newBooking)
      .reply(201, { 
        success: true, 
        data: { booking_reference: 'BK-002', message: 'Booking created successfully' } 
      });

    const result = await bookingsService.create(newBooking);
    expect(result.booking_reference).toBe('BK-002');
  });

  it('should update booking status', async () => {
    nock(API_BASE)
      .put('/bookings/1/status', { status: 'confirmed', payment_status: 'completed' })
      .reply(200, { 
        success: true, 
        data: { message: 'Booking status updated' } 
      });

    const result = await bookingsService.updateStatus(1, 'confirmed', 'completed');
    expect(result.message).toBe('Booking status updated');
  });

  it('should search bookings by date range', async () => {
    const mockBookings = [
      {
        id: 1,
        booking_reference: 'BK-001',
        check_in: '2024-12-22',
        check_out: '2024-12-24',
      }
    ];

    nock(API_BASE)
      .get('/bookings/dates/search?check_in_before=2024-12-25&check_out_after=2024-12-20')
      .reply(200, { success: true, data: mockBookings });

    const bookings = await bookingsService.searchByDates('2024-12-25', '2024-12-20');
    expect(bookings).toHaveLength(1);
  });

  it('should handle errors gracefully', async () => {
    nock(API_BASE)
      .get('/bookings/list')
      .reply(500, { success: false, error: 'Server error' });

    try {
      await bookingsService.getList();
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
```

Create `src/services/__tests__/amenities.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import nock from 'nock';
import { amenitiesService } from '../amenities';

const API_BASE = 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api';

describe('Amenities Service', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should fetch all amenities', async () => {
    const mockAmenities = [
      { id: 1, name: 'WiFi', category: 'connectivity', is_active: true, is_featured: true },
      { id: 2, name: 'Pool', category: 'recreation', is_active: true, is_featured: true },
    ];

    nock(API_BASE)
      .get('/amenities/list')
      .reply(200, { success: true, data: mockAmenities });

    const amenities = await amenitiesService.getList();
    expect(amenities).toHaveLength(2);
    expect(amenities[0].name).toBe('WiFi');
  });

  it('should fetch featured amenities', async () => {
    const mockAmenities = [
      { id: 1, name: 'WiFi', category: 'connectivity', is_featured: true },
      { id: 2, name: 'Pool', category: 'recreation', is_featured: true },
    ];

    nock(API_BASE)
      .get('/amenities/featured')
      .reply(200, { success: true, data: mockAmenities });

    const amenities = await amenitiesService.getFeatured();
    expect(amenities).toHaveLength(2);
  });

  it('should fetch amenities by category', async () => {
    const mockAmenities = [
      { id: 1, name: 'WiFi', category: 'connectivity' },
    ];

    nock(API_BASE)
      .get('/amenities/category/connectivity')
      .reply(200, { success: true, data: mockAmenities });

    const amenities = await amenitiesService.getByCategory('connectivity');
    expect(amenities[0].category).toBe('connectivity');
  });
});
```

### 4. React Component Tests

Create `src/components/__tests__/BookingsList.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { BookingsList } from '../BookingsList';

const API_BASE = 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api';

describe('BookingsList Component', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should render loading state initially', () => {
    nock(API_BASE)
      .get('/bookings/list?limit=50&offset=0')
      .delayConnection(100)
      .reply(200, { success: true, data: [] });

    render(<BookingsList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display bookings list', async () => {
    const mockBookings = [
      {
        id: 1,
        booking_reference: 'BK-001',
        first_name: 'John',
        last_name: 'Doe',
        check_in: '2024-12-20',
        check_out: '2024-12-25',
        status: 'pending',
        total_price: 500,
      }
    ];

    nock(API_BASE)
      .get('/bookings/list?limit=50&offset=0')
      .reply(200, { success: true, data: mockBookings });

    render(<BookingsList />);

    await waitFor(() => {
      expect(screen.getByText('BK-001')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });

  it('should display error message on failure', async () => {
    nock(API_BASE)
      .get('/bookings/list?limit=50&offset=0')
      .reply(500, { success: false, error: 'Server error' });

    render(<BookingsList />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
```

### 5. Test Scripts

Update `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

## Manual Testing Checklist

### Booking Endpoints
- [ ] GET /api/bookings/list - List all bookings
- [ ] GET /api/bookings/:id - Get single booking
- [ ] GET /api/bookings/ref/:reference - Get booking by reference
- [ ] POST /api/bookings/create - Create new booking
- [ ] PUT /api/bookings/:id/status - Update booking status
- [ ] GET /api/bookings/dates/search - Search bookings by dates

### Amenities Endpoints
- [ ] GET /api/amenities/list - List all amenities
- [ ] GET /api/amenities/featured - Get featured amenities
- [ ] GET /api/amenities/category/:name - Get amenities by category
- [ ] GET /api/amenities/:id - Get single amenity

### Authentication Endpoints
- [ ] POST /api/auth/login - Admin login
- [ ] POST /api/auth/verify - Verify token
- [ ] Token storage in localStorage
- [ ] Token refresh on page reload

### Images Endpoints
- [ ] GET /api/images/list - List all images
- [ ] POST /api/images/upload - Upload new image
- [ ] DELETE /api/images/:key - Delete image
- [ ] Image URL generation

### Admin Endpoints
- [ ] GET /api/admin/dashboard - Get dashboard stats
- [ ] GET /api/admin/analytics - Get analytics data

## Performance Testing

### Load Testing with k6

Create `loadtest.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  // Test bookings list endpoint
  let res = http.get(
    'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/bookings/list'
  );
  check(res, { 'bookings status was 200': (r) => r.status == 200 });

  // Test amenities endpoint
  res = http.get(
    'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/amenities/list'
  );
  check(res, { 'amenities status was 200': (r) => r.status == 200 });

  // Test admin dashboard
  res = http.get(
    'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/admin/dashboard'
  );
  check(res, { 'admin dashboard was 200': (r) => r.status == 200 });

  sleep(1);
}
```

Run with: `k6 run loadtest.js`

## Security Testing

### OWASP Top 10 Checklist

- [ ] **SQL Injection**: All queries use parameterized statements
- [ ] **Authentication**: JWT token validation implemented
- [ ] **XSS Protection**: Input validation in place
- [ ] **CSRF Protection**: CORS configured
- [ ] **Sensitive Data Exposure**: HTTPS enforced
- [ ] **Broken Access Control**: Admin routes verified
- [ ] **XXE Prevention**: XML parsing hardened
- [ ] **Broken Cryptography**: Password hashing implemented
- [ ] **Component Vulnerabilities**: Dependencies updated
- [ ] **Insufficient Logging**: API logging enabled

## Monitoring

### Cloudflare Analytics

1. Go to Cloudflare Dashboard
2. Select your account
3. Navigate to Analytics > Workers
4. Monitor:
   - Request count
   - Response times
   - Error rates
   - Bandwidth usage

### Custom Logging

Add to Worker:

```typescript
// Log requests to KV for monitoring
async function logRequest(env: Env, endpoint: string, method: string, status: number) {
  const log = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    status,
  };
  await env.SESSIONS.put(
    `log:${Date.now()}`,
    JSON.stringify(log),
    { expirationTtl: 86400 } // 24 hours
  );
}
```

## Deployment Testing

### Pre-deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] No console errors
- [ ] No security warnings
- [ ] Performance metrics acceptable
- [ ] CORS headers correct
- [ ] Database queries optimized
- [ ] Environment variables configured
- [ ] Error handling implemented
- [ ] Logging enabled
- [ ] Documentation updated

### Canary Deployment

1. Deploy to staging environment first
2. Run full test suite
3. Performance test with production data
4. Monitor for 24 hours
5. Deploy to production if stable

## Rollback Plan

If issues arise after deployment:

```bash
# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler deploy --config wrangler-api.toml --compatibility-date <date>
```

## Continuous Integration

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Monitoring Dashboard

Recommended tools:
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot
- **Performance**: New Relic / Datadog
- **Logging**: LogRocket
- **Analytics**: Mixpanel / Amplitude
