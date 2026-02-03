# Sentinel Journal 🛡️

## 2026-05-26 - Critical Open Relay in Email Service
**Vulnerability:** The `/api/email` endpoints accepted a full `booking_data` object from the client (including recipient email) and sent emails blindly. This allowed attackers to use the official domain to send spam/phishing emails to arbitrary addresses.
**Learning:** Never trust client-provided data for critical operations like sending emails. The client should only provide a reference (ID), and the server must look up the authoritative data (email, name, amount) from the database.
**Prevention:** Refactored `handleEmail` to accept only `booking_reference`. Added a DB lookup to fetch the confirmed email and details. If the reference is invalid or points to a non-existent booking, no email is sent.

## 2026-05-25 - DOKU Webhook Signature & Body Consumption
**Vulnerability:** The DOKU callback endpoint `/api/payment/callback` was accepting payment confirmations without verifying the signature, allowing attackers to mark bookings as paid.
**Learning:** The monolithic `handleRequest` in `src/workers/index.ts` automatically consumed the request body as JSON for all POST requests. This made signature verification impossible because the raw body stream was lost/altered.
**Prevention:** Explicitly exclude webhook endpoints from global body parsing logic in the main handler. Use `request.clone()` or skip parsing to preserve the raw body for cryptographic verification.

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
