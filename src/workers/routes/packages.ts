import { Env } from '../types';

export async function handlePackages(url: URL, method: string, body: any, env: Env): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // GET /api/packages - list all packages
  if (pathParts.length === 2 && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM packages WHERE is_active = 1 ORDER BY name'
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

  // GET /api/packages/:id - get single package
  if (pathParts.length === 3 && method === 'GET') {
    try {
      const id = parseInt(pathParts[2]);
      const result = await env.DB.prepare(
        'SELECT * FROM packages WHERE id = ?'
      ).bind(id).first();
      
      if (!result) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Package not found' 
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

  // GET /api/packages/:id/rooms - get package rooms
  if (pathParts.length === 4 && pathParts[3] === 'rooms' && method === 'GET') {
    try {
      const packageId = parseInt(pathParts[2]);
      const result = await env.DB.prepare(`
        SELECT pr.*, r.name as room_name, r.description as room_description
        FROM package_rooms pr
        JOIN rooms r ON pr.room_id = r.id
        WHERE pr.package_id = ? AND pr.is_active = 1
        ORDER BY pr.is_default DESC, pr.availability_priority
      `).bind(packageId).all();
      
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

  // GET /api/packages/:id/inclusions - get package inclusions
  if (pathParts.length === 4 && pathParts[3] === 'inclusions' && method === 'GET') {
    try {
      const packageId = parseInt(pathParts[2]);
      const result = await env.DB.prepare(`
        SELECT pi.*, i.name, i.description, i.icon
        FROM package_inclusions pi
        JOIN inclusions i ON pi.inclusion_id = i.id
        WHERE pi.package_id = ? AND pi.is_active = 1
        ORDER BY i.name
      `).bind(packageId).all();
      
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

  return new Response(JSON.stringify({ 
    success: false, 
    error: 'Invalid packages endpoint' 
  }), { 
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
