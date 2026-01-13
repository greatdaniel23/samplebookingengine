# R2 Storage Integration - imageroom

Your R2 bucket `imageroom` is now connected to your Cloudflare account.

## Configuration Applied ✅

| Setting | Value |
|---------|-------|
| R2 Bucket Name | `imageroom` |
| Binding | `IMAGES` |
| Type | Object Storage |
| Region | Auto (Cloudflare edge network) |

## Updated Files

✅ `wrangler.toml` - Updated with R2 bucket binding:
```toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "imageroom"
```

## What's Ready

### 1. **Image Upload Handler** (`src/workers/routes/images.ts`)
- Upload images to R2
- Automatic filename generation with timestamps
- File type and size validation
- Get image metadata
- Delete images
- List images by prefix

### 2. **API Endpoints Created**

```
POST   /api/images/upload         - Upload new image
GET    /api/images/:key           - Get image info
DELETE /api/images/:key           - Delete image
GET    /api/images/list/:prefix   - List images (e.g., list/room/villa-1)
```

### 3. **Routing System** (`src/workers/index.ts`)
- Bookings API
- Amenities API
- Images API
- Authentication API
- Health check endpoint

## Deployment Options

### Option A: Deploy as Cloudflare Worker (Recommended for API)
```bash
npm install -D wrangler @cloudflare/workers-types
npx wrangler deploy --config wrangler-api.toml
```

### Option B: Deploy with Cloudflare Pages Functions
```bash
npx wrangler pages deploy dist
```

## Next Steps

1. **Deploy the API**
   ```bash
   npx wrangler deploy --config wrangler-api.toml
   ```

2. **Test Image Upload**
   ```bash
   curl -X POST http://localhost:8787/api/images/upload \
     -F "file=@image.jpg" \
     -F "roomId=villa-1" \
     -F "type=room"
   ```

3. **Access Your Images**
   - Images stored at: `https://imageroom.cloudflare.com/<path>`
   - URLs are permanent and cached globally

## Image Organization

Images are stored with this structure:
```
imageroom/
├── room/
│   ├── villa-1/
│   ├── villa-2/
│   └── villa-3/
├── amenity/
├── hero/
└── gallery/
```

## Security Notes

- ✅ File type validation (JPEG, PNG, WebP, AVIF)
- ✅ File size limit (10MB)
- ✅ Unique filenames (timestamp + random)
- ⚠️ Add authentication checks before uploading
- ⚠️ Set CORS headers for cross-origin requests
- ⚠️ Implement rate limiting for uploads

## Pricing

R2 is billed on:
- Storage per GB/month
- API calls (read/write/delete)
- Bandwidth (if served directly)

**First 10GB/month are free** with Cloudflare Pages.

---

**Database Status:** ✅ 24 bookings, 56 amenities loaded
**D1 Status:** ✅ Ready at ID `71df7f17-943b-46dd-8870-2e7769a3c202`
**R2 Status:** ✅ Ready at `imageroom`
**KV Status:** ✅ SESSIONS and CACHE namespaces ready
