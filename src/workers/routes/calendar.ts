/**
 * 📅 Calendar & iCal Route Handler
 *
 * Handles all calendar-related API endpoints:
 *  GET  /api/calendar/ical                 – export bookings as .ics
 *  GET  /api/calendar/subscribe            – get subscription URLs
 *  POST /api/calendar/sync                 – fetch Airbnb iCal & import
 *  GET  /api/calendar/external-blocks      – list external blocks
 *  POST /api/calendar/external-blocks      – add manual block
 *  DELETE /api/calendar/external-blocks/:id – delete a block
 *  GET  /api/calendar/availability         – date conflict check
 *  GET  /api/calendar/config               – get stored iCal URLs
 *  PUT  /api/calendar/config               – save iCal URLs
 *  GET  /api/calendar/proxy?source=URL     – proxy/test an iCal URL
 */

import { Env } from '../types';
import { requireAuth } from '../utils/auth';

// ─── CORS whitelist (mirrors amenities.ts / index.ts pattern) ─────────────────

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

// ─── Shared response helpers ──────────────────────────────────────────────────

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Origin',
      ...SECURITY_HEADERS,
    },
  });
}

// ─── iCal Parser ──────────────────────────────────────────────────────────────

function parseICalDate(value: string): string {
  const v = value.trim();
  // DATE: YYYYMMDD
  if (/^\d{8}$/.test(v)) {
    return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
  }
  // DATETIME: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  if (/^\d{8}T/.test(v)) {
    return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
  }
  return v;
}

function parseICalEvents(
  icsContent: string
): Array<{ start: string; end: string; summary: string; uid: string }> {
  const events: Array<{ start: string; end: string; summary: string; uid: string }> = [];

  // RFC 5545 line unfolding: CRLF + (SPACE|TAB) = continuation
  const unfolded = icsContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '');

  const lines = unfolded.split('\n');
  let inEvent = false;
  let current: Record<string, string> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
    } else if (line === 'END:VEVENT') {
      inEvent = false;
      if (current.start && current.end) {
        events.push({
          start: current.start,
          end: current.end,
          summary: current.summary || 'Blocked',
          uid: current.uid || `${current.start}-${current.end}`,
        });
      }
    } else if (inEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const fullKey = line.slice(0, colonIdx).toUpperCase();
      const value = line.slice(colonIdx + 1);
      // Base key = before first semicolon (strips ;VALUE=DATE etc.)
      const key = fullKey.split(';')[0];

      if (key === 'DTSTART') {
        current.start = parseICalDate(value);
      } else if (key === 'DTEND') {
        current.end = parseICalDate(value);
      } else if (key === 'SUMMARY') {
        current.summary = value
          .replace(/\\n/g, '\n')
          .replace(/\\,/g, ',')
          .replace(/\\;/g, ';')
          .replace(/\\\\/g, '\\');
      } else if (key === 'UID') {
        current.uid = value;
      }
    }
  }

  return events;
}

// ─── iCal Generator (export bookings as .ics) ─────────────────────────────────

function formatICalDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function formatICalTimestamp(iso: string): string {
  try {
    return new Date(iso).toISOString().replace(/[-:.]/g, '').replace('Z', 'Z').slice(0, 16) + '00Z';
  } catch {
    return new Date().toISOString().replace(/[-:.]/g, '').slice(0, 16) + '00Z';
  }
}

function generateICalContent(bookings: any[], villaName: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${villaName}//Booking Engine//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${villaName} Bookings`,
    'X-WR-TIMEZONE:Asia/Makassar',
  ];

  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue;
    const guestName = `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Guest';
    const statusLabel = booking.status === 'confirmed' ? 'Confirmed' : 'Reserved';
    lines.push('BEGIN:VEVENT');
    lines.push(
      `UID:booking-${booking.booking_reference || booking.id}@${villaName.toLowerCase().replace(/\s+/g, '-')}`
    );
    lines.push(`DTSTART;VALUE=DATE:${formatICalDate(booking.check_in)}`);
    lines.push(`DTEND;VALUE=DATE:${formatICalDate(booking.check_out)}`);
    lines.push(`SUMMARY:${statusLabel} - ${guestName}`);
    lines.push(`STATUS:${booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`);
    lines.push(`DTSTAMP:${formatICalTimestamp(booking.created_at || new Date().toISOString())}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

// ─── Ensure external_blocks table exists ──────────────────────────────────────

async function ensureExternalBlocksTable(env: Env): Promise<void> {
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS external_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL DEFAULT 'airbnb',
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        summary TEXT DEFAULT 'Blocked',
        uid TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();
  } catch {
    // Table likely already exists – ignore
  }
}

