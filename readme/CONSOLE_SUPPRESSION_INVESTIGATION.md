# Console Suppression Investigation & Remediation Plan

Last Updated: 2025-11-21

## 1. Problem Summary
Console output is still appearing in the browser (examples from `diagnostic.ts`) despite prior attempts to suppress logs in production using:
- Runtime override in `src/main.tsx` (replacing `console.*` with no-ops when `import.meta.env.PROD`)
- Build-time removal via `esbuild: { drop: ['console'] }` in `vite.config.ts` for production builds
- ESLint `no-console` rule to prevent future additions.

Observed console shows:
```
Environment Mode: development
Is Development: true
Is Production: false
```
This indicates the application bundle loaded in the browser is still a development build (Vite dev server) rather than the production build from `dist/`.

## 2. Current Mechanisms
| Mechanism | Scope | When Active | Purpose |
|-----------|-------|------------|---------|
| `import.meta.env.PROD` runtime override in `main.tsx` | All `console.*` (log/info/debug/group/table/warn/error) | Production only | Prevent end-user visibility of any console output |
| Esbuild `drop: ['console']` | Removes console calls from generated JS code | Production only | Shrink bundle & ensure no stray logs remain |
| ESLint `no-console` | Source linting | Dev + CI | Block adding new console statements |
| `diagnostic.ts` | Emits environment & path information | Dev & (currently) Prod | Operational diagnostics (should be dev-only) |

## 3. Why Logs Still Appear
1. Running `vite` dev server (`npm run dev`) serves a development build → `import.meta.env.PROD` is false.
2. `diagnostic.ts` intentionally prints diagnostics; suppression logic only runs for production.
3. If production build was deployed but still shows `development`, hosting may be serving the dev server output or environment variables are misconfigured.

## 4. Differential Diagnosis
| Scenario | Indicator | Action |
|----------|-----------|--------|
| Dev build running locally | `Environment Mode: development` | Expected behavior; logs OK unless you want total silence even in dev |
| Production build deployed but still shows development | `dist/` not used; server proxies to dev | Reconfigure deployment to serve `dist/` directory |
| Production build served but some logs remain | Search built JS for a signature string | Confirm esbuild removal worked; offending logs likely from external lib or injected script |

## 5. Verification Steps
### A. Confirm Build Type
Run:
```powershell
npm run build
```
Then open `dist/assets/index-*.js` and search for a known diagnostic string:
```powershell
Select-String -Path .\dist\assets\index-*.js -Pattern "Environment Mode:" | Measure-Object
```
If count is 0 → diagnostic logs stripped. If >0 → file included pre-drop or string produced dynamically.

### B. Confirm Console Override Executed
In production environment open DevTools Console and run:
```js
console.log.toString()
```
If suppression active you should see `() => {}` or an empty function body instead of native code.

### C. Detect Remaining Console Calls (Source)
```powershell
Select-String -Path .\src\**\*.{ts,tsx,js} -Pattern "console." | Group-Object Path | Select-Object Name
```
These are now lint errors but remain until manually removed.

### D. Confirm Environment Flags
At runtime:
```js
import.meta.env.MODE
import.meta.env.PROD
```
If `MODE` is `development` suppression will not occur under current logic.

## 6. Remediation Options
| Option | Effort | Side Effects | Recommended When |
|--------|--------|--------------|------------------|
| A. Universal suppression (override even in dev) | Low | Harder local debugging | You need absolute silence everywhere |
| B. Guard `diagnostic.ts` import (only in dev) | Low | Diagnostics unavailable in prod | You want prod silent but keep dev visibility |
| C. Remove all console statements from source (codemod) | Medium | Lose quick local insights | Code cleanliness & security review |
| D. Feature-flag suppression `VITE_FORCE_NO_CONSOLE` | Low | Flexible toggling | Occasional need to re-enable logs temporarily |
| E. Replace console with custom logger that no-ops in prod | Medium | Adds abstraction | Structured logging / future remote sink |

