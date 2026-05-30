/**
 * MASON 2026-05-19 — Package Image Generator
 * Generates images for Samudra packages using CF Workers AI (Flux schnell),
 * uploads to R2 samudra-imageroom/packages/<slug>.jpg,
 * updates packages.image_url in D1.
 *
 * Usage:
 *   node scripts/generate-package-images.js
 *   node scripts/generate-package-images.js --force   # re-generate even if image_url exists
 *
 * Prerequisites:
 *   - wrangler authenticated (npx wrangler whoami)
 *   - CLOUDFLARE_API_TOKEN env var with AI write + R2 write permissions
 *     (falls back to wrangler OAuth token via shell)
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ACCOUNT_ID = 'b2a5cc3520b42302ad302f7a4790fbee';
const BUCKET = 'samudra-imageroom';
const R2_PUBLIC_URL = 'https://pub-913b92eaa36644408ee761502d6f53dc.r2.dev';
const DB_NAME = 'samudra-booking-db';
const FORCE = process.argv.includes('--force');

// Package definitions — title + description + dedicated Flux prompt
// Prompts must NOT mention infra providers (CF, R2, Flux, etc.) per feedback_client_facing_pages_no_infra_leak
const PACKAGES = [
  {
    id: 1,
    name: 'Romance Weekend',
    slug: 'romance-weekend',
    prompt: [
      'Cinematic luxury villa romance: champagne glasses on a private oceanview terrace at golden hour,',
      'rose petals scattered on pristine white linen, tropical flowers in foreground,',
      'Indian Ocean glittering in background, warm amber candlelight, Bali teal and gold color palette,',
      'architectural photography, ultra-detailed, 4K, soft bokeh, editorial luxury hospitality style'
    ].join(' '),
  },
  {
    id: 2,
    name: 'Cliff House Buy-Out',
    slug: 'cliff-house-buy-out',
    prompt: [
      'Exclusive luxury clifftop villa entire property buy-out: dramatic aerial view of private Balinese cliff house,',
      'infinity pool overlooking Indian Ocean at dusk, dedicated butler in traditional attire on stone terrace,',
      'lush tropical gardens, private outdoor dining pavilion with curated table setting,',
      'teal and gold architectural elements, cinematic wide angle, 4K, ultra luxury editorial photography'
    ].join(' '),
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write('[generate-package-images] ' + msg + '\n');
}

/**
 * Get CF API token — prefer env var, fallback to wrangler OAuth cache.
 */
function getApiToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }
  // Try reading from wrangler OAuth cache (Windows path)
  const cachePaths = [
    path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml'),
    path.join(os.homedir(), '.wrangler', 'config', 'default.toml'),
  ];
  for (const p of cachePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      const m = content.match(/oauth_token\s*=\s*["']([^"']+)["']/);
      if (m) return m[1];
    }
  }
  throw new Error('No CLOUDFLARE_API_TOKEN env var and no wrangler OAuth token found. Run: npx wrangler login');
}

/**
 * Call CF Workers AI Flux schnell — returns raw image bytes (PNG/JPEG).
 */
async function generateImage(apiToken, prompt) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, num_steps: 8 }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`CF AI error ${resp.status}: ${err}`);
  }

  // Flux schnell returns JSON with base64 image
  const data = await resp.json();
  if (!data.result || !data.result.image) {
    throw new Error('Unexpected CF AI response shape: ' + JSON.stringify(data).slice(0, 300));
  }
  // result.image is base64 string
  return Buffer.from(data.result.image, 'base64');
}

/**
 * Upload image bytes to R2 via wrangler (most reliable with OAuth).
 * Writes to a temp file, uses wrangler r2 object put.
 */
