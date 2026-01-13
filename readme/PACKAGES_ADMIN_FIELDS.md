# Packages Admin Dashboard - Field Mapping Documentation

This document maps all fields between the Admin Dashboard UI (PackagesSection), API endpoints, and database columns for Packages management.

---

## Overview

- **Frontend Component**: `src/components/admin/PackagesSection.tsx`
- **API Route**: `src/workers/routes/packages.ts`
- **API Endpoint**: `/api/packages`
- **Database Table**: `packages`

---

## Package Main Fields

### Create Form (`createFormData`)

| UI Label | Form State | API Sends | DB Column | Status |
|----------|------------|-----------|-----------|--------|
| Name | `createFormData.name` | `name` | `name` | ✅ Working |
| Description | `createFormData.description` | `description` | `description` | ✅ Working |
| Type | `createFormData.type` | `type` | `package_type` | ✅ Working |
| Base Room | `createFormData.base_room_id` | `base_room_id` | `base_room_id` | ✅ Working |
| Base Price | `createFormData.base_price` | `base_price` | `base_price` | ✅ Working |
| Min Nights | `createFormData.min_nights` | `min_nights` | `min_nights` | ✅ Working |
| Max Nights | `createFormData.max_nights` | `max_nights` | `max_nights` | ✅ Working |
| Max Guests | `createFormData.max_guests` | `max_guests` | `max_guests` | ✅ Working |
| Discount % | `createFormData.discount_percentage` | `discount_percentage` | `discount_percentage` | ✅ Working |
| Active | `createFormData.is_active` | `is_active` | `is_active` | ✅ Working |
| Featured | `createFormData.featured` | `featured` | `is_featured` | ✅ Working |
| Inclusions | `createFormData.inclusions` | `inclusions` | `inclusions` (JSON) | ✅ Working |
| Exclusions | `createFormData.exclusions` | `exclusions` | `exclusions` (JSON) | ✅ Working |

---

### Edit Form (`packageFormData`)

| UI Label | Form State | API Sends | DB Column | Status |
|----------|------------|-----------|-----------|--------|
| Name | `packageFormData.name` | `name` | `name` | ✅ Working |
| Description | `packageFormData.description` | `description` | `description` | ✅ Working |
| Type | `packageFormData.type` | `package_type` | `package_type` | ✅ Working |
| Price | `packageFormData.price` | `base_price` | `base_price` | ✅ Working |
| Duration Days | `packageFormData.duration_days` | `min_nights` | `min_nights` | ✅ Working |
| Max Guests | `packageFormData.max_guests` | `max_guests` | `max_guests` | ✅ Working |
| Available | `packageFormData.available` | `is_active` (0/1) | `is_active` | ✅ Working |
| Base Room | `packageFormData.base_room_id` | `base_room_id` | `base_room_id` | ✅ Working |
| Inclusions | `packageFormData.inclusions` | `includes` (JSON string) | `inclusions` | ✅ Working |
| Exclusions | `packageFormData.exclusions` | `exclusions` (JSON string) | `exclusions` | ✅ Working |
| Images | `packageFormData.images` | `images` (JSON string) | `images` | ✅ Working |
| Valid From | `packageFormData.valid_from` | `valid_from` | `valid_from` | ✅ Working |
| Valid Until | `packageFormData.valid_until` | `valid_until` | `valid_until` | ✅ Working |
| Terms & Conditions | `packageFormData.terms_conditions` | `terms_conditions` | `terms_conditions` | ✅ Working |

---

## API Endpoints

### Packages CRUD

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/packages` | List all active packages | ✅ Working |
| GET | `/api/packages/:id` | Get single package | ✅ Working |
| POST | `/api/packages` | Create new package | ✅ Working |
| PUT | `/api/packages` | Update package (requires `id` in body) | ✅ Working |
| DELETE | `/api/packages` | Delete package (requires `id` in body) | ✅ Working |

---

### Package Rooms Management

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/packages/:id/rooms` | Get rooms for package | ✅ Working |
| POST | `/api/packages/:id/rooms` | Add room to package | ✅ Working |
| PUT | `/api/packages/rooms/:id` | Update room relationship | ✅ Working |
| DELETE | `/api/packages/rooms/:id` | Remove room from package (soft delete) | ✅ Working |

#### Package Room Fields

