/**
 * MASON 2026-05-20 — Package Image Re-Generation (2 missing images)
 * Generates romance-weekend.jpg + cliff-house-buy-out.jpg via CF Workers AI Flux schnell,
 * uploads to R2 bucket `imageroom` at keys `samudra/packages/<slug>.jpg`.
 * D1 image_url already correct — no D1 update needed.
 *
 * Usage:
 *   node scripts/generate-package-images-2-regen.cjs
 *   node scripts/generate-package-images-2-regen.cjs --force
 *
 * Bucket: imageroom (consolidated post 2026-05-19)
 * Namespace: samudra/packages/
 * Public URL: https://image.alphadigitalagency.id/samudra/packages/<slug>.jpg
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ACCOUNT_ID = 'b2a5cc3520b42302ad302f7a4790fbee';
const BUCKET = 'imageroom';
const CUSTOM_DOMAIN_BASE = 'https://image.alphadigitalagency.id';
const DB_NAME = 'samudra-booking-db';
const FORCE = process.argv.includes('--force');

// Only the 2 missing packages
// Prompts must NOT mention infra providers per feedback_client_facing_pages_no_infra_leak
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

function log(msg) {
  process.stdout.write('[regen-package-images] ' + msg + '\n');
}

function getApiToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return process.env.CLOUDFLARE_API_TOKEN;
  }
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

  const data = await resp.json();
  if (!data.result || !data.result.image) {
    throw new Error('Unexpected CF AI response shape: ' + JSON.stringify(data).slice(0, 300));
  }
  return Buffer.from(data.result.image, 'base64');
}

function uploadToR2(imageBytes, r2Key) {
  const tmpFile = path.join(os.tmpdir(), 'samudra-pkg-regen-' + Date.now() + '.jpg');
  try {
    fs.writeFileSync(tmpFile, imageBytes);
    // Use imageroom bucket with full samudra/packages/ key
    const cmd = `npx wrangler r2 object put "${BUCKET}/${r2Key}" --file "${tmpFile}" --content-type image/jpeg --remote`;
    log(`  Uploading to R2: ${BUCKET}/${r2Key} (${imageBytes.length} bytes)`);
    execSync(cmd, { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' });
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

async function main() {
  log('=== Package Image Re-Generation — 2 missing images ===');
  log(`Bucket: ${BUCKET} | Namespace: samudra/packages/`);
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

    // r2Key uses full samudra/ namespace
    const r2Key = `samudra/packages/${pkg.slug}.jpg`;
    const publicUrl = `${CUSTOM_DOMAIN_BASE}/${r2Key}`;

    log(`  R2 key: ${r2Key}`);
    log(`  Public URL: ${publicUrl}`);

    try {
      log(`  Generating image (Flux schnell)...`);
      log(`  Prompt: ${pkg.prompt.slice(0, 80)}...`);
      const imageBytes = await generateImage(apiToken, pkg.prompt);
      log(`  Generated: ${imageBytes.length} bytes`);

      uploadToR2(imageBytes, r2Key);
      log(`  R2 upload complete`);

      // D1 image_url already correct from consolidation — no update needed
      log(`  D1 image_url already set to ${publicUrl} — no update needed`);

      results.push({ id: pkg.id, name: pkg.name, status: 'generated', r2Key, publicUrl, bytes: imageBytes.length });
    } catch (e) {
      log(`  ERROR: ${e.message}`);
      results.push({ id: pkg.id, name: pkg.name, status: 'error', error: e.message });
    }
  }

  log('\n=== RESULTS ===');
  for (const r of results) {
    if (r.status === 'generated') {
      log(`  [OK] ${r.name} → ${r.r2Key} (${r.bytes} bytes)`);
    } else {
      log(`  [ERR] ${r.name} → ${r.error}`);
    }
  }

  // Exit non-zero if any error
  const hasError = results.some(r => r.status === 'error');
  if (hasError) process.exit(1);

  log('\nDone. Run curl verify next.');
}

main().catch(e => {
  console.error('[regen-package-images] Fatal:', e);
  process.exit(1);
});
