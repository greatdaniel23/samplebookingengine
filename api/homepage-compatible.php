<?php
/**
 * Homepage Content Management API - Compatible with existing villa_info table
 * Handles CRUD operations for homepage content using existing villa_info structure
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

class HomepageController {
    private $db;
    
    public function __construct() {
        try {
            $database = new Database();
            $this->db = $database->getConnection();
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }
    
    /**
     * GET: Retrieve homepage content from villa_info table
     */
    public function getHomepageContent() {
        try {
            // Use existing villa_info table structure
            $query = "SELECT * FROM villa_info WHERE id = 1 LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result) {
                return $this->jsonResponse(false, 'No homepage content found', null);
            }
            
            // Transform villa_info data to homepage content format
            $homepageData = [
                'id' => $result['id'],
                
                // Hero section - map from villa data
                'hero_title' => $result['name'] ?? 'Villa Daisy Cantik',
                'hero_subtitle' => 'Luxury Villa Experience',
                'hero_description' => $result['description'] ?? 'Experience unparalleled luxury and comfort',
                
                // Basic property info
                'property_name' => $result['name'] ?? 'Villa Daisy Cantik', 
                'property_location' => $result['location'] ?? 'Bali, Indonesia',
                'property_description' => $result['description'] ?? '',
                'property_rating' => $result['rating'] ?? 4.9,
                'property_reviews' => $result['reviews'] ?? 128,
                
                // Contact information
                'contact_phone' => $result['phone'] ?? '+62 361 123456',
                'contact_email' => $result['email'] ?? 'info@villadaisycantik.com',
                'contact_website' => $result['website'] ?? '',
                
                // Address
                'address_street' => $result['address'] ?? 'Jl. Pantai Indah No. 123',
                'address_city' => $result['city'] ?? 'Bali',
                'address_state' => $result['state'] ?? '',
                'address_country' => $result['country'] ?? 'Indonesia',
                'address_zipcode' => $result['zip_code'] ?? '',
                
                // Specifications
                'spec_max_guests' => $result['max_guests'] ?? 8,
                'spec_bedrooms' => $result['bedrooms'] ?? 4,
                'spec_bathrooms' => $result['bathrooms'] ?? 3,
                'spec_base_price' => $result['price_per_night'] ?? 350,
                
                // Timing
                'timing_check_in' => $result['check_in_time'] ?? '15:00',
                'timing_check_out' => $result['check_out_time'] ?? '11:00',
                
                // Policies
                'policy_cancellation' => $result['cancellation_policy'] ?? '',
                'policy_house_rules' => $result['house_rules'] ?? '',
                'policy_terms_conditions' => '',
                
                // Social media - parse JSON if available
                'social_facebook' => '',
                'social_instagram' => '',
                'social_twitter' => '',
                
                // Media - parse JSON if available
                'images' => json_decode($result['images'] ?? '[]', true) ?: [],
                'amenities' => json_decode($result['amenities'] ?? '[]', true) ?: [],
                
                // Metadata
                'created_at' => $result['created_at'] ?? '',
                'updated_at' => $result['updated_at'] ?? ''
            ];
            
            // Parse social media if it exists
            if (isset($result['social_media']) && !empty($result['social_media'])) {
                $socialMedia = json_decode($result['social_media'], true);
                if ($socialMedia) {
                    $homepageData['social_facebook'] = $socialMedia['facebook'] ?? '';
                    $homepageData['social_instagram'] = $socialMedia['instagram'] ?? '';
                    $homepageData['social_twitter'] = $socialMedia['twitter'] ?? '';
                }
            }
            
            return $this->jsonResponse(true, 'Homepage content retrieved successfully', $homepageData);
            
        } catch (Exception $e) {
            error_log("❌ Homepage content retrieval error: " . $e->getMessage());
            return $this->jsonResponse(false, 'Database error: ' . $e->getMessage(), null);
        }
    }
    
    /**
     * PUT: Update homepage content via villa_info table
     */
    public function updateHomepageContent($data) {
        try {
            // Map homepage data back to villa_info structure
            $updateFields = [];
            $params = [];
            
            // Map hero/property fields
            if (isset($data['heroTitle']) || isset($data['name'])) {
                $updateFields[] = "name = :name";
                $params[':name'] = $data['heroTitle'] ?? $data['name'] ?? 'Villa Daisy Cantik';
            }
            
            if (isset($data['heroDescription']) || isset($data['description'])) {
                $updateFields[] = "description = :description";
                $params[':description'] = $data['heroDescription'] ?? $data['description'] ?? '';
            }
            
            // Contact information
            if (isset($data['phone'])) {
                $updateFields[] = "phone = :phone";
                $params[':phone'] = $data['phone'];
            }
            
            if (isset($data['email'])) {
                $updateFields[] = "email = :email";
                $params[':email'] = $data['email'];
            }
            
            if (isset($data['website'])) {
                $updateFields[] = "website = :website";
                $params[':website'] = $data['website'];
            }
            
            // Address fields
            if (isset($data['address'])) {
                $updateFields[] = "address = :address";
                $params[':address'] = $data['address'];
            }
            
            if (isset($data['city'])) {
                $updateFields[] = "city = :city";
                $params[':city'] = $data['city'];
            }
            
            if (isset($data['state'])) {
                $updateFields[] = "state = :state";
                $params[':state'] = $data['state'];
            }
            
            if (isset($data['country'])) {
                $updateFields[] = "country = :country";
                $params[':country'] = $data['country'];
            }
            
            if (isset($data['zipcode'])) {
                $updateFields[] = "zip_code = :zip_code";
                $params[':zip_code'] = $data['zipcode'];
            }
            
            // Specifications
            if (isset($data['maxGuests'])) {
                $updateFields[] = "max_guests = :max_guests";
                $params[':max_guests'] = (int)$data['maxGuests'];
            }
            
            if (isset($data['bedrooms'])) {
                $updateFields[] = "bedrooms = :bedrooms";
                $params[':bedrooms'] = (int)$data['bedrooms'];
            }
            
            if (isset($data['bathrooms'])) {
                $updateFields[] = "bathrooms = :bathrooms";
                $params[':bathrooms'] = (int)$data['bathrooms'];
            }
            
            if (isset($data['basePrice'])) {
                $updateFields[] = "price_per_night = :price_per_night";
                $params[':price_per_night'] = (float)$data['basePrice'];
            }
            
            // Timing
            if (isset($data['checkIn'])) {
                $updateFields[] = "check_in_time = :check_in_time";
                $params[':check_in_time'] = $data['checkIn'];
            }
            
            if (isset($data['checkOut'])) {
                $updateFields[] = "check_out_time = :check_out_time";
                $params[':check_out_time'] = $data['checkOut'];
            }
            
            // Policies
            if (isset($data['cancellationPolicy'])) {
                $updateFields[] = "cancellation_policy = :cancellation_policy";
                $params[':cancellation_policy'] = $data['cancellationPolicy'];
            }
            
            if (isset($data['houseRules'])) {
                $updateFields[] = "house_rules = :house_rules";
                $params[':house_rules'] = $data['houseRules'];
            }
            
            // Handle arrays (JSON fields)
            if (isset($data['images'])) {
                $updateFields[] = "images = :images";
                $params[':images'] = json_encode($data['images']);
            }
            
            if (isset($data['amenities'])) {
                $updateFields[] = "amenities = :amenities";
                $params[':amenities'] = json_encode($data['amenities']);
            }
            
            // Social media
            $socialMedia = [];
            if (isset($data['facebook'])) $socialMedia['facebook'] = $data['facebook'];
            if (isset($data['instagram'])) $socialMedia['instagram'] = $data['instagram'];
            if (isset($data['twitter'])) $socialMedia['twitter'] = $data['twitter'];
            
            if (!empty($socialMedia)) {
                $updateFields[] = "social_media = :social_media";
                $params[':social_media'] = json_encode($socialMedia);
            }
            
            // Always update the timestamp
            $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
            
            if (empty($updateFields)) {
                return $this->jsonResponse(false, 'No valid fields provided for update', null);
            }
            
            // Build and execute update query
            $query = "UPDATE villa_info SET " . implode(', ', $updateFields) . " WHERE id = 1";
            $stmt = $this->db->prepare($query);
            
            $success = $stmt->execute($params);
            
            if ($success) {
                return $this->jsonResponse(true, 'Homepage content updated successfully', null);
            } else {
                return $this->jsonResponse(false, 'Failed to update homepage content', null);
            }
            
        } catch (Exception $e) {
            error_log("❌ Homepage content update error: " . $e->getMessage());
            return $this->jsonResponse(false, 'Database error: ' . $e->getMessage(), null);
        }
    }
    
    /**
     * Helper method to send JSON response
     */
    private function jsonResponse($success, $message, $data = null) {
        $response = [
            'success' => $success,
            'message' => $message
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        echo json_encode($response);
        return $response;
    }
}

// Handle requests
try {
    $controller = new HomepageController();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            $controller->getHomepageContent();
            break;
            
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            if ($input === null) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid JSON input'
                ]);
                exit;
            }
            $controller->updateHomepageContent($input);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>