| Field | API Sends | DB Column | Description |
|-------|-----------|-----------|-------------|
| `room_id` | `room_id` | `room_id` | Room to add |
| `is_default` | `is_default` | `is_default` | Default room for package |
| `price_adjustment` | `price_adjustment` | `price_adjustment` | Price modifier |
| `adjustment_type` | `adjustment_type` | `adjustment_type` | 'fixed' or 'percentage' |
| `availability_priority` | `availability_priority` | `availability_priority` | Room priority order |
| `max_occupancy_override` | `max_occupancy_override` | `max_occupancy_override` | Override max guests |
| `description` | `description` | `description` | Custom description |

---

### Package Amenities Management

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/packages/:id/amenities` | Get amenities for package | ✅ Working |
| POST | `/api/packages/:id/amenities` | Add amenity to package | ✅ Working |
| DELETE | `/api/packages/:id/amenities/:amenityId` | Remove amenity (soft delete) | ✅ Working |

#### Package Amenity Fields

| Field | API Sends | DB Column | Description |
|-------|-----------|-----------|-------------|
| `amenity_id` | `amenity_id` | `amenity_id` | Amenity to add |
| `is_highlighted` | `is_highlighted` | `is_highlighted` | Featured amenity flag |

---

### Package Inclusions Management

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/packages/:id/inclusions` | Get inclusions for package | ✅ Working |
| POST | `/api/packages/:id/inclusions` | Add inclusion to package | ✅ Working |
| DELETE | `/api/packages/:id/inclusions/:inclusionId` | Remove inclusion (soft delete) | ✅ Working |

#### Package Inclusion Fields

| Field | API Sends | DB Column | Description |
|-------|-----------|-----------|-------------|
| `inclusion_id` | `inclusion_id` | `inclusion_id` | Inclusion to add |

---

## Database Schema

### `packages` Table

```sql
CREATE TABLE packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    package_type TEXT DEFAULT 'Romance',
    base_price REAL DEFAULT 0,
    discount_percentage REAL DEFAULT 0,
    min_nights INTEGER DEFAULT 1,
    max_nights INTEGER DEFAULT 30,
    max_guests INTEGER DEFAULT 2,
    base_room_id INTEGER,
    is_active INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    inclusions TEXT,           -- JSON array
    exclusions TEXT,           -- JSON array
    images TEXT,               -- JSON array
    valid_from TEXT,           -- Date string
    valid_until TEXT,          -- Date string
    terms_conditions TEXT,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (base_room_id) REFERENCES rooms(id)
);
```

### `package_rooms` Table

