/**
 * R2 Taxonomy Migration Script
 * Run: npx wrangler dev --local -- this won't work as a standalone
 * Instead: add a one-time endpoint GET /api/admin/migrate-r2 to the Worker,
 * call it once from the admin panel, then remove the endpoint.
 *
 * Canonical taxonomy:
 *   rooms/      — images referenced by rooms or room_images table
 *   packages/   — images referenced by packages table
 *   villa/      — images referenced by homepage_settings or villa_info
 *   marketing/  — images with existing marketing/ prefix
 *   misc/       — everything else (fallback)
 *
 * Steps per object:
 *   1. Compute canonical folder from DB references
 *   2. If already in correct folder → skip (idempotent)
 *   3. Copy R2 object to new key
 *   4. Update all DB references (rooms.images, room_images.image_url,
 *      packages.images, homepage_settings.images_json)
 *   5. Delete old R2 key
 *
 * REVERSIBLE: R2 objects are not deleted until the new copy is confirmed.
 * Run a dry-run first by passing ?dry_run=true.
 */

import { Env } from '../src/workers/types';

interface MigrationResult {
  processed: number;
  skipped: number;
  moved: number;
  errors: string[];
  log: string[];
}

export async function migrateR2Taxonomy(env: Env, dryRun: boolean): Promise<MigrationResult> {
  const result: MigrationResult = { processed: 0, skipped: 0, moved: 0, errors: [], log: [] };
  const R2_PUBLIC_URL = 'https://image.alphadigitalagency.id';

  const log = (msg: string) => { result.log.push(msg); console.log(msg); };

  // 1. List all R2 objects
  let cursor: string | undefined;
  const allObjects: { key: string; size: number }[] = [];
  do {
    const listed = await env.IMAGES.list({ cursor, limit: 1000 });
    for (const obj of listed.objects) {
      allObjects.push({ key: obj.key, size: obj.size });
    }
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);

  log(`Found ${allObjects.length} R2 objects`);

  // 2. Fetch all DB references
  const roomsData = await env.DB.prepare(`SELECT id, name, images FROM rooms WHERE images IS NOT NULL AND images != '' AND images != '[]'`).all();
  const roomImagesData = await env.DB.prepare(`SELECT id, room_id, image_url FROM room_images WHERE image_url IS NOT NULL`).all();
  const packagesData = await env.DB.prepare(`SELECT id, name, images FROM packages WHERE images IS NOT NULL AND images != '' AND images != '[]'`).all();
  const homepageData = await env.DB.prepare(`SELECT id, images_json FROM homepage_settings WHERE images_json IS NOT NULL AND images_json != '' AND images_json != '[]'`).all();

  // Build lookup: key → { entity_type, entity_ids }
  const keyToFolder: Map<string, string> = new Map();

  const parseJsonArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    try { return JSON.parse(val); } catch { return []; }
  };

  const extractKeysFromUrl = (urlOrKey: string): string => {
    // If it's already a bare key (no http), return as-is
    if (!urlOrKey.startsWith('http')) return urlOrKey;
    // Strip CDN prefix
    return urlOrKey.replace(`${R2_PUBLIC_URL}/`, '');
  };

  // rooms.images → rooms/
  for (const row of roomsData.results as any[]) {
    const keys = parseJsonArray(row.images);
    for (const k of keys) {
      const bareKey = extractKeysFromUrl(k);
      if (!keyToFolder.has(bareKey)) keyToFolder.set(bareKey, 'rooms/');
    }
  }

  // room_images.image_url → rooms/
  for (const row of roomImagesData.results as any[]) {
    const bareKey = extractKeysFromUrl(row.image_url as string);
    if (bareKey && !keyToFolder.has(bareKey)) keyToFolder.set(bareKey, 'rooms/');
  }

  // packages.images → packages/
  for (const row of packagesData.results as any[]) {
    const keys = parseJsonArray(row.images);
    for (const k of keys) {
      const bareKey = extractKeysFromUrl(k);
      if (!keyToFolder.has(bareKey)) keyToFolder.set(bareKey, 'packages/');
    }
  }

  // homepage_settings.images_json → villa/
  for (const row of homepageData.results as any[]) {
    const keys = parseJsonArray(row.images_json);
    for (const k of keys) {
      const bareKey = extractKeysFromUrl(k);
      if (!keyToFolder.has(bareKey)) keyToFolder.set(bareKey, 'villa/');
    }
  }

  const CANONICAL_PREFIXES = ['rooms/', 'packages/', 'villa/', 'marketing/', 'misc/'];

  // 3. Process each object
  for (const obj of allObjects) {
    result.processed++;
    const oldKey = obj.key;

    // Determine target folder
    let targetFolder: string;

    // Check if already in a canonical folder
    const existingPrefix = CANONICAL_PREFIXES.find(p => oldKey.startsWith(p));

    if (existingPrefix) {
      // Check if the DB says it belongs to a different folder
      const leaf = oldKey.slice(existingPrefix.length);
      const dbFolder = keyToFolder.get(oldKey);
      if (!dbFolder || dbFolder === existingPrefix) {
        // Already correct
        result.skipped++;
        log(`SKIP (already canonical): ${oldKey}`);
        continue;
      }
      targetFolder = dbFolder;
    } else {
      // Not in a canonical folder — determine from DB
      targetFolder = keyToFolder.get(oldKey) ?? 'misc/';
    }

    const leaf = oldKey.includes('/') ? oldKey.split('/').pop()! : oldKey;
    const newKey = `${targetFolder}${leaf}`;

    if (newKey === oldKey) {
      result.skipped++;
      log(`SKIP (key unchanged): ${oldKey}`);
      continue;
    }

    log(`${dryRun ? '[DRY RUN] ' : ''}MOVE: ${oldKey} → ${newKey}`);

    if (!dryRun) {
      try {
        // Copy R2 object
        const srcObject = await env.IMAGES.get(oldKey);
        if (!srcObject) {
          result.errors.push(`Source not found: ${oldKey}`);
          continue;
        }

        const body = await srcObject.arrayBuffer();
        await env.IMAGES.put(newKey, body, {
          httpMetadata: srcObject.httpMetadata,
          customMetadata: {
            ...(srcObject.customMetadata || {}),
            migratedFrom: oldKey,
            migratedAt: new Date().toISOString(),
          },
        });

        // Update DB references
        // rooms.images (JSON array text-replace)
        for (const row of roomsData.results as any[]) {
          const keys = parseJsonArray(row.images);
          const updated = keys.map((k: string) => {
            const bare = extractKeysFromUrl(k);
            return bare === oldKey ? newKey : k;
          });
          if (JSON.stringify(updated) !== JSON.stringify(keys)) {
            await env.DB.prepare(`UPDATE rooms SET images = ? WHERE id = ?`)
              .bind(JSON.stringify(updated), row.id).run();
          }
        }

        // room_images.image_url
        await env.DB.prepare(`UPDATE room_images SET image_url = ? WHERE image_url = ? OR image_url = ?`)
          .bind(newKey, oldKey, `${R2_PUBLIC_URL}/${oldKey}`).run();

        // packages.images (JSON array text-replace)
        for (const row of packagesData.results as any[]) {
          const keys = parseJsonArray(row.images);
          const updated = keys.map((k: string) => {
            const bare = extractKeysFromUrl(k);
            return bare === oldKey ? newKey : k;
          });
          if (JSON.stringify(updated) !== JSON.stringify(keys)) {
            await env.DB.prepare(`UPDATE packages SET images = ? WHERE id = ?`)
              .bind(JSON.stringify(updated), row.id).run();
          }
        }

        // homepage_settings.images_json
        for (const row of homepageData.results as any[]) {
          const keys = parseJsonArray(row.images_json);
          const updated = keys.map((k: string) => {
            const bare = extractKeysFromUrl(k);
            return bare === oldKey ? newKey : k;
          });
          if (JSON.stringify(updated) !== JSON.stringify(keys)) {
            await env.DB.prepare(`UPDATE homepage_settings SET images_json = ? WHERE id = ?`)
              .bind(JSON.stringify(updated), row.id).run();
          }
        }

        // Delete old R2 key only after copy + DB updates succeed
        await env.IMAGES.delete(oldKey);

        result.moved++;
        log(`MOVED: ${oldKey} → ${newKey}`);
      } catch (err: any) {
        result.errors.push(`ERROR moving ${oldKey}: ${err.message}`);
        log(`ERROR: ${oldKey} — ${err.message}`);
      }
    } else {
      result.moved++; // dry run count
    }
  }

  return result;
}
