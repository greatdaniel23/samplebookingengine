# Sentinel Journal 🛡️

## 2025-01-25 - Critical Auth Bypass in Admin Endpoints
**Vulnerability:** Admin and Settings endpoints (`/api/admin/*`, `/api/settings/*`) were completely unauthenticated. Anyone could access revenue stats and change global settings.
**Learning:** The `handleAuth` function existed but was not being used by other handlers. It seems like the auth implementation was "in progress" (`TODO` comments) and left wide open.
**Prevention:** Always implement a "deny by default" middleware or ensure every sensitive route handler starts with an authentication check.
