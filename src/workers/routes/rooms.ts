import { Env } from '../types';
import { requireAuth } from '../utils/auth';

export async function handleRooms(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Auth check for non-GET methods
  if (method !== 'GET') {
    const auth = await requireAuth(request, env);
    if (!auth.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  const parseRoom = (room: any) => {
    try {
      // images is a JSON array stored as text in DB
      if (room.images && typeof room.images === 'string') room.images = JSON.parse(room.images);
    } catch (e) {
      console.error('Error parsing room data:', e);
      if (typeof room.images === 'string') room.images = [];
    }
    // K3 fix: alias DB column names to FE expected names so edit form populates correctly
    // DB: base_price, max_occupancy — FE edit form reads: price, capacity
    if (room.base_price !== undefined && room.price === undefined) room.price = room.base_price;
    if (room.max_occupancy !== undefined && room.capacity === undefined) room.capacity = room.max_occupancy;
    return room;
  };

  // GET /api/rooms - list all rooms
  if (pathParts.length === 2 && method === 'GET') {
    try {
      const { searchParams } = url;
      const includeAll = searchParams.get('all') === 'true';

      const query = includeAll
        ? 'SELECT * FROM rooms ORDER BY name'
        : 'SELECT * FROM rooms WHERE is_active = 1 ORDER BY name';

      const result = await env.DB.prepare(query).all();

      const rooms = result.results.map(parseRoom);

      return new Response(JSON.stringify({
        success: true,
        data: rooms
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // GET /api/rooms/:id - get single room
  if (pathParts.length === 3 && method === 'GET') {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare(
        'SELECT * FROM rooms WHERE id = ?'
      ).bind(id).first();

      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Room not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        data: parseRoom(result)
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // POST /api/rooms - create new room
  if (pathParts.length === 2 && method === 'POST') {
    try {
      // Accept multiple field name aliases (FE sends 'price'/'capacity', DB has 'base_price'/'max_occupancy')
      const {
        name, type, description,
        base_price, price, price_per_night,
        max_occupancy, capacity, max_guests,
        amenities, images, slug,
        size_sqm, bed_type, view_type, display_order, is_active
      } = body;

      if (!name) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Room name is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Resolve canonical DB field names (DB has base_price, max_occupancy)
      const resolvedPrice = base_price ?? price ?? price_per_night ?? 0;
      const resolvedMaxOccupancy = max_occupancy ?? capacity ?? max_guests ?? 2;

      const result = await env.DB.prepare(
        `INSERT INTO rooms (name, type, description, base_price, max_occupancy, images, is_active, display_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        name,
        type || 'Standard',
        description || '',
        resolvedPrice,
        resolvedMaxOccupancy,
        Array.isArray(images) ? JSON.stringify(images) : (images || '[]'),
        is_active !== false ? 1 : 0,
        display_order ?? 0
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { id: result.meta.last_row_id, name, type },
        message: 'Room created successfully'
      }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // PUT /api/rooms/:id - update room
  if (pathParts.length === 3 && method === 'PUT') {
    try {
      const id = parseInt(pathParts[2]);
      // Accept multiple field name aliases for price and capacity
      const {
        name, type, description,
        base_price, price, price_per_night,
        max_occupancy, capacity, max_guests,
        amenities, images, is_active,
        slug, size_sqm, bed_type, view_type, display_order
      } = body;

      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) { updates.push('name = ?'); values.push(name); }
      if (type !== undefined) { updates.push('type = ?'); values.push(type); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      // base_price aliases (FE may send 'price' or 'price_per_night')
      const priceUpdate = base_price ?? price ?? price_per_night;
      if (priceUpdate !== undefined) { updates.push('base_price = ?'); values.push(priceUpdate); }
      // max_occupancy aliases (FE may send 'capacity' or 'max_guests')
      const occupancyUpdate = max_occupancy ?? capacity ?? max_guests;
      if (occupancyUpdate !== undefined) { updates.push('max_occupancy = ?'); values.push(occupancyUpdate); }
      // images column exists in DB; amenities column does NOT exist (room_amenities is separate junction table)
      if (images !== undefined) { updates.push('images = ?'); values.push(Array.isArray(images) ? JSON.stringify(images) : images); }
      if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }
      if (size_sqm !== undefined) { updates.push('size_sqm = ?'); values.push(size_sqm); }
      if (bed_type !== undefined) { updates.push('bed_type = ?'); values.push(bed_type); }
      if (view_type !== undefined) { updates.push('view_type = ?'); values.push(view_type); }
      if (display_order !== undefined) { updates.push('display_order = ?'); values.push(display_order); }

      updates.push("updated_at = datetime('now')");
      values.push(id);

      await env.DB.prepare(
        `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Room updated successfully'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // DELETE /api/rooms/:id - delete room (soft delete)
  if (pathParts.length === 3 && method === 'DELETE') {
    try {
      const id = parseInt(pathParts[2]);

      await env.DB.prepare(
        "UPDATE rooms SET is_active = 0, updated_at = datetime('now') WHERE id = ?"
      ).bind(id).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Room deleted successfully'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  return new Response(JSON.stringify({
    success: false,
    error: 'Invalid rooms endpoint'
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
