// Quick test to verify paths configuration
import { paths } from './src/config/paths.ts';

console.log('=== PATHS DEBUG ===');
console.log('API_BASE:', paths.apiBase);
console.log('bookings endpoint:', paths.api.bookings);
console.log('Expected:', 'http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/bookings');
console.log('Match:', paths.api.bookings === 'http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/bookings');