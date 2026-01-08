<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    // REMOVED: CREATE TABLE statement - production database already exists with correct schema
    // Don't create/alter existing production table structure
    // Production villa_info table has: postal_code (not zip_code), TIME fields, no max_guests/bedrooms/bathrooms/price_per_night

    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch($method) {
        case 'GET':
            // Get villa information  
            $query = "SELECT * FROM villa_info WHERE id = 1 LIMIT 1";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            

            
            if ($row) {
                // Parse JSON fields
                $row['images'] = json_decode($row['images'], true) ?: [];
                $row['amenities'] = json_decode($row['amenities'], true) ?: [];
                $row['socialMedia'] = isset($row['social_media']) ? json_decode($row['social_media'], true) ?: [] : [];
                
                // Map database field names to interface field names with default values
                $row['zipCode'] = $row['postal_code'] ?? '';
                $row['checkInTime'] = $row['check_in_time'] ?? '15:00';
                $row['checkOutTime'] = $row['check_out_time'] ?? '11:00';
                $row['cancellationPolicy'] = $row['cancellation_policy'] ?? '';
                $row['houseRules'] = $row['house_rules'] ?? '';
                
                // Create location field from address components
                $locationParts = array_filter([
                    $row['city'] ?? '',
                    $row['state'] ?? '',
                    $row['country'] ?? ''
                ]);
                $row['location'] = implode(', ', $locationParts) ?: 'Location not specified';
                
                // Keep actual database values - NO DEFAULTS
                $row['phone'] = $row['phone'] ?: '';
                $row['email'] = $row['email'] ?: '';
                $row['website'] = $row['website'] ?: '';
                $row['address'] = $row['address'] ?: '';
                $row['city'] = $row['city'] ?: '';
                $row['state'] = $row['state'] ?: '';
                $row['country'] = $row['country'] ?: '';
                $row['currency'] = $row['currency'] ?: 'USD';
                $row['rating'] = (float)$row['rating'] ?: 4.9;
                $row['reviews'] = (int)$row['reviews'] ?: 128;
                
                // Remove database field names that are different
                unset($row['postal_code'], $row['check_in_time'], $row['check_out_time'], 
                      $row['cancellation_policy'], $row['house_rules'], $row['social_media'],
                      $row['latitude'], $row['longitude'], $row['timezone'], $row['language'],
                      $row['tax_rate'], $row['service_fee'], $row['nearby_attractions'],
                      $row['seo_title'], $row['seo_description'], $row['seo_keywords']);
                
                echo json_encode([
                    'success' => true,
                    'data' => $row
                ]);
            } else {
                // No villa data found - this shouldn't happen in production
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Villa information not found'
                ]);
            }
            break;
            
        case 'PUT':
        case 'POST':
            // Update villa information
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Debug: Log received data
            error_log("Villa API received data: " . json_encode($input));
            
            if (!$input) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON data'
                ]);
                break;
            }
            
            // Validate rating if provided
            if (isset($input['rating']) && ($input['rating'] < 0 || $input['rating'] > 5)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Rating must be between 0 and 5'
                ]);
                break;
            }
            
            // Ensure images and amenities are arrays if provided
            if (isset($input['images']) && !is_array($input['images'])) {
                $input['images'] = [];
            }
            if (isset($input['amenities']) && !is_array($input['amenities'])) {
                $input['amenities'] = [];
            }
            
            // Build dynamic query - only update provided fields
            $setParts = [];
            $params = [];
            
            // Map frontend fields to database fields
            // Only include fields that exist in production villa_info table
            $fieldMap = [
                'name' => 'name',
                'description' => 'description', 
                'phone' => 'phone',
                'email' => 'email',
                'website' => 'website',
                'address' => 'address',
                'city' => 'city',
                'state' => 'state',
                'country' => 'country',
                'postal_code' => 'postal_code', // Updated: frontend sends postal_code
                'zipCode' => 'postal_code', // Keep backward compatibility
                // REMOVED: max_guests, bedrooms, bathrooms, price_per_night (don't exist in production)
                'check_in_time' => 'check_in_time', // Updated: frontend sends check_in_time  
                'check_out_time' => 'check_out_time', // Updated: frontend sends check_out_time
                'checkInTime' => 'check_in_time', // Keep backward compatibility
                'checkOutTime' => 'check_out_time', // Keep backward compatibility
                'currency' => 'currency',
                'rating' => 'rating', // This exists in production
                'reviews' => 'reviews', // This exists in production
                'cancellationPolicy' => 'cancellation_policy',
                'houseRules' => 'house_rules',
                'amenities' => 'amenities',
                'images' => 'images'
            ];
            
            foreach ($fieldMap as $inputField => $dbField) {
                if (isset($input[$inputField])) {
                    $setParts[] = "$dbField = :$dbField";
                    
                    if ($inputField === 'amenities' || $inputField === 'images') {
                        $params[$dbField] = json_encode($input[$inputField]);
                    } else {
                        $params[$dbField] = htmlspecialchars(strip_tags($input[$inputField]));
                    }
                }
            }
            
            if (empty($setParts)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'No valid fields to update'
                ]);
                break;
            }
            
            // Always update the timestamp
            $setParts[] = 'updated_at = NOW()';
            
            $query = "UPDATE villa_info SET " . implode(', ', $setParts) . " WHERE id = 1";

            $stmt = $db->prepare($query);
            
            // Debug: Log what we're trying to update
            error_log("Villa API SQL: " . $query);
            error_log("Villa API params: " . json_encode($params));
            
            $result = $stmt->execute($params);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Villa information updated successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to update villa information'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>