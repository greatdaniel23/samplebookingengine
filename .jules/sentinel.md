# Sentinel Journal 🛡️

## 2025-01-25 - Critical Auth Bypass in Admin Endpoints
**Vulnerability:** Admin and Settings endpoints (`/api/admin/*`, `/api/settings/*`) were completely unauthenticated. Anyone could access revenue stats and change global settings.
**Learning:** The `handleAuth` function existed but was not being used by other handlers. It seems like the auth implementation was "in progress" (`TODO` comments) and left wide open.
**Prevention:** Always implement a "deny by default" middleware or ensure every sensitive route handler starts with an authentication check.

## 2025-01-25 - Unauthenticated Write Operations in Bookings and Content
**Vulnerability:** Critical write operations (`PUT` bookings status, `POST`/`PUT`/`DELETE` amenities/inclusions) were unauthenticated. Attackers could update booking statuses or deface content.
**Learning:** Manual routing (using `if` statements) requires manual auth checks in every handler. Passing `request` down to sub-handlers is necessary to access headers for auth.
**Prevention:** Use a routing library with middleware support or a central `handleRequest` wrapper that enforces auth policies based on path/method patterns before dispatching.
