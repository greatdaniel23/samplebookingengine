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
        currency: 'USD',
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

      // Transform frontend camelCase to database snake_case
      const updateData: any = {
        name: body.name,
        description: body.description,
        location: body.location || `${body.city || ''}, ${body.state || ''}, ${body.country || ''}`.trim(),
        max_guests: body.maxGuests,
        total_rooms: body.bedrooms,
        total_bathrooms: body.bathrooms,
        size_sqm: body.sizeSqm,
        check_in_time: body.checkInTime,
        check_out_time: body.checkOutTime,
        phone: body.phone,
        email: body.email,
        website: body.website,
        address: body.address,
        policies: body.cancellationPolicy || body.houseRules,
        amenities_summary: body.amenities ? 
          body.amenities.map((a: any) => a.name).join(', ') : 
          '',
        images: body.images ? JSON.stringify(body.images) : '[]'
      };

      // Build UPDATE query
      const fields = Object.keys(updateData).filter(k => updateData[k] !== undefined);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);

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
        currency: 'USD',
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
