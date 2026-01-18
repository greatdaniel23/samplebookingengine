import { Env } from '../types';

export async function handleVilla(url: URL, method: string, body: any, env: Env): Promise<Response> {
  const pathParts = url.pathname.split('/').filter(Boolean);

  // GET /api/villa - get villa information
  if (pathParts.length === 2 && method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM villa_info LIMIT 1'
      ).first();

      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Villa information not found'
        }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Transform database fields to match frontend VillaInfo interface
      const transformedData = {
        id: result.id,
        name: result.name || 'Villa Name',
        location: result.location || '',
        description: result.description || '',
        logo_url: result.logo_url || '',
        rating: 4.5, // Default rating - can be calculated from reviews later
        reviews: 0, // Default reviews count
        images: result.images ? JSON.parse(result.images as string) : [],
        amenities: result.amenities_summary ?
          result.amenities_summary.split(',').map((item: string) => ({
            name: item.trim(),
            icon: 'Star' // Default icon
          })) : [],
        // Contact Information
        phone: result.phone || '',
        email: result.email || '',
        website: result.website || '',
        // Address Information
        address: result.address || '',
        city: result.location ? result.location.split(',')[0].trim() : '',
        state: result.location ? result.location.split(',')[1]?.trim() || '' : '',
        zipCode: '',
        country: result.location ? result.location.split(',').pop()?.trim() || '' : '',
        // Additional Information
        checkInTime: result.check_in_time || '14:00',
        checkOutTime: result.check_out_time || '12:00',
        maxGuests: result.max_guests || 10,
        bedrooms: result.total_rooms || 5,
        bathrooms: result.total_bathrooms || 5,
        pricePerNight: 0, // Will be calculated from rooms
        currency: 'IDR',
        // Policies
        cancellationPolicy: result.policies || '',
        houseRules: result.policies || '',
        // Social Media
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      };

      return new Response(JSON.stringify({
        success: true,
        data: transformedData
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

  // PUT /api/villa - update villa information
  if (pathParts.length === 2 && method === 'PUT') {
    try {
      if (!body) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Request body is required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Build location from city, state, country if provided
      let location = body.location;
      if (!location && (body.city || body.state || body.country)) {
        const parts = [body.city, body.state, body.country].filter(Boolean);
        location = parts.join(', ');
      }

      // Transform frontend fields to database snake_case
      // Support both camelCase and snake_case inputs
      const updateData: any = {};

      // Basic info
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (location !== undefined) updateData.location = location;
      if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;

      // Contact info
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.website !== undefined) updateData.website = body.website;
      if (body.address !== undefined) updateData.address = body.address;

      // Timing - support both formats
      if (body.checkInTime !== undefined) updateData.check_in_time = body.checkInTime;
      if (body.check_in_time !== undefined) updateData.check_in_time = body.check_in_time;
      if (body.checkOutTime !== undefined) updateData.check_out_time = body.checkOutTime;
      if (body.check_out_time !== undefined) updateData.check_out_time = body.check_out_time;

      // Policies - support both
      if (body.cancellationPolicy !== undefined) updateData.policies = body.cancellationPolicy;
      if (body.houseRules !== undefined && !updateData.policies) updateData.policies = body.houseRules;

      // Property specs (if columns exist)
      if (body.maxGuests !== undefined || body.max_guests !== undefined) {
        updateData.max_guests = body.maxGuests || body.max_guests;
      }
      if (body.bedrooms !== undefined || body.total_rooms !== undefined) {
        updateData.total_rooms = body.bedrooms || body.total_rooms;
      }
      if (body.bathrooms !== undefined || body.total_bathrooms !== undefined) {
        updateData.total_bathrooms = body.bathrooms || body.total_bathrooms;
      }

      // NOTE: currency, timezone, maintenance_mode columns don't exist in villa_info table
      // These fields are ignored until DB schema is updated
      // if (body.currency !== undefined) updateData.currency = body.currency;
      // if (body.timezone !== undefined) updateData.timezone = body.timezone;
      // if (body.maintenance_mode !== undefined) updateData.maintenance_mode = body.maintenance_mode;

      // Images and amenities
      if (body.images !== undefined) {
        updateData.images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images);
      }
      if (body.amenities !== undefined) {
        updateData.amenities_summary = body.amenities.map((a: any) => a.name || a).join(', ');
      }

      // Check if there's anything to update
      const fields = Object.keys(updateData);
      if (fields.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No valid fields to update'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Build UPDATE query
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);

      console.log('Updating villa with:', { fields, values });

      await env.DB.prepare(
        `UPDATE villa_info SET ${setClause} WHERE id = 1`
      ).bind(...values).run();

      // Fetch updated record
      const result = await env.DB.prepare(
        'SELECT * FROM villa_info WHERE id = 1'
      ).first();

      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to fetch updated villa information'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Transform response back to frontend format
      const transformedData = {
        id: result.id,
        name: result.name,
        location: result.location,
        description: result.description,
        rating: 4.5,
        reviews: 0,
        images: result.images ? JSON.parse(result.images as string) : [],
        amenities: result.amenities_summary ?
          result.amenities_summary.split(',').map((item: string) => ({
            name: item.trim(),
            icon: 'Star'
          })) : [],
        phone: result.phone || '',
        email: result.email || '',
        website: result.website || '',
        address: result.address || '',
        city: result.location ? result.location.split(',')[0].trim() : '',
        state: result.location ? result.location.split(',')[1]?.trim() || '' : '',
        zipCode: '',
        country: result.location ? result.location.split(',').pop()?.trim() || '' : '',
        checkInTime: result.check_in_time || '14:00',
        checkOutTime: result.check_out_time || '12:00',
        maxGuests: result.max_guests || 10,
        bedrooms: result.total_rooms || 5,
        bathrooms: result.total_bathrooms || 5,
        pricePerNight: 0,
        currency: 'IDR',
        cancellationPolicy: result.policies || '',
        houseRules: result.policies || '',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      };

      return new Response(JSON.stringify({
        success: true,
        data: transformedData
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
    error: 'Invalid villa endpoint'
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
