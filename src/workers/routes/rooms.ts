import { Env } from '../types';
import { getTokenFromHeader, verifyToken } from '../utils/auth';

export async function handleRooms(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Auth check for non-GET methods
  if (method !== 'GET') {
    const authHeader = request.headers.get('Authorization');
    const token = getTokenFromHeader(authHeader);
    const valid = token ? await verifyToken(token, env.JWT_SECRET) : false;

    if (!valid) {
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
      if (room.amenities && typeof room.amenities === 'string') room.amenities = JSON.parse(room.amenities);
      if (room.images && typeof room.images === 'string') room.images = JSON.parse(room.images);
      if (room.features && typeof room.features === 'string') room.features = JSON.parse(room.features);
    } catch (e) {
      console.error('Error parsing room data:', e);
      if (typeof room.amenities === 'string') room.amenities = [];
      if (typeof room.images === 'string') room.images = [];
      if (typeof room.features === 'string') room.features = [];
    }
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
      const { name, type, description, price_per_night, max_guests, amenities, images } = body;

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

      const result = await env.DB.prepare(
        `INSERT INTO rooms (name, type, description, price_per_night, max_guests, amenities, images, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
      ).bind(
        name,
        type || 'Standard',
        description || '',
        price_per_night || 0,
        max_guests || 2,
        JSON.stringify(amenities || []),
        JSON.stringify(images || [])
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
      const { name, type, description, price_per_night, max_guests, amenities, images, is_active } = body;

      const updates: string[] = [];
      const values: any[] = [];

      if (name !== undefined) { updates.push('name = ?'); values.push(name); }
      if (type !== undefined) { updates.push('type = ?'); values.push(type); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (price_per_night !== undefined) { updates.push('price_per_night = ?'); values.push(price_per_night); }
      if (max_guests !== undefined) { updates.push('max_guests = ?'); values.push(max_guests); }
      if (amenities !== undefined) { updates.push('amenities = ?'); values.push(JSON.stringify(amenities)); }
      if (images !== undefined) { updates.push('images = ?'); values.push(JSON.stringify(images)); }
      if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }

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