## 7. Recommended Action Plan
1. Restrict `diagnostic.ts` to development: wrap import in `if (import.meta.env.DEV)` or dynamically import.
2. Add optional env flag `VITE_FORCE_NO_CONSOLE` to force suppression even in development for special sessions.
3. (Optional) Run codemod to remove existing `console.*` statements (retain error handling using a silent reporter).
4. Rebuild and verify no diagnostic strings present in `dist` bundle.

## 8. Implementation Sketches
### A. Conditional Diagnostic Import (`main.tsx`)
```ts
if (import.meta.env.DEV) {
  await import('./diagnostic.ts');
}
```

### B. Force Suppression Flag (extend existing block)
```ts
const FORCE = import.meta.env.VITE_FORCE_NO_CONSOLE === 'true';
if (import.meta.env.PROD || FORCE) { /* override methods */ }
```

### C. Codemod Removal Strategy
Search & replace pattern: `console.(log|info|debug|warn|error|group|groupCollapsed|groupEnd|table)\([^;]*\);?`
Replace with nothing (or keep errors if desired). Run selectively per directory.

## 9. Risk Considerations
| Risk | Mitigation |
|------|------------|
| Loss of error visibility in prod | Preserve `error` logs or route to remote monitoring (Sentry, etc.) |
| Hard debugging future issues | Keep a feature flag to re-enable temporarily |
| Accidentally removing meaningful warnings | Review diff before committing codemod patches |

## 10. Acceptance Criteria
| Criterion | Target |
|----------|--------|
| No diagnostic output in production | DevTools console empty on fresh load |
| Build bundle lacks diagnostic strings | `Select-String` returns 0 matches |
| ESLint blocks new console usage | Running `npm run lint` shows errors for any added calls |
| Feature flag can re-enable logging | Setting `VITE_FORCE_NO_CONSOLE=false` restores logs locally |

## 11. Next Steps (Pending Approval)
1. Patch `main.tsx` to conditionally import `diagnostic.ts` only in dev.
2. Add feature flag logic for universal suppression.
3. Execute codemod to delete all console calls except `console.error` (optional).
4. Rebuild & verify.

## 12. Analyst Checklist
| Step | Tool/Command | Expected |
|------|--------------|----------|
| Confirm mode | Browser DevTools / `import.meta.env.MODE` | `production` in prod |
| Search bundle | `Select-String` | 0 matches for diagnostic labels |
| Check override | `console.log.toString()` | Empty / no-op function |
| Feature flag test | Set `VITE_FORCE_NO_CONSOLE=true` | Logs suppressed even in dev |
| Lint enforcement | `npm run lint` | No new console statements accepted |

---
Prepared for: Suppression & security hardening analysis.
---

## 13. Live Evidence Snapshot (Unresolved)
Recent browser console output (truncated) shows multiple lines from:
- `diagnostic.ts` (environment + paths)
- `useVillaInfo.tsx`, `usePackages.tsx`, `useRooms.tsx`
- `Footer.tsx`

Key indicators in the snapshot:
```
Environment Mode: development
Is Development: true
Is Production: false
```
This confirms a DEVELOPMENT build is running. All suppression logic added so far only activates when `import.meta.env.PROD === true` OR when feature flag `VITE_FORCE_NO_CONSOLE === 'true'` is set. Since neither condition is true, logs are expected to appear.

Additional duplicate villa logs indicate multiple fetch cycles (likely React strict mode double-invoke in development or duplicate effect triggers). StrictMode intentionally re-runs effects in dev.

## 14. Hard Lockdown Steps (Remove All Visible Logs Regardless of Mode)
Follow these in order if you need absolutely no console output even during development sessions.

| Step | Action | Command / Patch | Result |
|------|--------|-----------------|--------|
| 1 | Enable force flag | Create `.env` with `VITE_FORCE_NO_CONSOLE=true` | Runtime overrides all console methods |
| 2 | Guard duplicate fetch logs | Remove React StrictMode wrapper (if present in `main.tsx` or `App.tsx`) | Prevent dev-only effect double runs |
| 3 | Codemod removal (log/info/debug/group/table/warn) | Script below | Source cleaned (lint passes) |
| 4 | Decide on `error` retention | Keep or replace with silent reporter | Avoid loss of critical failure awareness |
| 5 | Rebuild & verify | `npm run build` then search bundle | Ensure strings removed |
| 6 | Final validation | Open app, run `console.log('test')` manually | Should output nothing (if overridden) |

