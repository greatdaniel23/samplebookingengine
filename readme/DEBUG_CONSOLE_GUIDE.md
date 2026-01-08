# FRONTEND + API DEBUG CONSOLE GUIDE

_Last Updated: 2025-11-21_

## 🎯 Purpose
A clear, repeatable way to debug data flow between APIs (PHP) and the React frontend. This guide standardizes console logging, how to inspect each data source, how to clear noise, and how to validate state updates.

---
## 📄 Source Files Emitting Console Output (Development Only)
The following source files contain `console.*` statements used for diagnostics while developing. In production builds these are fully suppressed at startup by the override block in `src/main.tsx` (executed before any side-effect imports), so end users do not see them.

**Hooks**
- `src/hooks/useVillaInfo.tsx`
- `src/hooks/useRooms.tsx`
- `src/hooks/usePackages.tsx`
- `src/hooks/useIndexPageData.tsx`
- `src/hooks/useHomepageContent.tsx`

**Pages**
- `src/pages/Booking.tsx`
- `src/pages/BookingSummary.tsx`
- `src/pages/ApiDebug.tsx`
- `src/pages/AdminPanel.tsx` (and `AdminPanel.tsx.backup`)
- `src/pages/Admin.tsx`
- `src/pages/AdminCalendar.tsx`
- `src/pages/Packages.tsx`
- `src/pages/PackageDetails.tsx`
- `src/pages/NotFound.tsx`

**Components**
- `src/components/Footer.tsx`

**Services**
- `src/services/api.js`
- `src/services/calendarService.ts`
- `src/services/villaService.ts`
- `src/services/packageService.ts`

**Utilities / Diagnostics**
- `src/utils/debugLogger.ts`
- `src/diagnostic.ts`
- (Suppression entry point) `src/main.tsx`

If further cleanup is desired you can: (a) wrap calls with `if (import.meta.env.DEV)`, (b) replace them with a no-op debug utility, or (c) remove them entirely after feature stabilization.

---
## 🗂 Data Sources Overview
| Source | Endpoint / Hook | Shape | Primary Use |
|--------|-----------------|-------|-------------|
| Villa Info API | `GET /api/villa.php` | `{ success, data: Villa }` | Core property data (homepage, footer) |
| Homepage API | `GET /api/homepage.php` | `{ success, data: HomepageMapped }` | Hero + composite homepage content |
| Rooms API | `ApiService.getRooms()` (rooms.php) | `Room[]` | Inventory listing & booking flow |
| Packages API | `packageService.getPackages()` (packages.php) | `Package[]` (filtered) | Marketing offers |

### Villa Structure (Processed in `useVillaInfo`):
```ts
interface VillaInfo {
  id: number; name: string; location: string; description: string;
  rating: number; reviews: number; images: string[];
  amenities: { name: string; icon: string; }[];
  phone: string; email: string; website: string;
  address: string; city: string; state: string; zipCode: string; country: string;
  checkInTime: string; checkOutTime: string;
  maxGuests: number; bedrooms: number; bathrooms: number; pricePerNight: number; currency: string;
  cancellationPolicy: string; houseRules: string;
  socialMedia: { facebook?: string; instagram?: string; twitter?: string };
}
```

### Homepage Mapped Format (`homepage.php`):
```json
{
  "id": 1,
  "hero_title": "...",
  "hero_subtitle": "...",
  "hero_description": "...",
  "property_name": "...",
  "property_location": "...",
  "property_description": "...",
  "property_rating": 4.9,
  "property_reviews": 128,
  "contact_phone": "+62 ...",
  "address_city": "Bali",
  "spec_max_guests": 8,
  "images": ["https://..."],
  "amenities": [{"name": "Wifi", "icon": "Bath"}],
  "updated_at": "2025-11-20 ..."
}
```

---
## 🔍 Key Hooks & Their Logs

