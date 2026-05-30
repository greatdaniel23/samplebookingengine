import { Env } from '../types';
import { requireAuth } from '../utils/auth';

function jsonResponse(data: any, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function ok(data: any, request?: Request): Response {
  return jsonResponse({ success: true, data }, 200, request);
}

function err(message: string, status = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

export async function handleHomepage(
  url: URL,
  method: string,
  body: any,
  env: Env,
  request: Request
): Promise<Response> {

  // Auth required for mutations
  if (method !== 'GET') {
    const auth = await requireAuth(request, env);
    if (!auth.valid) return err('Unauthorized', 401);
  }

  // GET /api/homepage-settings — read active row from homepage_settings
  if (method === 'GET') {
    try {
      const row = await env.DB.prepare(
        'SELECT * FROM homepage_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1'
      ).first();

      if (!row) {
        // Return empty shell so frontend doesn't error
        return ok({
          hero_title: '',
          hero_subtitle: '',
          hero_description: '',
          property_name: '',
          property_location: '',
          property_description: '',
          property_rating: 4.8,
          property_reviews: 0,
          contact_phone: '',
          contact_email: '',
          contact_website: '',
          address_street: '',
          address_city: '',
          address_state: '',
          address_country: '',
          address_zipcode: '',
          spec_max_guests: 8,
          spec_bedrooms: 4,
          spec_bathrooms: 3,
          spec_base_price: 0,
          timing_check_in: '15:00',
          timing_check_out: '11:00',
          policy_cancellation: '',
          policy_house_rules: '',
          policy_terms_conditions: '',
          social_facebook: '',
          social_instagram: '',
          social_twitter: '',
          images_json: '[]',
          amenities_json: '[]',
        });
      }

      return ok(row);
    } catch (e: any) {
      return err(e.message, 500);
    }
  }

  // PUT /api/homepage-settings — upsert active row
  if (method === 'PUT') {
    try {
      if (!body) return err('Request body required');

      // Map camelCase frontend keys → snake_case DB columns
      const map: Record<string, string> = {
        hero_title: 'hero_title',
        hero_subtitle: 'hero_subtitle',
        hero_description: 'hero_description',
        heroTitle: 'hero_title',
        heroSubtitle: 'hero_subtitle',
        heroDescription: 'hero_description',
        property_name: 'property_name',
        property_location: 'property_location',
        property_description: 'property_description',
        name: 'property_name',
        location: 'property_location',
        description: 'property_description',
        property_rating: 'property_rating',
        property_reviews: 'property_reviews',
        contact_phone: 'contact_phone',
        contact_email: 'contact_email',
        contact_website: 'contact_website',
        phone: 'contact_phone',
        email: 'contact_email',
        website: 'contact_website',
        address_street: 'address_street',
        address_city: 'address_city',
        address_state: 'address_state',
        address_country: 'address_country',
        address_zipcode: 'address_zipcode',
        address: 'address_street',
        city: 'address_city',
        state: 'address_state',
        country: 'address_country',
        zipcode: 'address_zipcode',
        spec_max_guests: 'spec_max_guests',
        spec_bedrooms: 'spec_bedrooms',
        spec_bathrooms: 'spec_bathrooms',
        spec_base_price: 'spec_base_price',
        maxGuests: 'spec_max_guests',
        bedrooms: 'spec_bedrooms',
        bathrooms: 'spec_bathrooms',
        basePrice: 'spec_base_price',
        timing_check_in: 'timing_check_in',
        timing_check_out: 'timing_check_out',
        checkIn: 'timing_check_in',
        checkOut: 'timing_check_out',
        policy_cancellation: 'policy_cancellation',
        policy_house_rules: 'policy_house_rules',
        policy_terms_conditions: 'policy_terms_conditions',
        cancellationPolicy: 'policy_cancellation',
        houseRules: 'policy_house_rules',
        termsConditions: 'policy_terms_conditions',
        social_facebook: 'social_facebook',
        social_instagram: 'social_instagram',
        social_twitter: 'social_twitter',
        facebook: 'social_facebook',
        instagram: 'social_instagram',
        twitter: 'social_twitter',
        images_json: 'images_json',
        amenities_json: 'amenities_json',
      };

      const updates: string[] = [];
      const values: any[] = [];

      for (const [key, col] of Object.entries(map)) {
        if (body[key] !== undefined) {
          // avoid duplicate columns if both camel and snake present
          if (!updates.some(u => u.startsWith(`${col} =`))) {
            updates.push(`${col} = ?`);
            const val = body[key];
            values.push(typeof val === 'object' ? JSON.stringify(val) : val);
          }
        }
      }

      if (updates.length === 0) return err('No valid fields to update');

      // Check if an active row exists
      const existing = await env.DB.prepare(
        'SELECT id FROM homepage_settings WHERE is_active = 1 ORDER BY id DESC LIMIT 1'
      ).first();

      if (existing) {
        updates.push("last_updated = datetime('now')");
        values.push(existing.id);
        await env.DB.prepare(
          `UPDATE homepage_settings SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...values).run();
      } else {
        // Insert new active row with supplied fields
        const cols = updates.map(u => u.split(' =')[0]).join(', ');
        const placeholders = values.map(() => '?').join(', ');
        values.push(1); // is_active
        await env.DB.prepare(
          `INSERT INTO homepage_settings (${cols}, is_active, created_at, last_updated)
           VALUES (${placeholders}, ?, datetime('now'), datetime('now'))`
        ).bind(...values).run();
      }

      return ok({ message: 'Homepage settings updated successfully' });
    } catch (e: any) {
      return err(e.message, 500);
    }
  }

  return err('Method not allowed', 405);
}
