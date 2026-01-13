# Cloudflare Workers API Documentation

## Overview
Your booking engine API is built with Cloudflare Workers, D1 database, and R2 storage.

## Configuration
- **Database:** D1 (71df7f17-943b-46dd-8870-2e7769a3c202)
- **R2 Bucket:** imageroom
- **KV Namespace (Sessions):** 91b758e307d8444091e468f6caa9ead3
- **KV Namespace (Cache):** ec304060e11b4215888430acdee7aafa

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Image Management (`/api/images/`)

#### Upload Image
```bash
POST /api/images/upload
Content-Type: multipart/form-data

Parameters:
- file: Image file (JPEG, PNG, WebP, AVIF, max 10MB)
- roomId: Room identifier (optional)
- type: 'room' | 'amenity' | 'hero' | 'gallery' (default: 'room')
```

**Response:**
```json
{
  "success": true,
  "filename": "room/villa-1/1704964800000-abc123.jpg",
  "url": "https://imageroom.account-id.r2.cloudflarestorage.com/room/villa-1/...",
  "size": 2048576,
  "type": "image/jpeg"
}
```

#### Get Image Info
```bash
GET /api/images/:key
```

#### Delete Image
```bash
DELETE /api/images/:key
```

#### List Images
```bash
GET /api/images/list/:prefix
# Example: /api/images/list/room/villa-1
```

### Bookings (`/api/bookings/`)

#### Get All Bookings
```bash
GET /api/bookings/list
```

#### Get Booking by ID
```bash
GET /api/bookings/:id
```

#### Get Booking by Reference
```bash
GET /api/bookings/reference/:ref
# Example: /api/bookings/reference/BK-999256
```

#### Create Booking
```bash
POST /api/bookings/create
Content-Type: application/json

{
  "booking_reference": "BK-123456",
  "room_id": "villa-1",
  "package_id": 17,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "check_in": "2026-01-20",
  "check_out": "2026-01-23",
  "guests": 2,
  "adults": 2,
  "children": 0,
  "total_price": 450.00,
  "currency": "USD",
  "special_requests": "Late checkout preferred",
  "source": "direct"
}
```

#### Update Booking Status
```bash
PUT /api/bookings/:id/status
Content-Type: application/json

{
  "status": "confirmed",
  "payment_status": "paid"
}
```

#### Search by Date Range
```bash
GET /api/bookings/search/by-dates?check_in=2026-01-20&check_out=2026-01-23
```

### Amenities (`/api/amenities/`)

#### Get All Amenities
```bash
GET /api/amenities/list
```

#### Get Amenities by Category
```bash
GET /api/amenities/category/:category
# Example: /api/amenities/category/wellness
```

#### Get Featured Amenities
```bash
GET /api/amenities/featured
```

#### Get Single Amenity
```bash
GET /api/amenities/:id
```

### Authentication (`/api/auth/`)

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@bookingengine.com",
    "role": "admin"
  }
}
```

#### Verify Token
```bash
POST /api/auth/verify
Authorization: Bearer <token>
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

## Local Development

### Build
```bash
npm run build
```

### Test Locally
```bash
npx wrangler dev
```

This starts a local server at `http://localhost:8787`

### Test API
```bash
curl http://localhost:8787/api/health
```

## Deployment

### Deploy to Cloudflare
```bash
npx wrangler deploy
```

### Remote Database Testing
Use the `--remote` flag to test against your live D1:
```bash
npx wrangler d1 execute booking-engine --command="SELECT COUNT(*) FROM bookings;" --remote
```

## Environment Variables

Add to `wrangler.toml` or `.env`:
```toml
[env.production]
vars = { 
  ENVIRONMENT = "production",
  JWT_SECRET = "your-secret-key"
}
```

## Security Notes

⚠️ **Important**: The current authentication implementation is simplified for development. For production:

1. Implement proper bcrypt password verification
2. Use a robust JWT library
3. Add CORS protection
4. Implement rate limiting
5. Add request validation middleware
6. Enable HTTPS only
7. Implement proper error handling without exposing sensitive data

## Database Schema

See [database/d1-schema.sql](../database/d1-schema.sql) for full schema.

Main tables:
- `users` - Admin users
- `bookings` - Booking records
- `amenities` - Property amenities
- `marketing_categories` - Package categories
- `homepage_settings` - Site configuration
- `api_logs` - API request logs
- `email_notifications` - Email queue
- `daily_analytics` - Analytics data

## Next Steps

1. ✅ Create Cloudflare Pages project
2. ✅ Deploy frontend to Pages
3. ⚠️ Implement proper password hashing
4. ⚠️ Add input validation middleware
5. ⚠️ Set up error tracking/logging
6. ⚠️ Configure CORS for frontend

