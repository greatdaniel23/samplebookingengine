# 🌐 R2 Custom Domain Routing Guide

## Overview

This document explains how the R2 bucket (`imageroom`) is connected to the custom domain `bookingengine.com` for serving images publicly.

---

## Current Configuration

### R2 Bucket Details
- **Bucket Name**: `imageroom`
- **Account ID**: `b2a5cc3520b42302ad302f7a4790fbee`
- **S3 API Endpoint**: `https://b2a5cc3520b42302ad302f7a4790fbee.r2.cloudflarestorage.com/imageroom`
- **Custom Domain**: ✅ `bookingengine.com`
- **Public Access**: ✅ Enabled via custom domain

### Domain Configuration
- **Domain**: `bookingengine.com`
- **Type**: Custom domain connected to R2 bucket
- **SSL/TLS**: ✅ Automatic (Cloudflare managed)
- **CDN**: ✅ Cloudflare's global network

---

## How It Works

### Image Upload Flow
```
User uploads image → Worker API → R2 Bucket (imageroom)
                                       ↓
                              Stored with key: hero/DSC02132.JPG
```

### Image Delivery Flow
```
Browser requests: https://bookingengine.com/hero/DSC02132.JPG
         ↓
Cloudflare DNS resolves bookingengine.com
         ↓
Cloudflare R2 Custom Domain routing
         ↓
R2 Bucket (imageroom) serves object at key: hero/DSC02132.JPG
         ↓
Image delivered through Cloudflare CDN
```

---

## URL Structure

### Public Image URLs
All images are accessible via the custom domain:

```
https://bookingengine.com/{key}
```

**Examples:**
```
Logo:           https://bookingengine.com/logo.png
Hero Image:     https://bookingengine.com/hero/DSC02132.JPG
Room Image:     https://bookingengine.com/rooms/Villa5/image1.webp
Package Image:  https://bookingengine.com/packages/romantic-escape.jpg
Amenity Icon:   https://bookingengine.com/amenities/pool.svg
```

### R2 Bucket Structure
```
imageroom/
├── logo.png                    → https://bookingengine.com/logo.png
├── hero/
│   ├── DSC02132.JPG           → https://bookingengine.com/hero/DSC02132.JPG
│   ├── DSC05979.JPG           → https://bookingengine.com/hero/DSC05979.JPG
│   └── DSC05990.JPG           → https://bookingengine.com/hero/DSC05990.JPG
├── rooms/
│   └── Villa5/
│       └── image1.webp        → https://bookingengine.com/rooms/Villa5/image1.webp
├── packages/
│   └── romantic-escape.jpg    → https://bookingengine.com/packages/romantic-escape.jpg
└── amenities/
    └── pool.svg               → https://bookingengine.com/amenities/pool.svg
```

---

## Configuration in Code

### Frontend Configuration

**File**: `src/config/r2.ts`
```typescript
export const R2_CONFIG = {
  publicUrl: 'https://bookingengine.com',
  bucketName: 'imageroom',
} as const;

export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '/placeholder.svg';
  if (imagePath.startsWith('http')) return imagePath;
  
  // Clean path and prepend custom domain
  const cleanPath = imagePath.replace(/^\/?(images\/)?/, '');
  return `${R2_CONFIG.publicUrl}/${cleanPath}`;
}
```

### Worker Configuration

**File**: `src/workers/index.ts`
```typescript
async function handleImages(url: URL, method: string, request: Request, env: Env): Promise<Response> {
  const R2_PUBLIC_URL = 'https://bookingengine.com';
  
  // Upload handler returns URLs with custom domain
  return successResponse({
    success: true,
    id: key,
    url: `${R2_PUBLIC_URL}/${key}`, // Custom domain URL
  });
}
```

### Component Usage

**File**: `src/components/PhotoGallery.tsx`
```tsx
import { getImageUrl } from '@/config/r2';

export const PhotoGallery = ({ images }: PhotoGalleryProps) => {
  // Automatically converts paths to custom domain URLs
  const displayImages = images.map(img => getImageUrl(img));
  
  return <img src={displayImages[0]} alt="Villa" />;
};
```

---

## Setting Up Custom Domain

### Prerequisites
✅ Domain registered (bookingengine.com)
✅ Domain added to Cloudflare account
✅ R2 bucket created (imageroom)

