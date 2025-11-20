# 🎯 AMENITIES ADMIN INTERFACE SPECIFICATION
**Villa Daisy Cantik - Admin Dashboard Enhancement**

---

## 📋 **OVERVIEW**

The amenities system database and API are complete. Now we need to add an **Amenities Management** section to the admin dashboard for full CRUD operations on the normalized amenities system.

---

## 🏗️ **DATABASE FOUNDATION (COMPLETED ✅)**

### **Tables Available:**
```sql
amenities (26 records)          - Master amenity catalog
room_amenities (4 mappings)     - Room-specific amenity assignments  
package_amenities (4 mappings)  - Package perk assignments
```

### **API Endpoints Available:**
```javascript
// Nov 19 2025 UPDATE: Base GET endpoint no longer requires ?endpoint parameter
GET    amenities.php                              // List all amenities (default endpoint)
GET    amenities.php/room-amenities               // Room-amenity mappings
GET    amenities.php/package-amenities            // Package-amenity mappings  
GET    amenities.php/sales-tool/1                 // Combined sales presentation
// Mutations (query param still accepted for clarity while method branching not yet added)
POST   amenities.php?endpoint=amenities           // Create amenity (needs implementation)
PUT    amenities.php?endpoint=amenities           // Update amenity (needs implementation)
DELETE amenities.php?endpoint=amenities           // Delete amenity (needs implementation)
```

---

## 🎨 **ADMIN DASHBOARD UI REQUIREMENTS**

### **New Section: "Amenities Management"**
Add as 4th section in admin dashboard after:
1. Business Details ✅
2. Villa Info ✅  
3. **→ Amenities Management** *(NEW)*
4. Gallery Management
5. Analytics & Reports

---

## 📦 **SECTION 1: AMENITY CATALOG MANAGER**

### **UI Layout:**
```html
<div class="amenities-section">
    <h2>🎯 Amenities Management</h2>
    
    <!-- Amenity List Table -->
    <div class="amenity-list">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Featured</th>
                    <th>Active</th>
                    <th>Rooms</th>
                    <th>Packages</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="amenities-table-body">
                <!-- Populated via API -->
            </tbody>
        </table>
    </div>
    
    <!-- Add New Amenity Form -->
    <div class="add-amenity-form">
        <h3>Add New Amenity</h3>
        <form id="amenity-form">
            <input type="text" name="name" placeholder="Amenity Name" required>
            <select name="category" required>
                <option value="connectivity">Connectivity</option>
                <option value="comfort">Comfort</option>
                <option value="entertainment">Entertainment</option>
                <!-- All 13 categories -->
            </select>
            <input type="text" name="icon" placeholder="Icon Name">
            <textarea name="description" placeholder="Description"></textarea>
            <input type="number" name="display_order" placeholder="Display Order">
            <label><input type="checkbox" name="is_featured"> Featured</label>
            <label><input type="checkbox" name="is_active" checked> Active</label>
            <button type="submit">Add Amenity</button>
        </form>
    </div>
</div>
```

### **JavaScript Functions Needed:**
```javascript
// Load amenities from API
async function loadAmenities() {
    const response = await fetch(getApiUrl('amenities.php'));
    const data = await response.json();
    renderAmenitiesTable(data.amenities);
}

// Create new amenity
async function createAmenity(amenityData) {
    const response = await fetch(getApiUrl('amenities.php?endpoint=amenities'), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(amenityData)
    });
    return response.json();
}

// Update existing amenity
async function updateAmenity(id, amenityData) {
    const response = await fetch(getApiUrl(`amenities.php?endpoint=amenities&id=${id}`), {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(amenityData)
    });
    return response.json();
}

// Delete amenity
async function deleteAmenity(id) {
    const response = await fetch(getApiUrl(`amenities.php?endpoint=amenities&id=${id}`), {
        method: 'DELETE'
    });
    return response.json();
}
```

---

## 🏨 **SECTION 2: ROOM-AMENITY ASSIGNMENTS**

### **UI Layout:**
```html
<div class="room-amenity-assignments">
    <h3>🏨 Room-Amenity Assignments</h3>
    
    <div class="room-tabs">
        <button class="room-tab active" data-room="deluxe-suite">Deluxe Suite</button>
        <button class="room-tab" data-room="master-suite">Master Suite</button>
        <button class="room-tab" data-room="family-room">Family Room</button>
        <button class="room-tab" data-room="standard-room">Standard Room</button>
        <button class="room-tab" data-room="economy-room">Economy Room</button>
    </div>
    
    <div class="amenity-checkboxes" id="room-amenities">
        <!-- Dynamically populated checkboxes for each amenity -->
        <div class="amenity-checkbox">
            <label>
                <input type="checkbox" data-amenity-id="1" data-room-id="deluxe-suite">
                <span class="amenity-icon">📶</span>
                Free WiFi
            </label>
        </div>
        <!-- Repeat for all 26 amenities -->
    </div>
    
    <button id="save-room-amenities">Save Room Amenities</button>
</div>
```

