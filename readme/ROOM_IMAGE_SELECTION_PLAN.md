# Room Image Selection System - Implementation Plan

## 🎯 **Project Goal**
Create an integrated image selection system that allows users to assign images to rooms using the existing image gallery infrastructure.

---

## 📋 **User Flow Specification**

### **Step-by-Step Process**
1. **Room Management View** → User sees room cards/list with "Image" buttons
2. **Click "Image" Button** → Opens image gallery modal popup
3. **Folder Selection** → User chooses from available image folders (hero, packages, amenities, ui, uploads)
4. **Image Browsing** → User scrolls through images in selected folder(s)
5. **Image Selection** → User clicks on desired image (highlights with selection indicator)
6. **Confirmation** → User clicks "Use This Image" button
7. **Assignment** → Image is assigned to room, modal closes, room card updates with new image

---

## 🏗️ **Technical Implementation Plan**

### **Phase 1: Frontend Components (Week 1)**

#### **1.1 Room Image Button Component**
```typescript
// src/components/RoomImageButton.tsx
interface RoomImageButtonProps {
  roomId: string;
  currentImage?: string;
  onImageSelected: (imagePath: string) => void;
}
```

**Features:**
- Camera icon button with hotel theme styling
- Shows current room image as thumbnail (if exists)
- Opens image selector modal on click
- Integrates with existing room cards/lists

#### **1.2 Image Gallery Modal Component**
```typescript
// src/components/ImageGalleryModal.tsx  
interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imagePath: string, imageData: any) => void;
  selectedRoomId: string;
}
```

**Features:**
- Popup modal with image gallery embedded
- Same folder structure as main gallery (hero, packages, amenities, ui, uploads)
- Same PHP scanner integration for real images
- "Use This Image" button on image hover/selection
- Mobile-responsive design

#### **1.3 Room Card Enhancement**
```typescript
// Update existing room components
- Add image display area
- Integrate RoomImageButton
- Show selected image immediately after assignment
- Fallback placeholder for rooms without images
```

### **Phase 2: Backend API Development (Week 1-2)**

#### **2.1 Room Images API Endpoint**
```php
// api/room-images.php
/**
 * Room Image Management API
 * 
 * GET /room-images.php?room_id=123 - Get room's current image
 * POST /room-images.php - Assign image to room
 * PUT /room-images.php?room_id=123 - Update room image
 * DELETE /room-images.php?room_id=123 - Remove room image
 */
```

**API Methods:**
```php
// POST: Assign image to room
{
    "room_id": "123",
    "image_path": "packages/romantic-escape.jpg",
    "image_folder": "packages",
    "selected_by": "admin_user_id"
}

// Response
{
    "success": true,
    "message": "Image assigned successfully",
    "room_id": "123",
    "image_url": "https://domain.com/public/images/packages/romantic-escape.jpg"
}
```

#### **2.2 Rooms API Extension**
```php
// Update api/rooms.php
- Include room_image in GET responses
- Add image validation in POST/PUT operations
- Handle image removal when room is deleted
```

#### **2.3 Image Gallery API Integration**
```php
// Extend sandbox/image-scanner.php for room selection
- Add metadata about image usage (which rooms use this image)
- Provide image selection endpoint
- Return image full URLs for frontend use
```

### **Phase 3: Database Schema Updates (Week 2)**

#### **3.1 Room Images Table Schema**
```sql
-- database/room-images-schema.sql
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_image VARCHAR(500) NULL 
    COMMENT 'Relative path to room image (e.g., packages/romantic-escape.jpg)';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_folder VARCHAR(100) NULL 
    COMMENT 'Source folder for the image (hero, packages, amenities, ui, uploads)';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_selected_at TIMESTAMP NULL 
    COMMENT 'When the image was assigned to this room';

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_selected_by VARCHAR(100) NULL 
    COMMENT 'User ID who assigned the image';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_rooms_image ON rooms(room_image);
CREATE INDEX IF NOT EXISTS idx_rooms_folder ON rooms(image_folder);
```

#### **3.2 Image Usage Tracking (Optional)**
```sql
-- Track which images are used by which rooms
CREATE TABLE IF NOT EXISTS room_image_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    image_folder VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    INDEX idx_usage_room (room_id),
    INDEX idx_usage_image (image_path)
);
```

### **Phase 4: UI/UX Integration (Week 2)**

#### **4.1 Room Management Interface Updates**

**Admin Dashboard Integration:**
```typescript
// src/components/admin/RoomCard.tsx
<div className="room-card">
    <div className="room-image-section">
        {roomImage ? (
            <img src={roomImage} alt={roomName} className="room-thumbnail" />
        ) : (
            <div className="image-placeholder">No Image</div>
        )}
        <RoomImageButton 
            roomId={room.id}
            currentImage={room.room_image}
            onImageSelected={handleImageAssignment}
        />
    </div>
    <div className="room-details">
        {/* existing room info */}
    </div>
</div>
```

