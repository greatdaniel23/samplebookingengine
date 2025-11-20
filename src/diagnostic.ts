// Simple diagnostic script to check environment variables at runtime
console.log('🔍 Environment Diagnostic Check');
console.log('================================');
console.log('Environment Mode:', import.meta.env.MODE);
console.log('Is Development:', import.meta.env.DEV);
console.log('Is Production:', import.meta.env.PROD);
console.log('VITE_API_BASE:', import.meta.env.VITE_API_BASE);
console.log('VITE_PUBLIC_BASE:', import.meta.env.VITE_PUBLIC_BASE);
console.log('All Environment Variables:', import.meta.env);

// Test paths configuration
import { paths } from './config/paths';
console.log('📁 Paths Configuration');
console.log('=====================');
console.log('API Base:', paths.apiBase);
console.log('Build API URL (bookings.php):', paths.buildApiUrl('bookings.php'));
console.log('Build API URL (rooms.php):', paths.buildApiUrl('rooms.php'));
console.log('Build API URL (packages.php):', paths.buildApiUrl('packages.php'));
console.log('Build API URL (villa.php):', paths.buildApiUrl('villa.php'));

// Check if we're using localhost
const usingLocalhost = paths.apiBase.includes('localhost') || paths.apiBase.includes('127.0.0.1');
console.log('🚨 Using Localhost API:', usingLocalhost ? 'YES (PROBLEM!)' : 'NO (Good)');

if (usingLocalhost) {
  console.error('❌ PROBLEM: API is still using localhost! Expected: https://api.rumahdaisycantik.com');
} else {
  console.log('✅ API correctly configured for production');
}

// Test an actual API call
console.log('🧪 Testing API Call');
console.log('==================');
const testUrl = paths.buildApiUrl('rooms.php');
console.log('Test URL:', testUrl);

fetch(testUrl)
  .then(response => {
    console.log('✅ API Test Response:', response.status, response.statusText);
    console.log('Response URL:', response.url);
  })
  .catch(error => {
    console.error('❌ API Test Failed:', error);
  });

// Export for external access
(window as any).diagnosticInfo = {
  env: import.meta.env,
  paths: paths,
  usingLocalhost: usingLocalhost,
  testUrl: testUrl
};