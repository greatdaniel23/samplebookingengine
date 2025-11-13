# Function & API Mapping Documentation

## Executive Summary
Both sections (`VillaInfoSection` and `BusinessDetailsSection`) share identical architectural patterns but manage different data domains. Critical conflict: both use same API endpoint with overlapping field names.

## Function Comparison Matrix

### 🔄 IDENTICAL FUNCTION PATTERNS

| Function Category | Villa Info Implementation | Business Details Implementation | Code Similarity |
|------------------|---------------------------|--------------------------------|------------------|
| **Data Loading** | `loadVillaInfo()` | `loadBusinessDetails()` | 95% identical |
| **Data Saving** | `handleSave()` | `handleSave()` | 90% identical |
| **State Management** | `useState` with `villaInfo` | `useState` with `businessDetails` | 100% identical |
| **Form Handling** | `handleInputChange()` | `handleInputChange()` | 100% identical |
| **Loading States** | `loading`, `saving` states | `saving` state | 90% identical |
| **Error Handling** | Try-catch with alerts | Try-catch with alerts | 100% identical |

### ⚙️ FUNCTION IMPLEMENTATIONS

#### Data Loading Functions
```javascript
// Villa Info Section
const loadVillaInfo = async () => {
    try {
        const apiUrl = window.getApiUrl('villa.php');
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.success && data.data) {
            setVillaInfo(data.data);
        }
    } catch (error) {
        console.error('Network Error:', error);
    } finally {
        setLoading(false);
    }
};

// Business Details Section  
const loadBusinessDetails = async () => {
    try {
        const apiUrl = window.getApiUrl('villa.php');
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.success && data.data) {
            setBusinessDetails(prev => ({
                ...prev,
                name: data.data.name || prev.name,
                email: data.data.email || prev.email,
                // ... field mapping
            }));
        }
    } catch (error) {
        console.error('Error loading business details:', error);
    }
};
```

**Analysis**: Same API call pattern, different data mapping logic.

#### Data Saving Functions
```javascript
// Villa Info Section
const handleSave = async () => {
    setSaving(true);
    try {
        const apiUrl = window.getApiUrl('villa.php');
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(villaInfo),
        });
        const result = await response.json();
        if (result.success) {
            setIsEditing(false);
            alert('Villa information updated successfully!');
            await loadVillaInfo();
        }
    } catch (error) {
        alert('Error updating villa information: ' + error.message);
    } finally {
        setSaving(false);
    }
};

// Business Details Section
const handleSave = async () => {
    setSaving(true);
    try {
        const apiUrl = window.getApiUrl('villa.php');
        const businessData = {
            name: businessDetails.name,
            email: businessDetails.email,
            // ... complete mapping
        };
        const response = await fetch(apiUrl, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(businessData),
        });
        const result = await response.json();
        if (result.success) {
            setIsEditing(false);
            alert('Business details updated successfully!');
            await loadBusinessDetails();
        }
    } catch (error) {
        alert('Error updating business details: ' + error.message);
    } finally {
        setSaving(false);
    }
};
```

**Analysis**: Identical structure, but Business Details has explicit data mapping.

### 🎯 UNIQUE FUNCTIONS

#### Villa Info Only
| Function | Purpose | Code Location |
|----------|---------|---------------|
| `handleImageChange(index, value)` | Image URL management | Lines 2184-2190 |
| `addImage()` | Add new image slot | Lines 2192-2197 |
| `removeImage(index)` | Remove image slot | Lines 2199-2204 |
| `handleAmenityChange(index, field, value)` | Amenity management | Lines 2206-2212 |
| `addAmenity()` | Add new amenity | Lines 2214-2219 |
| `removeAmenity(index)` | Remove amenity | Lines 2221-2226 |

#### Business Details Only
| Function | Purpose | Code Location |
|----------|---------|---------------|
| **Nested Object Handling** | `field.includes('.')` logic | Lines 2535-2547 |
| **Social Media Management** | Social media links handling | Part of nested logic |
| **Payment Methods** | Payment options array | Lines 2625+ |
| **Time Format Handling** | Check-in/out time format | Lines 2580+ |

## API Endpoint Mapping

### Current API Structure
**Endpoint**: `/api/villa.php`
**Methods**: `GET` (retrieve), `PUT` (update)

#### API Request Analysis
```javascript
// Both sections use identical API calls:
const apiUrl = window.getApiUrl('villa.php');

// GET Request (Loading)
fetch(apiUrl) // Returns all villa data

// PUT Request (Saving)  
fetch(apiUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
```

### Data Field Mapping

