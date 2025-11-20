# 🎯 AMENITIES INTERFACE IMPLEMENTATION GUIDE
**Villa Daisy Cantik - Complete Admin Interface Documentation**

---

## 📋 **PROJECT OVERVIEW**

**Objective**: Create a comprehensive amenities management interface for the admin dashboard to manage the normalized amenities system (26 amenities, 16 categories, room/package mappings).

**Status**: Database ✅ | API ✅ | Admin UI ❌ (To be implemented)

---

## 🏗️ **TECHNICAL FOUNDATION**

### **Database Schema (Completed)**
```sql
-- Master amenities catalog
amenities (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50), 
    description TEXT,
    icon VARCHAR(50),
    display_order INT,
    is_featured BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Room-amenity relationships
room_amenities (
    id INT PRIMARY KEY,
    room_id VARCHAR(50),
    amenity_id INT,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id)
)

-- Package-amenity relationships (perks)
package_amenities (
    id INT PRIMARY KEY,
    package_id INT,
    amenity_id INT,
    is_highlighted BOOLEAN,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
)
```

### **API Endpoints (Current & Planned)**
```text
BASE SCRIPT: /api/amenities.php

GET    /api/amenities.php                                       -> List all active amenities (default endpoint, category/featured filters still supported via query params)
GET    /api/amenities.php/room-amenities/{room_id}              -> Amenities for a specific room
GET    /api/amenities.php/package-amenities/{package_id}        -> Perks (amenities) for a specific package
GET    /api/amenities.php/sales-tool/{package_id}?room_id=RID   -> Combined sales tool presentation

PLANNED METHOD BRANCHING (same endpoint names, no new strings):
POST   /api/amenities.php?endpoint=amenities                    -> Create amenity (body JSON)
PUT    /api/amenities.php?endpoint=amenities&id={id}            -> Update amenity fields
DELETE /api/amenities.php?endpoint=amenities&id={id}            -> Soft/Hard delete (decide strategy)
POST   /api/amenities.php?endpoint=room-amenities               -> Replace room's amenity set (room_id + amenity_ids[])
POST   /api/amenities.php?endpoint=package-amenities            -> Replace package's perk set (package_id + amenity_ids[] + is_highlighted[])

NOTE: Current PHP switch only distinguishes by endpoint string; add HTTP method branching inside handleAmenities/handleRoomAmenities/handlePackageAmenities instead of introducing new endpoint names like "create-amenity".

Sample cURL (local XAMPP):
curl -X GET  "http://localhost/.../api/amenities.php"
curl -X POST "http://localhost/.../api/amenities.php?endpoint=amenities" \
    -H "Content-Type: application/json" \
    -d '{"name":"Fire Pit","category":"outdoor","icon":"grill","description":"Outdoor fire feature","display_order":27,"is_featured":false,"is_active":true}'
curl -X PUT  "http://localhost/.../api/amenities.php?endpoint=amenities&id=27" \
    -H "Content-Type: application/json" -d '{"is_featured":true}'
curl -X POST "http://localhost/.../api/amenities.php?endpoint=room-amenities" \
    -H "Content-Type: application/json" -d '{"room_id":"deluxe-suite","amenity_ids":[1,2,3]}'
```

---

## 🎨 **USER INTERFACE DESIGN**

### **Section Integration**
Add to admin-dashboard.html after existing sections:
```html
<!-- Existing sections -->
<div class="admin-section" id="business-details">...</div>
<div class="admin-section" id="villa-info">...</div>

<!-- NEW: Amenities Management Section -->
<div class="admin-section" id="amenities-management" style="display: none;">
    <!-- Implementation goes here -->
</div>

<!-- Navigation update -->
<nav class="admin-nav">
    <button onclick="showSection('business-details')">Business Details</button>
    <button onclick="showSection('villa-info')">Villa Info</button>
    <button onclick="showSection('amenities-management')">Amenities</button> <!-- NEW -->
</nav>
```

---

## 📦 **COMPONENT 1: AMENITIES CATALOG MANAGER**

