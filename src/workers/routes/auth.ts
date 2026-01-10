import { Router } from 'itty-router';
import { Env } from '../types';
import { verifyPassword, generateToken } from '../utils/auth';

const router = Router<{ Bindings: Env }>();

// Login endpoint
router.post('/login', async (request, env) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
    }

    // Get user from database
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    // Verify password (bcrypt comparison)
    // Note: Cloudflare Workers have limited crypto support, consider using a different approach
    // For now, we'll do a simple comparison (NOT recommended for production without proper bcrypt)
    const passwordMatch = await verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    if (!user.active) {
      return new Response(JSON.stringify({ error: 'User account is inactive' }), { status: 403 });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username, env.JWT_SECRET);

    // Update last login
    await env.DB.prepare(
      'UPDATE users SET last_login = datetime(\'now\') WHERE id = ?'
    ).bind(user.id).run();

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), { status: 500 });
  }
});

// Verify token endpoint
router.post('/verify', async (request, env) => {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid token' }), { status: 401 });
    }

    const token = authHeader.slice(7);

    // Verify JWT (simplified)
    // In production, use a proper JWT library
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.exp < Date.now() / 1000) {
        return new Response(JSON.stringify({ error: 'Token expired' }), { status: 401 });
      }

      return new Response(JSON.stringify({ valid: true, payload }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }
  } catch (error) {
    console.error('Verify error:', error);
    return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 500 });
  }
});

// Get current user
router.get('/me', async (request, env) => {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid token' }), { status: 401 });
    }

    const token = authHeader.slice(7);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = await env.DB.prepare(
        'SELECT id, username, email, role FROM users WHERE id = ?'
      ).bind(payload.userId).first();

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      }

      return new Response(JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get user' }), { status: 500 });
  }
});

export { router as authRouter };