#### 🔥 CRITICAL CONFLICTS
| Field Name | Villa Info Usage | Business Details Usage | Conflict Level |
|------------|------------------|------------------------|----------------|
| `name` | Property name: "Serene Mountain Retreat" | Business name: "Villa Daisy Cantik" | **CRITICAL** |
| `description` | Marketing description | Business policies/description | **HIGH** |

#### ✅ UNIQUE FIELDS - Villa Info
```javascript
{
    location: "Aspen, Colorado",
    rating: 4.9,
    reviews: 128,
    images: [...urls],
    amenities: [{name, icon}]
}
```

#### ✅ UNIQUE FIELDS - Business Details  
```javascript
{
    email: "info@rumahdaisycantik.com",
    phone: "+62 361 234 5678", 
    address: "Jl. Ubud Raya",
    city: "Ubud",
    state: "Bali",
    zipCode: "80571",
    country: "Indonesia",
    website: "https://booking.rumahdaisycantik.com",
    checkInTime: "14:00",
    checkOutTime: "12:00", 
    currency: "IDR",
    taxRate: "10",
    cancellationPolicy: "24",
    paymentMethods: [...],
    socialMedia: {facebook, instagram, whatsapp}
}
```

## Constants & Configuration Mapping

### Shared Constants
```javascript
// Both sections use:
const API_BASE_URL = window.getApiUrl() // from config.js
const SUCCESS_ALERT = 'Information updated successfully!'
const ERROR_ALERT = 'Error updating information: '
const LOADING_STATE = true/false
const EDITING_STATE = true/false
```

### Villa Info Constants
```javascript
const DEFAULT_VILLA = {
    name: 'Serene Mountain Retreat',
    location: 'Aspen, Colorado', 
    rating: 4.9,
    reviews: 128
};

const AMENITY_ICONS = [
    'Wifi', 'Bath', 'Flame', 'CookingPot', 
    'Car', 'AirVent', 'Star', 'Home', 'Coffee', 'Tv'
];

const MAX_RATING = 5;
const MIN_RATING = 0;
const RATING_STEP = 0.1;
```

### Business Details Constants
```javascript
const DEFAULT_BUSINESS = {
    name: 'Villa Daisy Cantik',
    email: 'info@rumahdaisycantik.com',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    currency: 'IDR',
    taxRate: '10'
};

const PAYMENT_METHODS = [
    'Credit Card', 'Bank Transfer', 'PayPal', 'Cash'
];

const SOCIAL_PLATFORMS = {
    facebook: 'https://facebook.com/villadaisycantik',
    instagram: 'https://instagram.com/villadaisycantik', 
    whatsapp: 'https://wa.me/6236123456789'
};
```

## Data Flow Analysis

### Current Data Flow (PROBLEMATIC)
```
Villa Info Section ──┐
                    ├─→ /api/villa.php ─→ Database
Business Details ───┘
```

**Issue**: Last save wins, no merge logic, data conflicts.

### Recommended Data Flow Options

#### Option 1: Field Prefixing
```javascript
// Villa Info saves as:
{
    property_name: "Serene Mountain Retreat",
    marketing_description: "Property marketing text",
    // ... other villa fields
}

// Business Details saves as:  
{
    business_name: "Villa Daisy Cantik",
    business_description: "Business policies text",
    // ... other business fields
}
```

#### Option 2: Separate Endpoints
```
Villa Info ──→ /api/property.php ──→ property_info table
Business Details ──→ /api/business.php ──→ business_info table
```

#### Option 3: Single Merged Section
```
Property Management Section:
├── Basic Info Tab (name, location, contact)
├── Marketing Tab (description, images, amenities) 
├── Business Tab (policies, social media)
└── Reviews Tab (rating, reviews)
```

## Implementation Recommendations

### Phase 1: Immediate Fix (Field Renaming)
1. **Villa Info fields**: `property_name`, `marketing_description`
2. **Business Details fields**: `business_name`, `business_description`  
3. **Update API calls** to use new field names
4. **Test data persistence** to ensure no loss

### Phase 2: Code Optimization (Function Consolidation)
1. **Create shared utility functions** for common patterns
2. **Standardize error handling** across both sections
3. **Implement consistent loading states**
4. **Add data validation helpers**

### Phase 3: Architecture Review (Long-term) 
1. **Consider API separation** for better data isolation
2. **Develop merge conflict resolution** if keeping single endpoint
3. **Add data versioning** for safer updates
4. **Implement audit logging** for changes

---
*Analysis Date: November 13, 2025*
*Status: Ready for Implementation Decision*