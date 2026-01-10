import { Router } from 'itty-router';
import { Env } from '../types';

const router = Router<{ Bindings: Env }>();

// Get all bookings
router.get('/list', async (request, env) => {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100'
    ).all();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), { status: 500 });
  }
});

// Get booking by ID
router.get('/:id', async (request, env) => {
  try {
    const { id } = request.params;

    const result = await env.DB.prepare(
      'SELECT * FROM bookings WHERE id = ?'
    ).bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch booking' }), { status: 500 });
  }
});

// Get booking by reference
router.get('/reference/:ref', async (request, env) => {
  try {
    const { ref } = request.params;

    const result = await env.DB.prepare(
      'SELECT * FROM bookings WHERE booking_reference = ?'
    ).bind(ref).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch booking' }), { status: 500 });
  }
});

// Create booking
router.post('/create', async (request, env) => {
  try {
    const body = await request.json();
    const {
      booking_reference,
      room_id,
      package_id,
      first_name,
      last_name,
      email,
      phone,
      check_in,
      check_out,
      guests,
      adults,
      children = 0,
      total_price,
      currency = 'USD',
      special_requests,
      source = 'direct',
    } = body;

    if (!booking_reference || !room_id || !first_name || !last_name || !email || !check_in || !check_out || !total_price) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const result = await env.DB.prepare(`
      INSERT INTO bookings (
        booking_reference, room_id, package_id, first_name, last_name, email, phone,
        check_in, check_out, guests, adults, children, total_price, currency,
        special_requests, source, status, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', datetime('now'), datetime('now'))
    `).bind(
      booking_reference, room_id, package_id, first_name, last_name, email, phone,
      check_in, check_out, guests, adults, children, total_price, currency,
      special_requests || null, source
    ).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id,
      booking_reference,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to create booking' }), { status: 500 });
  }
});

// Update booking status
router.put('/:id/status', async (request, env) => {
  try {
    const { id } = request.params;
    const { status, payment_status } = await request.json();

    if (!status && !payment_status) {
      return new Response(JSON.stringify({ error: 'No status provided' }), { status: 400 });
    }

    let query = 'UPDATE bookings SET updated_at = datetime(\'now\')';
    const params = [];

    if (status) {
      query += ', status = ?';
      params.push(status);
    }
    if (payment_status) {
      query += ', payment_status = ?';
      params.push(payment_status);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await env.DB.prepare(query).bind(...params).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to update booking' }), { status: 500 });
  }
});

// Get bookings by date range
router.get('/search/by-dates', async (request, env) => {
  try {
    const url = new URL(request.url);
    const checkIn = url.searchParams.get('check_in');
    const checkOut = url.searchParams.get('check_out');

    if (!checkIn || !checkOut) {
      return new Response(JSON.stringify({ error: 'Missing date parameters' }), { status: 400 });
    }

    const result = await env.DB.prepare(`
      SELECT * FROM bookings 
      WHERE check_in <= ? AND check_out >= ?
      ORDER BY check_in ASC
    `).bind(checkOut, checkIn).all();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error searching bookings:', error);
    return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500 });
  }
});

export { router as bookingsRouter };
