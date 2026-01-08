# 🏠 HOMEPAGE CONTENT SYSTEM - DATABASE INTEGRATION PLAN
## Complete Implementation Documentation

---

## 🚨 **CURRENT ISSUE IDENTIFIED**

The Homepage Content Manager we just created is **missing a critical foundation**:

### **❌ Problems:**
1. **No Database Storage** - Content is only stored in villa_info table (limited)
2. **No Dedicated API** - Using generic villa.php (not optimized for homepage)  
3. **Frontend Not Connected** - Homepage still uses hardcoded data
4. **Data Structure Mismatch** - HomepageContentData interface doesn't match database

### **✅ Required Solution:**
Complete 3-tier implementation: **Database → API → Frontend**

---

## 🗄️ **PHASE 1: DATABASE SCHEMA**

### **New Table: `homepage_content`**

```sql
-- File: database/homepage-content-table.sql

CREATE TABLE homepage_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Hero Section
  hero_title VARCHAR(255) NOT NULL DEFAULT 'Serene Mountain Retreat',
  hero_subtitle VARCHAR(255) DEFAULT 'Luxury Villa Experience',
  hero_description TEXT,
  
  -- Basic Property Info
  property_name VARCHAR(255) NOT NULL,
  property_location VARCHAR(255),
  property_description TEXT,
  property_rating DECIMAL(2,1) DEFAULT 4.8,
  property_reviews INT DEFAULT 127,
  
  -- Contact Information
  contact_phone VARCHAR(50),
  contact_email VARCHAR(100),
  contact_website VARCHAR(255),
  
  -- Address Details
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_country VARCHAR(100),
  address_zipcode VARCHAR(20),
  
  -- Property Specifications
  spec_max_guests INT DEFAULT 8,
  spec_bedrooms INT DEFAULT 4,
  spec_bathrooms INT DEFAULT 3,
  spec_base_price DECIMAL(10,2) DEFAULT 350.00,
  
  -- Timing
  timing_check_in VARCHAR(20) DEFAULT '3:00 PM',
  timing_check_out VARCHAR(20) DEFAULT '11:00 AM',
  
  -- Policies (JSON stored as TEXT)
  policy_cancellation TEXT,
  policy_house_rules TEXT,
  policy_terms_conditions TEXT,
  
  -- Social Media
  social_facebook VARCHAR(255),
  social_instagram VARCHAR(255),
  social_twitter VARCHAR(255),
  
  -- Images (JSON array stored as TEXT)
  images_json TEXT, -- Store array of image URLs as JSON
  
  -- Amenities (JSON array stored as TEXT)  
  amenities_json TEXT, -- Store amenities with name/icon as JSON
  
  -- Meta Information
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(100) DEFAULT 'admin'
);

-- Insert default data
INSERT INTO homepage_content (
  hero_title,
  hero_subtitle, 
  hero_description,
  property_name,
  property_location,
  property_description,
  contact_phone,
  contact_email,
  address_street,
  address_city,
  address_state,
  address_country,
  images_json,
  amenities_json
) VALUES (
  'Serene Mountain Retreat',
  'Luxury Villa Experience',
  'Experience unparalleled luxury and comfort at our prestigious mountain retreat. Perfect for creating unforgettable memories in the heart of nature.',
  'Serene Mountain Retreat',
  'Aspen, Colorado',
  'Escape to this stunning mountain retreat where modern luxury meets rustic charm. Nestled in the heart of the Rockies, this villa offers breathtaking views, world-class amenities, and unmatched privacy for the ultimate getaway experience.',
  '+1 (555) 123-4567',
  'info@sereneretreat.com',
  '123 Luxury Mountain Lane',
  'Aspen', 
  'Colorado',
  'United States',
  '["https://example.com/hero1.jpg", "https://example.com/hero2.jpg", "https://example.com/hero3.jpg"]',
  '[{"name": "Swimming Pool", "icon": "Pool"}, {"name": "WiFi", "icon": "Wifi"}, {"name": "Mountain Views", "icon": "Mountain"}, {"name": "Hot Tub", "icon": "Waves"}]'
);
```

### **Database Migration Script**

```sql
-- File: database/migrate-homepage-content.sql

-- Step 1: Create new table
SOURCE database/homepage-content-table.sql;

-- Step 2: Migrate existing data from villa_info (if exists)
INSERT INTO homepage_content (
  property_name,
  property_location, 
  property_description,
  contact_phone,
  contact_email,
  spec_max_guests,
  spec_bedrooms,
  spec_bathrooms,
  spec_base_price
)
SELECT 
  name,
  location,
  description, 
  phone,
  email,
  COALESCE(maxGuests, 8),
  COALESCE(bedrooms, 4),
  COALESCE(bathrooms, 3),
  COALESCE(basePrice, 350.00)
FROM villa_info 
WHERE id = 1
ON DUPLICATE KEY UPDATE
  property_name = VALUES(property_name),
  property_location = VALUES(property_location);

-- Step 3: Verify migration
SELECT 'Migration Complete' as status, COUNT(*) as records FROM homepage_content;
```

