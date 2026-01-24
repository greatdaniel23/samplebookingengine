# Sentinel Journal 🛡️

## 2025-01-25 - Critical Auth Bypass in Admin Endpoints
**Vulnerability:** Admin and Settings endpoints (`/api/admin/*`, `/api/settings/*`) were completely unauthenticated. Anyone could access revenue stats and change global settings.
**Learning:** The `handleAuth` function existed but was not being used by other handlers. It seems like the auth implementation was "in progress" (`TODO` comments) and left wide open.
**Prevention:** Always implement a "deny by default" middleware or ensure every sensitive route handler starts with an authentication check.

## 2025-01-26 - Stored XSS via Unauthenticated GTM Endpoint
**Vulnerability:** The Google Tag Manager configuration endpoint (`/api/gtm`) allowed unauthenticated POST/PUT requests. An attacker could inject malicious GTM container IDs, leading to Stored XSS on the client side.
**Learning:** Adding a new route handler (`handleGTM`) in `handleRequest` does not automatically inherit authentication. Each handler must explicitly verify the token, especially for write operations.
**Prevention:** Audit all route handlers in `src/workers/index.ts` to ensure they perform authentication checks for non-public methods.
