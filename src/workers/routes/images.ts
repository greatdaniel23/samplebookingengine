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

// Note: signature has request before env (matches index.ts routing call)
export async function handleImages(url: URL, method: string, request: Request, env: Env): Promise<Response> {
  // imageroom bucket is bound to image.alphadigitalagency.id (canonical custom domain).
  // Samudra objects are namespaced under samudra/ prefix for multi-tenant isolation.
  const R2_PUBLIC_URL = 'https://image.alphadigitalagency.id/samudra';

  // GET /api/images/list
  if (url.pathname === '/api/images/list' && method === 'GET') {
    try {
      const prefix = url.searchParams.get('prefix') || '';
      // Samudra objects live under samudra/ namespace in the shared imageroom bucket.
      const r2Prefix = prefix ? `samudra/${prefix}` : 'samudra/';
      const listed = await env.IMAGES.list({ prefix: r2Prefix });

      return successResponse({
        files: listed.objects.map((obj) => ({
          id: obj.key,
          filename: obj.key.split('/').pop(),
          uploaded: obj.uploaded.toISOString(),
          size: obj.size,
          url: `https://image.alphadigitalagency.id/${obj.key}`,
        }))
      });
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // POST /api/images/upload
  if (url.pathname === '/api/images/upload' && method === 'POST') {
    try {
      // Auth check
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401, request);

      const formData = await request.formData();
      const file = formData.get('file') as File;
      const prefix = (formData.get('prefix') as string) || '';

      if (!file) return errorResponse('No file provided', 400, request);

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return errorResponse('File too large. Max 10MB', 413, request);
      }

      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
      if (!allowedMimes.includes(file.type)) {
        return errorResponse('Invalid file type. Only JPEG, PNG, WebP, AVIF, GIF allowed', 400, request);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${randomString}.${extension}`;
      // Enforce samudra/ namespace — imageroom is multi-tenant, each client gets a top-level folder.
      const prefixWithNamespace = prefix ? `samudra/${prefix}${filename}` : `samudra/${filename}`;
      const key = prefixWithNamespace;

      // Upload to R2
      const arrayBuffer = await file.arrayBuffer();
      await env.IMAGES.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      return successResponse({
        success: true,
        id: key,
        filename: file.name,
        key: key,
        url: `${R2_PUBLIC_URL}/${key}`,
        uploaded: new Date().toISOString(),
      });
    } catch (error) {
      console.error('R2 upload error:', error);
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/images/usage?key=<r2_key>  — soft-block usage check
  if (url.pathname === '/api/images/usage' && method === 'GET') {
    try {
      const key = url.searchParams.get('key');
      if (!key) return errorResponse('Missing key parameter', 400, request);

      // Scan rooms.images (TEXT JSON array of R2 keys)
      const roomsResult = await env.DB.prepare(
        `SELECT id, name FROM rooms WHERE images LIKE ?`
      ).bind(`%${key}%`).all();

      // Scan room_images.image_url
      const roomImagesResult = await env.DB.prepare(
        `SELECT ri.id, r.name FROM room_images ri JOIN rooms r ON ri.room_id = r.id WHERE ri.image_url LIKE ?`
      ).bind(`%${key}%`).all();

      // Scan packages.images (TEXT JSON array)
      const packagesResult = await env.DB.prepare(
        `SELECT id, name FROM packages WHERE images LIKE ?`
      ).bind(`%${key}%`).all();

      // Scan homepage_settings.images_json
      const homepageResult = await env.DB.prepare(
        `SELECT id FROM homepage_settings WHERE images_json LIKE ? AND is_active = 1`
      ).bind(`%${key}%`).all();

      const usedByRooms = [
        ...roomsResult.results.map((r: any) => r.name),
        ...roomImagesResult.results.map((r: any) => r.name),
      ].filter((v, i, a) => a.indexOf(v) === i); // dedupe

      const usedByPackages = packagesResult.results.map((p: any) => p.name);
      const usedByHomepage = homepageResult.results.length > 0;

      return successResponse({
        key,
        used: usedByRooms.length > 0 || usedByPackages.length > 0 || usedByHomepage,
        used_by_rooms: usedByRooms,
        used_by_packages: usedByPackages,
        used_by_homepage: usedByHomepage,
      }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // DELETE /api/images/:imageId (supports nested paths)
  if (url.pathname.startsWith('/api/images/') && method === 'DELETE') {
    try {
      // Auth check
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401, request);

      const imageKey = url.pathname.replace('/api/images/', '');
      // Samudra objects live under samudra/ namespace in the shared imageroom bucket.
      const namespacedKey = imageKey.startsWith('samudra/') ? imageKey : `samudra/${imageKey}`;

      await env.IMAGES.delete(namespacedKey);

      return successResponse({ success: true, message: 'Image deleted', key: namespacedKey }, request);
    } catch (error) {
      return errorResponse(error.message, 500, request);
    }
  }

  // GET /api/images/:key (serve image — legacy fallback; canonical URL is image.alphadigitalagency.id/samudra/:key)
  // This path is kept for backward-compatibility with any cached links. Prefer the custom domain.
  if ((method === 'GET' || method === 'HEAD') && !url.pathname.startsWith('/api/images/list') && !url.pathname.startsWith('/api/images/upload') && url.pathname !== '/api/images/usage') {
    try {
      // Extract key from path.
      // If path is /api/images/folder/image.png -> key is folder/image.png
      let key = url.pathname.replace(/^\/api\/images\//, '').replace(/^\//, '');

      if (!key) return errorResponse('Image key missing', 400, request);

      // Samudra objects live under samudra/ namespace in the shared imageroom bucket.
      const namespacedKey = key.startsWith('samudra/') ? key : `samudra/${key}`;
      const object = await env.IMAGES.get(namespacedKey);

      if (object === null) {
        return errorResponse('Image not found', 404, request);
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      headers.set('Access-Control-Allow-Origin', '*'); // Images usually need generic CORS

      return new Response(object.body, {
        headers,
      });
    } catch (error) {
      return errorResponse('Error serving image: ' + error.message, 500, request);
    }
  }

  return errorResponse('Endpoint not found', 404, request);
}
