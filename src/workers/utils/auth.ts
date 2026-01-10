import { JWTPayload } from '../types';

/**
 * Verify password against bcrypt hash
 * Note: Cloudflare Workers doesn't have built-in bcrypt support
 * This is a placeholder - you should implement a proper bcrypt verification
 * or use a hashing service/library compatible with Workers
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // TODO: Implement proper bcrypt verification
  // For now, this is a placeholder that returns false
  // In production, you might want to:
  // 1. Use a service that supports bcrypt verification
  // 2. Use a compatible hashing library
  // 3. Store plaintext passwords (NOT RECOMMENDED)
  console.warn('Using placeholder password verification - implement proper bcrypt check');
  return false;
}

/**
 * Generate JWT token
 */
export function generateToken(userId: number, username: string, secret?: string): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (24 * 60 * 60); // 24 hours

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload: JWTPayload = {
    userId,
    username,
    iat: now,
    exp,
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  // Simple HMAC-SHA256 signature (simplified, not production-ready)
  const message = `${encodedHeader}.${encodedPayload}`;
  
  // Using a simple hash for demo purposes
  // In production, use a proper HMAC-SHA256 implementation
  const signature = btoa(message + (secret || 'secret'));

  return `${message}.${signature}`;
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string, secret?: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return null;
    }

    const [, payloadEncoded] = parts;
    const payload = JSON.parse(atob(payloadEncoded)) as JWTPayload;

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Authenticate request
 */
export function authenticateRequest(request: Request): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
