# Sentinel Journal 🛡️

## 2025-01-26 - Critical Missing Auth in Catalog Management
**Vulnerability:** Several administrative endpoints (`/api/amenities`, `/api/inclusions`, `/api/gtm`, `/api/images`) allowed state-changing operations (POST, PUT, DELETE) without any authentication.
**Learning:** Checking auth in the main dispatcher or route handler is crucial. It seems new handlers were added without copying the auth pattern from existing ones like `handleAdmin`.
**Prevention:** Ensure all new route handlers that modify data accept `request` and perform an auth check at the very beginning. Consider a middleware pattern or a wrapper function for protected routes to enforce this automatically.

## 2025-01-25 - Critical Auth Bypass in Admin Endpoints
**Vulnerability:** Admin and Settings endpoints (`/api/admin/*`, `/api/settings/*`) were completely unauthenticated. Anyone could access revenue stats and change global settings.
**Learning:** The `handleAuth` function existed but was not being used by other handlers. It seems like the auth implementation was "in progress" (`TODO` comments) and left wide open.
**Prevention:** Always implement a "deny by default" middleware or ensure every sensitive route handler starts with an authentication check.

## 2025-05-20 - Unauthenticated Booking Manipulation (IDOR)
**Vulnerability:** The `PUT /api/bookings/:id/status` and `GET /api/bookings/:id` endpoints were completely unauthenticated. Attackers could view any booking by ID or change its status (e.g., to "confirmed" or "paid") without credentials.
**Learning:** `handleBookings` had auth checks for the *list* endpoint but missed them for specific ID operations. Copy-paste errors or partial implementation often lead to these gaps.
**Prevention:** Use a middleware pattern or a router library that enforces auth at the route group level, rather than manual checks inside every `if` block.

## 2026-01-09 - Critical Authentication Bypass in Login
**Vulnerability:** The `/api/auth/login` endpoint retrieved the user by username but failed to verify the password against the stored hash before issuing a JWT token.
**Learning:** Checking for user existence is not enough. Always verify credentials explicitly. The `verifyPassword` utility was a stub returning false, but it wasn't even being called.
**Prevention:** Implement secure password verification (using bcrypt) and ensure it is invoked in the authentication flow. Use unit tests to verify security utilities.
