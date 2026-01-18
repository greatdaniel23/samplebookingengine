import { JWTPayload } from '../types';

/**
 * Verify password against bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // TODO: Implement proper bcrypt verification
  console.warn('Using placeholder password verification - implement proper bcrypt check');
  return false;
}

/**
 * Helper to encode string to Base64Url with Unicode support
 */
function base64UrlEncode(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Helper to decode Base64Url to string with Unicode support
 */
function base64UrlDecode(str: string): string {
  const binary = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

/**
 * Generate JWT token using HMAC-SHA256 via Web Crypto API
 */
export async function generateToken(userId: number, username: string, secret?: string): Promise<string> {
  if (!secret) {
      throw new Error('JWT_SECRET is not defined');
  }

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

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  // Convert ArrayBuffer to Base64Url
  const signatureArray = Array.from(new Uint8Array(signature));
  const encodedSignature = btoa(String.fromCharCode.apply(null, signatureArray))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verify JWT token using HMAC-SHA256 via Web Crypto API
 */
export async function verifyToken(token: string, secret?: string): Promise<JWTPayload | null> {
  if (!secret) {
    console.error('JWT_SECRET is missing during verification');
    return null;
  }

  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return null;
    }

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;

    // Verify signature
    const data = new TextEncoder().encode(`${headerEncoded}.${payloadEncoded}`);
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert Base64Url signature back to Uint8Array
    const binarySignature = atob(signatureEncoded.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, data);

    if (!isValid) {
      console.error('Invalid token signature');
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as JWTPayload;

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('Token expired');
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