function uploadToR2(imageBytes, r2Key) {
  const tmpFile = path.join(os.tmpdir(), 'samudra-pkg-' + Date.now() + '.jpg');
  try {
    fs.writeFileSync(tmpFile, imageBytes);
    const cmd = `npx wrangler r2 object put "${BUCKET}/${r2Key}" --file "${tmpFile}" --content-type image/jpeg`;
    log(`  Uploading to R2: ${BUCKET}/${r2Key} (${imageBytes.length} bytes)`);
    execSync(cmd, { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' });
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

/**
 * Update packages.image_url in D1.
 */
function updateD1ImageUrl(packageId, imageUrl) {
  const sql = `UPDATE packages SET image_url = '${imageUrl}', updated_at = datetime('now') WHERE id = ${packageId}`;
  const cmd = `npx wrangler d1 execute ${DB_NAME} --remote --command "${sql}"`;
  log(`  Updating D1 packages.image_url for id=${packageId}`);
  execSync(cmd, { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' });
}

/**
 * Check if package already has image_url in D1.
 */
function getExistingImageUrl(packageId) {
  const sql = `SELECT image_url FROM packages WHERE id = ${packageId}`;
  const cmd = `npx wrangler d1 execute ${DB_NAME} --remote --command "${sql}"`;
  try {
    const out = execSync(cmd, { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' }).toString();
    const m = out.match(/"image_url"\s*:\s*"([^"]+)"/);
    return m ? m[1] : null;
  } catch (e) {
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  log('=== Package Image Generation — Samudra ===');
  log(`FORCE mode: ${FORCE}`);

  let apiToken;
  try {
    apiToken = getApiToken();
    log('API token obtained');
  } catch (e) {
    log('ERROR: ' + e.message);
    process.exit(1);
  }

  const results = [];

  for (const pkg of PACKAGES) {
    log(`\nProcessing: ${pkg.name} (id=${pkg.id})`);

    // Idempotent check
    if (!FORCE) {
      const existing = getExistingImageUrl(pkg.id);
      if (existing) {
        log(`  SKIP — image_url already set: ${existing}`);
        results.push({ id: pkg.id, name: pkg.name, status: 'skipped', image_url: existing });
        continue;
      }
    }

    const r2Key = `packages/${pkg.slug}.jpg`;
    const publicUrl = `${R2_PUBLIC_URL}/${r2Key}`;

    try {
      // Generate
      log(`  Generating image (Flux schnell)...`);
      log(`  Prompt: ${pkg.prompt.slice(0, 80)}...`);
      const imageBytes = await generateImage(apiToken, pkg.prompt);
      log(`  Generated: ${imageBytes.length} bytes`);

      // Upload to R2
      uploadToR2(imageBytes, r2Key);
      log(`  R2 upload complete: ${publicUrl}`);

      // Update D1
      updateD1ImageUrl(pkg.id, publicUrl);
      log(`  D1 updated: packages.image_url = ${publicUrl}`);

      results.push({ id: pkg.id, name: pkg.name, status: 'generated', r2_key: r2Key, image_url: publicUrl, bytes: imageBytes.length });
    } catch (e) {
      log(`  ERROR: ${e.message}`);
      results.push({ id: pkg.id, name: pkg.name, status: 'error', error: e.message });
    }
  }

  log('\n=== RESULTS ===');
  for (const r of results) {
    if (r.status === 'generated') {
      log(`  [OK] ${r.name} → ${r.r2_key} (${r.bytes} bytes)`);
    } else if (r.status === 'skipped') {
      log(`  [SKIP] ${r.name} → already has image`);
    } else {
      log(`  [ERR] ${r.name} → ${r.error}`);
    }
  }

  // Verify D1 final state
  log('\n=== D1 VERIFY ===');
  try {
    const verifyCmd = `npx wrangler d1 execute ${DB_NAME} --remote --command "SELECT id, name, image_url FROM packages WHERE is_active=1 ORDER BY id"`;
    const verifyOut = execSync(verifyCmd, { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' }).toString();
    // Extract just the results section
    const jsonMatch = verifyOut.match(/\[\s*\{[\s\S]+\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const rows = parsed[0]?.results || [];
      for (const row of rows) {
        log(`  id=${row.id} ${row.name}: image_url=${row.image_url || 'NULL'}`);
      }
    }
  } catch (e) {
    log('  Verify query failed: ' + e.message);
  }

  log('\nDone.');
  return results;
}

main().catch(e => {
  console.error('[generate-package-images] Fatal:', e);
  process.exit(1);
});
