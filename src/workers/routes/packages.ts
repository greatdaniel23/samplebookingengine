import { Env } from '../types';
import { getTokenFromHeader, verifyToken } from '../utils/auth';

export async function handlePackages(url: URL, method: string, body: any, env: Env, request: Request): Promise<Response> {
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
      const result = await env.DB.prepare(`
        SELECT json_group_array(
          json_object(
            'id', id,
            'name', name,
            'description', description,
            'package_type', package_type,
            'base_price', base_price,
            'discount_percentage', discount_percentage,
            'duration_days', duration_days,
            'max_guests', max_guests,
            'is_active', is_active,
            'is_featured', is_featured,
            'display_order', display_order,
            'base_room_id', base_room_id,
            'marketing_category_id', marketing_category_id,
            'valid_from', valid_from,
            'valid_until', valid_until,
            'min_nights', min_nights,
            'max_nights', max_nights,
            'images', CASE WHEN json_valid(images) THEN json(images) ELSE json('[]') END,
            'inclusions', inclusions,
            'exclusions', exclusions,
            'terms_conditions', terms_conditions,
            'cancellation_policy', cancellation_policy,
            'created_at', created_at,
            'updated_at', updated_at
          )
        ) as data
        FROM packages WHERE is_active = 1 ORDER BY name
      `).first();

      const jsonString = (result as any)?.data || '[]';

      return new Response(`{"success":true,"data":${jsonString}}`, {
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
      const includeInactive = url.searchParams.get('include_inactive') === '1';
      
      const query = includeInactive
        ? `SELECT pr.*, r.name as room_name, r.description as room_description, r.images as room_images
           FROM package_rooms pr
           JOIN rooms r ON pr.room_id = r.id
           WHERE pr.package_id = ?
           ORDER BY pr.is_default DESC, pr.availability_priority`
        : `SELECT pr.*, r.name as room_name, r.description as room_description, r.images as room_images
           FROM package_rooms pr
           JOIN rooms r ON pr.room_id = r.id
           WHERE pr.package_id = ? AND pr.is_active = 1
           ORDER BY pr.is_default DESC, pr.availability_priority`;
      
      const result = await env.DB.prepare(query).bind(packageId).all();
      
      // Parse room_images JSON field
      const rooms = result.results.map((room: any) => {
        if (room.room_images && typeof room.room_images === 'string') {
          try {
            room.images = JSON.parse(room.room_images);
          } catch {
            room.images = [];
          }
        } else {
          room.images = room.room_images || [];
        }
        delete room.room_images;
        return room;
      });

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

  // POST /api/packages/:id/rooms - add room to package
  if (pathParts.length === 4 && pathParts[3] === 'rooms' && method === 'POST') {
    try {
      const packageId = parseInt(pathParts[2]);
      const { 
        room_id, 
        is_default = 0, 
        price_adjustment = 0, 
        adjustment_type = 'fixed',
        availability_priority = 1,
        max_occupancy_override = null,
        description = null
      } = body;

      if (!room_id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'room_id is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Check if relationship already exists
      const existing = await env.DB.prepare(
        'SELECT * FROM package_rooms WHERE package_id = ? AND room_id = ?'
      ).bind(packageId, room_id).first();

      if (existing) {
        // Reactivate if soft-deleted
        await env.DB.prepare(
          `UPDATE package_rooms 
           SET is_active = 1, is_default = ?, price_adjustment = ?, adjustment_type = ?, 
               availability_priority = ?, max_occupancy_override = ?, description = ?
           WHERE package_id = ? AND room_id = ?`
        ).bind(
          is_default ? 1 : 0,
          price_adjustment,
          adjustment_type,
          availability_priority,
          max_occupancy_override,
          description,
          packageId,
          room_id
        ).run();

        return new Response(JSON.stringify({
          success: true,
          message: 'Room relationship updated'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // If setting as default, unset other defaults first
      if (is_default) {
        await env.DB.prepare(
          'UPDATE package_rooms SET is_default = 0 WHERE package_id = ?'
        ).bind(packageId).run();
      }

      const result = await env.DB.prepare(
        `INSERT INTO package_rooms (package_id, room_id, is_default, price_adjustment, adjustment_type, availability_priority, max_occupancy_override, description, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(
        packageId,
        room_id,
        is_default ? 1 : 0,
        price_adjustment,
        adjustment_type,
        availability_priority,
        max_occupancy_override,
        description
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { id: result.meta.last_row_id },
        message: 'Room added to package'
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

  // PUT /api/packages/rooms/:id - update package room relationship
  if (pathParts.length === 4 && pathParts[2] === 'rooms' && method === 'PUT') {
    try {
      const relationshipId = parseInt(pathParts[3]);
      const { 
        is_default, 
        price_adjustment, 
        adjustment_type,
        availability_priority,
        max_occupancy_override,
        description,
        is_active
      } = body;

      const updates: string[] = [];
      const values: any[] = [];

      if (is_default !== undefined) {
        // If setting as default, get the package_id first
        if (is_default) {
          const rel = await env.DB.prepare(
            'SELECT package_id FROM package_rooms WHERE id = ?'
          ).bind(relationshipId).first() as any;
          if (rel) {
            await env.DB.prepare(
              'UPDATE package_rooms SET is_default = 0 WHERE package_id = ?'
            ).bind(rel.package_id).run();
          }
        }
        updates.push('is_default = ?');
        values.push(is_default ? 1 : 0);
      }
      if (price_adjustment !== undefined) { updates.push('price_adjustment = ?'); values.push(price_adjustment); }
      if (adjustment_type !== undefined) { updates.push('adjustment_type = ?'); values.push(adjustment_type); }
      if (availability_priority !== undefined) { updates.push('availability_priority = ?'); values.push(availability_priority); }
      if (max_occupancy_override !== undefined) { updates.push('max_occupancy_override = ?'); values.push(max_occupancy_override); }
      if (description !== undefined) { updates.push('description = ?'); values.push(description); }
      if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }

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

      values.push(relationshipId);

      await env.DB.prepare(
        `UPDATE package_rooms SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Package room relationship updated'
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

  // DELETE /api/packages/rooms/:id - soft delete package room relationship
  if (pathParts.length === 4 && pathParts[2] === 'rooms' && method === 'DELETE') {
    try {
      const relationshipId = parseInt(pathParts[3]);

      await env.DB.prepare(
        'UPDATE package_rooms SET is_active = 0 WHERE id = ?'
      ).bind(relationshipId).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Room removed from package'
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
        SELECT pi.inclusion_id, i.name, i.description, i.package_type as category
        FROM package_inclusions pi
        JOIN inclusions i ON pi.inclusion_id = i.id
        WHERE pi.package_id = ? AND pi.is_active = 1 AND i.is_active = 1
        ORDER BY i.name
      `).bind(packageId).all();

      return new Response(JSON.stringify({
        success: true,
        inclusions: result.results
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

  // POST /api/packages/:id/inclusions - add inclusion to package
  if (pathParts.length === 4 && pathParts[3] === 'inclusions' && method === 'POST') {
    try {
      const packageId = parseInt(pathParts[2]);
      const { inclusion_id } = body;

      if (!inclusion_id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'inclusion_id is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Check if already exists
      const existing = await env.DB.prepare(
        'SELECT * FROM package_inclusions WHERE package_id = ? AND inclusion_id = ?'
      ).bind(packageId, inclusion_id).first();

      if (existing) {
        // Reactivate if soft-deleted
        await env.DB.prepare(
          'UPDATE package_inclusions SET is_active = 1 WHERE package_id = ? AND inclusion_id = ?'
        ).bind(packageId, inclusion_id).run();
      } else {
        await env.DB.prepare(
          'INSERT INTO package_inclusions (package_id, inclusion_id, is_active) VALUES (?, ?, 1)'
        ).bind(packageId, inclusion_id).run();
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Inclusion added to package'
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

  // DELETE /api/packages/:id/inclusions/:inclusionId - remove inclusion from package
  if (pathParts.length === 5 && pathParts[3] === 'inclusions' && method === 'DELETE') {
    try {
      const packageId = parseInt(pathParts[2]);
      const inclusionId = parseInt(pathParts[4]);

      await env.DB.prepare(
        'UPDATE package_inclusions SET is_active = 0 WHERE package_id = ? AND inclusion_id = ?'
      ).bind(packageId, inclusionId).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Inclusion removed from package'
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

  // GET /api/packages/:id/amenities - get package amenities
  if (pathParts.length === 4 && pathParts[3] === 'amenities' && method === 'GET') {
    try {
      const packageId = parseInt(pathParts[2]);
      const result = await env.DB.prepare(`
        SELECT pa.amenity_id as id, a.name, a.description, a.category, a.icon, pa.is_highlighted, pa.custom_note
        FROM package_amenities pa
        JOIN amenities a ON pa.amenity_id = a.id
        WHERE pa.package_id = ? AND pa.is_active = 1 AND a.is_active = 1
        ORDER BY pa.is_highlighted DESC, a.name
      `).bind(packageId).all();

      return new Response(JSON.stringify({
        success: true,
        amenities: result.results
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

  // POST /api/packages/:id/amenities - add amenity to package
  if (pathParts.length === 4 && pathParts[3] === 'amenities' && method === 'POST') {
    try {
      const packageId = parseInt(pathParts[2]);
      const { amenity_id, is_highlighted = false } = body;

      if (!amenity_id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'amenity_id is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Check if already exists
      const existing = await env.DB.prepare(
        'SELECT * FROM package_amenities WHERE package_id = ? AND amenity_id = ?'
      ).bind(packageId, amenity_id).first();

      if (existing) {
        // Update highlight status or reactivate
        await env.DB.prepare(
          'UPDATE package_amenities SET is_active = 1, is_highlighted = ? WHERE package_id = ? AND amenity_id = ?'
        ).bind(is_highlighted ? 1 : 0, packageId, amenity_id).run();
      } else {
        await env.DB.prepare(
          'INSERT INTO package_amenities (package_id, amenity_id, is_highlighted, is_active) VALUES (?, ?, ?, 1)'
        ).bind(packageId, amenity_id, is_highlighted ? 1 : 0).run();
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Amenity added to package'
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

  // DELETE /api/packages/:id/amenities/:amenityId - remove amenity from package
  if (pathParts.length === 5 && pathParts[3] === 'amenities' && method === 'DELETE') {
    try {
      const packageId = parseInt(pathParts[2]);
      const amenityId = parseInt(pathParts[4]);

      await env.DB.prepare(
        'UPDATE package_amenities SET is_active = 0 WHERE package_id = ? AND amenity_id = ?'
      ).bind(packageId, amenityId).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Amenity removed from package'
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
