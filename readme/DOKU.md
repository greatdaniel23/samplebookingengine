# DOKU Payment Integration

This document outlines the integration with the DOKU Payment Gateway for the Booking Engine.

## Configuration

To use DOKU, you need to set up the following environment variables in your Cloudflare Worker:

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DOKU_CLIENT_ID` | Your DOKU Client ID | `6789...` |
| `DOKU_SECRET_KEY` | Your DOKU Secret Key | `SK-1234...` |
| `DOKU_ENVIRONMENT` | Integration environment | `sandbox` or `production` |

### Setting Secrets

Run these commands to set your DOKU credentials securely:

```bash
wrangler secret put DOKU_CLIENT_ID --env production
wrangler secret put DOKU_SECRET_KEY --env production
```

## Integration Details

### Signature Generation

DOKU requires a specific signature format in the headers:

- **Header:** `Signature`
- **Format:** `HMACSHA256=<signature>`
- **Components:** `Client-Id`, `Request-Id`, `Request-Timestamp`, `Request-Target`, `Digest`

### Common Issues & Fixes

1. **Invalid Signature (Header Format):** The signature must be prefixed with `HMACSHA256=`.
2. **Invalid Signature (Timestamp):** DOKU expects the timestamp in ISO 8601 format without milliseconds (`YYYY-MM-DDTHH:mm:ssZ`).
3. **Digest Mismatch:** Ensure the request body is exactly JSON-stringified before generating the SHA-256 digest.

## Testing Sandbox

When `DOKU_ENVIRONMENT` is set to `sandbox`, the API will use `https://api-sandbox.doku.com`.

1. Ensure your `wrangler-api.toml` has `DOKU_ENVIRONMENT = "sandbox"` in the `[vars]` or `[env.production.vars]` section.
2. Verify that the `callback_url` provided in the request is accessible from the internet if you want to test webhooks.