**Package Details Integration:**
```typescript
// src/pages/PackageDetails.tsx - Room selection area
<div className="room-option">
    <div className="room-image">
        <img src={getRoomImageUrl(room)} alt={room.name} />
    </div>
    <div className="room-info">
        {/* existing room details */}
    </div>
</div>
```

#### **4.2 Modal Design & Styling**

**Modal Structure:**
```html
<div className="image-selector-modal">
    <div className="modal-header">
        <h3>Select Image for {roomName}</h3>
        <button className="close-btn">×</button>
    </div>
    
    <div className="folder-selector">
        <!-- Same as main gallery -->
    </div>
    
    <div className="image-grid">
        <div className="image-card selectable">
            <img src="..." />
            <div className="image-overlay">
                <button className="use-image-btn">Use This Image</button>
            </div>
        </div>
    </div>
    
    <div className="modal-footer">
        <button className="cancel-btn">Cancel</button>
    </div>
</div>
```

**Styling (Hotel Theme):**
```css
.image-selector-modal {
    background: #F5F2E8; /* hotel-cream */
    border: 2px solid #E6A500; /* hotel-gold */
}

.use-image-btn {
    background: #E6A500; /* hotel-gold */
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: bold;
}

.use-image-btn:hover {
    background: #2F3A4F; /* hotel-navy */
}
```

---

## 🔧 **Implementation Steps**

### **Week 1: Core Components**
1. **Day 1-2**: Create RoomImageButton component
2. **Day 3-4**: Build ImageGalleryModal component  
3. **Day 5**: Create room-images.php API
4. **Day 6-7**: Database schema updates and testing

### **Week 2: Integration & Polish**
1. **Day 1-2**: Integrate components with existing room management
2. **Day 3-4**: Update PackageDetails.tsx to show room images
3. **Day 5**: Mobile responsive design and testing
4. **Day 6-7**: Error handling, edge cases, and documentation

---

## 📊 **Configuration & Settings**

### **Image Path Configuration**
```javascript
// src/config/images.ts
export const IMAGE_CONFIG = {
    baseImagePath: '/public/images',
    allowedFolders: ['hero', 'packages', 'amenities', 'ui', 'uploads'],
    roomImageMaxWidth: 400,
    roomImageMaxHeight: 300,
    thumbnailSize: 150,
    
    // Integration with existing gallery
    useGalleryScanner: true,
    fallbackToMockImages: true
};
```

### **Room Image Service**
```typescript
// src/services/roomImageService.ts
export class RoomImageService {
    static async assignImageToRoom(roomId: string, imagePath: string) {
        // API call to room-images.php
    }
    
    static async getRoomImage(roomId: string) {
        // Get room's current image
    }
    
    static async removeRoomImage(roomId: string) {
        // Remove image assignment
    }
    
    static getRoomImageUrl(room: Room) {
        // Generate full image URL for display
        if (room.room_image) {
            return `${CONFIG.baseImagePath}/${room.room_image}`;
        }
        return '/images/room-placeholder.svg';
    }
}
```

---

## 🎯 **Success Criteria**

### **Functional Requirements**
- ✅ User can click "Image" button on any room
- ✅ Gallery modal opens with folder selection
- ✅ User can browse and select images from any folder
- ✅ "Use This Image" assigns image to room immediately
- ✅ Room displays selected image in all relevant views
- ✅ System works with both real images (PHP) and fallback mode

### **Technical Requirements**
- ✅ Integration with existing image gallery system
- ✅ Hotel theme consistency throughout UI
- ✅ Mobile-responsive design
- ✅ API endpoints for room image management
- ✅ Database schema properly handles image assignments
- ✅ Error handling for missing images and failed assignments

### **Performance Requirements**
- ✅ Modal opens in < 1 second
- ✅ Image loading uses lazy loading
- ✅ No impact on existing room management performance
- ✅ Gallery scanner performance maintained

---

## 🚀 **Deployment Checklist**

### **Frontend Deployment**
- [ ] Build and test all new components
- [ ] Verify mobile responsiveness
- [ ] Test with both real and mock images
- [ ] Ensure hotel theme consistency

### **Backend Deployment** 
- [ ] Upload room-images.php to api.rumahdaisycantik.com
- [ ] Run database schema updates on production
- [ ] Test API endpoints on live server
- [ ] Verify image path resolution

### **Integration Testing**
- [ ] Test complete user flow end-to-end
- [ ] Verify image assignments persist correctly
- [ ] Test error scenarios (missing images, network failures)
- [ ] Confirm package details show room images properly

---

## 📚 **Documentation Updates**

After implementation, update:
1. **WORKFLOW_DOCUMENTATION.md** - Add room image system documentation
2. **API_DOCUMENTATION.md** - Document room-images.php endpoints
3. **DATABASE_ENHANCED_STATUS.md** - Update with new schema
4. **IMAGE_GALLERY_DOCUMENTATION.md** - Add room integration notes

---

**Implementation Timeline**: 2 weeks  
**Complexity Level**: Moderate  
**Dependencies**: Existing image gallery system, room management API  
**Risk Level**: Low (builds on existing proven systems)