import { Env } from '../types';

export async function handleRooms(url: URL, method: string, body: any, env: Env): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // GET /api/rooms - list all rooms
  if (pathParts.length === 2 && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM rooms WHERE is_active = 1 ORDER BY name'
      ).all();
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: result.results 
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
        data: result 
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