### **HTML Structure**
```html
<div class="amenities-catalog">
    <div class="section-header">
        <h2>🎯 Amenities Catalog</h2>
        <p>Manage your property's amenities and features</p>
    </div>
    
    <!-- Statistics Cards -->
    <div class="amenities-stats">
        <div class="stat-card">
            <div class="stat-number" id="total-amenities">26</div>
            <div class="stat-label">Total Amenities</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="featured-amenities">13</div>
            <div class="stat-label">Featured</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="active-amenities">26</div>
            <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
            <div class="stat-number" id="categories-count">16</div>
            <div class="stat-label">Categories</div>
        </div>
    </div>
    
    <!-- Filter and Search -->
    <div class="amenities-controls">
        <div class="control-group">
            <label>Filter by Category:</label>
            <select id="category-filter">
                <option value="">All Categories</option>
                <option value="connectivity">Connectivity</option>
                <option value="comfort">Comfort</option>
                <option value="entertainment">Entertainment</option>
                <option value="bathroom">Bathroom</option>
                <option value="appliances">Appliances</option>
                <option value="security">Security</option>
                <option value="outdoor">Outdoor</option>
                <option value="view">View</option>
                <option value="transport">Transport</option>
                <option value="service">Service</option>
                <option value="hospitality">Hospitality</option>
                <option value="dining">Dining</option>
                <option value="wellness">Wellness</option>
                <option value="recreation">Recreation</option>
                <option value="location">Location</option>
                <option value="activities">Activities</option>
            </select>
        </div>
        
        <div class="control-group">
            <label>Search Amenities:</label>
            <input type="text" id="amenity-search" placeholder="Search by name or description...">
        </div>
        
        <div class="control-group">
            <button class="btn-primary" id="add-amenity-btn">+ Add New Amenity</button>
        </div>
    </div>
    
    <!-- Amenities Table -->
    <div class="amenities-table-container">
        <table class="admin-table" id="amenities-table">
            <thead>
                <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Used In</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="amenities-table-body">
                <!-- Populated via JavaScript -->
            </tbody>
        </table>
    </div>
</div>
```

### **CSS Styling**
```css
.amenities-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 25px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.stat-number {
    font-size: 2.5em;
    font-weight: bold;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 0.9em;
    opacity: 0.9;
}

.amenities-controls {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 20px;
    margin-bottom: 25px;
    align-items: end;
}

.control-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.control-group input,
.control-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
}

.amenities-table-container {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
}

.admin-table th {
    background: #f8f9fa;
    padding: 15px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
}

.admin-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #dee2e6;
    vertical-align: middle;
}

.amenity-icon {
    font-size: 1.5em;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 50%;
    margin: 0 auto;
}

.amenity-category {
    display: inline-block;
    padding: 4px 8px;
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: 500;
}

.amenity-status {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 0.8em;
    font-weight: 500;
}

.status-active {
    background: #d4edda;
    color: #155724;
}

.status-inactive {
    background: #f8d7da;
    color: #721c24;
}

.featured-badge {
    background: #fff3cd;
    color: #856404;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.7em;
    font-weight: bold;
}

.usage-tags {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
}

.usage-tag {
    background: #e7f3ff;
    color: #0066cc;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.75em;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn-edit {
    background: #28a745;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85em;
}

.btn-delete {
    background: #dc3545;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85em;
}

.btn-edit:hover {
    background: #218838;
}

.btn-delete:hover {
    background: #c82333;
}
```