### 1. `useVillaInfo`
Logs produced:
- `🏨 Fetching villa info from:` (endpoint used)
- `🏨 Villa API response:` (raw JSON returned)
- `🏨 Villa name from API:` (key field check)
- `🏨 Villa updated_at:` (timestamp for freshness)
- `✅ Frontend state updated with villa name:` (confirmation of React state assignment)
- `🚨 Villa info fetch error:` (network / parsing failures)

Debug Validation Checklist:
1. Verify network call appears in browser devtools → Network tab
2. Confirm `success: true` in response JSON
3. Check for expected mandatory fields: `name`, `address`, `images`
4. If undefined fields → inspect server mapping in `villa.php`

### 2. `useIndexPageData`
Responsibilities:
- Aggregates rooms, packages, villaInfo
- Normalizes amenity formats
- Provides `currentVillaData`, `safeRooms`, `safePackages`

Console Indicators:
- `🚨 No villa data from API` → villaInfo missing or failed
- Warnings for non-array responses for rooms/packages

### 3. `usePackages`
Logs produced:
- `🔍 usePackages: Raw data from API:` initial response
- Per package availability decision: `🔍 Package {id} ({name}): available=... isActive=...`
- Final filtered list: `✅ usePackages: Active packages after filtering:`
- Summary: `📊 usePackages: Filtered X packages down to Y active packages`
- Warning if no active: `⚠️ WARNING: No active packages found!`

### 4. `useRooms`
Logs produced:
- `Fetched rooms data:` raw array
- Errors: `Rooms data is not an array:` or `Error in fetchRooms:`

---
## 🧪 End-to-End Debug Flow

1. Open browser devtools (F12) → Console + Network tabs
2. Hard refresh (`Ctrl+Shift+R`) to bypass browser cache
3. Observe initial logs order:
   - Villa fetch
   - Rooms fetch
   - Packages fetch
4. Confirm each network call returns HTTP 200
5. Expand each response body → validate required keys
6. If villa missing some fields → compare against `villa.php` JSON shaping section
7. If homepage values stale → test `GET /api/homepage.php` directly

---
## 🛠 API Direct Testing (PowerShell)
```powershell
Invoke-WebRequest "https://api.rumahdaisycantik.com/villa.php" | Select-Object -ExpandProperty Content
Invoke-WebRequest "https://api.rumahdaisycantik.com/homepage.php" | Select-Object -ExpandProperty Content
Invoke-WebRequest "https://api.rumahdaisycantik.com/check-columns.php" | Select-Object -ExpandProperty Content
```

---
## 🧼 Clearing Console Noise
Use grouping + style for new logs:
```ts
console.group('%cVilla Fetch','color: #2563eb; font-weight:600');
console.log('Endpoint:', url);
console.log('Payload:', data);
console.groupEnd();
```
Clear console manually before a new test:
```ts
console.clear();
```

Add a global debug flag pattern:
```ts
// src/utils/debug.ts
export const DEBUG = true; // toggle false in production
export const logDebug = (...args: any[]) => { if (DEBUG) console.log(...args); };
```
Usage:
```ts
import { logDebug } from '@/utils/debug';
logDebug('Villa payload', data);
```

---
## 🧩 Common Issues & Resolutions
| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| `Failed to fetch` | CORS or network | Check headers in PHP (Access-Control-Allow-*) |
| Missing `postal_code` | Column mismatch | Confirm DB schema; map to zipCode only if exists |
| Amenities raw characters | Bad JSON decode | Ensure `amenities` stored as valid JSON array |
| Stale footer info | Cached fetch | Added `cache: 'no-cache'` + Cache-Control in headers |
| `Non-JSON response` | Server error / HTML output | Inspect response body → check PHP error log |

