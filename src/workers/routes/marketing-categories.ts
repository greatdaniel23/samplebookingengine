import { Env } from '../types';
import { requireAuth } from '../utils/auth';

// ── CORS helpers (mirrors amenities.ts pattern) ───────────────────────────────

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

// Helper: generate slug from name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function handleMarketingCategories(
  url: URL,
  method: string,
  body: any,
  env: Env,
  request: Request
): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);
  // pathParts[1] = 'marketing-categories' OR 'admin'
  // For /api/admin/marketing-categories: pathParts = ['api','admin','marketing-categories',?id]
  const isAdminPath = pathParts[1] === 'admin';
  const idSegment = isAdminPath ? pathParts[3] : pathParts[2];
  const categoryId = idSegment && !isNaN(Number(idSegment)) ? parseInt(idSegment) : null;

  // Auth required for ALL mutations
  if (method !== 'GET') {
    const auth = await requireAuth(request, env);
    if (!auth.valid) return errorResponse('Unauthorized', 401, request);
  }

  // ── GET /api/marketing-categories — public list ───────────────────────────
  if (method === 'GET' && !isAdminPath) {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM marketing_categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
      ).all();
      return successResponse(result.results, request);
    } catch (e: any) {
      return errorResponse(e.message, 500, request);
    }
  }

  // ── GET /api/admin/marketing-categories — admin list (includes inactive) ──
  if (method === 'GET' && isAdminPath && !categoryId) {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM marketing_categories ORDER BY sort_order ASC, name ASC'
      ).all();
      return successResponse(result.results, request);
    } catch (e: any) {
      return errorResponse(e.message, 500, request);
    }
  }

  // ── GET /api/admin/marketing-categories/:id ────────────────────────────────
  if (method === 'GET' && isAdminPath && categoryId) {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM marketing_categories WHERE id = ?'
      ).bind(categoryId).first();
      if (!result) return errorResponse('Category not found', 404, request);
      return successResponse(result, request);
    } catch (e: any) {
      return errorResponse(e.message, 500, request);
    }
  }

  // ── POST /api/admin/marketing-categories — create ─────────────────────────
  // Also handles POST /api/marketing-categories (FE calls this path)
  if (method === 'POST') {
    try {
      const { name, description, color, icon, sort_order, is_active } = body || {};
      if (!name) return errorResponse('name is required', 400, request);

      const slug = slugify(name);

      const result = await env.DB.prepare(
        `INSERT INTO marketing_categories (name, slug, description, color, icon, sort_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        name,
        slug,
        description || null,
        color || null,
        icon || null,
        sort_order ?? 0,
        is_active !== false ? 1 : 0
      ).run();

      return successResponse(
        { id: result.meta.last_row_id, name, slug, message: 'Category created' },
        request
      );
    } catch (e: any) {
      return errorResponse(e.message, 500, request);
    }
  }

  // ── PUT /api/admin/marketing-categories/:id — update ──────────────────────
  // Also handles PUT /api/marketing-categories with {id} in body (FE pattern)
  if (method === 'PUT') {
    try {
      const bodyId = body?.id ? parseInt(body.id) : null;
      const targetId = categoryId || bodyId;
      if (!targetId) return errorResponse('Category id required', 400, request);

      const { name, description, color, icon, sort_order, is_active } = body || {};

      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
        updates.push('slug = ?');
        values.push(slugify(name));
      }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (color !== undefined) { updates.push('color = ?'); values.push(color); }
      if (icon !== undefined) { updates.push('icon = ?'); values.push(icon); }
      if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order); }
      if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }

      if (updates.length === 0) return errorResponse('No fields to update', 400, request);

      updates.push("updated_at = datetime('now')");
      values.push(targetId);

      await env.DB.prepare(
        `UPDATE marketing_categories SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      return successResponse({ message: 'Category updated' }, request);
    } catch (e: any) {
      return errorResponse(e.message, 500, request);
    }
  }

  // ── DELETE /api/admin/marketing-categories/:id — delete ───────────────────
  // Also handles DELETE /api/marketing-categories with {id} in body (FE deleteWithBody pattern)
  if (method === 'DELETE') {
    try {
      const bodyId = body?.id ? parseInt(body.id) : null;
      const targetId = categoryId || bodyId;
      if (!targetId) return errorResponse('Category id required', 400, request);

      await env.DB.prepare(
        'DELETE FROM marketing_categories WHERE id = ?'
      ).bind(targetId).run();

      return successResponse({ message: 'Category deleted' }, request);
    } catch (e: any) {
      return errorResponse(e.message, 500, request);
    }
  }

  return errorResponse('Endpoint not found', 404, request);
}
