import React, { useState, useEffect } from 'react';

const ComprehensiveDebug: React.FC = () => {
  const [results, setResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: any = {};

    // 1. Check import.meta.env
    diagnostics.importMetaEnv = {
      all: import.meta.env,
      viteApiBase: import.meta.env.VITE_API_BASE,
      vitePublicBase: import.meta.env.VITE_PUBLIC_BASE,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD
    };

    // 2. Check paths configuration
    try {
      const pathsModule = await import('../config/paths');
      diagnostics.pathsConfig = {
        API_BASE_URL: pathsModule.API_BASE_URL,
        paths: pathsModule.paths,
        buildApiUrl: pathsModule.paths.buildApiUrl('test.php')
      };
    } catch (error) {
      diagnostics.pathsConfig = { error: error.message };
    }

    // 3. Test actual API calls
    const apiTests = [];
    
    // Test production API (Cloudflare Worker)
    try {
      const prodResponse = await fetch('https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/rooms');
      apiTests.push({
        url: 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/rooms',
        status: prodResponse.status,
        ok: prodResponse.ok,
        type: 'production'
      });
    } catch (error) {
      apiTests.push({
        url: 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/rooms',
        error: error.message,
        type: 'production'
      });
    }

    // Test what buildApiUrl produces
    try {
      const pathsModule = await import('../config/paths');
      const apiUrl = pathsModule.paths.buildApiUrl('rooms');
      const response = await fetch(apiUrl);
      apiTests.push({
        url: apiUrl,
        status: response.status,
        ok: response.ok,
        type: 'buildApiUrl result'
      });
    } catch (error) {
      const pathsModule = await import('../config/paths');
      const apiUrl = pathsModule.paths.buildApiUrl('rooms');
      apiTests.push({
        url: apiUrl,
        error: error.message,
        type: 'buildApiUrl result'
      });
    }

    diagnostics.apiTests = apiTests;

    // 4. Check environment variable loading
    diagnostics.environmentCheck = {
      hasViteApiBase: 'VITE_API_BASE' in import.meta.env,
      actualValue: import.meta.env.VITE_API_BASE,
      expectedValue: 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api',
      matches: import.meta.env.VITE_API_BASE === 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api'
    };

    setResults(diagnostics);
    setIsRunning(false);
  };

  const renderObject = (obj: any, depth = 0) => {
    if (depth > 3) return '[Max depth reached]';
    
    if (typeof obj === 'object' && obj !== null) {
      return (
        <ul style={{ marginLeft: depth * 20 }}>
          {Object.entries(obj).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {renderObject(value, depth + 1)}
            </li>
          ))}
        </ul>
      );
    }
    
    return <span style={{ 
      color: typeof obj === 'string' && obj.includes('localhost') ? '#dc3545' : 
             typeof obj === 'string' && obj.includes('api.rumahdaisycantik.com') ? '#28a745' : 
             'inherit'
    }}>{String(obj)}</span>;
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <h1>🔍 Comprehensive React Environment Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Running Diagnostics...' : 'Refresh Diagnostics'}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div>
          <h2>📊 Diagnostic Results</h2>
          
          <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
            <h3>1. Environment Variables (import.meta.env)</h3>
            {renderObject(results.importMetaEnv)}
          </div>

          <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
            <h3>2. Paths Configuration</h3>
            {renderObject(results.pathsConfig)}
          </div>

          <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
            <h3>3. Environment Variable Check</h3>
            {renderObject(results.environmentCheck)}
          </div>

          <div style={{ background: 'white', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
            <h3>4. API Tests</h3>
            {results.apiTests?.map((test: any, index: number) => (
              <div key={index} style={{ 
                background: test.error ? '#f8d7da' : '#d4edda', 
                padding: '10px', 
                margin: '5px 0', 
                borderRadius: '4px' 
              }}>
                <div><strong>Type:</strong> {test.type}</div>
                <div><strong>URL:</strong> <span style={{ 
                  color: test.url.includes('localhost') ? '#dc3545' : '#28a745' 
                }}>{test.url}</span></div>
                {test.status && <div><strong>Status:</strong> {test.status}</div>}
                {test.ok !== undefined && <div><strong>Success:</strong> {test.ok ? '✅' : '❌'}</div>}
                {test.error && <div><strong>Error:</strong> {test.error}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveDebug;