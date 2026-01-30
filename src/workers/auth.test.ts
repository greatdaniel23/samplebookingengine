import { describe, it, expect, vi } from 'vitest';
import { handleRequest } from './index';
import { Env } from './types';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {
  const realHash = bcrypt.hashSync('password123', 10);
  const mockUser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    password_hash: realHash,
    active: 1
  };

  const mockEnv = {
    DB: {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          first: vi.fn().mockResolvedValue(mockUser),
        })),
      })),
    },
    JWT_SECRET: 'test-secret',
    IMAGES: {} as any,
    SESSIONS: {} as any,
    CACHE: {
        get: vi.fn(),
        put: vi.fn(),
    } as any,
  } as unknown as Env;

  it('rejects login with WRONG password', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'WRONG_PASSWORD',
      }),
    });

    const response = await handleRequest(request, mockEnv);
    const body = await response.json() as any;

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('logs in with CORRECT password', async () => {
    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
      }),
    });

    const response = await handleRequest(request, mockEnv);
    expect(response.status).toBe(200);
  });
});
