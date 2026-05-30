/**
 * schema-settings.ts — Schema Settings API
 * =========================================
 * Handles all /api/schema-settings and /api/admin/schema-settings routes.
 *
 * Public (read-only, edge-cacheable):
 *   GET /api/schema-settings/:route   → single row for middleware consumption
 *
 * Admin (JWT auth required):
 *   GET /api/admin/schema-settings    → all rows
 *   GET /api/admin/schema-settings/:route  → single row
 *   PUT /api/admin/schema-settings/:route  → upsert (validate JSON, max 32KB)
 *
 * Authorization: Daniel 2026-05-19
 * Author: MASON · 2026-05-19
 */

import { Env } from '../types';
import { requireAuth } from '../utils/auth';

// ── CORS / response helpers (mirrors amenities.ts pattern) ────────────────────

const ALLOWED_ORIGINS = [
  'https://booking-frontend-samudra.pages.dev',
  'https://villa-landing.pages.dev',
  'https://villa.alphadigitalagency.id',
  'https://alphadigitalagency.id',
  'https://alphademo.pages.dev',
  'https://demo.alphadigitalagency.id',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'http://127.0.0.1:4321',
  'http://localhost:4321',
  'http://127.0.0.1:4173',
  'http://localhost:4173',
];

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
};

function resolveAllowedOrigin(request?: Request): string {
  const origin = request?.headers.get('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0];
}

function successResponse(data: unknown, request?: Request, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': resolveAllowedOrigin(request),
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Origin',
      ...SECURITY_HEADERS,
      ...(extraHeaders || {}),
    },
  });
}

function errorResponse(message: string, status = 500, request?: Request): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': resolveAllowedOrigin(request),
      'Vary': 'Origin',
      ...SECURITY_HEADERS,
    },
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_ROUTES = ['_global', '/', '/stay', '/dine', '/spa', '/experiences', '/journal', '/reservations'];
const MAX_BODY_SIZE = 32 * 1024; // 32KB

// ── Schema row type ───────────────────────────────────────────────────────────

interface SchemaRow {
  route: string;
  fields_json: string;
  updated_at: number;
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function handleSchemaSettings(
  url: URL,
  method: string,
  body: unknown,
  env: Env,
  request: Request
): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);
  // pathParts examples:
  //   ['api', 'schema-settings', '_global']      → public single
  //   ['api', 'admin', 'schema-settings']         → admin list
  //   ['api', 'admin', 'schema-settings', '/stay'] → admin single / PUT

  const isAdmin = pathParts[1] === 'admin';

  // OPTIONS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': resolveAllowedOrigin(request),
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Vary': 'Origin',
      },
    });
  }

  // ── PUBLIC: GET /api/schema-settings/:route ──────────────────────────────────
  // Edge-cacheable, no auth. Used by _middleware.ts.
  if (!isAdmin && method === 'GET') {
    const routeParam = pathParts[2] ? decodeURIComponent(pathParts[2]) : null;
    if (!routeParam) return errorResponse('Route parameter required', 400, request);

    try {
      const row = await env.DB.prepare(
        'SELECT route, fields_json, updated_at FROM schema_settings WHERE route = ?'
      ).bind(routeParam).first<SchemaRow>();

      if (!row) {
        // Return empty fields — table may not have been seeded yet
        return successResponse({ route: routeParam, fields_json: '{}', updated_at: null }, request, {
          'Cache-Control': 'public, s-maxage=300, max-age=60',
        });
      }

      let fields: unknown = {};
      try { fields = JSON.parse(row.fields_json); } catch { /* empty */ }

      return successResponse({ route: row.route, fields, updated_at: row.updated_at }, request, {
        'Cache-Control': 'public, s-maxage=300, max-age=60',
      });
    } catch (err) {
      console.error('[schema-settings] public GET error:', err);
      return errorResponse('Failed to fetch schema settings', 500, request);
    }
  }

  // ── ADMIN routes — require JWT auth ──────────────────────────────────────────
  if (isAdmin) {
    const auth = await requireAuth(request, env);
    if (!auth.valid) return errorResponse('Unauthorized', 401, request);

    // pathParts: ['api', 'admin', 'schema-settings'] or ['api', 'admin', 'schema-settings', '<route>']
    const routeParam = pathParts[3] ? decodeURIComponent(pathParts[3]) : null;

    // GET /api/admin/schema-settings → all rows
    if (method === 'GET' && !routeParam) {
      try {
        const { results } = await env.DB.prepare(
          'SELECT route, fields_json, updated_at FROM schema_settings ORDER BY route ASC'
        ).all<SchemaRow>();

        const rows = (results || []).map(row => {
          let fields: unknown = {};
          try { fields = JSON.parse(row.fields_json); } catch { /* skip */ }
          return { route: row.route, fields, updated_at: row.updated_at };
        });

        return successResponse(rows, request);
      } catch (err) {
        console.error('[schema-settings] admin GET all error:', err);
        return errorResponse('Failed to fetch schema settings', 500, request);
      }
    }

    // GET /api/admin/schema-settings/:route → single row
    if (method === 'GET' && routeParam) {
      try {
        const row = await env.DB.prepare(
          'SELECT route, fields_json, updated_at FROM schema_settings WHERE route = ?'
        ).bind(routeParam).first<SchemaRow>();

        if (!row) return errorResponse('Route not found', 404, request);

        let fields: unknown = {};
        try { fields = JSON.parse(row.fields_json); } catch { /* skip */ }

        return successResponse({ route: row.route, fields, updated_at: row.updated_at }, request);
      } catch (err) {
        console.error('[schema-settings] admin GET single error:', err);
        return errorResponse('Failed to fetch schema settings', 500, request);
      }
    }

    // PUT /api/admin/schema-settings/:route → upsert
    if (method === 'PUT' && routeParam) {
      // Validate route key
      if (!VALID_ROUTES.includes(routeParam)) {
        return errorResponse(`Invalid route. Allowed: ${VALID_ROUTES.join(', ')}`, 400, request);
      }

      // Validate body
      if (!body || typeof body !== 'object') {
        return errorResponse('Request body must be a JSON object', 400, request);
      }

      // Size guard (approximate — stringify and check byte length)
      let fieldsJson: string;
      try {
        fieldsJson = JSON.stringify(body);
      } catch {
        return errorResponse('Invalid JSON in request body', 400, request);
      }

      if (new TextEncoder().encode(fieldsJson).length > MAX_BODY_SIZE) {
        return errorResponse('Request body exceeds 32KB limit', 400, request);
      }

      try {
        await env.DB.prepare(
          `INSERT INTO schema_settings (route, fields_json, updated_at)
           VALUES (?, ?, unixepoch())
           ON CONFLICT(route) DO UPDATE SET
             fields_json = excluded.fields_json,
             updated_at  = unixepoch()`
        ).bind(routeParam, fieldsJson).run();

        return successResponse({ route: routeParam, message: 'Schema settings saved' }, request);
      } catch (err) {
        console.error('[schema-settings] admin PUT error:', err);
        return errorResponse('Failed to save schema settings', 500, request);
      }
    }
  }

  return errorResponse('Method not allowed', 405, request);
}
