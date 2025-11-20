import React from 'react';
import ApiDebugComponent from '../components/ApiDebugComponent';

const ApiDebug = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🔍 API Configuration Debug Page</h1>
      <p>This page shows the actual API configuration that React is using.</p>
      <ApiDebugComponent />
      
      <div style={{ background: 'white', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
        <h2>Quick Tests</h2>
        <button 
          onClick={() => {
            console.log('Testing API call...');
            import('../config/paths').then(({ paths }) => {
              console.log('paths.apiBase:', paths.apiBase);
              console.log('paths.buildApiUrl("rooms.php"):', paths.buildApiUrl('rooms.php'));
              
              fetch(paths.buildApiUrl('rooms.php'))
                .then(response => {
                  console.log('API Response:', response.status, response.statusText);
                  console.log('API URL used:', paths.buildApiUrl('rooms.php'));
                })
                .catch(error => {
                  console.error('API Error:', error);
                  console.log('API URL attempted:', paths.buildApiUrl('rooms.php'));
                });
            });
          }}
          style={{ padding: '10px 20px', margin: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Test Rooms API Call
        </button>
        
        <button 
          onClick={() => {
            console.log('Current window location:', window.location.href);
            console.log('All environment variables:', import.meta.env);
          }}
          style={{ padding: '10px 20px', margin: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Log Environment Info
        </button>
      </div>
    </div>
  );
};

export default ApiDebug;