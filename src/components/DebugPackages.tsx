import React from 'react';
import { usePackages } from '@/hooks/usePackages';

const DebugPackages: React.FC = () => {
  const { packages, loading, error } = usePackages();

  if (loading) return <div>Loading packages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🐛 Debug: usePackages Hook</h1>
      <p><strong>Total packages returned by usePackages:</strong> {packages.length}</p>
      
      <h2>📦 Packages from usePackages hook:</h2>
      {packages.length === 0 ? (
        <div style={{ background: '#f8d7da', padding: '10px', border: '1px solid #dc3545', borderRadius: '5px' }}>
          ❌ No packages returned! This means filtering is working but there are no active packages.
        </div>
      ) : (
        <div>
          {packages.map(pkg => (
            <div 
              key={pkg.id} 
              style={{ 
                background: '#d4edda', 
                padding: '10px', 
                margin: '5px 0', 
                border: '1px solid #28a745', 
                borderRadius: '5px' 
              }}
            >
              <strong>ID {pkg.id}: {pkg.name}</strong><br/>
              Available: {pkg.available ? 'Yes' : 'No'}<br/>
              Price: ${pkg.price}
            </div>
          ))}
        </div>
      )}

      <h2>🔍 Debug Info:</h2>
      <div style={{ background: '#d1ecf1', padding: '10px', border: '1px solid #17a2b8', borderRadius: '5px' }}>
        <p>• Check browser console for detailed logging</p>
        <p>• This component uses the same usePackages hook as the main app</p>
        <p>• If you see all packages here, the filtering is not working</p>
        <p>• If you see only active packages, the filtering IS working</p>
      </div>
    </div>
  );
};

export default DebugPackages;