import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, removeAuthToken } from '@/config/cloudflare';

interface AdminGuardProps {
  children: React.ReactNode;
}

// Verify cache: avoid re-verifying on every route navigation (5-min TTL)
let verifyCache: { valid: boolean; timestamp: number } | null = null;
const VERIFY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function verifyJwt(): Promise<boolean> {
  // Return cached result if still fresh
  if (verifyCache && Date.now() - verifyCache.timestamp < VERIFY_CACHE_TTL_MS) {
    return verifyCache.valid;
  }

  const token = getAuthToken();
  if (!token) {
    verifyCache = { valid: false, timestamp: Date.now() };
    return false;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const valid = response.ok;
    verifyCache = { valid, timestamp: Date.now() };
    return valid;
  } catch {
    // Network error — treat as invalid to fail closed
    verifyCache = { valid: false, timestamp: Date.now() };
    return false;
  }
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const valid = await verifyJwt();
      if (cancelled) return;

      if (valid) {
        setIsAuthenticated(true);
      } else {
        // Clear stale token + cached state
        removeAuthToken();
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('adminLoggedIn');
        }
        verifyCache = null;
        setIsAuthenticated(false);
        navigate('/admin/login', { replace: true });
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Loading state while verify call is in flight
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-gold"></div>
          <p className="text-hotel-navy text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated !== true) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <p className="text-red-600 font-semibold text-lg">Access Denied</p>
            <p className="mt-2 text-gray-600">Authentication required for admin access</p>
            <button
              onClick={() => navigate('/admin/login')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
