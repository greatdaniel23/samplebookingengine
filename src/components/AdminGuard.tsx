import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  // Initialize with immediate auth check - FORCE strict authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    console.log('=== AdminGuard: COMPONENT CREATION ===');
    console.log('AdminGuard: Timestamp:', new Date().toISOString());
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    console.log('AdminGuard: Raw sessionStorage value:', JSON.stringify(adminLoggedIn));
    console.log('AdminGuard: Type of value:', typeof adminLoggedIn);
    console.log('AdminGuard: Strict equality check (=== "true"):', adminLoggedIn === 'true');
    const result = adminLoggedIn === 'true' ? true : false;
    console.log('AdminGuard: Initial authentication result:', result);
    console.log('=== END COMPONENT CREATION ===');
    return result;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
      
      // Debug logging
      console.log('AdminGuard: useEffect auth check...');
      console.log('AdminGuard: adminLoggedIn =', adminLoggedIn);
      
      if (adminLoggedIn === 'true') {
        console.log('AdminGuard: User is authenticated, allowing access');
        setIsAuthenticated(true);
      } else {
        console.log('AdminGuard: User is NOT authenticated, redirecting to login');
        setIsAuthenticated(false);
        // Add small delay to ensure navigation works properly
        setTimeout(() => {
          console.log('AdminGuard: Executing redirect to /admin/login');
          navigate('/admin/login', { replace: true });
        }, 100);
      }
    };

    // Only check if current state doesn't match sessionStorage
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const shouldBeAuthenticated = adminLoggedIn === 'true';
    
    if (isAuthenticated !== shouldBeAuthenticated) {
      checkAuth();
    }
  }, [navigate, isAuthenticated]);

  // Block access by default - only allow if explicitly authenticated
  console.log('=== AdminGuard: RENDER DECISION ===');
  console.log('AdminGuard: isAuthenticated =', isAuthenticated);
  console.log('AdminGuard: typeof isAuthenticated =', typeof isAuthenticated);
  console.log('AdminGuard: isAuthenticated === true?', isAuthenticated === true);
  
  if (isAuthenticated !== true) {
    console.log('AdminGuard: 🚫 BLOCKING ACCESS - Rendering denial screen');
    console.log('=== END RENDER DECISION ===');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <p className="text-red-600 font-semibold text-lg">🚫 Access Denied</p>
            <p className="mt-2 text-gray-600">Authentication required for admin access</p>
            <p className="mt-2 text-sm text-gray-500">
              Status: {isAuthenticated === null ? 'Checking...' : 'Not authenticated'}
            </p>
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

  console.log('AdminGuard: ✅ ACCESS GRANTED - Rendering admin children');
  console.log('=== END RENDER DECISION ===');
  return <>{children}</>;
};