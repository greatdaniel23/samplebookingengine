# Sentinel Journal 🛡️

## 2025-01-25 - Critical Auth Bypass in Admin Endpoints
**Vulnerability:** Admin and Settings endpoints (`/api/admin/*`, `/api/settings/*`) were completely unauthenticated. Anyone could access revenue stats and change global settings.
**Learning:** The `handleAuth` function existed but was not being used by other handlers. It seems like the auth implementation was "in progress" (`TODO` comments) and left wide open.
**Prevention:** Always implement a "deny by default" middleware or ensure every sensitive route handler starts with an authentication check.

## 2025-01-25 - Unauthenticated Booking Access
**Vulnerability:** Booking endpoints `GET /bookings/:id`, `PUT /bookings/:id/status`, and `GET /bookings/dates/search` were publicly accessible without authentication. This allowed IDOR (viewing any booking by ID) and unauthorized status modification.
**Learning:** Adding auth to "admin" routes is not enough; operational endpoints that modify state or expose user PII must also be protected, even if they look like "user" endpoints.
**Prevention:** Audit all endpoints that return PII or modify state. Ensure the `Authorization` header is checked before processing the request.
