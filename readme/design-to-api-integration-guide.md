# Design ↔ API Integration Guide (Package-First UI)

## Purpose
Connect the Marriott-style package-first UI to our existing PHP API and TypeScript types, ensuring styling-only changes do not break data contracts.

## Key Pages and Components
- Page: `src/pages/PackageDetails.tsx`
- HTML Reference: `sandbox/marriott-room-pricing-layout.html`
- Types: `src/types.ts`
- Services: `src/services/packageService.ts`
- Config: `paths.buildApiUrl()`

## Data Flow Overview
1. Router loads `PackageDetails` using `packageId` from URL
2. Fetch package details via `packageService.getPackageById(packageId)`
3. Fetch inclusions via `package-inclusions.php?action=list&package_id={id}` (fallback to sample data if API not ready)
4. Render UI using `pkg`, `packageInclusions`, and derived values (prices, dates)

## API Endpoints

### 1) Package Details
- Endpoint: `api/packages.php?action=get&id={packageId}` (via `packageService`)
- Returns: `Package` (see Types below)

### 2) Package Inclusions
- Endpoint: `api/package-inclusions.php?action=list&package_id={packageId}`
- Returns:
```json
{
  "success": true,
  "inclusions": [
    { "inclusion_id": 1, "name": "Welcome Breakfast", "category": "meals", "icon": "coffee", "description": "..." }
  ]
}
```
- Fallback: If 404 or not available, component uses sample inclusions for `packageId === '1'`.

## TypeScript Data Contracts (src/types.ts)

### `Package`
Key fields used by the UI:
- `id`, `name`, `description`
- `type` | `package_type` (string)
- `price` | `base_price` (string)
- `discount_percentage` (string)
- `duration_days`, `min_nights`, `max_nights`
- `valid_from`, `valid_until`
- `available` (boolean-like)
- `max_guests` (number)
- `images` | `image_url`
- `amenities?: PackageAmenity[]`
- `available_rooms?: RoomOption[]`
- `room_selection_type?: 'single' | 'multiple' | 'upgrade'`
- `allow_room_upgrades?: boolean`
- `upgrade_price_calculation?: 'fixed' | 'percentage' | 'per_night'`
- `inclusions?: string[]` | `includes?: string[]` (legacy)
- `exclusions?: string[]`
- `cancellation_policy?: string`

### `RoomOption`
- `room_id`, `room_name`
- `is_default` (boolean)
- `price_adjustment` (number)
- `final_price` (number)
- `adjustment_type: 'fixed' | 'percentage'`
- `max_occupancy` (number)
- `availability_priority` (number)
- `description?`

### `PackageAmenity`
- `name`, `icon`, `category`, flags like `is_highlighted`

## UI ↔ Field Mapping

### Package Hero
- Title: `pkg.name`
- Category badge: `pkg.type || pkg.package_type`
- Description: `pkg.description`
- Image: first of `pkg.images[]` else `pkg.image_url` else type-based fallback
- Feature tags:
  - Duration: `pkg.duration_days` or `min_nights`-`max_nights`
  - Guests: `pkg.max_guests`
  - Discount: `pkg.discount_percentage`

### Package Overview + What's Included (compact)
- Overview text: `pkg.description`
- Inclusions tags: prefer `packageInclusions[].name`; fallback to `pkg.inclusions`/`pkg.includes`

### Room Selection (Row Style)
- Rows: `pkg.available_rooms` sorted by `availability_priority`
- Name: `room.room_name`
- Upgrade Price: `room.price_adjustment`
- Description: `room.description`
- Features: `room.max_occupancy` (capacity), plus static tags (size/view/bed) for minimal display
- Selected state: `room.is_default`

### Booking Summary (Sidebar)
- Package: `pkg.name`
- Room Type: derived UI state (default room or selected room)
- Nights: derived (example uses 2; integrate with booking flow later)
- Guests: `pkg.max_guests`
- Subtotal: `(basePrice + roomUpgrade) * nights`
- Taxes & Fees: `subtotal * 0.15` (example)
- Total: `subtotal + taxes`

## Date Handling
- `valid_from`, `valid_until`: render with `toLocaleDateString` and guard invalid/zero dates

## Icons
- Inclusions/amenities icons map via `getInclusionIcon()` / `getAmenityIcon()` using Lucide icon names.

## Fallbacks and Legacy Support
- If `pkg.images` missing, use `image_url` or type-based fallback map
- If `packageInclusions` endpoint is missing, use sample data for `packageId === '1'`
- If `available_rooms` missing, show sample rows (optional; current code includes examples)

## Integration Best Practices
1. Keep styling changes separated from data logic
2. Always prefer existing API fields over hard-coded values
3. Guard against missing/null fields with safe fallbacks
4. Derive pricing transparently (show base vs upgrade)
5. Use `paths.buildApiUrl()` for all API construction
6. Keep TypeScript types the source of truth for fields used in the UI

## Open Items / Future Wiring
- Nights and selected room should persist into booking flow
- Replace placeholder images for room rows with real `room.images` when API provides
- Add availability calendar integration (DayPicker) later

## Testing Checklist
- Package loads with real data (PackageService)
- Inclusions appear from API; fallback works
- Room rows render from `available_rooms`
- Booking summary calculates amounts and formats IDR correctly
- No TypeScript errors; dev server runs without crash
