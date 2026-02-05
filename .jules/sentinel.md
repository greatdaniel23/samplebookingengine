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

## 2026-05-25 - DOKU Webhook Signature & Body Consumption
**Vulnerability:** The DOKU callback endpoint `/api/payment/callback` was accepting payment confirmations without verifying the signature, allowing attackers to mark bookings as paid.
**Learning:** The monolithic `handleRequest` in `src/workers/index.ts` automatically consumed the request body as JSON for all POST requests. This made signature verification impossible because the raw body stream was lost/altered.
**Prevention:** Explicitly exclude webhook endpoints from global body parsing logic in the main handler. Use `request.clone()` or skip parsing to preserve the raw body for cryptographic verification.

## 2026-02-02 - Unprotected Resource Routes
**Vulnerability:** Core resource management endpoints (`villa`, `rooms`, `packages`) were fully exposed to unauthorized modifications (POST/PUT/DELETE) because the auth check was missing in the individual route handlers.
**Learning:** Modular route handlers need to explicitly accept the `request` object to perform auth checks. Splitting routing logic requires careful propagation of context (like request/auth).
**Prevention:** Use a middleware pattern or higher-order function to wrap protected routes, ensuring the check is enforced at the entry point.

## 2026-02-02 - Login Password Verification Bypass
**Vulnerability:** The login endpoint (`/api/auth/login`) accepts a password but does NOT verify it against the hash. It only checks if the user exists.
**Learning:** Checking for user existence is not authentication. Password verification logic was stubbed out in `utils/auth.ts` and skipped in the handler.
**Prevention:** Essential security functions must fail closed (throw error) if not implemented, rather than allowing the flow to proceed.
