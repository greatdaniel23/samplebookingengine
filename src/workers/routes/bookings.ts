import { Env } from '../types';
import { requireAuth } from '../utils/auth';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
};

function successResponse(data: any): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...SECURITY_HEADERS,
    },
  });
}

function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...SECURITY_HEADERS,
    },
  });
}

export async function handleBookings(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // GET /api/bookings - list all bookings (default)
  if (pathParts.length === 2 && method === 'GET') {
    try {
      // Auth check
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401);

      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const result = await env.DB.prepare(
        'SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).bind(limit, offset).all();
      return successResponse(result.results);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  // GET /api/bookings/list
  if (pathParts[2] === 'list' && method === 'GET') {
    try {
      // Auth check
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401);

      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const result = await env.DB.prepare(
        'SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).bind(limit, offset).all();
      return successResponse(result.results);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  // GET /api/bookings/:id
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'GET') {
    try {
      // Auth check
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401);

      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
      if (!result) return errorResponse('Booking not found', 404);
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  // GET /api/bookings/ref/:reference
  // P0-2 fix per WARDEN — rate-limit per IP to block brute-force enumeration
  // Reference shape BK-<timestamp>-<5char> has ~60M entropy = brute-forceable without throttle
  if (pathParts[2] === 'ref' && pathParts[3] && method === 'GET') {
    try {
      // Rate-limit: 10 requests per IP per 10 minutes (KV-backed, SESSIONS binding)
      // PII stripped per WARDEN P0-2 — prevent brute-force PII exposure
      const clientIp = request.headers.get('CF-Connecting-IP') ||
                       request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
                       'unknown';
      const refRateKey = `booking_ref_lookup:${clientIp}`;
      const refWindowSec = 600; // 10 minutes
      const refMaxRequests = 10;

      const refRateData = await env.SESSIONS.get(refRateKey, 'json') as { count: number; expires: number } | null;
      const nowSec = Math.floor(Date.now() / 1000);

      if (refRateData && refRateData.expires > nowSec) {
        if (refRateData.count >= refMaxRequests) {
          return new Response(JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(refRateData.expires - nowSec),
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        await env.SESSIONS.put(refRateKey, JSON.stringify({ count: refRateData.count + 1, expires: refRateData.expires }), { expirationTtl: refWindowSec });
      } else {
        await env.SESSIONS.put(refRateKey, JSON.stringify({ count: 1, expires: nowSec + refWindowSec }), { expirationTtl: refWindowSec });
      }

      const ref = pathParts[3];
      const result = await env.DB.prepare(`
        SELECT b.*, r.name as room_name, p.name as package_name
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN packages p ON b.package_id = p.id
        WHERE b.booking_reference = ?
      `).bind(ref).first();
      if (!result) return errorResponse('Booking not found', 404);
      // Enrichment for GA4 purchase / purchase_failed event payload (frontend FIX E reads these).
      // total_price is stored in IDR per villa-landing booking flow; surface USD via fixed rate
      // to match the rate used at submit time (USD_TO_IDR = 16000, reservations.html:1727).
      const totalIdr = Number((result as any).total_price) || 0;
      const enriched = {
        ...(result as Record<string, unknown>),
        total_price_usd: totalIdr > 0 ? Math.round(totalIdr / 16000) : 0,
        // payment_error_code / payment_error_message already included via b.* spread.
        // Defaulted to null in schema; populated by payment callback on non-SUCCESS.
      };
      return successResponse(enriched);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  // POST /api/bookings — alias for /api/bookings/create (K3 fix: FE calls this path)
  // Rewrite pathParts so the create handler below also fires for POST /api/bookings
  if (pathParts.length === 2 && method === 'POST') {
    // Fall through to /create handler by treating as if path was /api/bookings/create
    pathParts[2] = 'create';
  }

  // POST /api/bookings/create
  if (pathParts[2] === 'create' && method === 'POST') {
    try {
      if (!body.booking_reference || !body.email || !body.check_in || !body.check_out) {
        return errorResponse('Missing required fields: booking_reference, email, check_in, check_out', 400);
      }

      // Rate limiting: max 5 booking creations per IP per 10 minutes (KV-based)
      const clientIp = request.headers.get('CF-Connecting-IP') ||
                       request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
                       'unknown';
      const rateKey = `ratelimit:booking_create:${clientIp}`;
      const windowSec = 600; // 10 minutes
      const maxRequests = 5;

      const existing = await env.SESSIONS.get(rateKey, 'json') as { count: number; expires: number } | null;
      const now = Math.floor(Date.now() / 1000);

      if (existing && existing.expires > now) {
        if (existing.count >= maxRequests) {
          return errorResponse('Too many booking requests. Please wait before trying again.', 429);
        }
        await env.SESSIONS.put(rateKey, JSON.stringify({ count: existing.count + 1, expires: existing.expires }), { expirationTtl: windowSec });
      } else {
        await env.SESSIONS.put(rateKey, JSON.stringify({ count: 1, expires: now + windowSec }), { expirationTtl: windowSec });
      }

      await env.DB.prepare(
        `INSERT INTO bookings (
          booking_reference, room_id, package_id, first_name, last_name, email, phone,
          check_in, check_out, guests, adults, children, total_price, currency,
          special_requests, source, status, payment_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        body.booking_reference,
        body.room_id || null,
        body.package_id || null,
        body.first_name,
        body.last_name,
        body.email,
        body.phone || null,
        body.check_in,
        body.check_out,
        body.guests,
        body.adults || body.guests,
        body.children || 0,
        body.total_price,
        body.currency || 'IDR',
        body.special_requests || null,
        body.source || 'direct',
        'pending',
        'pending'
      ).run();

      return successResponse({
        booking_reference: body.booking_reference,
        message: 'Booking created successfully',
      });
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  // PUT /api/bookings/:id/status
  if (pathParts[3] === 'status' && method === 'PUT') {
    try {
      // Auth check
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401);

      const id = parseInt(pathParts[2]);
      const { status, payment_status } = body;

      if (!status) return errorResponse('Status is required', 400);

      let query = 'UPDATE bookings SET status = ?, updated_at = datetime(\'now\')';
      const params: any[] = [status];

      if (payment_status) {
        query += ', payment_status = ?';
        params.push(payment_status);
      }

      query += ' WHERE id = ?';
      params.push(id);

      await env.DB.prepare(query).bind(...params).run();

      return successResponse({ message: 'Booking status updated' });
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  // GET /api/bookings/dates/search
  if (pathParts[2] === 'dates' && pathParts[3] === 'search' && method === 'GET') {
    try {
      const checkInBefore = url.searchParams.get('check_in_before');
      const checkOutAfter = url.searchParams.get('check_out_after');

      if (!checkInBefore || !checkOutAfter) {
        return errorResponse('Missing query parameters: check_in_before, check_out_after', 400);
      }

      // SECURITY: Select only necessary fields to prevent PII leakage
      const result = await env.DB.prepare(
        `SELECT check_in, check_out, status FROM bookings
         WHERE check_in <= ? AND check_out >= ?
         ORDER BY check_in ASC`
      ).bind(checkOutAfter, checkInBefore).all();

      return successResponse(result.results);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  return errorResponse('Endpoint not found', 404);
}
