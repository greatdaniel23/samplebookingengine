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
    
    // Create table if it doesn't exist
    $createTable = "
    CREATE TABLE IF NOT EXISTS villa_info (
        id INT PRIMARY KEY DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        rating DECIMAL(2,1) DEFAULT 4.9,
        reviews INT DEFAULT 0,
        images JSON,
        amenities JSON,
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        website VARCHAR(255) DEFAULT '',
        address TEXT DEFAULT '',
        city VARCHAR(100) DEFAULT '',
        state VARCHAR(100) DEFAULT '',
        zip_code VARCHAR(20) DEFAULT '',
        country VARCHAR(100) DEFAULT 'Indonesia',
        check_in_time VARCHAR(20) DEFAULT '14:00',
        check_out_time VARCHAR(20) DEFAULT '12:00',
        max_guests INT DEFAULT 8,
        bedrooms INT DEFAULT 4,
        bathrooms INT DEFAULT 3,
        price_per_night DECIMAL(10,2) DEFAULT 0.00,
        currency VARCHAR(10) DEFAULT 'USD',
        cancellation_policy TEXT DEFAULT '',
        house_rules TEXT DEFAULT '',
        social_media JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $db->exec($createTable);
    
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
                
                // Set default values for fields
                $row['phone'] = $row['phone'] ?? '';
                $row['email'] = $row['email'] ?? '';
                $row['website'] = $row['website'] ?? '';
                $row['address'] = $row['address'] ?? '';
                $row['city'] = $row['city'] ?? '';
                $row['state'] = $row['state'] ?? '';
                $row['country'] = $row['country'] ?? '';
                $row['currency'] = $row['currency'] ?? 'USD';
                $row['rating'] = 4.9; // Default rating since enhanced DB doesn't have this
                $row['reviews'] = 128; // Default reviews since enhanced DB doesn't have this
                
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
                // Return default data and initialize
                $defaultData = [
                    'id' => 1,
                    'name' => 'Serene Mountain Retreat',
                    'location' => 'Aspen, Colorado',
                    'description' => 'Escape to this stunning mountain retreat where modern luxury meets rustic charm. Nestled in the heart of the Rockies, this villa offers breathtaking views, unparalleled comfort, and direct access to world-class ski slopes and hiking trails. Perfect for family vacations, romantic getaways, or corporate retreats.',
                    'phone' => '+1 (555) 123-4567',
                    'email' => 'info@serenemountainretreat.com',
                    'website' => 'www.serenemountainretreat.com',
                    'address' => '123 Mountain View Drive',
                    'city' => 'Aspen',
                    'state' => 'Colorado',
                    'zipCode' => '81611',
                    'country' => 'United States',
                    'checkInTime' => '15:00',
                    'checkOutTime' => '11:00',
                    'maxGuests' => 8,
                    'bedrooms' => 4,
                    'bathrooms' => 3,
                    'pricePerNight' => 550.00,
                    'currency' => 'USD',
                    'cancellationPolicy' => 'Free cancellation up to 48 hours before check-in. 50% refund for cancellations within 48 hours.',
                    'houseRules' => 'No smoking • No pets • No parties or events • Check-in after 3:00 PM • Quiet hours 10:00 PM - 8:00 AM',
                    'socialMedia' => [
                        'facebook' => 'https://facebook.com/serenemountainretreat',
                        'instagram' => 'https://instagram.com/serenemountainretreat',
                        'twitter' => 'https://twitter.com/serenemountain'
                    ],
                    'rating' => 4.9,
                    'reviews' => 128,
                    'images' => [
                        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1613977257363-3116958f136b?q=80&w=2670&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1593696140826-c58b02198d4a?q=80&w=2670&auto=format&fit=crop',
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop'
                    ],
                    'amenities' => [
                        ['name' => 'High-speed Wifi', 'icon' => 'Wifi'],
                        ['name' => 'Private Hot Tub', 'icon' => 'Bath'],
                        ['name' => 'Indoor Fireplace', 'icon' => 'Flame'],
                        ['name' => 'Fully Equipped Kitchen', 'icon' => 'CookingPot'],
                        ['name' => 'Free Parking on Premises', 'icon' => 'Car'],
                        ['name' => 'Central Air & Heating', 'icon' => 'AirVent']
                    ]
                ];
                
                // Initialize with default data
                $insertSQL = "
                INSERT INTO villa_info (id, name, location, description, rating, reviews, images, amenities, created_at, updated_at) 
                VALUES (1, :name, :location, :description, :rating, :reviews, :images, :amenities, NOW(), NOW())
                ";
                
                $stmt = $db->prepare($insertSQL);
                $stmt->execute([
                    'name' => $defaultData['name'],
                    'location' => $defaultData['location'],
                    'description' => $defaultData['description'],
                    'rating' => $defaultData['rating'],
                    'reviews' => $defaultData['reviews'],
                    'images' => json_encode($defaultData['images']),
                    'amenities' => json_encode($defaultData['amenities'])
                ]);
                
                echo json_encode([
                    'success' => true,
                    'data' => $defaultData
                ]);
            }
            break;
            
        case 'PUT':
        case 'POST':
            // Update villa information
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON data'
                ]);
                break;
            }
            
            // Validate required fields
            $required = ['name', 'description'];
            foreach ($required as $field) {
                if (!isset($input[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => "Missing required field: $field"
                    ]);
                    exit;
                }
            }
            
            // Validate rating
            if ($input['rating'] < 0 || $input['rating'] > 5) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Rating must be between 0 and 5'
                ]);
                break;
            }
            
            // Ensure images and amenities are arrays
            if (!isset($input['images']) || !is_array($input['images'])) {
                $input['images'] = [];
            }
            if (!isset($input['amenities']) || !is_array($input['amenities'])) {
                $input['amenities'] = [];
            }
            
            $query = "UPDATE villa_info SET 
                        name = :name,
                        description = :description,
                        phone = :phone,
                        email = :email,
                        website = :website,
                        address = :address,
                        city = :city,
                        state = :state,
                        postal_code = :postal_code,
                        country = :country,
                        check_in_time = :check_in_time,
                        check_out_time = :check_out_time,
                        currency = :currency,
                        cancellation_policy = :cancellation_policy,
                        house_rules = :house_rules,
                        amenities = :amenities,
                        images = :images,
                        updated_at = NOW()
                      WHERE id = 1";

            $stmt = $db->prepare($query);
            
            $result = $stmt->execute([
                'name' => htmlspecialchars(strip_tags($input['name'])),
                'description' => htmlspecialchars(strip_tags($input['description'])),
                'phone' => htmlspecialchars(strip_tags($input['phone'] ?? '')),
                'email' => htmlspecialchars(strip_tags($input['email'] ?? '')),
                'website' => htmlspecialchars(strip_tags($input['website'] ?? '')),
                'address' => htmlspecialchars(strip_tags($input['address'] ?? '')),
                'city' => htmlspecialchars(strip_tags($input['city'] ?? '')),
                'state' => htmlspecialchars(strip_tags($input['state'] ?? '')),
                'postal_code' => htmlspecialchars(strip_tags($input['zipCode'] ?? '')),
                'country' => htmlspecialchars(strip_tags($input['country'] ?? '')),
                'check_in_time' => htmlspecialchars(strip_tags($input['checkInTime'] ?? '15:00')),
                'check_out_time' => htmlspecialchars(strip_tags($input['checkOutTime'] ?? '11:00')),
                'currency' => htmlspecialchars(strip_tags($input['currency'] ?? 'USD')),
                'cancellation_policy' => htmlspecialchars(strip_tags($input['cancellationPolicy'] ?? '')),
                'house_rules' => htmlspecialchars(strip_tags($input['houseRules'] ?? '')),
                'amenities' => json_encode($input['amenities'] ?? []),
                'images' => json_encode($input['images'] ?? [])
            ]);
            
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