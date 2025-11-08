# Image Resources Directory

This directory contains all image resources for the booking engine application.

## Directory Structure

```
public/images/
├── rooms/              # Room-specific images
│   ├── deluxe-suite/
│   │   ├── main.jpg           # Primary room image
│   │   ├── thumbnail.jpg      # Small preview image
│   │   ├── gallery-1.jpg      # Gallery image 1
│   │   ├── gallery-2.jpg      # Gallery image 2  
│   │   ├── gallery-3.jpg      # Gallery image 3
│   │   └── gallery-4.jpg      # Gallery image 4
│   ├── standard-room/
│   ├── family-room/
│   ├── master-suite/
│   └── economy-room/
│
├── amenities/          # Amenity icons (SVG format)
│   ├── wifi.svg
│   ├── tv.svg
│   ├── balcony.svg
│   ├── air-conditioning.svg
│   ├── minibar.svg
│   ├── breakfast.svg
│   ├── parking.svg
│   ├── gym.svg
│   ├── pool.svg
│   └── spa.svg
│
├── gallery/            # Hotel gallery images
│   ├── hotel/          # Hotel exterior/lobby
│   ├── facilities/     # Common facilities
│   └── dining/         # Restaurant/dining areas
│
└── ui/                 # UI elements
    ├── logo.png        # Main logo
    ├── logo-small.png  # Small logo for mobile
    ├── placeholder.jpg # Default placeholder
    └── no-image.svg    # No image available icon

```

## Image Guidelines

### Room Images
- **Main Image**: 1200x800px (3:2 ratio) - Primary room photo
- **Thumbnail**: 300x200px (3:2 ratio) - For listings/cards
- **Gallery Images**: 1200x800px (3:2 ratio) - Additional room photos

### Amenity Icons
- **Format**: SVG (scalable vector graphics)
- **Size**: 24x24px base size
- **Style**: Simple, monochrome icons
- **Colors**: Should work with CSS styling

### Gallery Images
- **Format**: JPG/PNG
- **Size**: 1920x1080px (16:9 ratio) for hero images
- **Size**: 800x600px (4:3 ratio) for thumbnails

### UI Elements
- **Logo**: PNG with transparent background
- **Sizes**: Multiple sizes (logo.png, logo-small.png)

## Usage in Code

```typescript
import { imagePaths, getRoomImages, getAmenityIcon } from '@/config/images';

// Get room images
const roomImages = getRoomImages('deluxe-suite');
console.log(roomImages.main); // '/images/rooms/deluxe-suite/main.jpg'

// Get amenity icon
const wifiIcon = getAmenityIcon('WiFi');
console.log(wifiIcon); // '/images/amenities/wifi.svg'

// Direct path access
const logo = imagePaths.ui.logo;
console.log(logo); // '/images/ui/logo.png'
```

## File Naming Convention

- Use lowercase with hyphens: `deluxe-suite`, `air-conditioning`
- Be descriptive: `gallery-1.jpg`, `main.jpg`, `thumbnail.jpg`
- Use consistent extensions: `.jpg` for photos, `.svg` for icons

## Optimization Tips

1. **Compress Images**: Use tools like TinyPNG for JPG/PNG files
2. **WebP Format**: Consider WebP for better compression
3. **Lazy Loading**: Images will be lazy-loaded by default
4. **Multiple Sizes**: Create responsive image sizes when needed

## Adding New Images

1. Create room folder in `/public/images/rooms/[room-id]/`
2. Add required images (main.jpg, thumbnail.jpg, gallery-*.jpg)
3. Update room data to reference the new room ID
4. Test image loading in the application

## API Integration

Room images are automatically linked through the room ID. When you add a room with ID `ocean-view`, create:
- `/public/images/rooms/ocean-view/main.jpg`
- `/public/images/rooms/ocean-view/thumbnail.jpg`
- `/public/images/rooms/ocean-view/gallery-1.jpg` (etc.)

The frontend will automatically load these images using the `getRoomImages()` function.