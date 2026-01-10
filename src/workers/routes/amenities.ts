import { Router } from 'itty-router';
import { Env } from '../types';

const router = Router<{ Bindings: Env }>();

// Get all active amenities
router.get('/list', async (request, env) => {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM amenities WHERE is_active = 1 ORDER BY display_order ASC'
    ).all();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch amenities' }), { status: 500 });
  }
});

// Get amenities by category
router.get('/category/:category', async (request, env) => {
  try {
    const { category } = request.params;

    const result = await env.DB.prepare(
      'SELECT * FROM amenities WHERE category = ? AND is_active = 1 ORDER BY display_order ASC'
    ).bind(category).all();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching amenities by category:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch amenities' }), { status: 500 });
  }
});

// Get featured amenities
router.get('/featured', async (request, env) => {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM amenities WHERE is_featured = 1 AND is_active = 1 ORDER BY display_order ASC'
    ).all();

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching featured amenities:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch amenities' }), { status: 500 });
  }
});

// Get single amenity
router.get('/:id', async (request, env) => {
  try {
    const { id } = request.params;

    const result = await env.DB.prepare(
      'SELECT * FROM amenities WHERE id = ?'
    ).bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Amenity not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching amenity:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch amenity' }), { status: 500 });
  }
});

export { router as amenitiesRouter };
