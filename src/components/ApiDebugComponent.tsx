import React, { useEffect, useState } from 'react';
import { paths } from '../config/paths';

const ApiDebugComponent = () => {
  const [apiConfig, setApiConfig] = useState(null);

  useEffect(() => {
    // Get the actual API configuration that React is using
    const config = {
      environment: import.meta.env.NODE_ENV,
      isDev: import.meta.env.DEV,
      isProd: import.meta.env.PROD,
      viteApiBase: import.meta.env.VITE_API_BASE,
      pathsApiBase: paths.apiBase,
      pathsBuildApiUrl: paths.buildApiUrl('test.php'),
      allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')).reduce((acc, key) => {
        acc[key] = import.meta.env[key];
        return acc;
      }, {})
    };
    
    setApiConfig(config);
    
  }, []);

  if (!apiConfig) return <div>Loading API config...</div>;

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', margin: '20px', borderRadius: '8px' }}>
      <h2>🔍 React API Configuration Debug</h2>
      
      <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
        <h3>Environment Info</h3>
        <pre style={{ background: '#f1f1f1', padding: '10px', fontSize: '12px' }}>
{JSON.stringify({
  NODE_ENV: apiConfig.environment,
  DEV: apiConfig.isDev,
  PROD: apiConfig.isProd
}, null, 2)}
        </pre>
      </div>

      <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
        <h3>API Base URLs</h3>
        <pre style={{ background: '#f1f1f1', padding: '10px', fontSize: '12px' }}>
{JSON.stringify({
  'VITE_API_BASE (env var)': apiConfig.viteApiBase,
  'paths.apiBase (config)': apiConfig.pathsApiBase,
  'paths.buildApiUrl() result': apiConfig.pathsBuildApiUrl
}, null, 2)}
        </pre>
      </div>

      <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
        <h3>All Vite Environment Variables</h3>
        <pre style={{ background: '#f1f1f1', padding: '10px', fontSize: '12px' }}>
{JSON.stringify(apiConfig.allEnvVars, null, 2)}
        </pre>
      </div>

      <div style={{ background: apiConfig.pathsApiBase?.includes('api.rumahdaisycantik.com') ? '#d4edda' : '#f8d7da', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
        <h3>Current Status</h3>
        <p><strong>API Base:</strong> {apiConfig.pathsApiBase}</p>
        <p><strong>Using Production API:</strong> {apiConfig.pathsApiBase?.includes('api.rumahdaisycantik.com') ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Using Localhost API:</strong> {apiConfig.pathsApiBase?.includes('localhost') ? '❌ YES' : '✅ NO'}</p>
      </div>
    </div>
  );
};

export default ApiDebugComponent;
