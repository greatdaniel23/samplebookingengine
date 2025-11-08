<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
            $required = ['name', 'location', 'description', 'rating', 'reviews'];
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
                        location = :location,
                        description = :description,
                        rating = :rating,
                        reviews = :reviews,
                        images = :images,
                        amenities = :amenities,
                        updated_at = NOW()
                      WHERE id = 1";

            $stmt = $db->prepare($query);
            
            $result = $stmt->execute([
                'name' => htmlspecialchars(strip_tags($input['name'])),
                'location' => htmlspecialchars(strip_tags($input['location'])),
                'description' => htmlspecialchars(strip_tags($input['description'])),
                'rating' => floatval($input['rating']),
                'reviews' => intval($input['reviews']),
                'images' => json_encode($input['images']),
                'amenities' => json_encode($input['amenities'])
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