// ─── Main Handler ──────────────────────────────────────────────────────────────

export async function handleCalendar(
  url: URL,
  method: string,
  body: any,
  env: Env,
  request: Request
): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);
  // pathParts: ['api', 'calendar', subPath?, subId?]
  const subPath = pathParts[2] || '';
  const subId = pathParts[3] || '';

  // Ensure external_blocks table exists on every request (cheap no-op if already there)
  await ensureExternalBlocksTable(env);

  try {
    // ── GET /api/calendar/ical ──────────────────────────────────────────────
    // Export bookings as .ics (or JSON preview)
    if (subPath === 'ical' && method === 'GET') {
      const status = url.searchParams.get('status') || 'all';
      const format = url.searchParams.get('format') || 'ics';

      let query: string;
      let params: any[];

      if (status === 'all') {
        query = "SELECT * FROM bookings WHERE status != 'cancelled' ORDER BY check_in ASC";
        params = [];
      } else {
        query = 'SELECT * FROM bookings WHERE status = ? ORDER BY check_in ASC';
        params = [status];
      }

      const result =
        params.length > 0
          ? await env.DB.prepare(query).bind(...params).all()
          : await env.DB.prepare(query).all();

      const bookings = result.results || [];

      // Get villa name from env or settings table
      let villaName = env.VILLA_NAME || 'Villa';
      try {
        const villaRow = await env.DB.prepare(
          "SELECT setting_value FROM settings WHERE setting_key = 'villa_name' LIMIT 1"
        ).first() as any;
        if (villaRow?.setting_value) villaName = villaRow.setting_value;
      } catch { /* use default */ }

      if (format === 'json') {
        return successResponse({ bookings, count: bookings.length }, request);
      }

      const icsContent = generateICalContent(bookings, villaName);
      return new Response(icsContent, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'attachment; filename="villa-bookings.ics"',
          // iCal feed is intentionally public so calendar apps (Airbnb, Google Cal, etc.) can subscribe
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // ── GET /api/calendar/subscribe ─────────────────────────────────────────
    // Returns subscription URLs for Google Calendar, Outlook, Apple, Airbnb etc.
    if (subPath === 'subscribe' && method === 'GET') {
      const baseUrl = `https://${url.hostname}`;
      const calUrl = `${baseUrl}/api/calendar/ical?format=ics`;
      const webcalUrl = calUrl.replace('https://', 'webcal://');

      return successResponse({
        subscribe_url: calUrl,
        webcal_url: webcalUrl,
        instructions: {
          google_calendar: `Open Google Calendar → Other Calendars (+) → From URL → Paste: ${calUrl}`,
          outlook: `Outlook → Add calendar → Subscribe from web → Paste: ${calUrl}`,
          apple_calendar: `Calendar app → File → New Calendar Subscription → Paste: ${webcalUrl}`,
          airbnb: `Airbnb host → Calendar → Import calendar → Paste: ${calUrl}`,
        },
      }, request);
    }

    // ── POST /api/calendar/sync ─────────────────────────────────────────────
    // Fetches a remote iCal feed (Airbnb etc.) and stores events as external_blocks
    // ⚠ K1 SECURITY FIX: requires valid JWT — unauthenticated callers get 401
    if (subPath === 'sync' && method === 'POST') {
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401, request);

      let icalUrl: string | null = body?.url || null;
      const source: string = body?.source || 'airbnb';

      // If no URL in body, look it up in settings
      if (!icalUrl) {
        const settingKey = source === 'airbnb' ? 'airbnb_ical_url'
          : source === 'booking' ? 'booking_ical_url'
          : source === 'vrbo' ? 'vrbo_ical_url'
          : 'airbnb_ical_url';

        try {
          const row = await env.DB.prepare(
            'SELECT setting_value FROM settings WHERE setting_key = ? LIMIT 1'
          ).bind(settingKey).first() as any;
          icalUrl = row?.setting_value || null;
        } catch { /* ignore */ }
      }

      if (!icalUrl) {
        return errorResponse(
          `No iCal URL configured for source "${source}". Please save it in Calendar Settings first.`,
          400,
          request
        );
      }

      // Fetch the remote iCal feed server-side (Workers bypass browser CORS)
      let icsContent: string;
      try {
        const fetchResponse = await fetch(icalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VillaBookingEngine/1.0)',
          },
        });
        if (!fetchResponse.ok) {
          return errorResponse(`Failed to fetch iCal feed: HTTP ${fetchResponse.status} ${fetchResponse.statusText}`, 400, request);
        }
        icsContent = await fetchResponse.text();
      } catch (e: any) {
        return errorResponse(`Network error fetching iCal feed: ${e.message}`, 400, request);
      }

      // Parse VEVENT blocks
      const events = parseICalEvents(icsContent);

      // Remove old blocks for this source, then bulk-insert new ones
      await env.DB.prepare('DELETE FROM external_blocks WHERE source = ?').bind(source).run();

      let inserted = 0;
      const now = new Date().toISOString();

      for (const event of events) {
        if (!event.start || !event.end) continue;
        try {
          await env.DB.prepare(
            'INSERT INTO external_blocks (source, start_date, end_date, summary, uid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          ).bind(source, event.start, event.end, event.summary, event.uid, now, now).run();
          inserted++;
        } catch { /* skip duplicates or bad rows */ }
      }

      return successResponse({
        events_processed: events.length,
        inserted,
        updated: 0,
        skipped: events.length - inserted,
        sync_timestamp: now,
        source,
      }, request);
    }

    // ── GET /api/calendar/external-blocks ──────────────────────────────────
    if (subPath === 'external-blocks' && method === 'GET') {
      const source = url.searchParams.get('source');
      const from = url.searchParams.get('from') || url.searchParams.get('start_date');
      const to = url.searchParams.get('to') || url.searchParams.get('end_date');

      const conditions: string[] = [];
      const params: any[] = [];

      if (source) { conditions.push('source = ?'); params.push(source); }
      if (from)   { conditions.push('end_date >= ?'); params.push(from); }
      if (to)     { conditions.push('start_date <= ?'); params.push(to); }

      const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      const query = `SELECT * FROM external_blocks ${where} ORDER BY start_date ASC`;

      const result =
        params.length > 0
          ? await env.DB.prepare(query).bind(...params).all()
          : await env.DB.prepare(query).all();

      return successResponse({ success: true, data: result.results || [] }, request);
    }

    // ── POST /api/calendar/external-blocks ─────────────────────────────────
    // ⚠ K1 SECURITY FIX: requires valid JWT
    if (subPath === 'external-blocks' && !subId && method === 'POST') {
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401, request);

      const { source = 'manual', start_date, end_date, summary = 'Manual Block' } = body || {};
      if (!start_date || !end_date) {
        return errorResponse('start_date and end_date are required', 400, request);
      }
      const now = new Date().toISOString();
      const result = await env.DB.prepare(
        'INSERT INTO external_blocks (source, start_date, end_date, summary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(source, start_date, end_date, summary, now, now).run();

      return successResponse({ id: result.meta?.last_row_id }, request);
    }

    // ── DELETE /api/calendar/external-blocks/:id ────────────────────────────
    // ⚠ K1 SECURITY FIX: requires valid JWT
    if (subPath === 'external-blocks' && subId && method === 'DELETE') {
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401, request);

      await env.DB.prepare('DELETE FROM external_blocks WHERE id = ?').bind(Number(subId)).run();
      return successResponse({ message: 'External block deleted' }, request);
    }

    // ── GET /api/calendar/availability ─────────────────────────────────────
    // Returns whether the requested date range is free of bookings AND external blocks
    if (subPath === 'availability' && method === 'GET') {
      const checkIn  = url.searchParams.get('check_in');
      const checkOut = url.searchParams.get('check_out');

      if (!checkIn || !checkOut) {
        return errorResponse('check_in and check_out query params are required', 400, request);
      }

      // Bookings that overlap with the requested range
      const bookingConflicts = await env.DB.prepare(
        `SELECT check_in, check_out, status FROM bookings
         WHERE check_in < ? AND check_out > ?
         AND status NOT IN ('cancelled')`
      ).bind(checkOut, checkIn).all();

      // External blocks (Airbnb etc.) that overlap
      const externalConflicts = await env.DB.prepare(
        `SELECT start_date, end_date, source, summary FROM external_blocks
         WHERE start_date < ? AND end_date > ?`
      ).bind(checkOut, checkIn).all();

      const bookingList  = bookingConflicts.results  || [];
      const externalList = externalConflicts.results || [];
      const available    = bookingList.length === 0 && externalList.length === 0;

      return successResponse({
        available,
        booking_conflicts:  bookingList,
        external_conflicts: externalList,
      }, request);
    }

    // ── GET /api/calendar/config ────────────────────────────────────────────
    if (subPath === 'config' && method === 'GET') {
      const config: Record<string, string | null> = {
        airbnb_ical_url:  null,
        booking_ical_url: null,
        vrbo_ical_url:    null,
      };

      try {
        const rows = await env.DB.prepare(
          `SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('airbnb_ical_url','booking_ical_url','vrbo_ical_url')`
        ).all() as any;
        for (const row of (rows.results || [])) {
          config[row.setting_key] = row.setting_value;
        }
      } catch { /* settings table might not have these rows yet */ }

      return successResponse(config, request);
    }

    // ── PUT /api/calendar/config ─────────────────────────────────────────────
    // ⚠ K1 SECURITY FIX: requires valid JWT — unauthenticated callers get 401
    if (subPath === 'config' && method === 'PUT') {
      const auth = await requireAuth(request, env);
      if (!auth.valid) return errorResponse('Unauthorized', 401, request);

      const allowed = ['airbnb_ical_url', 'booking_ical_url', 'vrbo_ical_url'];
      const updates = body || {};
      const now = new Date().toISOString();

      for (const key of allowed) {
        if (!(key in updates)) continue;
        const val = updates[key] || null;

        const existing = await env.DB.prepare(
          'SELECT id FROM settings WHERE setting_key = ?'
        ).bind(key).first();

        if (existing) {
          await env.DB.prepare(
            'UPDATE settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?'
          ).bind(val, now, key).run();
        } else {
          await env.DB.prepare(
            "INSERT INTO settings (setting_key, setting_value, category, created_at, updated_at) VALUES (?, ?, 'calendar', ?, ?)"
          ).bind(key, val, now, now).run();
        }
      }

      return successResponse({ message: 'Calendar config updated' }, request);
    }

    // ── GET /api/calendar/proxy ─────────────────────────────────────────────
    // Server-side proxy to fetch & validate an iCal URL (used by admin "Test URL" button)
    if (subPath === 'proxy' && method === 'GET') {
      const targetUrl = url.searchParams.get('source') || url.searchParams.get('url');
      if (!targetUrl) {
        return errorResponse('source URL parameter required', 400, request);
      }

      try {
        const fetchResponse = await fetch(targetUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VillaBookingEngine/1.0)' },
        });
        if (!fetchResponse.ok) {
          return successResponse({ success: false, event_count: 0, error: `HTTP ${fetchResponse.status}` }, request);
        }
        const icsContent = await fetchResponse.text();
        const events = parseICalEvents(icsContent);
        return successResponse({
          success: true,
          event_count: events.length,
          // Return a preview of the first 5 events
          events: events.slice(0, 5),
        }, request);
      } catch (e: any) {
        return successResponse({ success: false, event_count: 0, error: e.message }, request);
      }
    }

  } catch (err: any) {
    return errorResponse(err.message || 'Calendar route error', 500, request);
  }

  return errorResponse('Calendar endpoint not found', 404, request);
}
