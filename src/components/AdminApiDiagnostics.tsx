import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'log' | 'error' | 'warn' | 'info';
  message: string;
  args: any[];
}

interface NetworkRequest {
  timestamp: string;
  method: string;
  url: string;
  status: number | string;
  statusText: string;
  responseTime: number;
  type: 'localhost' | 'production' | 'other' | 'error';
  success: boolean;
}

const AdminApiDiagnostics: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const originalConsole = useRef<any>({});
  const originalFetch = useRef<any>(null);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => stopMonitoring();
  }, [isMonitoring]);

  const startMonitoring = () => {
    // Store original console methods
    originalConsole.current = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    // Store original fetch
    originalFetch.current = window.fetch;

    // Intercept console methods
    ['log', 'error', 'warn', 'info'].forEach(method => {
      console[method as keyof Console] = function(...args: any[]) {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        setLogs(prev => [...prev.slice(-49), {
          timestamp,
          level: method as LogEntry['level'],
          message,
          args
        }]);

        // Call original method
        originalConsole.current[method].apply(console, args);
      };
    });

    // Intercept fetch
    window.fetch = async function(url: RequestInfo, options: RequestInit = {}) {
      const startTime = Date.now();
      const timestamp = new Date().toLocaleTimeString();
      const method = options.method || 'GET';
      
      try {
        const response = await originalFetch.current(url, options);
        const responseTime = Date.now() - startTime;
        
        const urlString = String(url);
        const isLocalhost = urlString.includes('localhost') || urlString.includes('127.0.0.1');
        const isProduction = urlString.includes('api.rumahdaisycantik.com');
        
        setNetworkRequests(prev => [...prev.slice(-19), {
          timestamp,
          method,
          url: urlString,
          status: response.status,
          statusText: response.statusText,
          responseTime,
          type: isLocalhost ? 'localhost' : isProduction ? 'production' : 'other',
          success: response.ok
        }]);
        
        return response;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        setNetworkRequests(prev => [...prev.slice(-19), {
          timestamp,
          method,
          url: String(url),
          status: 'ERROR',
          statusText: (error as Error).message,
          responseTime,
          type: 'error',
          success: false
        }]);

        throw error;
      }
    };

    console.log('🔍 Admin API Diagnostics Started');
  };

  const stopMonitoring = () => {
    // Restore original console methods
    Object.keys(originalConsole.current).forEach(method => {
      if (originalConsole.current[method]) {
        console[method as keyof Console] = originalConsole.current[method];
      }
    });

    // Restore original fetch
    if (originalFetch.current) {
      window.fetch = originalFetch.current;
    }

    console.log('🔍 Admin API Diagnostics Stopped');
  };

  const clearLogs = () => {
    setLogs([]);
    setNetworkRequests([]);
    console.log('🧹 Diagnostics cleared');
  };

  const exportDiagnostics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      consoleLogs: logs,
      networkRequests,
      summary: {
        totalRequests: networkRequests.length,
        localhostCalls: networkRequests.filter(req => req.type === 'localhost').length,
        productionCalls: networkRequests.filter(req => req.type === 'production').length,
        errors: logs.filter(log => log.level === 'error').length
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-diagnostics-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const testApiEndpoints = () => {
    console.log('🧪 Testing API endpoints...');
    
    // Test production API
    fetch('https://api.rumahdaisycantik.com/rooms.php')
      .then(response => console.log('✅ Production API test:', response.status))
      .catch(error => console.error('❌ Production API test failed:', error));
      
    // Test what the admin panel might call
    fetch('/api/rooms.php')
      .then(response => console.warn('⚠️ Relative API call result:', response.status))
      .catch(error => console.log('ℹ️ Relative API call failed (expected):', error.message));
  };

  const localhostCalls = networkRequests.filter(req => req.type === 'localhost').length;
  const productionCalls = networkRequests.filter(req => req.type === 'production').length;
  const errorLogs = logs.filter(log => log.level === 'error').length;

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px 8px 0 0',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0, fontSize: '2em' }}>🔍 Admin Panel API Diagnostics</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Real-time monitoring of console logs and API calls in the admin panel
        </p>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '6px' }}>
        <button 
          onClick={() => setIsMonitoring(!isMonitoring)}
          style={{
            background: isMonitoring ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            margin: '5px',
            cursor: 'pointer'
          }}
        >
          {isMonitoring ? '🛑 Stop Monitoring' : '▶️ Start Monitoring'}
        </button>
        <button 
          onClick={clearLogs}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            margin: '5px',
            cursor: 'pointer'
          }}
        >
          🧹 Clear Logs
        </button>
        <button 
          onClick={exportDiagnostics}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            margin: '5px',
            cursor: 'pointer'
          }}
        >
          📊 Export Data
        </button>
        <button 
          onClick={testApiEndpoints}
          style={{
            background: '#ffc107',
            color: 'black',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            margin: '5px',
            cursor: 'pointer'
          }}
        >
          🧪 Test APIs
        </button>
      </div>

      {/* Status Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          background: localhostCalls > 0 ? '#fff5f5' : '#f0fff4', 
          border: `2px solid ${localhostCalls > 0 ? '#dc3545' : '#28a745'}`,
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: localhostCalls > 0 ? '#dc3545' : '#28a745' }}>
            🔴 Localhost Calls
          </h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{localhostCalls}</div>
          <div>{localhostCalls > 0 ? '❌ Should be 0!' : '✅ Good!'}</div>
        </div>

        <div style={{ 
          background: '#f0fff4', 
          border: '2px solid #28a745',
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>🟢 Production Calls</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{productionCalls}</div>
          <div>✅ Good!</div>
        </div>

        <div style={{ 
          background: errorLogs > 0 ? '#fff5f5' : '#f8f9fa', 
          border: `2px solid ${errorLogs > 0 ? '#dc3545' : '#6c757d'}`,
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: errorLogs > 0 ? '#dc3545' : '#6c757d' }}>
            ❌ Console Errors
          </h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{errorLogs}</div>
          <div>{errorLogs > 0 ? '⚠️ Check logs!' : '✅ No errors'}</div>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          border: '2px solid #007bff',
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>📊 Total Requests</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{networkRequests.length}</div>
          <div>Monitoring: {isMonitoring ? '🟢 Active' : '🔴 Stopped'}</div>
        </div>
      </div>

      {/* Console Logs */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          📝 Console Logs
        </h2>
        <div style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '15px',
          borderRadius: '4px',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '14px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#888' }}>No console logs yet. Start monitoring to see logs.</div>
          ) : (
            logs.slice(-20).map((log, index) => {
              const levelColors = {
                error: '#ff6b6b',
                warn: '#ffd93d',
                info: '#74c0fc',
                log: '#d4d4d4'
              };
              
              return (
                <div key={index} style={{ color: levelColors[log.level], margin: '5px 0' }}>
                  <span style={{ color: '#888' }}>[{log.timestamp}]</span>
                  <strong> [{log.level.toUpperCase()}]</strong> {log.message}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Network Requests */}
      <div>
        <h2 style={{ color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
          🌐 Network Requests
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Time</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Method</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>URL</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Type</th>
                <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {networkRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ 
                    border: '1px solid #ddd', 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#666' 
                  }}>
                    No network requests yet. Start monitoring and use the admin panel.
                  </td>
                </tr>
              ) : (
                networkRequests.slice(-10).map((req, index) => {
                  const statusColor = req.success ? '#28a745' : '#dc3545';
                  const typeColor = req.type === 'localhost' ? '#dc3545' : 
                                  req.type === 'production' ? '#28a745' : '#ffc107';
                  
                  return (
                    <tr key={index} style={{ background: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                      <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '12px', color: '#666' }}>
                        {req.timestamp}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <strong>{req.method}</strong>
                      </td>
                      <td style={{ 
                        border: '1px solid #ddd', 
                        padding: '8px', 
                        color: typeColor, 
                        fontFamily: 'monospace', 
                        fontSize: '12px',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {req.url}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', color: statusColor, fontWeight: 'bold' }}>
                        {req.status} {req.statusText}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          marginRight: '8px',
                          background: req.type === 'localhost' ? '#dc3545' : 
                                     req.type === 'production' ? '#28a745' : '#ffc107'
                        }}></span>
                        {req.type}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        {req.responseTime}ms
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#e7f3ff', 
        border: '1px solid #b3d7ff',
        borderRadius: '6px' 
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>📋 How to Use</h3>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Start Monitoring:</strong> Click "Start Monitoring" to begin tracking</li>
          <li><strong>Use Admin Panel:</strong> Navigate through admin features normally</li>
          <li><strong>Check Results:</strong> Look for red entries (localhost calls) in the summary</li>
          <li><strong>Export Data:</strong> Save diagnostics for further analysis</li>
        </ol>
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: 'white', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          <strong>Expected:</strong> All API calls should go to <span style={{ color: '#28a745' }}>https://api.rumahdaisycantik.com</span><br/>
          <strong>Problem:</strong> Any calls to <span style={{ color: '#dc3545' }}>localhost</span> or <span style={{ color: '#dc3545' }}>127.0.0.1</span>
        </div>
      </div>
    </div>
  );
};

export default AdminApiDiagnostics;