### Setup Steps

#### 1. Connect Domain to R2 Bucket
```bash
# Via Cloudflare Dashboard:
# 1. Go to R2 → Buckets → imageroom
# 2. Click "Settings" tab
# 3. Scroll to "Public Access"
# 4. Click "Connect Domain"
# 5. Enter: bookingengine.com
# 6. Click "Connect Domain"

# Via Wrangler CLI:
npx wrangler r2 bucket domain add imageroom bookingengine.com
```

#### 2. Verify DNS Configuration
```bash
# DNS should automatically be configured by Cloudflare
# Check DNS records:
nslookup bookingengine.com

# Should show Cloudflare IPs (e.g., 104.21.x.x, 172.67.x.x)
```

#### 3. Test Domain Access
```bash
# Upload a test image
npx wrangler r2 object put imageroom/test.jpg --file=test.jpg

# Access via custom domain
curl -I https://bookingengine.com/test.jpg
# Should return: HTTP/2 200 OK
```

---

## Advantages of Custom Domain

### 1. **Branding** 🎨
- Professional branded URLs instead of generic r2.dev
- Example: `bookingengine.com/hero/villa.jpg` vs `pub-xxx.r2.dev/hero/villa.jpg`

### 2. **Reliability** 🛡️
- Not affected if Cloudflare changes r2.dev URL structure
- Complete control over domain

### 3. **SEO Benefits** 🔍
- Branded domain improves trust signals
- Better for image search indexing

### 4. **Flexibility** 🔄
- Easy to migrate between buckets
- Can add subdomain routing (images.bookingengine.com)

### 5. **Performance** ⚡
- Cloudflare's global CDN
- Automatic caching at edge locations
- HTTP/2 and HTTP/3 support

---

## Uploading Images

### Upload Single File
```powershell
npx wrangler r2 object put imageroom/logo.png --file="path\to\logo.png"
```

### Bulk Upload Hero Images
```powershell
Get-ChildItem "public\images\hero\*.JPG" | ForEach-Object {
    $key = "hero/$($_.Name)"
    npx wrangler r2 object put "imageroom/$key" --file=$_.FullName
    Write-Host "✅ Uploaded: https://bookingengine.com/$key"
}
```

### Upload with Metadata
```powershell
npx wrangler r2 object put imageroom/hero/DSC02132.JPG `
  --file="public\images\hero\DSC02132.JPG" `
  --content-type="image/jpeg" `
  --cache-control="public, max-age=31536000"
```

---

## Image Management via Worker API

### Upload Image (POST)
```bash
POST https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/images/upload
Content-Type: multipart/form-data

# Returns:
{
  "success": true,
  "data": {
    "id": "hero/1736419200000-abc123.jpg",
    "url": "https://bookingengine.com/hero/1736419200000-abc123.jpg",
    "uploaded": "2026-01-09T12:00:00.000Z"
  }
}
```

### List Images (GET)
```bash
GET https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/images/list?prefix=hero

# Returns:
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "hero/DSC02132.JPG",
        "filename": "DSC02132.JPG",
        "url": "https://bookingengine.com/hero/DSC02132.JPG",
        "uploaded": "2026-01-09T12:00:00.000Z",
        "size": 2048576
      }
    ]
  }
}
```

### Delete Image (DELETE)
```bash
DELETE https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/images/hero/DSC02132.JPG

# Returns:
{
  "success": true,
  "message": "Image deleted",
  "key": "hero/DSC02132.JPG"
}
```

---

## Database Integration

### Villa Images Storage
**Table**: `villa_info`
**Column**: `images` (TEXT, JSON array)

**Example Data**:
```json
["hero/DSC02132.JPG", "hero/DSC05979.JPG", "hero/DSC05990.JPG"]
```

**Frontend Display**:
```tsx
// Database returns: ["hero/DSC02132.JPG"]
const villaImages = villaInfo.images; // ["hero/DSC02132.JPG"]

// getImageUrl converts to full URL
const imageUrl = getImageUrl(villaImages[0]);
// Result: "https://bookingengine.com/hero/DSC02132.JPG"

