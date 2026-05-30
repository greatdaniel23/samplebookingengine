import { Env } from './types';
import { handleRooms } from './routes/rooms';
import { handlePackages } from './routes/packages';
import { handleVilla } from './routes/villa';
import { handleHomepage } from './routes/homepage';
import { handlePayment } from './routes/payment';
import { handleBookings } from "./routes/bookings";
import { handleAmenities } from './routes/amenities';
import { handleImages } from './routes/images';
import { handleCalendar } from './routes/calendar';
import { handleSchemaSettings } from './routes/schema-settings';
import { handleMarketingCategories } from './routes/marketing-categories';
import { generateToken, verifyToken, getTokenFromHeader, verifyPassword, requireAuth } from './utils/auth';

// FORGE audit fix - 2026-05-14

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  let body = null;
  // Skip JSON parsing for image upload (needs formData) and payment callback (needs raw body for signature)
  if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && path !== '/api/images/upload' && path !== '/api/payment/callback') {
    try {
      body = await request.json();
    } catch (e) {
      // Allow empty body for DELETE requests
      if (method !== 'DELETE') {
        return errorResponse('Invalid JSON body', 400, request);
      }
    }
  }

  try {
    // Health check
    if (path === '/api/health') {
      return successResponse({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '3.1.0',
      });
    }

    // Bookings routes
    if (path.startsWith('/api/bookings')) {
      return handleBookings(url, method, body, env, request);
    }

    // Rooms routes
    if (path.startsWith('/api/rooms')) {
      return handleRooms(url, method, body, env, request);
    }

    // Packages routes
    if (path.startsWith('/api/packages')) {
      return handlePackages(url, method, body, env, request);
    }

    // Inclusions routes
    if (path.startsWith('/api/inclusions')) {
      return handleInclusions(url, method, body, env, request);
    }

    // Villa routes
    if (path.startsWith('/api/villa')) {
      return handleVilla(url, method, body, env, request);
    }

    // Homepage settings routes (hero copy, social, policies)
    if (path.startsWith('/api/homepage-settings')) {
      return handleHomepage(url, method, body, env, request);
    }

    // Amenities routes
    if (path.startsWith('/api/amenities')) {
      return handleAmenities(url, method, body, env, request);
    }

    // Auth routes
    if (path.startsWith('/api/auth')) {
      return handleAuth(url, method, body, env, request);
    }

    // Images routes (API and direct serving)
    if (path.startsWith('/api/images') || path.startsWith('/images') || path.startsWith('/hero') || path.startsWith('/packages')) {
      return handleImages(url, method, request, env);
    }

    // Schema settings routes (public + admin)
    // Public: GET /api/schema-settings/:route  (edge-cacheable, used by _middleware.ts)
    // Admin:  GET|PUT /api/admin/schema-settings[/:route]
    if (path.startsWith('/api/schema-settings') || path.startsWith('/api/admin/schema-settings')) {
      return handleSchemaSettings(url, method, body, env, request);
    }

    // Marketing categories routes — must come BEFORE generic /api/admin catch-all
    // GET /api/marketing-categories  — public list
    // GET|POST|PUT|DELETE /api/admin/marketing-categories[/:id]  — admin CRUD
    if (path.startsWith('/api/marketing-categories') || path.startsWith('/api/admin/marketing-categories')) {
      return handleMarketingCategories(url, method, body, env, request);
    }

    // Admin routes
    if (path.startsWith('/api/admin')) {
      return handleAdmin(url, method, body, env, request);
    }

    // Settings routes
    if (path.startsWith('/api/settings')) {
      return handleSettings(url, method, body, env, request);
    }

    // Email routes
    if (path.startsWith('/api/email')) {
      return handleEmail(url, method, body, env, request);
    }

    // Payment routes (DOKU)
    if (path.startsWith('/api/payment')) {
      return handlePayment(url, method, body, env, request);
    }

    // GTM routes
    if (path.startsWith('/api/gtm')) {
      return handleGTM(url, method, body, env, request);
    }

    // Calendar routes
    if (path.startsWith('/api/calendar')) {
      return handleCalendar(url, method, body, env, request);
    }

    return errorResponse('Endpoint not found', 404, request);
  } catch (error) {
    console.error('Request error:', error);
    // Don't leak internal error details to client
    return errorResponse('Internal server error', 500, request);
  }
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
};

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

