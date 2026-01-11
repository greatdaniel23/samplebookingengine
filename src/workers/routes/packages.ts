import { Env } from '../types';

export async function handlePackages(url: URL, method: string, body: any, env: Env): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  const parsePackage = (pkg: any) => {
    try {
      if (pkg.images && typeof pkg.images === 'string') pkg.images = JSON.parse(pkg.images);
      // Parse other JSON fields if any
    } catch (e) {
      console.error('Error parsing package data:', e);
      if (typeof pkg.images === 'string') pkg.images = [];
    }
    return pkg;
  };

  // GET /api/packages - list all packages
  if (pathParts.length === 2 && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM packages WHERE is_active = 1 ORDER BY name'
      ).all();

      const packages = result.results.map(parsePackage);

      return new Response(JSON.stringify({
        success: true,
        data: packages
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
        data: parsePackage(result)
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

  // POST /api/packages - create new package
  if (pathParts.length === 2 && method === 'POST') {
    try {
      const {
        name,
        description,
        type,
        base_room_id,
        base_price,
        min_nights,
        max_nights,
        max_guests,
        discount_percentage,
        is_active,
        inclusions,
        exclusions,
        featured
      } = body;

      if (!name) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Package name is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const result = await env.DB.prepare(
        `INSERT INTO packages (name, description, package_type, base_price, discount_percentage, min_nights, max_nights, max_guests, base_room_id, is_active, is_featured, inclusions, exclusions, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        name,
        description || '',
        type || 'Romance',
        base_price || 0,
        discount_percentage || 0,
        min_nights || 1,
        max_nights || 30,
        max_guests || 2,
        base_room_id || null,
        is_active !== false ? 1 : 0,
        featured ? 1 : 0,
        JSON.stringify(inclusions || []),
        JSON.stringify(exclusions || [])
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { id: result.meta.last_row_id, name },
        message: 'Package created successfully'
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

  // PUT /api/packages - update package
  if (pathParts.length === 2 && method === 'PUT') {
    try {
      const { id, ...fields } = body;

      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Package ID is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (fields.name !== undefined) { updates.push('name = ?'); values.push(fields.name); }
      if (fields.description !== undefined) { updates.push('description = ?'); values.push(fields.description); }
      if (fields.package_type !== undefined) { updates.push('package_type = ?'); values.push(fields.package_type); }
      if (fields.base_price !== undefined) { updates.push('base_price = ?'); values.push(fields.base_price); }
      if (fields.discount_percentage !== undefined) { updates.push('discount_percentage = ?'); values.push(fields.discount_percentage); }
      if (fields.min_nights !== undefined) { updates.push('min_nights = ?'); values.push(fields.min_nights); }
      if (fields.max_nights !== undefined) { updates.push('max_nights = ?'); values.push(fields.max_nights); }
      if (fields.max_guests !== undefined) { updates.push('max_guests = ?'); values.push(fields.max_guests); }
      if (fields.base_room_id !== undefined) { updates.push('base_room_id = ?'); values.push(fields.base_room_id || null); }
      if (fields.is_active !== undefined) { updates.push('is_active = ?'); values.push(fields.is_active ? 1 : 0); }
      if (fields.is_featured !== undefined) { updates.push('is_featured = ?'); values.push(fields.is_featured ? 1 : 0); }
      if (fields.includes !== undefined) { updates.push('inclusions = ?'); values.push(fields.includes); }
      if (fields.exclusions !== undefined) { updates.push('exclusions = ?'); values.push(fields.exclusions); }
      if (fields.images !== undefined) { updates.push('images = ?'); values.push(fields.images); }
      if (fields.valid_from !== undefined) { updates.push('valid_from = ?'); values.push(fields.valid_from); }
      if (fields.valid_until !== undefined) { updates.push('valid_until = ?'); values.push(fields.valid_until); }
      if (fields.terms_conditions !== undefined) { updates.push('terms_conditions = ?'); values.push(fields.terms_conditions); }

      if (updates.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No fields to update'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      updates.push("updated_at = datetime('now')");
      values.push(id);

      await env.DB.prepare(
        `UPDATE packages SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Package updated successfully'
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

  // DELETE /api/packages - soft delete package
  if (pathParts.length === 2 && method === 'DELETE') {
    try {
      const { id } = body;

      if (!id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Package ID is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      await env.DB.prepare(
        "UPDATE packages SET is_active = 0, updated_at = datetime('now') WHERE id = ?"
      ).bind(id).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Package deleted successfully'
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