### Codemod Removal Script (PowerShell)
Removes most console statements except `error`:
```powershell
$patterns = @(
  'console.log', 'console.info', 'console.debug', 'console.group', 'console.groupCollapsed', 'console.groupEnd', 'console.table', 'console.warn'
)
Get-ChildItem -Path .\src -Include *.ts,*.tsx,*.js -Recurse | ForEach-Object {
  $file = $_.FullName
  $content = Get-Content $file -Raw
  $orig = $content
  foreach ($p in $patterns) {
    # Remove simple statements ending with ); (best-effort, manual review recommended)
    $content = $content -replace "$p\([^;]*\);?", ''
  }
  if ($content -ne $orig) { Set-Content -Path $file -Value $content }
}
```
After running codemod:
```powershell
npm run lint
```
Resolve any residual formatting issues.

### Optional: Keep Only Error Reporting
If you still want `console.error` in development but never in production, modify suppression block:
```ts
const suppressed = ['log','info','debug','group','groupCollapsed','groupEnd','table','warn'];
if (import.meta.env.PROD || FORCE_SUPPRESS) suppressed.push('error');
```

### Verify After Lockdown
```powershell
Select-String -Path .\dist\assets\index-*.js -Pattern "useVillaInfo" | Measure-Object
Select-String -Path .\dist\assets\index-*.js -Pattern "diagnostic.ts" | Measure-Object
Select-String -Path .\dist\assets\index-*.js -Pattern "Environment Mode:" | Measure-Object
```
All counts should be 0 if logs stripped and diagnostic excluded.

## 15. Common Pitfalls Now
| Pitfall | Cause | Resolution |
|---------|-------|-----------|
| Logs still show after enabling flag | Dev server not restarted | Stop dev server, restart `npm run dev` |
| Flag ignored | Misspelled variable name | Use exact `VITE_FORCE_NO_CONSOLE` (Vite only exposes `VITE_` prefixed vars) |
| Diagnostic still loads | Static import remained | Ensure dynamic import pattern used with dev check (`import.meta.env.DEV`) |
| Duplicate villa fetch logs | React StrictMode double-invoke | Remove StrictMode wrapper for production parity testing |

## 16. Decision Matrix (Choose Suppression Level)
| Level | Description | Pros | Cons |
|-------|-------------|------|------|
| Standard (current) | Suppress in prod only | Easy local debug | Dev logs visible |
| Flagged Dev Silence | Prod + optional dev flag | Flexible | Need flag management |
| Source Purge | Remove logs entirely | Clean code, smaller bundle | Harder debugging later |
| Logger Abstraction | Replace with custom API | Future remote logging, filtering | Implementation overhead |
| Total Blackout | Override ALL including errors always | Maximum secrecy | No visibility on failures |

## 17. Immediate Next Action Requested
Implement chosen level. If you need total silence now even in development, set `.env`:
```
VITE_FORCE_NO_CONSOLE=true
```
Restart dev server. Then optionally run the codemod removal to purge statements site-wide.

---
Status: Updated based on latest unsolved problem (dev logs visible). Pending selection of suppression level for final implementation.
---
## 18. Endpoint Exposure Mitigation (Added)
Goal: Prevent casual observers from seeing full external API domain (e.g. `https://api.rumahdaisycantik.com/rooms.php`) in console logs and reduce direct visibility of origin.

### Implemented Changes
- Switched `paths.ts` to use relative `'/api'` base when running on booking production domain (`booking.rumahdaisycantik.com`).
- Removed production configuration logging from `paths.ts` (eliminated lines printing `API_BASE` and domain).
- Replaced verbose diagnostics with a minimal dev-only summary (`diagnostic.ts`) that does not print full URLs.

