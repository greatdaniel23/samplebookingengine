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

## 2026-05-21 - PII Leakage in Public Search Endpoint
**Vulnerability:** The `GET /api/bookings/dates/search` endpoint returned all columns (`SELECT *`) including guest names, emails, and phone numbers to unauthenticated users.
**Learning:** Developers often default to `SELECT *` for convenience, not realizing that for public endpoints this exposes sensitive internal data.
**Prevention:** Always explicitly select only the necessary columns for public endpoints (e.g., `SELECT check_in, check_out, status`).

## 2026-02-06 - PII Leakage in Booking Reference Endpoint
**Vulnerability:** The `GET /api/bookings/ref/:reference` endpoint returned all columns (`SELECT *`) to unauthenticated users, potentially leaking sensitive internal fields like `admin_notes` or `payment_gateway_id`.
**Learning:** Public endpoints that rely on "secret" IDs (like booking references) must still filter their output to the minimum viable data.
**Prevention:** Implement explicit column selection for public access, and conditional logic to allow admins to see full details.
