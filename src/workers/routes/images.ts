import { Router } from 'itty-router';
import { Env } from '../types';

const router = Router<{ Bindings: Env }>();

// Upload image to R2
router.post('/upload', async (request, env) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const roomId = formData.get('roomId') as string;
    const type = formData.get('type') as string || 'room'; // room, amenity, hero, etc.

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large' }), { status: 413 });
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedMimes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type' }), { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop();
    const filename = `${type}/${roomId || 'general'}/${timestamp}-${random}.${ext}`;

    // Upload to R2
    const buffer = await file.arrayBuffer();
    await env.IMAGES.put(filename, buffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Generate URL
    const url = `https://imageroom.${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${filename}`;

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        url,
        size: file.size,
        type: file.type,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
});

// Get image metadata
router.get('/:key', async (request, env) => {
  try {
    const { key } = request.params;
    
    if (!key) {
      return new Response(JSON.stringify({ error: 'No key provided' }), { status: 400 });
    }

    const object = await env.IMAGES.head(key);
    
    if (!object) {
      return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        key,
        size: object.size,
        type: object.httpMetadata?.contentType,
        uploaded: object.uploaded,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Get image error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get image' }), { status: 500 });
  }
});

// Delete image
router.delete('/:key', async (request, env) => {
  try {
    const { key } = request.params;
    
    if (!key) {
      return new Response(JSON.stringify({ error: 'No key provided' }), { status: 400 });
    }

    await env.IMAGES.delete(key);

    return new Response(
      JSON.stringify({ success: true, message: 'Image deleted' }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500 });
  }
});

// List images
router.get('/list/:prefix', async (request, env) => {
  try {
    const { prefix } = request.params;

    const result = await env.IMAGES.list({ prefix });

    return new Response(
      JSON.stringify({
        files: result.objects.map(obj => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
        })),
        isTruncated: result.truncated,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('List error:', error);
    return new Response(JSON.stringify({ error: 'List failed' }), { status: 500 });
  }
});

export { router as imageRouter };
