import React, { useState, useEffect } from 'react';
import { paths } from '@/config/paths';

const ApiUrlTester: React.FC = () => {
  const [apiUrls, setApiUrls] = useState<any>({});
  
  useEffect(() => {
    const urls = {
      envVars: {
        VITE_API_BASE: import.meta.env.VITE_API_BASE,
        VITE_PUBLIC_BASE: import.meta.env.VITE_PUBLIC_BASE,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
      },
      pathsConfig: {
        apiBase: paths.apiBase,
        buildApiUrlBookings: paths.buildApiUrl('bookings.php'),
        buildApiUrlRooms: paths.buildApiUrl('rooms.php'),
        buildApiUrlPackages: paths.buildApiUrl('packages.php'),
        buildApiUrlVilla: paths.buildApiUrl('villa.php'),
      },
      directPaths: {
        bookings: paths.api.bookings,
        rooms: paths.api.rooms,
      }
    };
    setApiUrls(urls);
  }, []);

  const testApiCall = async (endpoint: string) => {
    try {
      console.log('Testing API call to:', endpoint);
      const response = await fetch(endpoint);
      console.log('API Response:', response.status, response.statusText);
      return `${response.status} ${response.statusText}`;
    } catch (error) {
      console.error('API Error:', error);
      return `Error: ${error.message}`;
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      background: '#f8f9fa',
      maxWidth: '1000px',
      margin: '20px auto'
    }}>
      <h2>🔍 API URL Configuration Test</h2>
      
      <div style={{ 
        background: 'white', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>Environment Variables</h3>
        <pre>{JSON.stringify(apiUrls.envVars, null, 2)}</pre>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>Paths Configuration</h3>
        <pre>{JSON.stringify(apiUrls.pathsConfig, null, 2)}</pre>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>Direct Paths</h3>
        <pre>{JSON.stringify(apiUrls.directPaths, null, 2)}</pre>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '15px', 
        marginBottom: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>API Tests</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {apiUrls.pathsConfig && Object.entries(apiUrls.pathsConfig).map(([key, url]) => {
            if (typeof url === 'string' && url.includes('http')) {
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ minWidth: '150px' }}>{key}:</span>
                  <span style={{ 
                    color: url.includes('localhost') ? '#dc3545' : '#28a745',
                    minWidth: '300px',
                    fontWeight: 'bold'
                  }}>
                    {url}
                  </span>
                  <button 
                    onClick={() => testApiCall(url)}
                    style={{
                      padding: '5px 10px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Test
                  </button>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      <div style={{ 
        background: url => url.includes('localhost') ? '#fff5f5' : '#f0fff4', 
        padding: '15px', 
        borderRadius: '8px',
        border: '2px solid #28a745'
      }}>
        <h3>Expected Result</h3>
        <p><strong>✅ All URLs should start with:</strong> <span style={{color: '#28a745'}}>https://api.rumahdaisycantik.com</span></p>
        <p><strong>❌ No URLs should contain:</strong> <span style={{color: '#dc3545'}}>localhost</span> or <span style={{color: '#dc3545'}}>127.0.0.1</span></p>
      </div>
    </div>
  );
};

export default ApiUrlTester;