---
## ✅ Quick Verification Script (In Browser Console)
```js
(async () => {
  const endpoints = ['villa.php','homepage.php'];
  for (const ep of endpoints) {
    try {
      const url = `https://api.rumahdaisycantik.com/${ep}`;
      const res = await fetch(url, { cache: 'no-cache' });
      const json = await res.json();
      console.group(`%c${ep}`,`color:#10b981;font-weight:600`);
      console.log('Status:', res.status);
      console.log('Success:', json.success);
      console.log('Keys:', Object.keys(json.data || {}));
      console.log('Sample:', json.data?.name || json.data?.hero_title);
      console.groupEnd();
    } catch (e) {
      console.group(`%c${ep} ERROR`,`color:#ef4444;font-weight:600`);
      console.error(e);
      console.groupEnd();
    }
  }
})();
```

---
## 🧪 Field Presence Checklist (Villa)
| Field | Required | Fallback Behavior |
|-------|----------|-------------------|
| name | Yes | Shows placeholder if missing |
| description | Strongly | "Description not available" |
| images | Recommended | Empty array → skeleton UI |
| amenities | Optional | Empty array → hide amenities section |
| phone/email | Recommended | UI shows defaults if missing |
| address + city + country | Recommended | Fallback to default text |

---
## 🧱 Suggested Improvements (Optional)
- Convert ad-hoc `console.log` to `logDebug` utility
- Add `console.table` for `rooms` & `packages`
- Integrate network timing: `performance.now()` deltas
- Add React DevTools Profiler passes for initial load
- Track last successful villa fetch timestamp in state

---
## 🚀 Debug Session Template
```text
[Start] console.clear()
[Step 1] Load page, watch villa/rooms/packages calls
[Step 2] Validate JSON shapes
[Step 3] Trigger manual refresh (footer button if present)
[Step 4] Re-verify changed fields (phone, address, images)
[Step 5] Record anomalies + endpoint + raw payload
[End] Create issue ticket with captured logs & payload
```

---
## 📦 Minimal Logging Utility (Optional Add)
```ts
// src/utils/debugLogger.ts
export const DEBUG_GROUP_STYLE = 'background:#1e293b;color:#fff;padding:2px 6px;border-radius:4px;';
export const debugGroup = (name: string, fn: () => void) => {
  console.group('%c' + name, DEBUG_GROUP_STYLE);
  try { fn(); } finally { console.groupEnd(); }
};
export const debugValue = (label: string, value: any) => console.log(label + ':', value);
```

---
## ✅ Summary
You now have a standardized, repeatable console-based workflow to:
- Inspect each API independently
- Validate transformed frontend state
- Diagnose mapping / schema mismatches
- Reduce noise and group related logs

Use this document during any regression, data freshness, or integration issue.

---
## 🔁 Verification Checklist (Live Usage)

### Endpoints
| Endpoint | Expect HTTP | Critical Keys | Notes |
|----------|-------------|---------------|-------|
| `/api/villa.php` | 200 | `success,data.name,data.images` | `zipCode` derived from `postal_code` (may be empty) |
| `/api/homepage.php` | 200 | `success,data.hero_title,data.images` | Mirrors villa, adds hero_* fields |
| `/api/check-columns.php` | 200 | `columns[]` | Confirms DB schema (no max_guests if using reduced schema) |
| `/api/rooms.php` (optional) | 200 / 500 | Array of rooms | Requires rooms table creation |
| `/api/bookings.php` (optional) | 200 / 500 | booking objects | Requires bookings table creation |
| `/api/packages.php` (optional) | 200 | packages array | Filtered client-side for availability |

### Villa Data Field Verification
| Field | Source Column | Fallback Behavior |
|-------|---------------|------------------|
| name | `name` | Placeholder if missing (rare) |
| description | `description` | "Description not available" in UI |
| images | `images` (JSON) | Empty array → skeleton components |
| amenities | `amenities` (JSON) | Empty → hide amenities section |
| phone | `phone` | Default phone if blank |
| email | `email` | Default email if blank |
| location | constructed (city,state,country) | "Location not specified" |
| zipCode | `postal_code` | Empty string if missing |
| rating | default (4.9) | Hardcoded until rating system added |
| reviews | default (128) | Hardcoded until review system added |

### Homepage (Mapped) Field Verification
| Mapped Field | Origin | Notes |
|--------------|--------|-------|
| hero_title | `name` | Same as villa name |
| hero_description | `description` | May be truncated client-side |
| property_location | `location` or constructed | Unified format |
| property_rating | rating default | Not yet DB-driven |
| spec_max_guests | `max_guests` (if exists) | Skipped if column absent |
| images | `images` JSON | Should match villa set |
| amenities | `amenities` JSON | Same transformation rules |

### Room Data (Raw API → `Room` interface)
| Field | Notes |
|-------|-------|
| id | String identifier (e.g. `deluxe-suite`) |
| name | Display name |
| price | String; parse to number where needed |
| image_url | Primary image path/url |
| description | Rich text / marketing copy |
| size | Human readable (e.g. `65 sqm`) |
| beds | Composition description |
| occupancy | Maximum guests for booking logic |
| features | JSON string; parse before structured use |
| available | 1/0 flag (optional) |
| type | Category (Suite, Standard, etc.) |
| capacity | Redundant with occupancy if present |
| amenities | Raw JSON string (legacy) |
| images | Raw JSON string (legacy multi-image) |

### Package Data (Post-Filter → Active Only)
| Field | Notes |
|-------|-------|
| id | String or numeric string identifier |
| name | Display title |
| description | Marketing description |
| price | Final price string (cast to number for math) |
| discount_percentage | String; convert to float if needed |
| valid_from / valid_until | Date strings for validity window |
| available / is_active | Either field may appear; treat 1 as active |
| inclusions / includes | Arrays of included services; merge if both exist |
| exclusions | Services not provided (optional) |
| images / image_url | Prefer array; fallback to single image |
| max_guests | Package guest cap |
| cancellation_policy | Optional policy override |
| room_options | Per-room overrides (advanced pricing) |
| sort_order | Use for prioritized display |

### Console Log Order (Healthy Load)
1. `🏨 Fetching villa info from:`
2. `🏨 Villa API response:`
3. Rooms fetch logs (if rooms enabled)
4. Packages filter logs
5. Any normalization warnings (should be none)

### Rapid Manual Verification Script (Copy into Browser Console)
```js
const verify = async () => {
  const endpoints = ['villa.php','homepage.php'];
  for (const ep of endpoints) {
    const url = `https://api.rumahdaisycantik.com/${ep}`;
    const t0 = performance.now();
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      const json = await res.json();
      const dt = (performance.now() - t0).toFixed(0)+'ms';
      console.group(`%cVERIFY ${ep}`,'background:#0f172a;color:#fff;padding:2px 6px;border-radius:4px;');
      console.log('Status:', res.status, 'Time:', dt);
      console.log('Success:', json.success);
      console.log('Keys:', Object.keys(json.data || {}));
      console.log('Primary Name:', json.data?.name || json.data?.hero_title);
      console.log('Images Count:', (json.data?.images || []).length);
      console.log('Amenities Count:', (json.data?.amenities || []).length);
      console.groupEnd();
    } catch (e) {
      console.group(`%cVERIFY ERROR ${ep}`,'background:#7f1d1d;color:#fff;padding:2px 6px;border-radius:4px;');
      console.error(e);
      console.groupEnd();
    }
  }
};
verify();
```

### Common Red Flags
| Symptom | Action |
|---------|--------|
| Missing `name` | Check `villa.php` table row exists (id=1) |
| Images length 0 unexpectedly | Inspect raw DB JSON; ensure valid JSON array syntax |
| Amenities show character fragments | Data stored as string not JSON → correct DB value |
| Hardcoded defaults appearing after edits | Confirm update endpoint (PUT) invoked & 200 returned |
| CORS error after changes | Re-check `Access-Control-Allow-Headers` includes `Cache-Control` |

### Optional Automation Idea
Add a lightweight `/api/health.php` returning `{ api:true, db:true, tables:{villa_info:true,...} }` for CI or uptime checks.

---
## 🔄 Maintenance Notes
- Keep this guide updated when adding columns (e.g. dynamic rating system).
- Replace hardcoded rating/reviews once review aggregation is implemented.
- Consider moving debug utilities into a single `src/utils/debug/` folder.

---
## 📌 Last Verification
Date: (update manually) 2025-11-21
Result: All core endpoints responsive; mapping consistent; no CORS issues.