---

## 🔌 **PHASE 2: API ENDPOINT**

### **New File: `api/homepage.php`**

```php
<?php
// File: api/homepage.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

class HomepageController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * GET: Retrieve homepage content
     */
    public function getHomepageContent() {
        try {
            $query = "SELECT * FROM homepage_content WHERE is_active = TRUE ORDER BY id DESC LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result) {
                return $this->jsonResponse(false, 'No homepage content found', null);
            }
            
            // Parse JSON fields
            $result['images'] = json_decode($result['images_json'] ?? '[]', true);
            $result['amenities'] = json_decode($result['amenities_json'] ?? '[]', true);
            
            // Remove JSON fields from response
            unset($result['images_json'], $result['amenities_json']);
            
            return $this->jsonResponse(true, 'Homepage content retrieved successfully', $result);
            
        } catch (Exception $e) {
            return $this->jsonResponse(false, 'Database error: ' . $e->getMessage(), null);
        }
    }
    
    /**
     * PUT: Update homepage content
     */
    public function updateHomepageContent($data) {
        try {
            // Validate required fields
            $requiredFields = ['hero_title', 'property_name'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return $this->jsonResponse(false, "Field '{$field}' is required", null);
                }
            }
            
            // Convert arrays to JSON
            $imagesJson = json_encode($data['images'] ?? []);
            $amenitiesJson = json_encode($data['amenities'] ?? []);
            
            $query = "UPDATE homepage_content SET 
                hero_title = :hero_title,
                hero_subtitle = :hero_subtitle,
                hero_description = :hero_description,
                property_name = :property_name,
                property_location = :property_location,
                property_description = :property_description,
                property_rating = :property_rating,
                property_reviews = :property_reviews,
                contact_phone = :contact_phone,
                contact_email = :contact_email,
                contact_website = :contact_website,
                address_street = :address_street,
                address_city = :address_city,
                address_state = :address_state,
                address_country = :address_country,
                address_zipcode = :address_zipcode,
                spec_max_guests = :spec_max_guests,
                spec_bedrooms = :spec_bedrooms,
                spec_bathrooms = :spec_bathrooms,
                spec_base_price = :spec_base_price,
                timing_check_in = :timing_check_in,
                timing_check_out = :timing_check_out,
                policy_cancellation = :policy_cancellation,
                policy_house_rules = :policy_house_rules,
                policy_terms_conditions = :policy_terms_conditions,
                social_facebook = :social_facebook,
                social_instagram = :social_instagram,
                social_twitter = :social_twitter,
                images_json = :images_json,
                amenities_json = :amenities_json,
                last_updated = CURRENT_TIMESTAMP
            WHERE is_active = TRUE";
            
            $stmt = $this->db->prepare($query);
            
            // Bind parameters
            $params = [
                ':hero_title' => $data['heroTitle'] ?? $data['hero_title'],
                ':hero_subtitle' => $data['heroSubtitle'] ?? $data['hero_subtitle'] ?? '',
                ':hero_description' => $data['heroDescription'] ?? $data['hero_description'] ?? '',
                ':property_name' => $data['name'] ?? $data['property_name'],
                ':property_location' => $data['location'] ?? $data['property_location'] ?? '',
                ':property_description' => $data['description'] ?? $data['property_description'] ?? '',
                ':property_rating' => $data['rating'] ?? $data['property_rating'] ?? 4.8,
                ':property_reviews' => $data['reviews'] ?? $data['property_reviews'] ?? 127,
                ':contact_phone' => $data['phone'] ?? $data['contact_phone'] ?? '',
                ':contact_email' => $data['email'] ?? $data['contact_email'] ?? '',
                ':contact_website' => $data['website'] ?? $data['contact_website'] ?? '',
                ':address_street' => $data['address'] ?? $data['address_street'] ?? '',
                ':address_city' => $data['city'] ?? $data['address_city'] ?? '',
                ':address_state' => $data['state'] ?? $data['address_state'] ?? '',
                ':address_country' => $data['country'] ?? $data['address_country'] ?? '',
                ':address_zipcode' => $data['zipcode'] ?? $data['address_zipcode'] ?? '',
                ':spec_max_guests' => $data['maxGuests'] ?? $data['spec_max_guests'] ?? 8,
                ':spec_bedrooms' => $data['bedrooms'] ?? $data['spec_bedrooms'] ?? 4,
                ':spec_bathrooms' => $data['bathrooms'] ?? $data['spec_bathrooms'] ?? 3,
                ':spec_base_price' => $data['basePrice'] ?? $data['spec_base_price'] ?? 350,
                ':timing_check_in' => $data['checkIn'] ?? $data['timing_check_in'] ?? '3:00 PM',
                ':timing_check_out' => $data['checkOut'] ?? $data['timing_check_out'] ?? '11:00 AM',
                ':policy_cancellation' => $data['cancellationPolicy'] ?? $data['policy_cancellation'] ?? '',
                ':policy_house_rules' => $data['houseRules'] ?? $data['policy_house_rules'] ?? '',
                ':policy_terms_conditions' => $data['termsConditions'] ?? $data['policy_terms_conditions'] ?? '',
                ':social_facebook' => $data['facebook'] ?? $data['social_facebook'] ?? '',
                ':social_instagram' => $data['instagram'] ?? $data['social_instagram'] ?? '',
                ':social_twitter' => $data['twitter'] ?? $data['social_twitter'] ?? '',
                ':images_json' => $imagesJson,
                ':amenities_json' => $amenitiesJson
            ];
            
            $success = $stmt->execute($params);
            
            if (!$success) {
                return $this->jsonResponse(false, 'Failed to update homepage content', null);
            }
            
            return $this->jsonResponse(true, 'Homepage content updated successfully', [
                'affected_rows' => $stmt->rowCount(),
                'last_updated' => date('Y-m-d H:i:s')
            ]);
            
        } catch (Exception $e) {
            return $this->jsonResponse(false, 'Database error: ' . $e->getMessage(), null);
        }
    }
    
    /**
     * Helper: JSON Response formatter
     */
    private function jsonResponse($success, $message, $data) {
        return [
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
}

// Handle requests
$controller = new HomepageController();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        echo json_encode($controller->getHomepageContent());
        break;
        
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode($controller->updateHomepageContent($input));
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed',
            'allowed_methods' => ['GET', 'PUT']
        ]);
        break;
}
?>
```

