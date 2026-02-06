import { Env } from '../types';
import { getTokenFromHeader, verifyToken } from '../utils/auth';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
};

function successResponse(data: any): Response {
  const allowedOrigin = 'https://bookingengine-8g1-boe-kxn.pages.dev'; // Restrict to production domain

  return new Response(JSON.stringify({ success: true, data }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...SECURITY_HEADERS,
    },
  });
}

function errorResponse(message: string, status = 500): Response {
  const allowedOrigin = 'https://bookingengine-8g1-boe-kxn.pages.dev';

  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
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
      const authHeader = request.headers.get('Authorization');
      const token = getTokenFromHeader(authHeader);

      const valid = token ? await verifyToken(token, env.JWT_SECRET) : false;

      if (!valid) return errorResponse('Unauthorized', 401);

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
      const authHeader = request.headers.get('Authorization');
      const token = getTokenFromHeader(authHeader);

      const valid = token ? await verifyToken(token, env.JWT_SECRET) : false;

      if (!valid) return errorResponse('Unauthorized', 401);

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
      const authHeader = request.headers.get('Authorization');
      const token = getTokenFromHeader(authHeader);

      const valid = token ? await verifyToken(token, env.JWT_SECRET) : false;

      if (!valid) return errorResponse('Unauthorized', 401);

      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
      if (!result) return errorResponse('Booking not found', 404);
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  // GET /api/bookings/ref/:reference
  if (pathParts[2] === 'ref' && pathParts[3] && method === 'GET') {
    try {
      const ref = pathParts[3];

      // Check for admin auth to optionally return full details
      const authHeader = request.headers.get('Authorization');
      const token = getTokenFromHeader(authHeader);
      const isAdmin = token ? await verifyToken(token, env.JWT_SECRET) : false;

      let result;

      if (isAdmin) {
        // Admin gets full record
        result = await env.DB.prepare('SELECT * FROM bookings WHERE booking_reference = ?').bind(ref).first();
      } else {
        // Public/Guest gets restricted fields to prevent PII leakage
        // Explicitly select only fields needed for the frontend confirmation page
        result = await env.DB.prepare(`
          SELECT
            id, booking_reference, room_id, package_id,
            first_name, last_name, email, phone,
            check_in, check_out, guests, adults, children,
            total_price, currency, status, payment_status,
            special_requests, created_at
          FROM bookings
          WHERE booking_reference = ?
        `).bind(ref).first();
      }

      if (!result) return errorResponse('Booking not found', 404);
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message);
    }
  }

  // POST /api/bookings/create
  if (pathParts[2] === 'create' && method === 'POST') {
    try {
      if (!body.booking_reference || !body.email || !body.check_in || !body.check_out) {
        return errorResponse('Missing required fields: booking_reference, email, check_in, check_out', 400);
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
      const authHeader = request.headers.get('Authorization');
      const token = getTokenFromHeader(authHeader);

      const valid = token ? await verifyToken(token, env.JWT_SECRET) : false;

      if (!valid) return errorResponse('Unauthorized', 401);

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
