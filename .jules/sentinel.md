# Sentinel Journal 🛡️

## 2026-05-24 - Critical Password Verification Bypass Fixed
**Vulnerability:** The `/api/auth/login` endpoint was accepting any password for a valid username. The `verifyPassword` function was a stub that returned `false`, but the `handleAuth` route handler ignored this result and issued a JWT token anyway.
**Learning:** Never assume authentication middleware or helper functions are fully implemented, especially if they are marked with TODOs. Always check the return value of verification functions.
**Prevention:** Implement strict password verification using strong hashing (PBKDF2/bcrypt) before issuing tokens. Ensure route handlers abort if verification fails.

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

## 2026-05-25 - DOKU Webhook Signature & Body Consumption
**Vulnerability:** The DOKU callback endpoint `/api/payment/callback` was accepting payment confirmations without verifying the signature, allowing attackers to mark bookings as paid.
**Learning:** The monolithic `handleRequest` in `src/workers/index.ts` automatically consumed the request body as JSON for all POST requests. This made signature verification impossible because the raw body stream was lost/altered.
**Prevention:** Explicitly exclude webhook endpoints from global body parsing logic in the main handler. Use `request.clone()` or skip parsing to preserve the raw body for cryptographic verification.

## 2026-05-26 - Open Relay in Email Service
**Vulnerability:** The `/api/email/booking-confirmation` endpoint accepted arbitrary email addresses in the request body, allowing attackers to send spam emails using the villa's domain and template (Open Relay).
**Learning:** Trusting client input (`booking_data`) for sensitive operations like email sending is dangerous. Even if the endpoint is "public" (for client use), it must verify the data against the backend's source of truth.
**Prevention:** Never use email addresses provided in the request body for sending automated notifications. Always look up the verified email address from the database using a reference ID.
