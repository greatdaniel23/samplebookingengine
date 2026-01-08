// Minimal diagnostic (dev-only) with no API endpoint exposure.
import { paths } from './config/paths';

if (import.meta.env.DEV) {
  const info = {
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD,
    publicBase: import.meta.env.VITE_PUBLIC_BASE || '/',
    apiBaseType: paths.apiBase.startsWith('/api') ? 'relative-proxied' : 'absolute'
  };
  // Single summary line; avoid printing full URLs.
  
  // Expose lightweight object for manual inspection if needed.
  // @ts-expect-error attach for debugging
  window.__DEV_DIAGNOSTIC__ = info;
}
