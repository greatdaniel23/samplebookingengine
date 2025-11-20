import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  // Initialize with immediate auth check - FORCE strict authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    
    
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    
    
    
    const result = adminLoggedIn === 'true' ? true : false;
    
    
    return result;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
      
      // Debug logging
      
      
      
      if (adminLoggedIn === 'true') {
        
        setIsAuthenticated(true);
      } else {
        
        setIsAuthenticated(false);
        // Add small delay to ensure navigation works properly
        setTimeout(() => {
          
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
  
  
  
  
  
  if (isAuthenticated !== true) {
    
    
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

  
  
  return <>{children}</>;
};
