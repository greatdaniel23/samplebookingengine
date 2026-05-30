-- Migration: 0005_image_url_consolidation.sql
-- Date: 2026-05-19
-- Purpose: Consolidate all image URLs to canonical custom domain image.alphadigitalagency.id
--          with samudra/ namespace prefix. Replaces:
--          - pub-913b92eaa36644408ee761502d6f53dc.r2.dev/... (old imageroom pub URL)
--          - booking-engine-api-samudra.danielsantosomarketing2017.workers.dev/api/images/... (Worker workaround)
--          - samudra-imageroom bucket references
--          Target: https://image.alphadigitalagency.id/samudra/<folder>/<file>
-- Idempotent: safe to re-run (WHERE clauses match old patterns only)

-- 1. room_images.image_url: replace pub URL for rooms
UPDATE room_images
SET image_url = 'https://image.alphadigitalagency.id/samudra/rooms/ocean-suite.png'
WHERE id = 1 AND image_url NOT LIKE 'https://image.alphadigitalagency.id/samudra/%';

UPDATE room_images
SET image_url = 'https://image.alphadigitalagency.id/samudra/rooms/pool-suite.png'
WHERE id = 3 AND image_url NOT LIKE 'https://image.alphadigitalagency.id/samudra/%';

UPDATE room_images
SET image_url = 'https://image.alphadigitalagency.id/samudra/rooms/garden-pavilion.png'
WHERE id = 5 AND image_url NOT LIKE 'https://image.alphadigitalagency.id/samudra/%';

UPDATE room_images
SET image_url = 'https://image.alphadigitalagency.id/samudra/rooms/cliff-villa.png'
WHERE id = 6 AND image_url NOT LIKE 'https://image.alphadigitalagency.id/samudra/%';

UPDATE room_images
SET image_url = 'https://image.alphadigitalagency.id/samudra/rooms/cliff-house.png'
WHERE id = 8 AND image_url NOT LIKE 'https://image.alphadigitalagency.id/samudra/%';

-- 2. rooms.images: replace Worker workaround URL for Cliff Villa (room id=4)
UPDATE rooms
SET images = '[{"url":"https://image.alphadigitalagency.id/samudra/rooms/cliff-house.png","filename":"rooms/cliff-house.png","is_primary":true,"caption":"","added_at":"2026-05-19T14:00:00.000Z"}]'
WHERE id = 4 AND images LIKE '%booking-engine-api-samudra%';

-- 3. packages.image_url: replace pub URL for packages
UPDATE packages
SET image_url = 'https://image.alphadigitalagency.id/samudra/packages/romance-weekend.jpg'
WHERE id = 1 AND image_url NOT LIKE 'https://image.alphadigitalagency.id/samudra/%';

UPDATE packages
SET image_url = 'https://image.alphadigitalagency.id/samudra/packages/cliff-house-buy-out.jpg'
WHERE id = 2 AND image_url NOT LIKE 'https://image.alphadigitalagency.id/samudra/%';
