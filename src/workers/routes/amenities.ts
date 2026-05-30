import { Env } from '../types';
import { requireAuth } from '../utils/auth';

// ── CORS helpers (mirrors index.ts pattern) ────────────────────────────────────

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

function successResponse(data: any, request?: Request): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': resolveAllowedOrigin(request),
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Origin',
      ...SECURITY_HEADERS,
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

// ── Handler ───────────────────────────────────────────────────────────────────

export async function handleAmenities(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Auth check for non-GET methods
  if (method !== 'GET') {
    const auth = await requireAuth(request, env);
    if (!auth.valid) return errorResponse('Unauthorized', 401, request);
  }

  // GET /api/amenities or /api/amenities/list
  if ((pathParts.length === 2 || pathParts[2] === 'list') && method === 'GET') {
    try {
      // Try to get from KV first
      const cacheKey = 'amenities_list';
      const cached = await env.CACHE.get(cacheKey, 'json');
      if (cached) {
        return successResponse(cached, request);
      }

      const result = await env.DB.prepare(
        'SELECT * FROM amenities WHERE is_active = 1 ORDER BY display_order ASC'
      ).all();
      // Store in KV (cache for 1 hour)
      await env.CACHE.put(cacheKey, JSON.stringify(result.results), { expirationTtl: 3600 });

      return successResponse(result.results, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/amenities/featured
  if (pathParts[2] === 'featured' && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM amenities WHERE is_featured = 1 AND is_active = 1 ORDER BY display_order ASC'
      ).all();
      return successResponse(result.results, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/amenities/category/:name
  if (pathParts[2] === 'category' && pathParts[3] && method === 'GET') {
    try {
      const category = pathParts[3];
      const result = await env.DB.prepare(
        'SELECT * FROM amenities WHERE category = ? AND is_active = 1 ORDER BY display_order ASC'
      ).bind(category).all();
      return successResponse(result.results, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/amenities/:id
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'GET') {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare('SELECT * FROM amenities WHERE id = ?').bind(id).first();
      if (!result) return errorResponse('Amenity not found', 404, request);
      return successResponse(result, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // POST /api/amenities - Create new amenity
  if (pathParts.length === 2 && method === 'POST') {
    try {
      const { name, category, description, icon, is_featured, is_active, display_order } = body;
      if (!name) return errorResponse('Name is required', 400, request);

      const result = await env.DB.prepare(
        `INSERT INTO amenities (name, category, description, icon, is_featured, is_active, display_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        name,
        category || null,
        description || null,
        icon || 'star',
        is_featured ? 1 : 0,
        is_active !== false ? 1 : 0,
        display_order || 0
      ).run();

      // Invalidate cache
      await env.CACHE.delete('amenities_list');

      return successResponse({ id: result.meta.last_row_id, message: 'Amenity created successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // PUT /api/amenities/:id - Update amenity
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'PUT') {
    try {
      const id = parseInt(pathParts[2]);
      const { name, category, description, icon, is_featured, is_active, display_order } = body;

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) { updates.push('name = ?'); values.push(name); }
      if (category !== undefined) { updates.push('category = ?'); values.push(category); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }
      if (is_featured !== undefined) { updates.push('is_featured = ?'); values.push(is_featured ? 1 : 0); }
      if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }
      if (display_order !== undefined) { updates.push('display_order = ?'); values.push(display_order); }

      updates.push("updated_at = datetime('now')");
      values.push(id);

      await env.DB.prepare(
        `UPDATE amenities SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      // Invalidate cache
      await env.CACHE.delete('amenities_list');

      return successResponse({ message: 'Amenity updated successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // DELETE /api/amenities/:id - Delete amenity
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'DELETE') {
    try {
      const id = parseInt(pathParts[2]);
      await env.DB.prepare('DELETE FROM amenities WHERE id = ?').bind(id).run();
      // Invalidate cache
      await env.CACHE.delete('amenities_list');

      return successResponse({ message: 'Amenity deleted successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  return errorResponse('Endpoint not found', 404, request);
}