### Required Server Support
Configure reverse proxy (Nginx/Apache/Cloudflare) so frontend requests to `/api/*` are forwarded to `https://api.rumahdaisycantik.com/*`. Example Nginx snippet:
```nginx
location /api/ {
  proxy_pass https://api.rumahdaisycantik.com/;
  proxy_set_header Host api.rumahdaisycantik.com;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Result
- Console logs no longer print full API URLs (dev-only minimal info retained, suppressed in prod).
- Network tab will still show request destinations; this cannot be fully hidden in browsers.

### Limitations
| Aspect | Why Cannot Hide |
|--------|-----------------|
| Network panel URLs | Browser devtools must show real request targets |
| View-source bundle strings | Obfuscation possible but reversible |
| Third-party scripts | May still log if they use console internally |

### Optional Further Obfuscation
- Enable code minification/obfuscation (already minified by Vite build) using additional Rollup plugin if desired.
- Move high-sensitivity calls to server-rendered endpoints to reduce client awareness.

---
## 19. Live Snapshot #2 (Absolute API Base Still Used)
Latest console evidence shows continued use of full domain API URLs and `apiBaseType: 'absolute'`:
```
ℹ️ Dev Diagnostic: {mode: 'development', prod: false, publicBase: '/', apiBaseType: 'absolute'}
🏨 Fetching villa info from: https://api.rumahdaisycantik.com/villa.php
```
Relative `/api` proxy path did not activate.

## 20. Root Cause Hypotheses
| Hypothesis | Explanation | Quick Check |
|-----------|-------------|-------------|
| Host pattern miss | Domain variation (e.g. `www.booking...`, staging prefix) not matched by regex | `window.location.host` in DevTools |
| Env override | `VITE_API_BASE` present forcing absolute base | Inspect `import.meta.env.VITE_API_BASE` |
| Execution order | Code runs before `window.location` correct (unlikely in Vite) | Temporary debug log in `paths.ts` |
| Proxy header rewrite | Reverse proxy changes visible origin silently | Compare `location.host` vs expected domain |

## 21. Enhanced Detection Patch (Planned)
Use broader pattern plus feature flag:
```ts
const hostLower = window.location.host.toLowerCase();
const bookingLike = /(^|\.)booking\.rumahdaisycantik\.com$/i.test(hostLower);
const forceRelative = import.meta.env.VITE_FORCE_RELATIVE_API === 'true';
if (bookingLike || forceRelative) API_BASE = '/api';
```

## 22. Feature Flag Controls
| Flag | Effect |
|------|--------|
| `VITE_FORCE_NO_CONSOLE=true` | Silences all console output (dev + prod) |
| `VITE_FORCE_RELATIVE_API=true` | Forces relative `/api` base regardless of host |

Add to `.env` (not committed):
```
VITE_FORCE_NO_CONSOLE=true
VITE_FORCE_RELATIVE_API=true
```

## 23. Verification After Patch
| Step | Expected |
|------|----------|
| `window.location.host` | Matches booking domain or staging subdomain |
| `paths.apiBase` | `/api` |
| Diagnostic summary | `apiBaseType: 'relative-proxied'` |
| Network requests | Appear as `/api/rooms.php` (proxy rewrites upstream) |

## 24. Limitations of Hiding Upstream Domain
Even with relative API base, determined users can still discover upstream origin via:
1. Server response headers (if `Server` or custom headers leak info).
2. CORS preflight `Access-Control-Allow-Origin` exposing domain if misconfigured.
3. External asset references (images/CDN) carrying the root domain.

Mitigation: Audit headers; ensure reverse proxy strips internal disclosures; host images under same domain or neutral CDN.

## 25. Pending Action Decision
Approve enhanced detection + flags? (Yes/No)
Optional follow-ups: purge source console lines, disable source maps, add server header hardening doc.

---

## 26. Verification Results (Latest Audit)
**Date:** 2025-11-21  
**Method:** Systematic file inspection + source scanning

### ✅ Working Mechanisms
| Component | Status | Details |
|-----------|--------|---------|
| `src/main.tsx` | ✅ Configured | Console suppression active for prod + `VITE_FORCE_NO_CONSOLE` flag support |
| `vite.config.ts` | ✅ Configured | Build-time `esbuild: { drop: ['console'] }` for production |
| `eslint.config.js` | ✅ Configured | `no-console` rule enforced |
| Dynamic diagnostic import | ✅ Working | `diagnostic.ts` only loads in dev when not force-suppressed |

### ❌ Critical Issues Found
| Issue | Severity | Impact |
|-------|----------|--------|
| Domain pattern too restrictive | **HIGH** | Relative `/api` switching never activates (pattern: `/booking\.rumahdaisycantik\.com$/i`) |
| 191 console statements remain | **HIGH** | Source still contains extensive logging despite ESLint rule |
| No feature flag environment files | **MEDIUM** | Missing `.env` with `VITE_FORCE_NO_CONSOLE` / `VITE_FORCE_RELATIVE_API` |

### 🔍 Root Cause Analysis: Why API Base Stays Absolute
**Current pattern in `paths.ts` line 42:**
```ts
const bookingDomain = /booking\.rumahdaisycantik\.com$/i;
```

**Problems:**
1. **Missing subdomain support** - Won't match `www.booking.rumahdaisycantik.com`, `staging-booking.rumahdaisycantik.com`
2. **No feature flag fallback** - Can't force relative mode for testing
3. **Anchored end match** - Requires exact suffix, no flexibility

**Required Fix (per section 21):**
```ts
const hostLower = window.location.host.toLowerCase();
const bookingLike = /(^|\.)booking\.rumahdaisycantik\.com$/i.test(hostLower);
const forceRelative = import.meta.env.VITE_FORCE_RELATIVE_API === 'true';
if (bookingLike || forceRelative) API_BASE = '/api';
```

### 📊 Console Statement Breakdown
**Total found:** 191 statements across source  
**Files affected:** Multiple hooks, pages, services, components  
**ESLint bypass:** Statements exist despite `no-console` rule (likely pre-existing)

**High-volume sources:**
- Hooks: `useVillaInfo.tsx`, `usePackages.tsx`, `useRooms.tsx`, etc.
- Pages: `Booking.tsx`, `BookingSummary.tsx`, `AdminPanel.tsx`
- Services: `api.js`, `calendarService.ts`, `villaService.ts`

## 27. Immediate Action Plan (Priority Order)
| Priority | Action | Command/Method | Expected Outcome |
|----------|--------|----------------|------------------|
| **P1** | Fix domain pattern + add flag | Patch `paths.ts` per section 21 | Relative `/api` activates on booking domains |
| **P2** | Create `.env` template | Add flags to `.env.example` | Feature flags available for toggling |
| **P3** | Console source purge | Run codemod script (section 14) | 191 → ~20 console statements (keep critical errors) |
| **P4** | Verify production bundle | Build + search for leaked strings | Confirm no API domains in `dist/` |

## 28. Success Criteria (Updated)
| Test | Current | Target | Verification Method |
|------|---------|--------|-------------------|
| Domain pattern flexibility | ❌ Restrictive | ✅ Handles subdomains + flag | Test with `www.booking.rumahdaisycantik.com` |
| API base on booking domain | ❌ Always absolute | ✅ `/api` when pattern matches | Check `paths.apiBase` value |
| Console source count | ❌ 191 statements | ✅ <25 critical only | `Select-String` count |
| Production bundle cleanliness | ❓ Not tested | ✅ No API domains in JS | Search `dist/assets/index-*.js` |
| Force flags working | ❌ No `.env` | ✅ Toggles behavior | Set flags, restart dev server |

## 29. Risk Assessment (Implementation)
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regex breaks existing domains | Low | High | Test pattern with known valid/invalid hosts |
| Console purge removes critical errors | Medium | High | Preserve `console.error` in codemod; manual review |
| Relative API fails without proxy | High | Medium | Document server config requirement clearly |
| Flag typos break suppression | Low | Low | Use exact documented variable names |

---
**Status:** Verification complete. Ready for systematic remediation (P1-P4 action plan).
---