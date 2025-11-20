// Console suppression executes before any side-effect imports.
// Adds optional feature flag `VITE_FORCE_NO_CONSOLE=true` to silence logs even in development.
const FORCE_SUPPRESS = import.meta.env.VITE_FORCE_NO_CONSOLE === 'true';
if (import.meta.env.PROD || FORCE_SUPPRESS) {
  const noop = () => {};
  const suppressed: (keyof Console)[] = [
    'log',
    'info',
    'debug',
    'group',
    'groupCollapsed',
    'groupEnd',
    'table',
    'warn',
    'error'
  ];
  suppressed.forEach(method => {
    try {
      // @ts-expect-error intentional override
      console[method] = noop;
    } catch {}
  });
  // @ts-expect-error custom global marker
  window.__CONSOLE_DISABLED__ = true;
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
// Load diagnostics only in development AND when not force-suppressed.
if (import.meta.env.DEV && !FORCE_SUPPRESS) {
	// Dynamic import prevents inclusion if tree-shaken in production build.
	import('./diagnostic.ts');
}

createRoot(document.getElementById("root")!).render(<App />);