```sql
CREATE TABLE package_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    is_default INTEGER DEFAULT 0,
    price_adjustment REAL DEFAULT 0,
    adjustment_type TEXT DEFAULT 'fixed',
    availability_priority INTEGER DEFAULT 1,
    max_occupancy_override INTEGER,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

### `package_amenities` Table

```sql
CREATE TABLE package_amenities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id INTEGER NOT NULL,
    amenity_id INTEGER NOT NULL,
    is_highlighted INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (amenity_id) REFERENCES amenities(id)
);
```

### `package_inclusions` Table

```sql
CREATE TABLE package_inclusions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id INTEGER NOT NULL,
    inclusion_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (inclusion_id) REFERENCES inclusions(id)
);
```

---

## Marketing Categories

Packages can be categorized by type. Marketing categories are fetched from `/api/marketing-categories`.

| Default Categories | Slug |
|-------------------|------|
| Romance | `romance` |
| Family | `family` |
| Adventure | `adventure` |
| Business | `business` |
| Wellness | `wellness` |

---

## Frontend Component State

### `PackagesSection.tsx` State Variables

| State | Type | Purpose |
|-------|------|---------|
| `packages` | `any[]` | List of all packages |
| `rooms` | `any[]` | List of available rooms |
| `loading` | `boolean` | Loading state |
| `editingPackage` | `any` | Package being edited |
| `showCreateModal` | `boolean` | Create modal visibility |
| `calendarManagerOpen` | `boolean` | Calendar manager modal |
| `selectedPackageForCalendar` | `object` | Package for calendar editing |
| `roomsManagerOpen` | `boolean` | Rooms manager modal |
| `selectedPackageForRooms` | `object` | Package for room editing |
| `amenities` | `any[]` | Available amenities |
| `selectedPackageForAmenities` | `object` | Package for amenity editing |
| `showAmenitiesModal` | `boolean` | Amenities modal visibility |
| `packageAmenities` | `any[]` | Amenities assigned to package |
| `inclusions` | `any[]` | Available inclusions |
| `selectedPackageForInclusions` | `object` | Package for inclusion editing |
| `showInclusionsModal` | `boolean` | Inclusions modal visibility |
| `packageInclusions` | `any[]` | Inclusions assigned to package |
| `showImagePicker` | `boolean` | Image picker modal |
| `marketingCategories` | `any[]` | Marketing category options |

---

## Field Name Mapping Reference

### Create → API → Database

| Create Form | API Body | Database |
|-------------|----------|----------|
| `name` | `name` | `name` |
| `description` | `description` | `description` |
| `type` | `type` | `package_type` |
| `base_room_id` | `base_room_id` | `base_room_id` |
| `base_price` | `base_price` | `base_price` |
| `min_nights` | `min_nights` | `min_nights` |
| `max_nights` | `max_nights` | `max_nights` |
| `max_guests` | `max_guests` | `max_guests` |
| `discount_percentage` | `discount_percentage` | `discount_percentage` |
| `is_active` | `is_active` | `is_active` |
| `featured` | `featured` | `is_featured` |
| `inclusions[]` | `inclusions` (JSON) | `inclusions` |
| `exclusions[]` | `exclusions` (JSON) | `exclusions` |

### Edit Form → API → Database

| Edit Form | API Body | Database |
|-----------|----------|----------|
| `name` | `name` | `name` |
| `description` | `description` | `description` |
| `type` | `package_type` | `package_type` |
| `price` | `base_price` | `base_price` |
| `duration_days` | `min_nights` | `min_nights` |
| `max_guests` | `max_guests` | `max_guests` |
| `available` | `is_active` (0/1) | `is_active` |
| `base_room_id` | `base_room_id` | `base_room_id` |
| `inclusions[]` | `includes` (JSON string) | `inclusions` |
| `exclusions[]` | `exclusions` (JSON string) | `exclusions` |
| `images[]` | `images` (JSON string) | `images` |
| `valid_from` | `valid_from` | `valid_from` |
| `valid_until` | `valid_until` | `valid_until` |
| `terms_conditions` | `terms_conditions` | `terms_conditions` |

---

## Notes

1. **JSON Fields**: `inclusions`, `exclusions`, and `images` are stored as JSON strings in the database
2. **Soft Deletes**: Package rooms, amenities, and inclusions use `is_active = 0` for soft deletes
3. **Type Mapping**: Frontend uses `type`, API converts to `package_type` for database
4. **Price Mapping**: Edit form uses `price`, API converts to `base_price` for database
5. **Duration Mapping**: Edit form uses `duration_days`, API converts to `min_nights` for database
6. **Boolean Mapping**: `available` converts to `is_active` (0 or 1)

---

## Bug Fixes History

### DELETE Request Body Not Parsed (Fixed 2026-01-12)

**Problem**: Package delete wasn't working - API returned error `Cannot destructure property 'id' of 'body' as it is null`

**Root Cause**: In `src/workers/index.ts`, the JSON body parsing only happened for `POST` and `PUT` methods:
```typescript
// BEFORE (broken)
if ((method === 'POST' || method === 'PUT') && path !== '/api/images/upload') {
```

**Solution**: Added `DELETE` to the body parsing condition:
```typescript
// AFTER (fixed)
if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && path !== '/api/images/upload') {
```

**Files Changed**: `src/workers/index.ts`

---

### Room Images Not Updating on Package Page (Fixed 2026-01-12)

**Problem**: After changing room images in admin dashboard, the package details page still showed old images or broken images.

**Root Cause**: In `src/pages/user/PackageDetails.tsx`, the room images were accessed as `roomImages[0]` directly. But the API returns an array of objects with `url` property:
```json
"images": [{"url": "https://...", "filename": "...", "is_primary": true}]
```

So `roomImages[0]` returned the whole object `{url: "..."}`, not the URL string.

**Solution**: Normalize the images array to handle both string arrays and object arrays:
```typescript
// BEFORE (broken)
const roomImages = room.images || [];
// Usage: roomImages[0] → returns object, not string

// AFTER (fixed)
const rawImages = room.images || [];
const roomImages = rawImages.map((img: any) => 
  typeof img === 'string' ? img : (img.url || img)
);
// Usage: roomImages[0] → returns URL string
```

**Files Changed**: `src/pages/user/PackageDetails.tsx`