// ==================== INCLUSIONS ====================
async function handleInclusions(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Auth check for non-GET methods
  if (method !== 'GET') {
    const auth = await requireAuth(request, env);
    if (!auth.valid) return errorResponse('Unauthorized', 401, request);
  }

  // GET /api/inclusions or /api/inclusions/list - List all inclusions
  if ((pathParts.length === 2 || pathParts[2] === 'list') && method === 'GET') {
    try {
      // Try to get from KV first
      const cacheKey = 'inclusions_list';
      const cached = await env.CACHE.get(cacheKey, 'json');
      if (cached) {
        return successResponse({ inclusions: cached }, request);
      }

      const result = await env.DB.prepare(
        'SELECT * FROM inclusions WHERE is_active = 1 ORDER BY package_type, name ASC'
      ).all();

      // Store in KV (cache for 1 hour)
      await env.CACHE.put(cacheKey, JSON.stringify(result.results), { expirationTtl: 3600 });

      return successResponse({ inclusions: result.results }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/inclusions/category/:type - Get by package type/category
  if (pathParts[2] === 'category' && pathParts[3] && method === 'GET') {
    try {
      const packageType = pathParts[3];
      const result = await env.DB.prepare(
        'SELECT * FROM inclusions WHERE package_type = ? AND is_active = 1 ORDER BY name ASC'
      ).bind(packageType).all();
      return successResponse({ inclusions: result.results }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/inclusions/package/:id - Get inclusions for a specific package
  if (pathParts[2] === 'package' && pathParts[3] && method === 'GET') {
    try {
      const packageId = parseInt(pathParts[3]);
      const result = await env.DB.prepare(`
        SELECT i.*, pi.quantity, pi.custom_description
        FROM inclusions i
        JOIN package_inclusions pi ON i.id = pi.inclusion_id
        WHERE pi.package_id = ? AND i.is_active = 1 AND pi.is_active = 1
        ORDER BY i.name ASC
      `).bind(packageId).all();
      return successResponse({ inclusions: result.results }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/inclusions/:id - Get single inclusion
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'GET') {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare('SELECT * FROM inclusions WHERE id = ?').bind(id).first();
      if (!result) return errorResponse('Inclusion not found', 404, request);
      return successResponse(result, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // POST /api/inclusions - Create new inclusion
  if (pathParts.length === 2 && method === 'POST') {
    try {
      const { name, description, package_type, is_active } = body;
      if (!name) return errorResponse('Name is required', 400, request);

      const result = await env.DB.prepare(
        `INSERT INTO inclusions (name, description, package_type, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        name,
        description || null,
        package_type || null,
        is_active !== false ? 1 : 0
      ).run();

      return successResponse({ id: result.meta.last_row_id, message: 'Inclusion created successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // PUT /api/inclusions/:id - Update inclusion
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'PUT') {
    try {
      const id = parseInt(pathParts[2]);
      const { name, description, package_type, is_active } = body;

      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) { updates.push('name = ?'); values.push(name); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (package_type !== undefined) { updates.push('package_type = ?'); values.push(package_type); }
      if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }

      updates.push("updated_at = datetime('now')");
      values.push(id);

      await env.DB.prepare(
        `UPDATE inclusions SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      return successResponse({ message: 'Inclusion updated successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // DELETE /api/inclusions/:id - Delete inclusion
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'DELETE') {
    try {
      const id = parseInt(pathParts[2]);
      // Also remove from package_inclusions
      await env.DB.prepare('DELETE FROM package_inclusions WHERE inclusion_id = ?').bind(id).run();
      await env.DB.prepare('DELETE FROM inclusions WHERE id = ?').bind(id).run();
      return successResponse({ message: 'Inclusion deleted successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // POST /api/inclusions/link-package - Link inclusion to package
  if (pathParts[2] === 'link-package' && method === 'POST') {
    try {
      const { package_id, inclusion_id, quantity } = body;
      if (!package_id || !inclusion_id) return errorResponse('package_id and inclusion_id are required', 400, request);

      await env.DB.prepare(
        `INSERT INTO package_inclusions (package_id, inclusion_id, quantity, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`
      ).bind(package_id, inclusion_id, quantity || 1).run();

      return successResponse({ message: 'Inclusion linked to package successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // DELETE /api/inclusions/unlink-package - Unlink inclusion from package
  if (pathParts[2] === 'unlink-package' && method === 'DELETE') {
    try {
      const { package_id, inclusion_id } = body;
      if (!package_id || !inclusion_id) return errorResponse('package_id and inclusion_id are required', 400, request);

      await env.DB.prepare(
        'DELETE FROM package_inclusions WHERE package_id = ? AND inclusion_id = ?'
      ).bind(package_id, inclusion_id).run();

      return successResponse({ message: 'Inclusion unlinked from package successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/inclusions/room/:id - Get inclusions for a specific room
  if (pathParts[2] === 'room' && pathParts[3] && method === 'GET') {
    try {
      const roomId = parseInt(pathParts[3]);
      const result = await env.DB.prepare(`
        SELECT i.*, ri.quantity, ri.custom_description
        FROM inclusions i
        JOIN room_inclusions ri ON i.id = ri.inclusion_id
        WHERE ri.room_id = ? AND i.is_active = 1
        ORDER BY i.name ASC
      `).bind(roomId).all();
      return successResponse({ inclusions: result.results }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // POST /api/inclusions/link-room - Link inclusion to room
  if (pathParts[2] === 'link-room' && method === 'POST') {
    try {
      const { room_id, inclusion_id, quantity, custom_description } = body;
      if (!room_id || !inclusion_id) return errorResponse('room_id and inclusion_id are required', 400, request);

      await env.DB.prepare(
        `INSERT OR REPLACE INTO room_inclusions (room_id, inclusion_id, quantity, custom_description, created_at, updated_at) 
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(room_id, inclusion_id, quantity || 1, custom_description || null).run();

      return successResponse({ message: 'Inclusion linked to room successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // DELETE /api/inclusions/unlink-room - Unlink inclusion from room
  if (pathParts[2] === 'unlink-room' && method === 'DELETE') {
    try {
      const { room_id, inclusion_id } = body;
      if (!room_id || !inclusion_id) return errorResponse('room_id and inclusion_id are required', 400, request);

      await env.DB.prepare(
        'DELETE FROM room_inclusions WHERE room_id = ? AND inclusion_id = ?'
      ).bind(room_id, inclusion_id).run();

      return successResponse({ message: 'Inclusion unlinked from room successfully' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  return errorResponse('Endpoint not found', 404, request);
}

// ==================== AUTHENTICATION ====================
async function handleAuth(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  // POST /api/auth/login
  if (url.pathname === '/api/auth/login' && method === 'POST') {
    try {
      if (!body.username || !body.password) {
        return errorResponse('Username and password required', 400, request);
      }

      // Brute-force throttle: max 5 failed attempts per IP per 10 minutes (KV-based)
      const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
      const throttleKey = `login_throttle:${clientIP}`;
      const windowSec = 600; // 10 minutes
      const maxFailedAttempts = 5;

      const throttleData = await env.SESSIONS.get(throttleKey, 'json') as { count: number; expires: number } | null;
      const now = Math.floor(Date.now() / 1000);

      if (throttleData && throttleData.expires > now && throttleData.count >= maxFailedAttempts) {
        const retryAfter = throttleData.expires - now;
        const response = errorResponse('Too many failed login attempts. Please try again later.', 429, request);
        // Add Retry-After header
        const headers = new Headers(response.headers);
        headers.set('Retry-After', String(retryAfter));
        return new Response(response.body, { status: 429, headers });
      }

      const user = await env.DB.prepare(
        'SELECT id, username, email, role, password_hash FROM users WHERE username = ? AND active = 1'
      ).bind(body.username).first();

      if (!user) {
        // Count failed attempt
        const current = (throttleData && throttleData.expires > now) ? throttleData : null;
        const newCount = current ? current.count + 1 : 1;
        const newExpires = current ? current.expires : now + windowSec;
        await env.SESSIONS.put(throttleKey, JSON.stringify({ count: newCount, expires: newExpires }), { expirationTtl: windowSec });
        return errorResponse('Invalid credentials', 401, request);
      }

      const isValidPassword = await verifyPassword(body.password, user.password_hash);
      if (!isValidPassword) {
        // Count failed attempt
        const current = (throttleData && throttleData.expires > now) ? throttleData : null;
        const newCount = current ? current.count + 1 : 1;
        const newExpires = current ? current.expires : now + windowSec;
        await env.SESSIONS.put(throttleKey, JSON.stringify({ count: newCount, expires: newExpires }), { expirationTtl: windowSec });
        return errorResponse('Invalid credentials', 401, request);
      }

      // Success — reset throttle counter
      await env.SESSIONS.delete(throttleKey);

      // Using proper JWT token generation
      // This will use the simplified HMAC-SHA256 from utils/auth
      const token = await generateToken(user.id, user.username, env.JWT_SECRET);

      return successResponse({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // POST /api/auth/verify
  if (url.pathname === '/api/auth/verify' && method === 'POST') {
    try {
      if (!body.token) return errorResponse('Token required', 400, request);

      const payload = await verifyToken(body.token, env.JWT_SECRET);

      if (payload) {
        return successResponse({ valid: true, user: payload }, request);
      }

      return errorResponse('Invalid token', 401, request);
    } catch (error) {
      return errorResponse('Invalid token', 401, request);
    }
  }

  return errorResponse('Endpoint not found', 404, request);
}

// ==================== ADMIN ====================
async function handleAdmin(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  // Auth check
  const auth = await requireAuth(request, env);
  if (!auth.valid) return errorResponse('Unauthorized', 401, request);

  // GET /api/admin/dashboard
  if (url.pathname === '/api/admin/dashboard' && method === 'GET') {
    try {
      const [bookingsCount, amenitiesCount, usersCount, totalRevenue] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as count FROM bookings').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM amenities').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
        env.DB.prepare('SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE payment_status = ?').bind('completed').first(),
      ]);

      return successResponse({
        bookingsCount: (bookingsCount as any).count || 0,
        amenitiesCount: (amenitiesCount as any).count || 0,
        usersCount: (usersCount as any).count || 0,
        totalRevenue: (totalRevenue as any).total || 0,
      });
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/admin/migrate-r2?dry_run=true|false — one-time R2 taxonomy migration
  // Run with ?dry_run=true first to preview changes; then ?dry_run=false to execute.
  // This endpoint is protected by admin auth. Remove after migration is confirmed.
  if (url.pathname === '/api/admin/migrate-r2' && method === 'GET') {
    try {
      const dryRun = url.searchParams.get('dry_run') !== 'false';
      const R2_PUBLIC_URL = 'https://image.alphadigitalagency.id';
      const CANONICAL_PREFIXES = ['rooms/', 'packages/', 'villa/', 'marketing/', 'misc/'];

      const log: string[] = [];
      const errors: string[] = [];
      let processed = 0, skipped = 0, moved = 0;

      // List all R2 objects
      let cursor: string | undefined;
      const allObjects: { key: string; size: number }[] = [];
      do {
        const listed = await env.IMAGES.list({ cursor: cursor as any, limit: 1000 });
        for (const obj of (listed as any).objects) allObjects.push({ key: obj.key, size: obj.size });
        cursor = (listed as any).truncated ? (listed as any).cursor : undefined;
      } while (cursor);

      log.push(`Found ${allObjects.length} R2 objects`);

      // Fetch DB references
      const roomsData = await env.DB.prepare(`SELECT id, name, images FROM rooms WHERE images IS NOT NULL AND images != '' AND images != '[]'`).all();
      const roomImagesData = await env.DB.prepare(`SELECT id, room_id, image_url FROM room_images WHERE image_url IS NOT NULL`).all();
      const packagesData = await env.DB.prepare(`SELECT id, name, images FROM packages WHERE images IS NOT NULL AND images != '' AND images != '[]'`).all();
      const homepageData = await env.DB.prepare(`SELECT id, images_json FROM homepage_settings WHERE images_json IS NOT NULL AND images_json != '' AND images_json != '[]'`).all();

      const parseJsonArray = (val: any): string[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val.filter(Boolean);
        try { return JSON.parse(val); } catch { return []; }
      };
      const extractKey = (urlOrKey: string): string => {
        if (!urlOrKey.startsWith('http')) return urlOrKey;
        return urlOrKey.replace(`${R2_PUBLIC_URL}/`, '');
      };

      // Build key→folder map from DB
      const keyToFolder = new Map<string, string>();
      for (const row of roomsData.results as any[]) {
        for (const k of parseJsonArray(row.images)) { const bk = extractKey(k); if (!keyToFolder.has(bk)) keyToFolder.set(bk, 'rooms/'); }
      }
      for (const row of roomImagesData.results as any[]) {
        const bk = extractKey(row.image_url as string); if (bk && !keyToFolder.has(bk)) keyToFolder.set(bk, 'rooms/');
      }
      for (const row of packagesData.results as any[]) {
        for (const k of parseJsonArray(row.images)) { const bk = extractKey(k); if (!keyToFolder.has(bk)) keyToFolder.set(bk, 'packages/'); }
      }
      for (const row of homepageData.results as any[]) {
        for (const k of parseJsonArray(row.images_json)) { const bk = extractKey(k); if (!keyToFolder.has(bk)) keyToFolder.set(bk, 'villa/'); }
      }

      for (const obj of allObjects) {
        processed++;
        const oldKey = obj.key;
        const existingPrefix = CANONICAL_PREFIXES.find(p => oldKey.startsWith(p));

        let targetFolder: string;
        if (existingPrefix) {
          const dbFolder = keyToFolder.get(oldKey);
          if (!dbFolder || dbFolder === existingPrefix) { skipped++; log.push(`SKIP: ${oldKey}`); continue; }
          targetFolder = dbFolder;
        } else {
          targetFolder = keyToFolder.get(oldKey) ?? 'misc/';
        }

        const leaf = oldKey.includes('/') ? oldKey.split('/').pop()! : oldKey;
        const newKey = `${targetFolder}${leaf}`;
        if (newKey === oldKey) { skipped++; log.push(`SKIP (same): ${oldKey}`); continue; }

        log.push(`${dryRun ? '[DRY] ' : ''}MOVE: ${oldKey} → ${newKey}`);

        if (!dryRun) {
          try {
            const srcObj = await env.IMAGES.get(oldKey);
            if (!srcObj) { errors.push(`Source not found: ${oldKey}`); continue; }
            const body2 = await srcObj.arrayBuffer();
            await env.IMAGES.put(newKey, body2, {
              httpMetadata: srcObj.httpMetadata,
              customMetadata: { ...(srcObj.customMetadata || {}), migratedFrom: oldKey, migratedAt: new Date().toISOString() },
            });

            // Update rooms.images
            for (const row of roomsData.results as any[]) {
              const keys = parseJsonArray(row.images);
              const updated = keys.map((k: string) => extractKey(k) === oldKey ? newKey : k);
              if (JSON.stringify(updated) !== JSON.stringify(keys)) {
                await env.DB.prepare(`UPDATE rooms SET images = ? WHERE id = ?`).bind(JSON.stringify(updated), row.id).run();
              }
            }
            // Update room_images.image_url
            await env.DB.prepare(`UPDATE room_images SET image_url = ? WHERE image_url = ? OR image_url = ?`).bind(newKey, oldKey, `${R2_PUBLIC_URL}/${oldKey}`).run();
            // Update packages.images
            for (const row of packagesData.results as any[]) {
              const keys = parseJsonArray(row.images);
              const updated = keys.map((k: string) => extractKey(k) === oldKey ? newKey : k);
              if (JSON.stringify(updated) !== JSON.stringify(keys)) {
                await env.DB.prepare(`UPDATE packages SET images = ? WHERE id = ?`).bind(JSON.stringify(updated), row.id).run();
              }
            }
            // Update homepage_settings.images_json
            for (const row of homepageData.results as any[]) {
              const keys = parseJsonArray(row.images_json);
              const updated = keys.map((k: string) => extractKey(k) === oldKey ? newKey : k);
              if (JSON.stringify(updated) !== JSON.stringify(keys)) {
                await env.DB.prepare(`UPDATE homepage_settings SET images_json = ? WHERE id = ?`).bind(JSON.stringify(updated), row.id).run();
              }
            }
            // Delete old key only after success
            await env.IMAGES.delete(oldKey);
            moved++;
          } catch (err: any) {
            errors.push(`ERROR ${oldKey}: ${err.message}`);
          }
        } else {
          moved++;
        }
      }

      return successResponse({ dryRun, processed, skipped, moved, errors, log }, request);
    } catch (error: any) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/admin/analytics
  if (url.pathname === '/api/admin/analytics' && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT SUM(bookings_count) as bookings, SUM(revenue) as revenue, COUNT(*) as days FROM daily_analytics LIMIT 30'
      ).first();
      return successResponse(result, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  return errorResponse('Endpoint not found', 404, request);
}

// ==================== SETTINGS ====================
async function handleSettings(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);
  const settingKey = pathParts[2];

  // Settings modification requires auth
  if (method !== 'GET') {
    const auth = await requireAuth(request, env);
    if (!auth.valid) return errorResponse('Unauthorized', 401, request);
  }

  // GET /api/settings - Public-safe subset only.
  // admin_email / from_email (owner PII) are stripped from public response.
  // Any field that needs admin contact info must go through /api/admin/* (auth-gated).
  if (method === 'GET' && !settingKey) {
    try {
      const cachedSettings = await env.CACHE.get('app_settings', 'json') as any;
      // Return ONLY public-safe fields — never owner email or from_email.
      const publicSettings = {
        villa_name: cachedSettings?.villa_name || env.VILLA_NAME || 'Samudra',
      };
      return successResponse(publicSettings, request);
    } catch (error) {
      return errorResponse('Could not load settings', 500, request);
    }
  }

  // GET /api/settings/:key - Public-safe lookup.
  // Only allow explicitly safe keys to be fetched unauthenticated.
  if (method === 'GET' && settingKey) {
    const PUBLIC_SAFE_KEYS = ['villa_name'];
    if (!PUBLIC_SAFE_KEYS.includes(settingKey)) {
      // Key is not public-safe — require auth
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401, request);
    }
    try {
      const settings = await env.CACHE.get('app_settings', 'json') as any;
      if (settings && settings[settingKey] !== undefined) {
        return successResponse({ key: settingKey, value: settings[settingKey] }, request);
      }
      // Safe fallback for public keys only
      const defaults: any = {
        villa_name: env.VILLA_NAME || 'Samudra',
      };
      return successResponse({ key: settingKey, value: defaults[settingKey] ?? null }, request);
    } catch (error) {
      return errorResponse('Could not load setting', 500, request);
    }
  }

  // POST /api/settings - Update settings
  if (method === 'POST') {
    try {
      const { admin_email, villa_name, from_email } = body;

      // Get existing settings
      const existing = await env.CACHE.get('app_settings', 'json') as any || {};

      // Merge with new values
      const updatedSettings = {
        ...existing,
        admin_email: admin_email || existing.admin_email || env.ADMIN_EMAIL,
        villa_name: villa_name || existing.villa_name || env.VILLA_NAME,
        from_email: from_email || existing.from_email || env.FROM_EMAIL,
        updated_at: new Date().toISOString(),
      };

      // Store in KV (no expiration - permanent)
      await env.CACHE.put('app_settings', JSON.stringify(updatedSettings));

      return successResponse({
        message: 'Settings updated successfully',
        settings: updatedSettings,
      });
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // PUT /api/settings/:key - Update single setting
  if (method === 'PUT' && settingKey) {
    try {
      const { value } = body;

      // Get existing settings
      const existing = await env.CACHE.get('app_settings', 'json') as any || {};

      // Update specific key
      existing[settingKey] = value;
      existing.updated_at = new Date().toISOString();

      // Store in KV
      await env.CACHE.put('app_settings', JSON.stringify(existing));

      return successResponse({
        message: `Setting '${settingKey}' updated successfully`,
        key: settingKey,
        value: value,
      });
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  return errorResponse('Settings endpoint not found', 404, request);
}

// ==================== GTM ====================
async function handleGTM(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);
  const gtmId = pathParts[2]; // For /api/gtm/:id

  // Auth check for non-GET methods
  if (method !== 'GET') {
    const auth = await requireAuth(request, env);
    if (!auth.valid) return errorResponse('Unauthorized', 401, request);
  }

  // GET /api/gtm - List all GTM codes
  if (method === 'GET' && !gtmId) {
    try {
      const gtmCodes = await env.CACHE.get('gtm_codes', 'json') as any[] || [];
      return successResponse({ gtm_codes: gtmCodes }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // POST /api/gtm - Add new GTM code
  if (method === 'POST' && !gtmId) {
    try {
      const { container_id, name, enabled } = body;
      if (!container_id) return errorResponse('container_id is required', 400, request);

      const existing = await env.CACHE.get('gtm_codes', 'json') as any[] || [];
      const newCode = {
        id: Date.now().toString(),
        container_id,
        name: name || container_id,
        enabled: enabled !== false,
        created_at: new Date().toISOString(),
      };
      existing.push(newCode);
      await env.CACHE.put('gtm_codes', JSON.stringify(existing));

      return successResponse({ message: 'GTM code added successfully', gtm_code: newCode }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // PUT /api/gtm/:id - Update GTM code
  if (method === 'PUT' && gtmId) {
    try {
      const { container_id, name, enabled } = body;
      const existing = await env.CACHE.get('gtm_codes', 'json') as any[] || [];
      const idx = existing.findIndex((c: any) => c.id === gtmId);
      if (idx === -1) return errorResponse('GTM code not found', 404, request);

      if (container_id !== undefined) existing[idx].container_id = container_id;
      if (name !== undefined) existing[idx].name = name;
      if (enabled !== undefined) existing[idx].enabled = enabled;
      existing[idx].updated_at = new Date().toISOString();

      await env.CACHE.put('gtm_codes', JSON.stringify(existing));
      return successResponse({ message: 'GTM code updated', gtm_code: existing[idx] }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // DELETE /api/gtm/:id - Remove GTM code
  if (method === 'DELETE' && gtmId) {
    try {
      const existing = await env.CACHE.get('gtm_codes', 'json') as any[] || [];
      const filtered = existing.filter((c: any) => c.id !== gtmId);
      if (filtered.length === existing.length) return errorResponse('GTM code not found', 404, request);

      await env.CACHE.put('gtm_codes', JSON.stringify(filtered));
      return successResponse({ message: 'GTM code deleted' }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  return errorResponse('GTM endpoint not found', 404, request);
}

// Helper: get all app settings from KV (falls back to env vars)
async function getAppSettings(env: Env): Promise<{ admin_email: string; from_email: string; villa_name: string }> {
  try {
    const settings = await env.CACHE.get('app_settings', 'json') as any;
    if (settings) {
      return {
        admin_email: settings.admin_email || env.ADMIN_EMAIL || 'booking@alphadigitalagency.id',
        from_email:  settings.from_email  || env.FROM_EMAIL  || 'booking@alphadigitalagency.id',
        villa_name:  settings.villa_name  || env.VILLA_NAME  || 'Best Villa Bali',
      };
    }
  } catch (e) {
    console.error('Error reading app_settings from KV:', e);
  }
  return {
    admin_email: env.ADMIN_EMAIL || 'booking@alphadigitalagency.id',
    from_email:  env.FROM_EMAIL  || 'booking@alphadigitalagency.id',
    villa_name:  env.VILLA_NAME  || 'Best Villa Bali',
  };
}

// Helper function to get admin email (checks KV first, then env)
async function getAdminEmail(env: Env): Promise<string> {
  const s = await getAppSettings(env);
  return s.admin_email;
}

// ==================== EMAIL ====================
async function handleEmail(url: URL, method: string, body: any, env: Env, request?: Request): Promise<Response> {
  if (method !== 'POST') {
    return errorResponse('Only POST method allowed', 405, request);
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  const action = pathParts[2];

  try {
    // Send booking confirmation email
    if (action === 'booking-confirmation') {
      const { booking_data } = body;
      // Use booking_reference from body, but verify against DB
      const ref = booking_data?.booking_reference;

      if (!ref) {
        return errorResponse('Missing booking_reference', 400, request);
      }

      // Verify booking exists and get trusted data (prevent Open Relay)
      const booking = await env.DB.prepare(`
        SELECT b.*, r.name as room_name, p.name as package_name
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN packages p ON b.package_id = p.id
        WHERE b.booking_reference = ?
      `).bind(ref).first();

      if (!booking) {
        return errorResponse('Booking not found', 404, request);
      }

      // Construct trusted data object for template
      const trustedData = {
        ...booking,
        guest_email: booking.email,
        guest_name: `${booking.first_name} ${booking.last_name}`,
        room_name: booking.room_name || booking.package_name || 'Standard Room',
        total_amount: booking.total_price
      };

      // Send real email via Resend API
      const emailHtml = getBookingConfirmationHtml(trustedData, env);
      const resendResult = await sendEmailViaResend(
        env,
        trustedData.guest_email, // Use verified email from DB
        `🎉 Booking Confirmation - ${env.VILLA_NAME || 'Best Villa Bali'}`,
        emailHtml
      );

      // Store email record in KV
      await env.CACHE.put(
        `email:${ref}:guest`,
        JSON.stringify({
          to: trustedData.guest_email,
          type: 'booking_confirmation',
          sent_at: new Date().toISOString(),
          booking_data: trustedData,
          resend_id: resendResult.id,
        }),
        { expirationTtl: 86400 * 30 }
      );

      return successResponse({
        success: true,
        message: 'Booking confirmation email sent successfully',
        recipient: trustedData.guest_email,
        booking_reference: ref,
        timestamp: new Date().toISOString(),
        email_id: resendResult.id,
        resend_error: (resendResult as any).error || null,
      });
    }

    // Send admin notification email
    if (action === 'admin-notification') {
      const { booking_data } = body;
      const ref = booking_data?.booking_reference;

      if (!ref) {
        return errorResponse('Missing booking_reference', 400, request);
      }

      // Verify booking exists (prevent admin spam)
      const booking = await env.DB.prepare(`
        SELECT b.*, r.name as room_name, p.name as package_name
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN packages p ON b.package_id = p.id
        WHERE b.booking_reference = ?
      `).bind(ref).first();

      if (!booking) {
        return errorResponse('Booking not found', 404, request);
      }

      // Construct trusted data
      const trustedData = {
        ...booking,
        guest_email: booking.email,
        guest_name: `${booking.first_name} ${booking.last_name}`,
        room_name: booking.room_name || booking.package_name || 'Standard Room',
        total_amount: booking.total_price
      };

      // Get admin email from KV (dynamic) or fallback to env
      const adminEmail = await getAdminEmail(env);

      // Send real email via Resend API
      const emailHtml = getAdminNotificationHtml(trustedData, env);
      const resendResult = await sendEmailViaResend(
        env,
        adminEmail,
        `🔔 New Booking Alert - ${ref}`,
        emailHtml
      );

      // Store email record
      await env.CACHE.put(
        `email:${ref}:admin`,
        JSON.stringify({
          to: adminEmail,
          type: 'admin_notification',
          sent_at: new Date().toISOString(),
          booking_data: booking_data,
          resend_id: resendResult.id,
        }),
        { expirationTtl: 86400 * 30 }
      );

      return successResponse({
        success: true,
        message: 'Admin notification email sent successfully',
        recipient: adminEmail,
        booking_reference: booking_data?.booking_reference,
        timestamp: new Date().toISOString(),
        email_id: resendResult.id,
      });
    }

    // Send status change notification
    if (action === 'status-change') {
      const { booking_data, old_status, new_status } = body;

      const emailResult = {
        success: true,
        message: 'Status change notification sent',
        booking_reference: booking_data?.booking_reference,
        status_change: `${old_status} → ${new_status}`,
        timestamp: new Date().toISOString(),
      };

      return successResponse(emailResult, request);
    }

    return errorResponse('Unknown email action', 400, request);
  } catch (error) {
    console.error('Email handler error:', error);
    return errorResponse(error.message || 'Email service error', 500, request);
  }
}

// ==================== RESEND EMAIL SERVICE ====================
async function sendEmailViaResend(env: Env, to: string, subject: string, html: string): Promise<{ id: string }> {
  const RESEND_API_KEY = env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { id: 'no-api-key' };
  }

  // Read from KV settings so admin dashboard controls these values
  const appSettings = await getAppSettings(env);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${appSettings.villa_name} <${appSettings.from_email}>`,
        to: [to],
        reply_to: appSettings.admin_email,
        subject: subject,
        html: html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return { id: 'error-' + Date.now(), error: JSON.stringify(result) } as any;
    }

    return { id: result.id || 'sent-' + Date.now() };
  } catch (error) {
    console.error('Resend fetch error:', error);
    return { id: 'error-' + Date.now() };
  }
}

function getBookingConfirmationHtml(booking: any, env: Env): string {
  const villaName = env.VILLA_NAME || 'Best Villa Bali';
  const ref = booking.booking_reference || ('BK-' + Date.now());
  const sentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const total = Number(booking.total_amount || 0).toLocaleString('id-ID');
  const specialRequests = booking.special_requests ? `<tr><td colspan="4" style="padding:10px 16px;border-bottom:1px solid #e6e6e6;font-size:12px;color:#69707a;"><strong>Special Requests:</strong> ${booking.special_requests}</td></tr>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#f5f8fb;font-family:Arial,sans-serif;">
<table role="presentation" style="width:100%;margin:0;border-spacing:0;">
  <tr><td style="padding:40px 0;">
    <table role="presentation" style="width:100%;max-width:650px;background-color:#ffffff;border-radius:6px;margin:auto;border-collapse:collapse;">
      <tr><td style="height:8px;background-color:#C9A84C;border-radius:6px 6px 0 0;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:40px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:70%;padding-bottom:20px;">
              <h1 style="font-size:22px;margin:0;color:#041639;">Booking Confirmation</h1>
              <span style="font-size:13px;color:#69707a;">Booking Number: ${ref}</span>
            </td>
            <td style="width:30%;text-align:right;vertical-align:top;padding-bottom:20px;">
              <span style="font-size:15px;font-weight:700;color:#C9A84C;">${villaName}</span>
            </td>
          </tr>
        </table>
        <table role="presentation" style="width:100%;margin:0 0 24px 0;border-collapse:collapse;">
          <tr>
            <td style="border-top:1px solid #d7dae0;border-bottom:1px solid #d7dae0;padding:14px 14px 14px 0;width:33%;vertical-align:top;">
              <strong style="font-size:13px;font-weight:600;color:#041639;">Booking Date:</strong><br/>
              <span style="font-size:13px;color:#69707a;">${sentDate}</span><br/><br/>
              <strong style="font-size:13px;font-weight:600;color:#041639;">Status:</strong><br/>
              <span style="font-size:13px;font-weight:700;color:#1a7f4b;">&#10003; Confirmed</span>
            </td>
            <td style="border:1px solid #d7dae0;padding:14px;width:33%;vertical-align:top;">
              <strong style="font-size:13px;font-weight:600;color:#041639;">Bill to:</strong><br/>
              <span style="font-size:13px;font-weight:600;color:#69707a;">${booking.guest_name || 'Guest'}</span><br/>
              <div style="margin-top:6px;">
                <span style="font-size:11px;color:#818995;">${booking.guest_email || ''}</span><br/>
                <span style="font-size:11px;color:#818995;">${booking.guest_phone || booking.phone || ''}</span>
              </div>
            </td>
            <td style="border-top:1px solid #d7dae0;border-bottom:1px solid #d7dae0;padding:14px;width:33%;vertical-align:top;">
              <strong style="font-size:13px;font-weight:600;color:#041639;">From:</strong><br/>
              <span style="font-size:13px;font-weight:600;color:#69707a;">${villaName}</span>
            </td>
          </tr>
        </table>
        <p style="font-weight:700;font-size:13px;color:#3f464f;margin-bottom:6px;">Dear Customer,</p>
        <strong style="font-weight:700;font-size:14px;color:#3f464f;">Your booking has been confirmed!</strong>
        <p style="font-weight:400;font-size:13px;color:#3f464f;margin:6px 0 16px 0;">Thank you for choosing ${villaName}. Below are the details of your reservation:</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:12px;">
          <thead>
            <tr>
              <th style="padding:8px 16px;border-bottom:1px solid #e6e6e6;font-weight:700;font-size:13px;color:#212832;background-color:#f9fafb;text-align:left;">Description</th>
              <th style="padding:8px 16px;border-bottom:1px solid #e6e6e6;font-weight:700;font-size:13px;color:#212832;background-color:#f9fafb;text-align:center;">Guests</th>
              <th style="padding:8px 16px;border-bottom:1px solid #e6e6e6;font-weight:700;font-size:13px;color:#212832;background-color:#f9fafb;text-align:right;">Check-in</th>
              <th style="padding:8px 16px;border-bottom:1px solid #e6e6e6;font-weight:700;font-size:13px;color:#212832;background-color:#f9fafb;text-align:right;">Check-out</th>
            </tr>
          </thead>
          <tbody style="font-weight:400;font-size:12px;color:#2c333c;">
            <tr>
              <td style="padding:10px 16px;border-bottom:1px solid #e6e6e6;">${booking.room_name || 'Standard Room'}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e6e6e6;text-align:center;">${booking.guests || '1'}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e6e6e6;text-align:right;">${booking.check_in || 'TBD'}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e6e6e6;text-align:right;">${booking.check_out || 'TBD'}</td>
            </tr>
            ${specialRequests}
          </tbody>
        </table>
        <div style="width:55%;margin-left:auto;">
          <div style="padding:8px 16px;border-top:1px solid #C9A84C;border-bottom:1px solid #C9A84C;">
            <span style="font-weight:700;font-size:13px;color:#C9A84C;">Total Amount</span>
            <span style="font-weight:700;font-size:13px;color:#C9A84C;float:right;">Rp ${total}</span>
          </div>
        </div>
        <hr style="border-top:1px solid #e6e6e6;margin:24px 0 20px 0;" />
        <p style="font-weight:700;font-size:13px;color:#3f464f;margin-bottom:6px;">Thank you!</p>
        <span style="font-size:10px;font-weight:400;color:#4d4d4d;">This email is sent automatically. For questions, contact us at ${env.FROM_EMAIL || 'booking@alphadigitalagency.id'}.</span>
      </td></tr>
      <tr><td style="height:8px;background-color:#C9A84C;border-radius:0 0 6px 6px;font-size:0;">&nbsp;</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function getAdminNotificationHtml(booking: any, env: Env): string {
  const villaName = env.VILLA_NAME || 'Best Villa Bali';
  const ref = booking?.booking_reference || 'N/A';
  const receivedAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' } as any);
  const total = Number(booking?.total_amount || 0).toLocaleString('id-ID');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>New Booking Alert</title>
</head>
<body style="margin:0;padding:0;width:100%;background-color:#f5f8fb;font-family:Arial,sans-serif;">
<table role="presentation" style="width:100%;margin:0;border-spacing:0;">
  <tr><td style="padding:40px 0;">
    <table role="presentation" style="width:100%;max-width:650px;background-color:#ffffff;border-radius:6px;margin:auto;border-collapse:collapse;">
      <tr><td style="height:8px;background-color:#C9A84C;border-radius:6px 6px 0 0;font-size:0;">&nbsp;</td></tr>
      <tr><td style="padding:40px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:70%;padding-bottom:20px;">
              <h1 style="font-size:22px;margin:0;color:#041639;">New Booking Alert</h1>
              <span style="font-size:13px;color:#69707a;">Booking Number: ${ref}</span>
            </td>
            <td style="width:30%;text-align:right;vertical-align:top;padding-bottom:20px;">
              <span style="font-size:15px;font-weight:700;color:#C9A84C;">${villaName}</span>
            </td>
          </tr>
        </table>
        <table role="presentation" style="width:100%;margin:0 0 24px 0;border-collapse:collapse;">
          <tr>
            <td style="border-top:1px solid #d7dae0;border-bottom:1px solid #d7dae0;padding:14px 14px 14px 0;width:33%;vertical-align:top;">
              <strong style="font-size:13px;font-weight:600;color:#041639;">Received:</strong><br/>
              <span style="font-size:13px;color:#69707a;">${receivedAt}</span><br/><br/>
              <strong style="font-size:13px;font-weight:600;color:#041639;">Action:</strong><br/>
              <span style="font-size:13px;font-weight:700;color:#e1251b;">Review &amp; Confirm</span>
            </td>
            <td style="border:1px solid #d7dae0;padding:14px;width:33%;vertical-align:top;">
              <strong style="font-size:13px;font-weight:600;color:#041639;">Guest:</strong><br/>
              <span style="font-size:13px;font-weight:600;color:#69707a;">${booking?.guest_name || 'Guest'}</span><br/>
              <div style="margin-top:6px;">
                <span style="font-size:11px;color:#818995;">${booking?.guest_email || 'N/A'}</span><br/>
                <span style="font-size:11px;color:#818995;">${booking?.guest_phone || booking?.phone || 'N/A'}</span>
              </div>
            </td>
            <td style="border-top:1px solid #d7dae0;border-bottom:1px solid #d7dae0;padding:14px;width:33%;vertical-align:top;">
              <strong style="font-size:13px;font-weight:600;color:#041639;">From:</strong><br/>
              <span style="font-size:13px;font-weight:600;color:#69707a;">${villaName}</span>
            </td>
          </tr>
        </table>
        <strong style="font-weight:700;font-size:14px;color:#3f464f;">New booking received — action required</strong>
        <p style="font-weight:400;font-size:13px;color:#3f464f;margin:6px 0 16px 0;">A new reservation has been submitted. Please review and confirm.</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:12px;">
          <thead>
            <tr>
              <th style="padding:8px 16px;border-bottom:1px solid #e6e6e6;font-weight:700;font-size:13px;color:#212832;background-color:#f9fafb;text-align:left;">Package / Room</th>
              <th style="padding:8px 16px;border-bottom:1px solid #e6e6e6;font-weight:700;font-size:13px;color:#212832;background-color:#f9fafb;text-align:center;">Guests</th>
              <th style="padding:8px 16px;border-bottom:1px solid #e6e6e6;font-weight:700;font-size:13px;color:#212832;background-color:#f9fafb;text-align:right;">Check-in</th>
              <th style="padding:8px 16px;border-bottom:1px solid #e6e6e6;font-weight:700;font-size:13px;color:#212832;background-color:#f9fafb;text-align:right;">Check-out</th>
            </tr>
          </thead>
          <tbody style="font-weight:400;font-size:12px;color:#2c333c;">
            <tr>
              <td style="padding:10px 16px;border-bottom:1px solid #e6e6e6;">${booking?.room_name || 'Standard Room'}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e6e6e6;text-align:center;">${booking?.guests || '1'}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e6e6e6;text-align:right;">${booking?.check_in || 'TBD'}</td>
              <td style="padding:10px 16px;border-bottom:1px solid #e6e6e6;text-align:right;">${booking?.check_out || 'TBD'}</td>
            </tr>
          </tbody>
        </table>
        <div style="width:55%;margin-left:auto;">
          <div style="padding:8px 16px;border-top:1px solid #C9A84C;border-bottom:1px solid #C9A84C;">
            <span style="font-weight:700;font-size:13px;color:#C9A84C;">Total Amount</span>
            <span style="font-weight:700;font-size:13px;color:#C9A84C;float:right;">Rp ${total}</span>
          </div>
        </div>
        <hr style="border-top:1px solid #e6e6e6;margin:24px 0 20px 0;" />
        <p style="font-weight:700;font-size:13px;color:#3f464f;margin-bottom:6px;">Thank you!</p>
        <span style="font-size:10px;font-weight:400;color:#4d4d4d;">This is an automated admin notification from ${villaName}. Please do not reply to this email.</span>
      </td></tr>
      <tr><td style="height:8px;background-color:#C9A84C;border-radius:0 0 6px 6px;font-size:0;">&nbsp;</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': resolveAllowedOrigin(request),
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
        },
      });
    }

    return handleRequest(request, env);
  },
};
