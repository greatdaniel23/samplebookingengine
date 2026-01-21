# Sentinel Journal 🛡️

## 2025-01-25 - Critical Auth Bypass in Admin Endpoints
**Vulnerability:** Admin and Settings endpoints (`/api/admin/*`, `/api/settings/*`) were completely unauthenticated. Anyone could access revenue stats and change global settings.
**Learning:** The `handleAuth` function existed but was not being used by other handlers. It seems like the auth implementation was "in progress" (`TODO` comments) and left wide open.
**Prevention:** Always implement a "deny by default" middleware or ensure every sensitive route handler starts with an authentication check.

## 2025-01-25 - Exposed Management Endpoints
**Vulnerability:** Critical management endpoints (`/api/amenities`, `/api/inclusions`, `/api/gtm`, `/api/images`, `/api/bookings/status`) lacked authentication for modification methods (POST, PUT, DELETE).
**Learning:** Manual routing logic in `src/workers/index.ts` makes it easy to forget auth checks compared to a middleware-based approach. The pattern of `handleAmenities` not receiving `request` made it impossible to check headers without refactoring.
**Prevention:** Ensure all route handlers receive the request object. Use a standardized wrapper or middleware for protected routes.
