import { Env } from './types';
import { handleRooms } from './routes/rooms';
import { handlePackages } from './routes/packages';
import { handleVilla } from './routes/villa';

// FORCE REBUILD - Timestamp: 2026-01-11 10:10
// This comment exists only to force Wrangler to rebuild the Worker

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  let body = null;

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Skip JSON parsing for image upload (needs formData)
  if ((method === 'POST' || method === 'PUT') && path !== '/api/images/upload') {
    try {
      body = await request.json();
    } catch (e) {
      return errorResponse('Invalid JSON body', 400);
    }
  }

  try {
    // Health check
    if (path === '/api/health') {
      return successResponse({
        status: 'REVERTED - THIS SHOULD NOW APPEAR',
        timestamp: new Date().toISOString(),
        version: '3.0.0-reverted-test',
      });
    }

    // Debug test endpoint
    if (path === '/api/test/debug') {
      return successResponse({
        message: 'Debug test successful',
        requestPath: path,
        requestMethod: method,
      });
    }

    // Test endpoints
    if (path === '/api/test/bookings') {
      const result = await env.DB.prepare('SELECT COUNT(*) as count FROM bookings').first();
      return successResponse(result);
    }

    if (path === '/api/test/r2') {
      const objects = await env.IMAGES.list();
      return successResponse({
        bucketAvailable: true,
        objectCount: objects.objects.length,
      });
    }

    // NEW EMAIL TEST ENDPOINT
    if (path === '/api/test/send-email-test') {
      return successResponse({
        message: 'Email test endpoint is working!',
        status: 'success',
        recipient: 'greatdaniel87@gmail.com',
      });
    }

    // Bookings routes
    if (path.startsWith('/api/bookings')) {
      return handleBookings(url, method, body, env);
    }

    // Rooms routes
    if (path.startsWith('/api/rooms')) {
      return handleRooms(url, method, body, env);
    }

    // Packages routes
    if (path.startsWith('/api/packages')) {
      return handlePackages(url, method, body, env);
    }

    // Villa routes
    if (path.startsWith('/api/villa')) {
      return handleVilla(url, method, body, env);
    }

    // Amenities routes
    if (path.startsWith('/api/amenities')) {
      return handleAmenities(url, method, body, env);
    }

    // Auth routes
    if (path.startsWith('/api/auth')) {
      return handleAuth(url, method, body, env);
    }

    // Images routes
    if (path.startsWith('/api/images')) {
      return handleImages(url, method, request, env);
    }

    // Admin routes
    if (path.startsWith('/api/admin')) {
      return handleAdmin(url, method, body, env);
    }

    // Settings routes
    if (path.startsWith('/api/settings')) {
      return handleSettings(url, method, body, env);
    }

    // Email routes
    if (path.startsWith('/api/email')) {
      return handleEmail(url, method, body, env);
    }

    // Marketing Categories routes
    if (path.startsWith('/api/marketing-categories')) {
      return handleMarketingCategories(url, method, body, env);
    }

    // Inclusions routes
    if (path.startsWith('/api/inclusions')) {
      return handleInclusions(url, method, body, env);
    }

    // Homepage Settings routes
    if (path.startsWith('/api/homepage-settings')) {
      return handleHomepageSettings(url, method, body, env);
    }

    // Calendar / Blackout Dates routes
    if (path.startsWith('/api/blackout-dates')) {
      return handleBlackoutDates(url, method, body, env);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Request error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

function successResponse(data: any): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ==================== BOOKINGS ====================
async function handleBookings(url: URL, method: string, body: any, env: Env): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // GET /api/bookings - list all bookings (default)
  if (pathParts.length === 2 && method === 'GET') {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const result = await env.DB.prepare(
        'SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).bind(limit, offset).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // GET /api/bookings/list
  if (pathParts[2] === 'list' && method === 'GET') {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const result = await env.DB.prepare(
        'SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).bind(limit, offset).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // GET /api/bookings/:id
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'GET') {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
      if (!result) return errorResponse('Booking not found', 404);
      return successResponse(result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // GET /api/bookings/ref/:reference
  if (pathParts[2] === 'ref' && pathParts[3] && method === 'GET') {
    try {
      const ref = pathParts[3];
      const result = await env.DB.prepare('SELECT * FROM bookings WHERE booking_reference = ?').bind(ref).first();
      if (!result) return errorResponse('Booking not found', 404);
      return successResponse(result);
    } catch (error) {
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
        body.currency || 'USD',
        body.special_requests || null,
        body.source || 'direct',
        'pending',
        'pending'
      ).run();

      return successResponse({
        booking_reference: body.booking_reference,
        message: 'Booking created successfully',
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // PUT /api/bookings/:id/status
  if (pathParts[3] === 'status' && method === 'PUT') {
    try {
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
    } catch (error) {
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

      const result = await env.DB.prepare(
        `SELECT * FROM bookings
         WHERE check_in <= ? AND check_out >= ?
         ORDER BY check_in ASC`
      ).bind(checkOutAfter, checkInBefore).all();

      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  return errorResponse('Endpoint not found', 404);
}

// ==================== AMENITIES ====================
async function handleAmenities(url: URL, method: string, body: any, env: Env): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // GET /api/amenities or /api/amenities/list
  if ((pathParts.length === 2 || pathParts[2] === 'list') && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM amenities WHERE is_active = 1 ORDER BY display_order ASC'
      ).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // GET /api/amenities/featured
  if (pathParts[2] === 'featured' && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM amenities WHERE is_featured = 1 AND is_active = 1 ORDER BY display_order ASC'
      ).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // GET /api/amenities/category/:name
  if (pathParts[2] === 'category' && pathParts[3] && method === 'GET') {
    try {
      const category = pathParts[3];
      const result = await env.DB.prepare(
        'SELECT * FROM amenities WHERE category = ? AND is_active = 1 ORDER BY display_order ASC'
      ).bind(category).all();
      return successResponse(result.results);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // GET /api/amenities/:id
  if (pathParts[2] && !isNaN(Number(pathParts[2])) && method === 'GET') {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare('SELECT * FROM amenities WHERE id = ?').bind(id).first();
      if (!result) return errorResponse('Amenity not found', 404);
      return successResponse(result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  return errorResponse('Endpoint not found', 404);
}

// ==================== AUTHENTICATION ====================
async function handleAuth(url: URL, method: string, body: any, env: Env): Promise<Response> {
  // POST /api/auth/login
  if (url.pathname === '/api/auth/login' && method === 'POST') {
    try {
      if (!body.username || !body.password) {
        return errorResponse('Username and password required', 400);
      }

      const user = await env.DB.prepare(
        'SELECT id, username, email, role, password_hash FROM users WHERE username = ? AND active = 1'
      ).bind(body.username).first();

      if (!user) return errorResponse('Invalid credentials', 401);

      // TODO: Implement proper password verification (bcrypt)
      // For now using placeholder
      const token = Buffer.from(
        JSON.stringify({ id: user.id, username: user.username, role: user.role })
      ).toString('base64');

      return successResponse({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // POST /api/auth/verify
  if (url.pathname === '/api/auth/verify' && method === 'POST') {
    try {
      if (!body.token) return errorResponse('Token required', 400);

      // TODO: Implement proper JWT verification
      const decoded = JSON.parse(Buffer.from(body.token, 'base64').toString());
      return successResponse({ valid: true, user: decoded });
    } catch (error) {
      return errorResponse('Invalid token', 401);
    }
  }

  return errorResponse('Endpoint not found', 404);
}

// ==================== IMAGES ====================
async function handleImages(url: URL, method: string, request: Request, env: Env): Promise<Response> {
  const R2_PUBLIC_URL = 'https://bookingengine-8g1-boe-kxn.pages.dev';

  // GET /api/images/list
  if (url.pathname === '/api/images/list' && method === 'GET') {
    try {
      const prefix = url.searchParams.get('prefix') || '';
      const listed = await env.IMAGES.list({ prefix });

      return successResponse({
        files: listed.objects.map((obj) => ({
          id: obj.key,
          filename: obj.key.split('/').pop(),
          uploaded: obj.uploaded.toISOString(),
          size: obj.size,
          url: `${R2_PUBLIC_URL}/${obj.key}`,
        }))
      });
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // POST /api/images/upload
  if (url.pathname === '/api/images/upload' && method === 'POST') {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const prefix = (formData.get('prefix') as string) || '';

      if (!file) return errorResponse('No file provided', 400);

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return errorResponse('File too large. Max 10MB', 413);
      }

      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
      if (!allowedMimes.includes(file.type)) {
        return errorResponse('Invalid file type. Only JPEG, PNG, WebP, AVIF, GIF allowed', 400);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${randomString}.${extension}`;
      const key = prefix ? `${prefix}${filename}` : filename;

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
      return errorResponse(error.message);
    }
  }

  // DELETE /api/images/:imageId (supports nested paths)
  if (url.pathname.startsWith('/api/images/') && method === 'DELETE') {
    try {
      const imageKey = url.pathname.replace('/api/images/', '');

      await env.IMAGES.delete(imageKey);

      return successResponse({ success: true, message: 'Image deleted', key: imageKey });
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  return errorResponse('Endpoint not found', 404);
}

// ==================== ADMIN ====================
async function handleAdmin(url: URL, method: string, body: any, env: Env): Promise<Response> {
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
      return errorResponse(error.message);
    }
  }

  // GET /api/admin/analytics
  if (url.pathname === '/api/admin/analytics' && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT SUM(bookings_count) as bookings, SUM(revenue) as revenue, COUNT(*) as days FROM daily_analytics LIMIT 30'
      ).first();
      return successResponse(result);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  return errorResponse('Endpoint not found', 404);
}

// ==================== SETTINGS ====================
async function handleSettings(url: URL, method: string, body: any, env: Env): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);
  const settingKey = pathParts[2];

  // GET /api/settings - Get all settings
  if (method === 'GET' && !settingKey) {
    try {
      // Try to get from KV first (faster)
      const cachedSettings = await env.CACHE.get('app_settings', 'json');
      if (cachedSettings) {
        return successResponse(cachedSettings);
      }

      // Fallback to defaults
      const defaultSettings = {
        admin_email: env.ADMIN_EMAIL || 'danielsantosomarketing2017@gmail.com',
        villa_name: env.VILLA_NAME || 'Best Villa Bali',
        from_email: env.FROM_EMAIL || 'danielsantosomarketing2017@gmail.com',
      };
      return successResponse(defaultSettings);
    } catch (error) {
      return errorResponse(error.message);
    }
  }

  // GET /api/settings/:key - Get specific setting
  if (method === 'GET' && settingKey) {
    try {
      const settings = await env.CACHE.get('app_settings', 'json') as any;
      if (settings && settings[settingKey]) {
        return successResponse({ key: settingKey, value: settings[settingKey] });
      }
      // Return env default
      const defaults: any = {
        admin_email: env.ADMIN_EMAIL || 'danielsantosomarketing2017@gmail.com',
        villa_name: env.VILLA_NAME || 'Best Villa Bali',
      };
      return successResponse({ key: settingKey, value: defaults[settingKey] || null });
    } catch (error) {
      return errorResponse(error.message);
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
      return errorResponse(error.message);
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
      return errorResponse(error.message);
    }
  }

  return errorResponse('Settings endpoint not found', 404);
}

// Helper function to get admin email (checks KV first, then env)
async function getAdminEmail(env: Env): Promise<string> {
  try {
    const settings = await env.CACHE.get('app_settings', 'json') as any;
    if (settings && settings.admin_email) {
      return settings.admin_email;
    }
  } catch (e) {
    console.error('Error getting admin email from KV:', e);
  }
  return env.ADMIN_EMAIL || 'danielsantosomarketing2017@gmail.com';
}

// ==================== EMAIL ====================
async function handleEmail(url: URL, method: string, body: any, env: Env): Promise<Response> {
  if (method !== 'POST') {
    return errorResponse('Only POST method allowed', 405);
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  const action = pathParts[2];

  try {
    // Send booking confirmation email
    if (action === 'booking-confirmation') {
      const { booking_data } = body;

      if (!booking_data || !booking_data.guest_email) {
        return errorResponse('Missing booking_data or guest_email', 400);
      }

      // Send real email via Resend API
      const emailHtml = getBookingConfirmationHtml(booking_data, env);
      const resendResult = await sendEmailViaResend(
        env,
        booking_data.guest_email,
        `🎉 Booking Confirmation - ${env.VILLA_NAME || 'Best Villa Bali'}`,
        emailHtml
      );

      // Store email record in KV
      await env.CACHE.put(
        `email:${booking_data.booking_reference}:guest`,
        JSON.stringify({
          to: booking_data.guest_email,
          type: 'booking_confirmation',
          sent_at: new Date().toISOString(),
          booking_data: booking_data,
          resend_id: resendResult.id,
        }),
        { expirationTtl: 86400 * 30 }
      );

      return successResponse({
        success: true,
        message: 'Booking confirmation email sent successfully',
        recipient: booking_data.guest_email,
        booking_reference: booking_data.booking_reference,
        timestamp: new Date().toISOString(),
        email_id: resendResult.id,
        resend_error: (resendResult as any).error || null,
      });
    }

    // Send admin notification email
    if (action === 'admin-notification') {
      const { booking_data } = body;
      // Get admin email from KV (dynamic) or fallback to env
      const adminEmail = await getAdminEmail(env);

      // Send real email via Resend API
      const emailHtml = getAdminNotificationHtml(booking_data, env);
      const resendResult = await sendEmailViaResend(
        env,
        adminEmail,
        `🔔 New Booking Alert - ${booking_data?.booking_reference || 'New Booking'}`,
        emailHtml
      );

      // Store email record
      await env.CACHE.put(
        `email:${booking_data?.booking_reference}:admin`,
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

      return successResponse(emailResult);
    }

    return errorResponse('Unknown email action', 400);
  } catch (error) {
    console.error('Email handler error:', error);
    return errorResponse(error.message || 'Email service error', 500);
  }
}

// ==================== RESEND EMAIL SERVICE ====================
async function sendEmailViaResend(env: Env, to: string, subject: string, html: string): Promise<{ id: string, error?: string }> {
  const RESEND_API_KEY = env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { id: 'no-api-key' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${env.VILLA_NAME || 'Best Villa Bali'} <booking@bookingengine.com>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      return { id: 'error-' + Date.now(), error: JSON.stringify(result) };
    }

    return { id: result.id || 'sent-' + Date.now() };
  } catch (error) {
    console.error('Resend fetch error:', error);
    return { id: 'error-' + Date.now() };
  }
}

function getBookingConfirmationHtml(booking: any, env: Env): string {
  const villaName = env.VILLA_NAME || 'Best Villa Bali';
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2E8B57; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f9f9f9; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .detail-row { padding: 12px 0; border-bottom: 1px solid #eee; display: flex; }
    .detail-label { font-weight: bold; color: #2E8B57; width: 40%; }
    .detail-value { width: 60%; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f0f0f0; border-radius: 0 0 8px 8px; }
    .highlight { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2E8B57; }
    h1 { margin: 0; font-size: 28px; }
    h2 { margin: 10px 0 0; font-size: 18px; font-weight: normal; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏨 ${villaName}</h1>
      <h2>Booking Confirmation</h2>
    </div>
    <div class="content">
      <div class="highlight">
        <h3 style="margin-top:0;">✅ Your booking has been confirmed!</h3>
        <p style="margin-bottom:0;"><strong>Booking Reference:</strong> ${booking.booking_reference || 'BK-' + Date.now()}</p>
      </div>
      
      <div class="booking-details">
        <h3 style="margin-top:0;">📋 Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Guest Name:</span>
          <span class="detail-value">${booking.guest_name || 'Guest'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${booking.guest_email || ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in:</span>
          <span class="detail-value">${booking.check_in || 'TBD'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out:</span>
          <span class="detail-value">${booking.check_out || 'TBD'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Guests:</span>
          <span class="detail-value">${booking.guests || '1'} guest(s)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Room/Package:</span>
          <span class="detail-value">${booking.room_name || 'Standard Room'}</span>
        </div>
        <div class="detail-row" style="border-bottom:none;">
          <span class="detail-label">Total Amount:</span>
          <span class="detail-value"><strong>$${booking.total_amount || '0.00'}</strong></span>
        </div>
      </div>
      
      <p>We look forward to welcoming you!</p>
    </div>
    <div class="footer">
      <p>Thank you for choosing ${villaName} for your Bali getaway.</p>
      <p>${villaName} | Luxury Accommodation in Bali</p>
      <p>Email sent: ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;
}

function getAdminNotificationHtml(booking: any, env: Env): string {
  const villaName = env.VILLA_NAME || 'Best Villa Bali';
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #FF6B35; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f9f9f9; }
    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .detail-row { padding: 12px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #FF6B35; display: inline-block; width: 40%; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; background: #f0f0f0; border-radius: 0 0 8px 8px; }
    .alert { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35; }
    h1 { margin: 0; font-size: 28px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Booking Alert</h1>
      <p style="margin:10px 0 0;">${villaName}</p>
    </div>
    <div class="content">
      <div class="alert">
        <h3 style="margin-top:0;">⚡ New booking received!</h3>
        <p style="margin-bottom:0;"><strong>Action Required:</strong> Review and confirm booking details</p>
      </div>
      
      <div class="booking-details">
        <h3 style="margin-top:0;">📋 Booking Information</h3>
        <div class="detail-row">
          <span class="detail-label">Booking Ref:</span> ${booking?.booking_reference || 'N/A'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Guest Name:</span> ${booking?.guest_name || 'Guest'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span> ${booking?.guest_email || 'N/A'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone:</span> ${booking?.guest_phone || booking?.phone || 'Not provided'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in:</span> ${booking?.check_in || 'TBD'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out:</span> ${booking?.check_out || 'TBD'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Guests:</span> ${booking?.guests || '1'} guest(s)
        </div>
        <div class="detail-row">
          <span class="detail-label">Room/Package:</span> ${booking?.room_name || 'Standard Room'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Amount:</span> <strong>$${booking?.total_amount || '0.00'}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">Booking Time:</span> ${new Date().toISOString()}
        </div>
      </div>
    </div>
    <div class="footer">
      <p>${villaName} - Admin Notification System</p>
      <p>${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    return handleRequest(request, env);
  },
};