### **JavaScript Functions:**
```javascript
// Load room-amenity mappings
async function loadRoomAmenities(roomId) {
    const response = await fetch(getApiUrl(`amenities.php?endpoint=room-amenities&room_id=${roomId}`));
    const data = await response.json();
    updateRoomAmenityCheckboxes(data.mappings);
}

// Save room-amenity assignments
async function saveRoomAmenities(roomId, amenityIds) {
    const response = await fetch(getApiUrl('amenities.php?endpoint=room-amenities'), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            room_id: roomId,
            amenity_ids: amenityIds
        })
    });
    return response.json();
}
```

---

## 📦 **SECTION 3: PACKAGE-PERK ASSIGNMENTS**

### **UI Layout:**
```html
<div class="package-perk-assignments">
    <h3>📦 Package Perk Assignments</h3>
    
    <div class="package-tabs">
        <button class="package-tab active" data-package="1">Romantic Getaway</button>
        <button class="package-tab" data-package="2">Adventure Explorer</button>
        <button class="package-tab" data-package="3">Wellness Retreat</button>
        <button class="package-tab" data-package="4">Cultural Heritage</button>
        <button class="package-tab" data-package="5">Family Fun</button>
    </div>
    
    <div class="perk-checkboxes" id="package-perks">
        <!-- Similar to room amenities but for package perks -->
    </div>
    
    <button id="save-package-perks">Save Package Perks</button>
</div>
```

---

## 🔍 **SECTION 4: SALES TOOL PREVIEW**

### **UI Layout:**
```html
<div class="sales-tool-preview">
    <h3>🔍 Sales Tool Preview</h3>
    
    <div class="preview-controls">
        <select id="preview-package">
            <option value="1">Romantic Getaway</option>
            <option value="2">Adventure Explorer</option>
            <!-- All packages -->
        </select>
        
        <select id="preview-room">
            <option value="">No specific room</option>
            <option value="deluxe-suite">Deluxe Suite</option>
            <!-- All rooms -->
        </select>
        
        <button id="generate-preview">Generate Preview</button>
    </div>
    
    <div class="preview-output" id="sales-preview">
        <!-- API response preview -->
        <div class="preview-json">
            <pre id="preview-json-content"></pre>
        </div>
        
        <div class="preview-visual">
            <h4>Package Perks:</h4>
            <ul id="preview-perks"></ul>
            
            <h4>Room Features:</h4>
            <ul id="preview-features"></ul>
        </div>
    </div>
</div>
```

### **JavaScript Function:**
```javascript
// Generate sales tool preview
async function generateSalesPreview(packageId, roomId = null) {
    const url = roomId 
        ? getApiUrl(`amenities.php/sales-tool/${packageId}?room_id=${roomId}`)
        : getApiUrl(`amenities.php/sales-tool/${packageId}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Display JSON
    document.getElementById('preview-json-content').textContent = JSON.stringify(data, null, 2);
    
    // Display visual preview
    renderSalesPreview(data.sales_tool);
}
```

---

## 🚀 **IMPLEMENTATION PRIORITY**

### **Phase 1: Basic Amenity CRUD** *(Immediate)*
1. Add amenities section to admin dashboard
2. Implement amenity list table with API data
3. Add form for creating new amenities
4. Implement edit/delete functionality

### **Phase 2: Room-Amenity Management** *(Next)*
1. Add room-amenity assignment interface
2. Load existing mappings from database
3. Save/update room-amenity relationships

### **Phase 3: Package-Perk Management** *(Then)*
1. Add package-perk assignment interface
2. Load existing perk mappings
3. Save/update package-perk relationships

### **Phase 4: Sales Tool Preview** *(Final)*
1. Add preview functionality
2. Visual representation of combined data
3. JSON output for debugging

---

## 🔧 **API ENHANCEMENTS NEEDED**

The following endpoints need to be added to `amenities.php`:

```php
// Add to switch statement in amenities.php
case 'create-amenity':
    handleCreateAmenity($pdo, $_POST);
    break;
    
case 'update-amenity':
    handleUpdateAmenity($pdo, $_POST);
    break;
    
case 'delete-amenity':
    handleDeleteAmenity($pdo, $_POST);
    break;
    
case 'save-room-amenities':
    handleSaveRoomAmenities($pdo, $_POST);
    break;
    
case 'save-package-amenities':
    handleSavePackageAmenities($pdo, $_POST);
    break;
```

---

## 🎯 **EXPECTED OUTCOME**

After implementation, the admin dashboard will have:

✅ **Complete amenities catalog management**  
✅ **Room-specific amenity assignments**  
✅ **Package-specific perk assignments**  
✅ **Sales tool preview functionality**  
✅ **Real-time database synchronization**  

This will provide full control over the amenities system through a user-friendly interface, eliminating the need for direct database manipulation.