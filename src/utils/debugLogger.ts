// Centralized debug logging helpers
export const DEBUG_ENABLED = true; // Flip to false to silence all debug output

const BASE_STYLE = 'background:#1e293b;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;';
const ERROR_STYLE = 'background:#7f1d1d;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;';
const WARN_STYLE = 'background:#92400e;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;';
const OK_STYLE = 'background:#065f46;color:#fff;padding:2px 6px;border-radius:4px;font-size:11px;';

export const debugGroup = (label: string, fn: () => void, style: string = BASE_STYLE) => {
  if (!DEBUG_ENABLED) return;
  
  try { fn(); } finally {  }
};

export const debugValue = (label: string, value: any) => {
  if (!DEBUG_ENABLED) return;
  
};

export const debugOk = (msg: string) => {
  if (!DEBUG_ENABLED) return;
  
};

export const debugWarn = (msg: string) => {
  if (!DEBUG_ENABLED) return;
  
};

export const debugError = (msg: string, err?: any) => {
  if (!DEBUG_ENABLED) return;
  console.error('%c' + msg, ERROR_STYLE, err || '');
};

// Example usage pattern:
// debugGroup('Villa Fetch', () => {
//   debugValue('Endpoint', url);
//   debugValue('Payload', data);
//   debugOk('State updated');
// });