---

## 🎯 **PHASE 3: FRONTEND INTEGRATION**

### **New Hook: `src/hooks/useHomepageContent.tsx`**

```typescript
// File: src/hooks/useHomepageContent.tsx

import { useState, useEffect } from 'react';
import { paths } from '@/config/paths';

export interface HomepageContent {
  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  
  // Basic Info (mapped to existing villa info structure)
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  
  // Contact
  phone: string;
  email: string;
  website: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  
  // Specifications
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;
  
  // Timing
  checkIn: string;
  checkOut: string;
  
  // Policies
  cancellationPolicy: string;
  houseRules: string;
  termsConditions: string;
  
  // Social
  facebook: string;
  instagram: string;
  twitter: string;
  
  // Media
  images: string[];
  amenities: Array<{
    name: string;
    icon: string;
  }>;
}

export const useHomepageContent = () => {
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = paths.buildApiUrl('/homepage.php');
      console.log('🏠 Fetching homepage content from:', apiUrl);
      
      const response = await fetch(apiUrl);
      const result = await response.json();
      
      console.log('🏠 Homepage content response:', result);
      
      if (result.success && result.data) {
        // Transform API response to match frontend interface
        const transformedData: HomepageContent = {
          // Hero section
          hero_title: result.data.hero_title,
          hero_subtitle: result.data.hero_subtitle,
          hero_description: result.data.hero_description,
          
          // Map database fields to existing villa info structure
          name: result.data.property_name,
          location: result.data.property_location,
          description: result.data.property_description,
          rating: parseFloat(result.data.property_rating),
          reviews: parseInt(result.data.property_reviews),
          
          // Contact info
          phone: result.data.contact_phone,
          email: result.data.contact_email,
          website: result.data.contact_website,
          
          // Address
          address: result.data.address_street,
          city: result.data.address_city,
          state: result.data.address_state,
          country: result.data.address_country,
          zipcode: result.data.address_zipcode,
          
          // Specs
          maxGuests: parseInt(result.data.spec_max_guests),
          bedrooms: parseInt(result.data.spec_bedrooms),
          bathrooms: parseInt(result.data.spec_bathrooms),
          basePrice: parseFloat(result.data.spec_base_price),
          
          // Timing
          checkIn: result.data.timing_check_in,
          checkOut: result.data.timing_check_out,
          
          // Policies
          cancellationPolicy: result.data.policy_cancellation,
          houseRules: result.data.policy_house_rules,
          termsConditions: result.data.policy_terms_conditions,
          
          // Social
          facebook: result.data.social_facebook,
          instagram: result.data.social_instagram,
          twitter: result.data.social_twitter,
          
          // Media
          images: result.data.images || [],
          amenities: result.data.amenities || []
        };
        
        setHomepageContent(transformedData);
      } else {
        throw new Error(result.message || 'Failed to fetch homepage content');
      }
    } catch (err) {
      console.error('🚨 Homepage content fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch homepage content');
    } finally {
      setLoading(false);
    }
  };

  const updateHomepageContent = async (data: Partial<HomepageContent>) => {
    try {
      const apiUrl = paths.buildApiUrl('/homepage.php');
      
      // Transform frontend data back to API format
      const apiData = {
        heroTitle: data.hero_title,
        heroSubtitle: data.hero_subtitle,
        heroDescription: data.hero_description,
        name: data.name,
        location: data.location,
        description: data.description,
        rating: data.rating,
        reviews: data.reviews,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipcode: data.zipcode,
        maxGuests: data.maxGuests,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        basePrice: data.basePrice,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        cancellationPolicy: data.cancellationPolicy,
        houseRules: data.houseRules,
        termsConditions: data.termsConditions,
        facebook: data.facebook,
        instagram: data.instagram,
        twitter: data.twitter,
        images: data.images,
        amenities: data.amenities
      };
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh data after successful update
        await fetchHomepageContent();
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message || 'Failed to update homepage content');
      }
    } catch (err) {
      console.error('🚨 Homepage content update error:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update homepage content' 
      };
    }
  };

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  return {
    homepageContent,
    loading,
    error,
    refetch: fetchHomepageContent,
    updateHomepageContent
  };
};
```

