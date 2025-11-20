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
            
            import('../config/paths').then(({ paths }) => {
              
              
              
              fetch(paths.buildApiUrl('rooms.php'))
                .then(response => {
                  
                  
                })
                .catch(error => {
                  console.error('API Error:', error);
                  
                });
            });
          }}
          style={{ padding: '10px 20px', margin: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Test Rooms API Call
        </button>
        
        <button 
          onClick={() => {
            
            
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
