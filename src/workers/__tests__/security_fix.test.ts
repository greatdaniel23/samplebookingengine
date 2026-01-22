import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../index';
import { Env } from '../types';

// Mock crypto for JWT
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = require('crypto').webcrypto;
}

describe('Security Vulnerabilities', () => {
  let env: Env;

  beforeEach(() => {
    // Mock Env
    const runMock = vi.fn().mockResolvedValue({ meta: { last_row_id: 1 } });
    const allMock = vi.fn().mockResolvedValue({ results: [] });
    const firstMock = vi.fn().mockResolvedValue(null);

    const stmtMock = {
      bind: vi.fn().mockReturnThis(),
      run: runMock,
      all: allMock,
      first: firstMock,
    };

    env = {
      DB: {
        prepare: vi.fn().mockReturnValue(stmtMock),
      } as any,
      IMAGES: {} as any,
      SESSIONS: {} as any,
      CACHE: {
        get: vi.fn(),
        put: vi.fn(),
      } as any,
      JWT_SECRET: 'test-secret',
    };
  });

  it('should prevent unauthenticated booking status update', async () => {
    const request = new Request('http://localhost/api/bookings/1/status', {
      method: 'PUT',
      body: JSON.stringify({ status: 'confirmed' }),
    });

    const response = await worker.fetch(request, env);
    expect(response.status).toBe(401);
  });

  it('should prevent unauthenticated amenity creation', async () => {
     const request = new Request('http://localhost/api/amenities', {
      method: 'POST',
      body: JSON.stringify({ name: 'Hacked Amenity' }),
    });

    const response = await worker.fetch(request, env);
    expect(response.status).toBe(401);
  });

  it('should prevent unauthenticated amenity deletion', async () => {
     const request = new Request('http://localhost/api/amenities/1', {
      method: 'DELETE',
    });

    const response = await worker.fetch(request, env);
    expect(response.status).toBe(401);
  });
});