<img src={imageUrl} alt="Villa" />
```

---

## Troubleshooting

### Issue: Images not loading (404)

**Check 1: Domain connection**
```bash
npx wrangler r2 bucket domain list imageroom
# Should show: bookingengine.com
```

**Check 2: File exists in bucket**
```bash
npx wrangler r2 object get imageroom/hero/DSC02132.JPG
```

**Check 3: DNS resolution**
```bash
nslookup bookingengine.com
# Should resolve to Cloudflare IPs
```

### Issue: CORS errors

**Check Worker response headers**:
```typescript
return new Response(data, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE',
    'Cache-Control': 'public, max-age=31536000',
  },
});
```

### Issue: Slow loading

**Enable caching**:
```bash
# Set cache headers on upload
npx wrangler r2 object put imageroom/hero/image.jpg \
  --file=image.jpg \
  --cache-control="public, max-age=31536000, immutable"
```

---

## Performance Optimization

### 1. Cache Headers
```typescript
// Worker sets optimal cache headers
await env.IMAGES.put(key, arrayBuffer, {
  httpMetadata: {
    contentType: file.type,
    cacheControl: 'public, max-age=31536000, immutable',
  },
});
```

### 2. Image Formats
- Use WebP for photographs (smaller size)
- Use SVG for icons/logos (vector, scalable)
- Use AVIF for next-gen browsers (better compression)

### 3. CDN Edge Caching
- Cloudflare automatically caches at edge
- Requests served from nearest datacenter
- No origin hits after first request

---

## Security

### Public Access Control
- ✅ Domain-level access (via bookingengine.com only)
- ✅ HTTPS enforced (automatic SSL/TLS)
- ✅ DDoS protection (Cloudflare)
- ✅ Rate limiting (Cloudflare Workers)

### Private Files (if needed)
For private images, use Worker authentication:
```typescript
if (url.pathname.startsWith('/api/images/private/')) {
  // Check auth token
  const token = request.headers.get('Authorization');
  if (!isValidToken(token)) {
    return errorResponse('Unauthorized', 401);
  }
}
```

---

## Monitoring

### Check Bucket Usage
```bash
# Via Cloudflare Dashboard:
# R2 → imageroom → Metrics

# Via API:
npx wrangler r2 bucket info imageroom
```

### Analytics
- **Storage Used**: Monitor in Cloudflare Dashboard
- **Bandwidth**: Check R2 analytics
- **Request Count**: Worker analytics
- **Cache Hit Rate**: Cloudflare analytics

---

## Cost Estimation

### R2 Pricing (as of 2026)
- **Storage**: $0.015 per GB/month
- **Class A Operations** (writes): $4.50 per million
- **Class B Operations** (reads): $0.36 per million
- **Egress**: FREE (via custom domain)

### Example Cost (1000 images, 2GB total)
```
Storage:  2 GB × $0.015 = $0.03/month
Uploads:  1000 × $4.50/1M = $0.0045
Reads:    100K × $0.36/1M = $0.036
Egress:   FREE (via bookingengine.com)
─────────────────────────────────────────
Total:    ~$0.07/month
```

---

## Quick Reference

### Custom Domain URL
```
https://bookingengine.com/{key}
```

### Upload Command
```powershell
npx wrangler r2 object put imageroom/{key} --file={path}
```

### List Files
```powershell
npx wrangler r2 object list imageroom --prefix={folder}/
```

### Delete File
```powershell
npx wrangler r2 object delete imageroom/{key}
```

### Configuration Files
- Frontend: `src/config/r2.ts`
- Worker: `src/workers/index.ts` (handleImages)
- Components: Use `getImageUrl()` helper

---

## Migration Checklist

- [x] R2 bucket created (`imageroom`)
- [x] Custom domain connected (`bookingengine.com`)
- [x] Worker configured with custom domain URL
- [x] Frontend configured with `getImageUrl` helper
- [x] Components updated to use R2 URLs
- [ ] Upload logo.png to R2
- [ ] Upload hero images to R2
- [ ] Test image loading on homepage
- [ ] Verify URLs in browser DevTools
- [ ] Update database image paths

---

## Support Resources

- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Custom Domain Setup**: https://developers.cloudflare.com/r2/buckets/public-buckets/
- **Wrangler R2 Commands**: https://developers.cloudflare.com/workers/wrangler/commands/#r2

---

**Last Updated**: January 9, 2026
**Configuration**: Production
**Status**: ✅ Active and configured