---

## 📝 **PHASE 4: UPDATE EXISTING COMPONENTS**

### **Update Homepage Content Manager**

```typescript
// Update: src/components/admin/HomepageContentManager.tsx
// Replace useVillaInfo with useHomepageContent

import { useHomepageContent } from '@/hooks/useHomepageContent';

const HomepageContentManager: React.FC = () => {
  const { homepageContent, loading, updateHomepageContent } = useHomepageContent();
  // ... rest of component remains the same
};
```

### **Update Homepage Index**

```typescript
// Update: src/pages/Index.tsx  
// Replace useVillaInfo with useHomepageContent

import { useHomepageContent } from '@/hooks/useHomepageContent';

const Index = () => {
  const { homepageContent: currentVillaData, loading } = useHomepageContent();
  // ... rest of component uses currentVillaData
};
```

### **Update Footer Component**

```typescript
// Update: src/components/Footer.tsx
// Replace useVillaInfo with useHomepageContent for contact info

import { useHomepageContent } from '@/hooks/useHomepageContent';

const Footer = () => {
  const { homepageContent } = useHomepageContent();
  // ... use homepageContent for all footer data
};
```

---

## 🚀 **PHASE 5: DEPLOYMENT CHECKLIST**

### **Database Setup**
- [ ] **Run database migration**: `mysql < database/homepage-content-table.sql`
- [ ] **Verify table creation**: Check `homepage_content` table exists
- [ ] **Test data insertion**: Verify default record created
- [ ] **Backup existing data**: Export current `villa_info` before migration

### **API Testing**
- [ ] **Test GET endpoint**: `GET /api/homepage.php`
- [ ] **Test PUT endpoint**: `PUT /api/homepage.php` with sample data
- [ ] **Verify CORS headers**: Frontend can access API
- [ ] **Check error handling**: Test with invalid data

### **Frontend Integration**
- [ ] **Update admin panel**: Use new `useHomepageContent` hook
- [ ] **Update homepage**: Use new data source  
- [ ] **Update footer**: Use new contact data
- [ ] **Test edit functionality**: Admin can edit and save changes
- [ ] **Verify real-time updates**: Changes reflect on frontend immediately

### **Production Deployment**
- [ ] **Database migration**: Run on production database
- [ ] **API endpoint**: Deploy `homepage.php` to production
- [ ] **Frontend build**: Build and deploy updated React components
- [ ] **Cache clearing**: Clear any CDN/browser cache
- [ ] **User acceptance testing**: Verify all functionality works

---

## ⚠️ **CRITICAL DEPENDENCIES**

### **Required Files:**
1. `database/homepage-content-table.sql` - Database schema
2. `api/homepage.php` - API endpoint
3. `src/hooks/useHomepageContent.tsx` - React hook
4. Updated components using new hook

### **Breaking Changes:**
- **Admin panel** will need new hook instead of `useVillaInfo`
- **Homepage** will use new data structure
- **API calls** will target `/homepage.php` instead of `/villa.php`

### **Backwards Compatibility:**
- Keep `villa_info` table and `villa.php` for now
- Migrate data from `villa_info` to `homepage_content`
- Phase out old system after testing

---

*Implementation Plan Created: November 20, 2025*
*Status: Ready for Development*
*Priority: Database → API → Frontend → Testing*