### **JavaScript Implementation**
```javascript
// Global variables
let allAmenities = [];
let filteredAmenities = [];

// Initialize amenities management
async function initAmenitiesManagement() {
    try {
        await loadAmenities();
        updateAmenitiesStats();
        renderAmenitiesTable();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize amenities management:', error);
        showNotification('Failed to load amenities data', 'error');
    }
}

// Load amenities from API
async function loadAmenities() {
    // Prefer building query string outside getApiUrl to keep helper focused on path resolution
    const response = await fetch(getApiUrl('amenities.php') + '?endpoint=amenities');
    if (!response.ok) throw new Error('Failed to load amenities');
    
    const data = await response.json();
    allAmenities = data.amenities || [];
    filteredAmenities = [...allAmenities];
    
    return allAmenities;
}

// Update statistics cards
function updateAmenitiesStats() {
    const totalCount = allAmenities.length;
    const featuredCount = allAmenities.filter(a => a.is_featured).length;
    const activeCount = allAmenities.filter(a => a.is_active).length;
    const categoriesCount = new Set(allAmenities.map(a => a.category)).size;
    
    document.getElementById('total-amenities').textContent = totalCount;
    document.getElementById('featured-amenities').textContent = featuredCount;
    document.getElementById('active-amenities').textContent = activeCount;
    document.getElementById('categories-count').textContent = categoriesCount;
}

// Render amenities table
function renderAmenitiesTable() {
    const tbody = document.getElementById('amenities-table-body');
    
    if (filteredAmenities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #666;">
                    No amenities found matching your criteria
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredAmenities.map(amenity => `
        <tr>
            <td>
                <div class="amenity-icon" title="${amenity.icon}">
                    ${getIconDisplay(amenity.icon)}
                </div>
            </td>
            <td>
                <strong>${amenity.name}</strong>
                ${amenity.is_featured ? '<span class="featured-badge">FEATURED</span>' : ''}
            </td>
            <td>
                <span class="amenity-category">${amenity.category}</span>
            </td>
            <td>
                <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${amenity.description}">
                    ${amenity.description || 'No description'}
                </div>
            </td>
            <td>${amenity.display_order}</td>
            <td>
                <input type="checkbox" ${amenity.is_featured ? 'checked' : ''} 
                       onchange="toggleFeatured(${amenity.id}, this.checked)">
            </td>
            <td>
                <span class="amenity-status ${amenity.is_active ? 'status-active' : 'status-inactive'}">
                    ${amenity.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="usage-tags" id="usage-${amenity.id}">
                    <!-- Will be populated with room/package usage -->
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editAmenity(${amenity.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteAmenity(${amenity.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Load usage data for each amenity
    loadAmenityUsage();
}

// Get icon display (you can enhance this with actual icons)
function getIconDisplay(iconName) {
    const iconMap = {
        'wifi': '📶',
        'snowflake': '❄️',
        'bath': '🛁',
        'tv': '📺',
        'refrigerator': '🧊',
        'coffee': '☕',
        'lock': '🔒',
        'balcony': '🏠',
        'waves': '🌊',
        'tree': '🌳',
        'car': '🚗',
        'broom': '🧹',
        'bell': '🔔',
        'cocktail': '🍹',
        'utensils': '🍽️',
        'spa': '💆',
        'yoga': '🧘',
        'map': '🗺️',
        'chef': '👨‍🍳',
        'clock': '⏰',
        'swimming': '🏊',
        'grill': '🔥',
        'garden': '🌿',
        'parking': '🅿️',
        'beach': '🏖️',
        'dumbbell': '🏋️'
    };
    
    return iconMap[iconName] || '🔹';
}

// Load amenity usage data
async function loadAmenityUsage() {
    try {
        // Load room-amenity mappings
    const roomResponse = await fetch(getApiUrl('amenities.php') + '?endpoint=room-amenities');
        const roomData = await roomResponse.json();
        
        // Load package-amenity mappings
    const packageResponse = await fetch(getApiUrl('amenities.php') + '?endpoint=package-amenities');
        const packageData = await packageResponse.json();
        
        // Process and display usage
        const usageMap = {};
        
        // Process room usage
        if (roomData.success && roomData.mappings) {
            roomData.mappings.forEach(mapping => {
                if (!usageMap[mapping.amenity_id]) usageMap[mapping.amenity_id] = [];
                usageMap[mapping.amenity_id].push(`Room: ${mapping.room_id}`);
            });
        }
        
        // Process package usage
        if (packageData.success && packageData.mappings) {
            packageData.mappings.forEach(mapping => {
                if (!usageMap[mapping.amenity_id]) usageMap[mapping.amenity_id] = [];
                usageMap[mapping.amenity_id].push(`Package: ${mapping.package_id}`);
            });
        }
        
        // Update UI
        Object.keys(usageMap).forEach(amenityId => {
            const usageElement = document.getElementById(`usage-${amenityId}`);
            if (usageElement) {
                usageElement.innerHTML = usageMap[amenityId]
                    .map(usage => `<span class="usage-tag">${usage}</span>`)
                    .join('');
            }
        });
        
    } catch (error) {
        console.error('Failed to load amenity usage:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category filter
    document.getElementById('category-filter').addEventListener('change', filterAmenities);
    
    // Search
    document.getElementById('amenity-search').addEventListener('input', filterAmenities);
    
    // Add new amenity button
    document.getElementById('add-amenity-btn').addEventListener('click', showAddAmenityModal);
}

// Filter amenities based on category and search
function filterAmenities() {
    const categoryFilter = document.getElementById('category-filter').value;
    const searchTerm = document.getElementById('amenity-search').value.toLowerCase();
    
    filteredAmenities = allAmenities.filter(amenity => {
        const matchesCategory = !categoryFilter || amenity.category === categoryFilter;
        const matchesSearch = !searchTerm || 
            amenity.name.toLowerCase().includes(searchTerm) ||
            amenity.description.toLowerCase().includes(searchTerm);
        
        return matchesCategory && matchesSearch;
    });
    
    renderAmenitiesTable();
}

// Toggle featured status
async function toggleFeatured(amenityId, isFeatured) {
    try {
    const response = await fetch(getApiUrl('amenities.php') + `?endpoint=amenities&id=${amenityId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({is_featured: isFeatured})
        });
        
        if (response.ok) {
            // Update local data
            const amenity = allAmenities.find(a => a.id === amenityId);
            if (amenity) amenity.is_featured = isFeatured;
            
            updateAmenitiesStats();
            showNotification('Featured status updated successfully', 'success');
        } else {
            throw new Error('Failed to update featured status');
        }
    } catch (error) {
        console.error('Error updating featured status:', error);
        showNotification('Failed to update featured status', 'error');
        // Revert checkbox
        event.target.checked = !isFeatured;
    }
}

// Edit amenity
function editAmenity(amenityId) {
    const amenity = allAmenities.find(a => a.id === amenityId);
    if (amenity) {
        showEditAmenityModal(amenity);
    }
}

// Delete amenity
async function deleteAmenity(amenityId) {
    if (!confirm('Are you sure you want to delete this amenity? This action cannot be undone.')) {
        return;
    }
    
    try {
    const response = await fetch(getApiUrl('amenities.php') + `?endpoint=amenities&id=${amenityId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove from local data
            allAmenities = allAmenities.filter(a => a.id !== amenityId);
            filterAmenities();
            updateAmenitiesStats();
            showNotification('Amenity deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete amenity');
        }
    } catch (error) {
        console.error('Error deleting amenity:', error);
        showNotification('Failed to delete amenity', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Implementation depends on your notification system
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
```

---

## 🏨 **COMPONENT 2: ROOM-AMENITY ASSIGNMENTS**

### **HTML Structure**
```html
<div class="room-amenity-manager">
    <div class="section-header">
        <h2>🏨 Room-Amenity Assignments</h2>
        <p>Assign amenities to specific room types</p>
    </div>
    
    <!-- Room Selector -->
    <div class="room-selector">
        <div class="room-tabs">
            <button class="room-tab active" data-room="deluxe-suite">
                <div class="room-tab-content">
                    <div class="room-name">Deluxe Suite</div>
                    <div class="room-price">$250/night</div>
                    <div class="room-amenity-count">4 amenities</div>
                </div>
            </button>
            <button class="room-tab" data-room="master-suite">
                <div class="room-tab-content">
                    <div class="room-name">Master Suite</div>
                    <div class="room-price">$450/night</div>
                    <div class="room-amenity-count">0 amenities</div>
                </div>
            </button>
            <button class="room-tab" data-room="family-room">
                <div class="room-tab-content">
                    <div class="room-name">Family Room</div>
                    <div class="room-price">$180/night</div>
                    <div class="room-amenity-count">0 amenities</div>
                </div>
            </button>
            <button class="room-tab" data-room="standard-room">
                <div class="room-tab-content">
                    <div class="room-name">Standard Room</div>
                    <div class="room-price">$120/night</div>
                    <div class="room-amenity-count">0 amenities</div>
                </div>
            </button>
            <button class="room-tab" data-room="economy-room">
                <div class="room-tab-content">
                    <div class="room-name">Economy Room</div>
                    <div class="room-price">$85/night</div>
                    <div class="room-amenity-count">0 amenities</div>
                </div>
            </button>
        </div>
    </div>
    
    <!-- Amenity Assignment Grid -->
    <div class="amenity-assignment-container">
        <div class="assignment-header">
            <h3>Amenities for <span id="current-room-name">Deluxe Suite</span></h3>
            <div class="assignment-actions">
                <button class="btn-secondary" onclick="selectAllAmenities()">Select All</button>
                <button class="btn-secondary" onclick="clearAllAmenities()">Clear All</button>
                <button class="btn-primary" onclick="saveRoomAmenities()">Save Changes</button>
            </div>
        </div>
        
        <!-- Amenities by Category -->
        <div class="amenity-categories" id="amenity-assignment-grid">
            <!-- Will be populated dynamically -->
        </div>
    </div>
</div>
```

### **CSS for Room-Amenity Manager**
```css
.room-selector {
    margin-bottom: 30px;
}

.room-tabs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.room-tab {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.room-tab:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,123,255,0.1);
}

.room-tab.active {
    border-color: #007bff;
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
}

.room-name {
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 8px;
}

.room-price {
    font-size: 1.1em;
    color: #28a745;
    margin-bottom: 5px;
}

.room-tab.active .room-price {
    color: #b3d9ff;
}

.room-amenity-count {
    font-size: 0.9em;
    opacity: 0.8;
}

.amenity-assignment-container {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.1);
}

.assignment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f8f9fa;
}

.assignment-actions {
    display: flex;
    gap: 10px;
}

.amenity-categories {
    display: grid;
    gap: 25px;
}

.category-section {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
}

.category-header {
    background: #f8f9fa;
    padding: 15px 20px;
    font-weight: bold;
    color: #495057;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.category-count {
    background: #6c757d;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
}

.category-amenities {
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
}

.amenity-checkbox {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.amenity-checkbox:hover {
    background: #f8f9fa;
    border-color: #007bff;
}

.amenity-checkbox.selected {
    background: #e3f2fd;
    border-color: #007bff;
}

.amenity-checkbox input[type="checkbox"] {
    margin-right: 12px;
    transform: scale(1.2);
}

.amenity-info {
    flex: 1;
}

.amenity-name {
    font-weight: 500;
    margin-bottom: 4px;
}

.amenity-description {
    font-size: 0.85em;
    color: #6c757d;
    line-height: 1.3;
}

.amenity-icon-small {
    margin-right: 8px;
    font-size: 1.2em;
}
```

### **JavaScript for Room-Amenity Manager**
```javascript
let currentRoom = 'deluxe-suite';
let roomAmenityMappings = {};
let amenitiesByCategory = {};

// Initialize room-amenity manager
async function initRoomAmenityManager() {
    await loadRoomAmenityData();
    setupRoomTabs();
    renderAmenityAssignmentGrid();
}

// Load room-amenity data
async function loadRoomAmenityData() {
    try {
        // Load all amenities grouped by category
    const amenitiesResponse = await fetch(getApiUrl('amenities.php') + '?endpoint=amenities');
        const amenitiesData = await amenitiesResponse.json();
        
        // Group amenities by category
        amenitiesByCategory = amenitiesData.grouped_by_category || {};
        
        // Load existing room-amenity mappings
    const mappingsResponse = await fetch(getApiUrl('amenities.php') + '?endpoint=room-amenities');
        const mappingsData = await mappingsResponse.json();
        
        // Process mappings by room
        roomAmenityMappings = {};
        if (mappingsData.success && mappingsData.mappings) {
            mappingsData.mappings.forEach(mapping => {
                if (!roomAmenityMappings[mapping.room_id]) {
                    roomAmenityMappings[mapping.room_id] = [];
                }
                roomAmenityMappings[mapping.room_id].push(mapping.amenity_id);
            });
        }
        
    } catch (error) {
        console.error('Failed to load room-amenity data:', error);
        showNotification('Failed to load room data', 'error');
    }
}

// Setup room tab functionality
function setupRoomTabs() {
    document.querySelectorAll('.room-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            document.querySelectorAll('.room-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update current room
            currentRoom = tab.dataset.room;
            document.getElementById('current-room-name').textContent = 
                tab.querySelector('.room-name').textContent;
            
            // Re-render amenity grid
            renderAmenityAssignmentGrid();
        });
    });
    
    // Update amenity counts
    updateRoomAmenityCounts();
}

// Update room amenity counts in tabs
function updateRoomAmenityCounts() {
    document.querySelectorAll('.room-tab').forEach(tab => {
        const roomId = tab.dataset.room;
        const count = roomAmenityMappings[roomId] ? roomAmenityMappings[roomId].length : 0;
        tab.querySelector('.room-amenity-count').textContent = `${count} amenities`;
    });
}

// Render amenity assignment grid
function renderAmenityAssignmentGrid() {
    const container = document.getElementById('amenity-assignment-grid');
    const currentRoomAmenities = roomAmenityMappings[currentRoom] || [];
    
    container.innerHTML = Object.keys(amenitiesByCategory).map(category => {
        const amenities = amenitiesByCategory[category];
        const selectedCount = amenities.filter(a => currentRoomAmenities.includes(a.id)).length;
        
        return `
            <div class="category-section">
                <div class="category-header">
                    <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span class="category-count">${selectedCount}/${amenities.length}</span>
                </div>
                <div class="category-amenities">
                    ${amenities.map(amenity => `
                        <div class="amenity-checkbox ${currentRoomAmenities.includes(amenity.id) ? 'selected' : ''}"
                             onclick="toggleAmenitySelection(${amenity.id})">
                            <input type="checkbox" 
                                   id="amenity-${amenity.id}-${currentRoom}"
                                   ${currentRoomAmenities.includes(amenity.id) ? 'checked' : ''}
                                   onclick="event.stopPropagation()">
                            <div class="amenity-info">
                                <div class="amenity-name">
                                    <span class="amenity-icon-small">${getIconDisplay(amenity.icon)}</span>
                                    ${amenity.name}
                                    ${amenity.is_featured ? '<span class="featured-badge">FEATURED</span>' : ''}
                                </div>
                                <div class="amenity-description">${amenity.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Toggle amenity selection
function toggleAmenitySelection(amenityId) {
    const checkbox = document.getElementById(`amenity-${amenityId}-${currentRoom}`);
    checkbox.checked = !checkbox.checked;
    
    if (!roomAmenityMappings[currentRoom]) {
        roomAmenityMappings[currentRoom] = [];
    }
    
    if (checkbox.checked) {
        if (!roomAmenityMappings[currentRoom].includes(amenityId)) {
            roomAmenityMappings[currentRoom].push(amenityId);
        }
    } else {
        roomAmenityMappings[currentRoom] = roomAmenityMappings[currentRoom]
            .filter(id => id !== amenityId);
    }
    
    // Update UI
    renderAmenityAssignmentGrid();
    updateRoomAmenityCounts();
}

// Select all amenities for current room
function selectAllAmenities() {
    const allAmenityIds = [];
    Object.values(amenitiesByCategory).forEach(amenities => {
        amenities.forEach(amenity => allAmenityIds.push(amenity.id));
    });
    
    roomAmenityMappings[currentRoom] = [...allAmenityIds];
    renderAmenityAssignmentGrid();
    updateRoomAmenityCounts();
}

// Clear all amenities for current room
function clearAllAmenities() {
    roomAmenityMappings[currentRoom] = [];
    renderAmenityAssignmentGrid();
    updateRoomAmenityCounts();
}

// Save room amenities
async function saveRoomAmenities() {
    try {
        const amenityIds = roomAmenityMappings[currentRoom] || [];
        
    const response = await fetch(getApiUrl('amenities.php') + '?endpoint=room-amenities', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                room_id: currentRoom,
                amenity_ids: amenityIds
            })
        });
        
        if (response.ok) {
            showNotification('Room amenities saved successfully', 'success');
        } else {
            throw new Error('Failed to save room amenities');
        }
    } catch (error) {
        console.error('Error saving room amenities:', error);
        showNotification('Failed to save room amenities', 'error');
    }
}
```

---

## 📦 **COMPONENT 3: PACKAGE-PERK ASSIGNMENTS**

### **HTML Structure**
```html
<div class="package-perk-manager">
    <div class="section-header">
        <h2>📦 Package Perk Assignments</h2>
        <p>Assign special perks to your packages</p>
    </div>
    
    <!-- Package Selector -->
    <div class="package-selector">
        <div class="package-tabs">
            <button class="package-tab active" data-package="1">
                <div class="package-tab-content">
                    <div class="package-name">Romantic Getaway</div>
                    <div class="package-price">$599 • 3 days</div>
                    <div class="package-perk-count">4 perks</div>
                </div>
            </button>
            <button class="package-tab" data-package="2">
                <div class="package-tab-content">
                    <div class="package-name">Adventure Explorer</div>
                    <div class="package-price">$899 • 5 days</div>
                    <div class="package-perk-count">0 perks</div>
                </div>
            </button>
            <button class="package-tab" data-package="3">
                <div class="package-tab-content">
                    <div class="package-name">Wellness Retreat</div>
                    <div class="package-price">$1299 • 7 days</div>
                    <div class="package-perk-count">0 perks</div>
                </div>
            </button>
            <button class="package-tab" data-package="4">
                <div class="package-tab-content">
                    <div class="package-name">Cultural Heritage</div>
                    <div class="package-price">$749 • 4 days</div>
                    <div class="package-perk-count">0 perks</div>
                </div>
            </button>
            <button class="package-tab" data-package="5">
                <div class="package-tab-content">
                    <div class="package-name">Family Fun</div>
                    <div class="package-price">$1199 • 6 days</div>
                    <div class="package-perk-count">0 perks</div>
                </div>
            </button>
        </div>
    </div>
    
    <!-- Perk Assignment Interface -->
    <div class="perk-assignment-container">
        <div class="assignment-header">
            <h3>Perks for <span id="current-package-name">Romantic Getaway</span></h3>
            <div class="assignment-actions">
                <button class="btn-secondary" onclick="previewSalesTool()">Preview Sales Tool</button>
                <button class="btn-primary" onclick="savePackagePerks()">Save Perks</button>
            </div>
        </div>
        
        <!-- Perks Selection with Highlight Option -->
        <div class="perk-categories" id="perk-assignment-grid">
            <!-- Similar to room amenities but with highlight option -->
        </div>
    </div>
    
    <!-- Sales Tool Preview Modal -->
    <div class="modal" id="sales-tool-preview-modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Sales Tool Preview</h3>
                <button class="modal-close" onclick="closeSalesToolPreview()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="preview-tabs">
                    <button class="preview-tab active" data-tab="visual">Visual Preview</button>
                    <button class="preview-tab" data-tab="json">JSON Response</button>
                </div>
                <div class="preview-content">
                    <div class="preview-panel" id="visual-preview">
                        <!-- Visual preview content -->
                    </div>
                    <div class="preview-panel" id="json-preview" style="display: none;">
                        <pre id="json-content"></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## 🔍 **COMPONENT 4: SALES TOOL PREVIEW**

### **Implementation**
```javascript
// Preview sales tool functionality
async function previewSalesTool(packageId = null, roomId = null) {
    try {
        packageId = packageId || currentPackage;
        
    const base = getApiUrl('amenities.php');
    let url = `${base}/sales-tool/${packageId}`;
        if (roomId) {
            url += `?room_id=${roomId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displaySalesToolPreview(data.sales_tool);
            document.getElementById('sales-tool-preview-modal').style.display = 'block';
        } else {
            throw new Error('Failed to generate sales tool preview');
        }
    } catch (error) {
        console.error('Error generating sales tool preview:', error);
        showNotification('Failed to generate preview', 'error');
    }
}

// Display sales tool preview
function displaySalesToolPreview(salesTool) {
    // Visual preview
    const visualPreview = document.getElementById('visual-preview');
    visualPreview.innerHTML = `
        <div class="sales-preview">
            <div class="preview-header">
                <h4>${salesTool.package_info.name}</h4>
                <div class="preview-tagline">${salesTool.sales_presentation.tagline}</div>
            </div>
            
            <div class="preview-sections">
                <div class="preview-section">
                    <h5>Package Perks (${salesTool.sales_presentation.package_perks.length})</h5>
                    <div class="perk-list">
                        ${salesTool.sales_presentation.package_perks.map(perk => `
                            <div class="perk-item ${perk.is_highlighted ? 'highlighted' : ''}">
                                <span class="perk-icon">${getIconDisplay(perk.icon)}</span>
                                <div class="perk-details">
                                    <div class="perk-name">${perk.name}</div>
                                    <div class="perk-description">${perk.description}</div>
                                </div>
                                ${perk.is_highlighted ? '<span class="highlight-badge">HIGHLIGHTED</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="preview-section">
                    <h5>Room Features (${salesTool.sales_presentation.room_features.length})</h5>
                    <div class="room-context">
                        <p><strong>Room Determined:</strong> ${salesTool.room_context.room_determined}</p>
                        ${salesTool.room_context.room_id ? `<p><strong>Room:</strong> ${salesTool.room_context.room_id}</p>` : ''}
                    </div>
                    ${salesTool.sales_presentation.room_features.length > 0 ? `
                        <div class="feature-list">
                            ${salesTool.sales_presentation.room_features.map(feature => `
                                <div class="feature-item">
                                    <span class="feature-icon">${getIconDisplay(feature.icon)}</span>
                                    <div class="feature-details">
                                        <div class="feature-name">${feature.name}</div>
                                        <div class="feature-description">${feature.description}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="no-features">No specific room selected</p>'}
                </div>
            </div>
        </div>
    `;
    
    // JSON preview
    document.getElementById('json-content').textContent = 
        JSON.stringify(salesTool, null, 2);
}
```

---

## 🚀 **IMPLEMENTATION STEPS**

### **Phase 1: Basic Setup**
1. Add amenities section to admin dashboard navigation
2. Implement amenities catalog manager
3. Add CRUD API endpoints to amenities.php

### **Phase 2: Room Assignments**
1. Implement room-amenity assignment interface
2. Add room-amenity API endpoints
3. Integrate with existing room data

### **Phase 3: Package Perks**
1. Implement package-perk assignment interface
2. Add package-amenity API endpoints
3. Integrate with existing package data

### **Phase 4: Sales Tool Preview**
1. Implement preview functionality
2. Add visual and JSON preview modes
3. Test with different room/package combinations

---

## 📋 **CONCLUSION**

This comprehensive amenities interface will provide complete control over your villa's amenities system through an intuitive admin dashboard. The interface includes:

✅ **Complete amenities catalog management**  
✅ **Room-specific amenity assignments**  
✅ **Package-specific perk assignments**  
✅ **Sales tool preview functionality**  
✅ **Real-time statistics and usage tracking**  
✅ **Professional UI with responsive design**

The implementation will transform your amenities system from a database-only solution into a fully manageable business tool.