/**
 * apiClient — centralized HTTP helper for booking admin mutations
 *
 * K2 FE contract repair (KURATOR sprint plan):
 *   - Routes all mutations to the Worker direct URL (CF Pages _redirects only proxies GET)
 *   - Auto-attaches Authorization: Bearer ${getAuthToken()} on every non-GET
 *   - Auto-sets Content-Type: application/json on POST/PUT/PATCH
 *   - Uniform error handling: 401 → throw with re-login hint, 4xx/5xx → throw with message
 *   - One-line callsite: apiClient.put('/api/admin/rooms/123', { images })
 */

import { getAuthToken } from '@/config/cloudflare';

// Direct Worker URL — CF Pages _redirects only passes GET through to Worker for most prefixes.
// All mutations (POST/PUT/PATCH/DELETE) must go directly to the Worker.
const WORKER_BASE =
  (import.meta as any).env?.VITE_WORKER_BASE ||
  'https://booking-engine-api-samudra.danielsantosomarketing2017.workers.dev';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Whether to attach Authorization header.
   * Defaults to true for non-GET, false for GET.
   */
  requireAuth?: boolean;
}

async function request<T = unknown>(
  method: Method,
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const requireAuth = opts.requireAuth ?? method !== 'GET';
  const token = getAuthToken();

  if (requireAuth && !token) {
    throw new Error('No auth token — please log in again');
  }

  const headers: Record<string, string> = {
    ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  // If path is already absolute, use it directly.
  // Otherwise prefix with WORKER_BASE — strip /api prefix since WORKER_BASE itself has none.
  // Convention: callers pass '/api/rooms', '/api/packages/:id/amenities', etc.
  const url = path.startsWith('http') ? path : `${WORKER_BASE}${path}`;

  const res = await fetch(url, {
    method,
    headers,
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });

  if (res.status === 401) {
    throw new Error('Session expired — please log in again');
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const p = payload as Record<string, unknown> | null;
    const msg =
      (p?.error as string) ||
      (p?.message as string) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return payload as T;
}

export const apiClient = {
  get: <T = unknown>(path: string, opts?: ApiOptions) =>
    request<T>('GET', path, opts),

  post: <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>('POST', path, { ...opts, body }),

  put: <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>('PUT', path, { ...opts, body }),

  patch: <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>('PATCH', path, { ...opts, body }),

  delete: <T = unknown>(path: string, opts?: ApiOptions) =>
    request<T>('DELETE', path, opts),

  /** Convenience: DELETE with a JSON body (non-RESTful but used in several sections) */
  deleteWithBody: <T = unknown>(path: string, body?: unknown, opts?: ApiOptions) =>
    request<T>('DELETE', path, { ...opts, body }),
};
