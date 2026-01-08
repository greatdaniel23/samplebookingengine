<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Enable error logging for debugging
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Log the request for debugging
    error_log("API Request: $method " . $_SERVER['REQUEST_URI'] ?? 'N/A');
    
    switch ($method) {
        case 'GET':
            handleGet($db);
            break;
        case 'POST':
            handlePost($db);
            break;
        case 'PUT':
            handlePut($db);
            break;
        case 'DELETE':
            handleDelete($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    // Log detailed error information
    error_log("API Error: " . $e->getMessage() . " in " . $e->getFile() . " line " . $e->getLine());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage(),
        'debug' => [
            'file' => basename($e->getFile()),
            'line' => $e->getLine(),
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'N/A'
        ]
    ]);
}

function handleGet($db) {
    try {
        if (isset($_GET['action']) && $_GET['action'] === 'types') {
            // Get package types with counts
            $stmt = $db->query("SELECT package_type, COUNT(*) as count FROM packages GROUP BY package_type ORDER BY package_type");
            $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $types]);
        } elseif (isset($_GET['action']) && $_GET['action'] === 'check_availability') {
            // Check room availability for package
            if (!isset($_GET['id']) || !isset($_GET['checkin']) || !isset($_GET['checkout'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing required parameters: id, checkin, checkout']);
                return;
            }
            
            $packageId = $_GET['id'];
            $checkin = $_GET['checkin'];
            $checkout = $_GET['checkout'];
            
            // Calculate nights
            $checkinDate = new DateTime($checkin);
            $checkoutDate = new DateTime($checkout);
            $nights = $checkinDate->diff($checkoutDate)->days;
            
            // Get package with room options
            $stmt = $db->prepare("
                SELECT p.*, pr.room_id, pr.price_adjustment, pr.adjustment_type, r.name as room_name
                FROM packages p
                LEFT JOIN package_rooms pr ON p.id = pr.package_id AND pr.is_active = 1
                LEFT JOIN rooms r ON pr.room_id = r.id
                WHERE p.id = ?
                ORDER BY pr.availability_priority ASC, pr.is_default DESC
            ");
            $stmt->execute([$packageId]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($results)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Package not found']);
                return;
            }
            
            $package = $results[0];
            $availableRooms = [];
            
            foreach ($results as $row) {
                if ($row['room_id']) {
                    // Check room availability (simplified - you may need more complex logic)
                    $available = true; // Implement your availability logic here
                    
                    // Calculate final price
                    $basePrice = floatval($package['price']);
                    $adjustment = floatval($row['price_adjustment']);
                    
                    if ($row['adjustment_type'] === 'percentage') {
                        $finalPrice = $basePrice * (1 + $adjustment / 100);
                    } else {
                        $finalPrice = $basePrice + $adjustment;
                    }
                    
                    $totalPrice = $finalPrice * $nights;
                    
                    $availableRooms[] = [
                        'room_id' => $row['room_id'],
                        'room_name' => $row['room_name'],
                        'available' => $available,
                        'price_per_night' => $finalPrice,
                        'total_price' => $totalPrice
                    ];
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'package_id' => intval($packageId),
                    'checkin' => $checkin,
                    'checkout' => $checkout,
                    'nights' => $nights,
                    'available_rooms' => $availableRooms
                ]
            ]);
        } elseif (isset($_GET['id'])) {
            // Get specific package
            $includeRooms = isset($_GET['include_rooms']) && $_GET['include_rooms'] === 'true';
            
            if ($includeRooms) {
                // Get package with room options
                $stmt = $db->prepare("
                    SELECT p.*, 
                           pr.room_id, pr.is_default, pr.price_adjustment, pr.adjustment_type,
                           pr.max_occupancy_override, pr.availability_priority, pr.description as room_description,
                           r.name as room_name, r.capacity as room_max_occupancy
                    FROM packages p
                    LEFT JOIN package_rooms pr ON p.id = pr.package_id AND pr.is_active = 1
                    LEFT JOIN rooms r ON pr.room_id = r.id
                    WHERE p.id = ?
                    ORDER BY pr.availability_priority ASC, pr.is_default DESC
                ");
                $stmt->execute([$_GET['id']]);
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (empty($results)) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Package not found']);
                    return;
                }
                
                $package = $results[0];
                $availableRooms = [];
                
                foreach ($results as $row) {
                    if ($row['room_id']) {
                        // Calculate final price
                        $basePrice = floatval($package['price']);
                        $adjustment = floatval($row['price_adjustment']);
                        
                        if ($row['adjustment_type'] === 'percentage') {
                            $finalPrice = $basePrice * (1 + $adjustment / 100);
                        } else {
                            $finalPrice = $basePrice + $adjustment;
                        }
                        
                        $availableRooms[] = [
                            'room_id' => $row['room_id'],
                            'room_name' => $row['room_name'],
                            'is_default' => (bool)$row['is_default'],
                            'price_adjustment' => floatval($row['price_adjustment']),
                            'final_price' => $finalPrice,
                            'adjustment_type' => $row['adjustment_type'],
                            'max_occupancy' => intval($row['max_occupancy_override'] ?? $row['room_max_occupancy']),
                            'availability_priority' => intval($row['availability_priority']),
                            'description' => $row['room_description']
                        ];
                    }
                }
                
                // Remove room-related fields from main package data
                unset($package['room_id'], $package['is_default'], $package['price_adjustment'], 
                      $package['adjustment_type'], $package['max_occupancy_override'], 
                      $package['availability_priority'], $package['room_description'],
                      $package['room_name'], $package['room_max_occupancy']);
                
                $package['available_rooms'] = $availableRooms;
            } else {
                // Get package without room details
                $stmt = $db->prepare("SELECT * FROM packages WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $package = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            if ($package) {
                // Decode JSON fields (handle both 'includes' and 'inclusions')
                if (isset($package['includes']) && $package['includes']) {
                    $decoded = json_decode($package['includes'], true);
                    $package['inclusions'] = is_array($decoded) ? $decoded : [];
                    $package['includes'] = $package['inclusions']; // For backward compatibility
                }
                
                if (isset($package['inclusions']) && $package['inclusions'] && !is_array($package['inclusions'])) {
                    $decoded = json_decode($package['inclusions'], true);
                    $package['inclusions'] = is_array($decoded) ? $decoded : [];
                }
                
                if (isset($package['exclusions']) && $package['exclusions'] && !is_array($package['exclusions'])) {
                    $decoded = json_decode($package['exclusions'], true);
                    $package['exclusions'] = is_array($decoded) ? $decoded : [];
                }
                
                if (isset($package['images']) && $package['images'] && !is_array($package['images'])) {
                    $decoded = json_decode($package['images'], true);
                    $package['images'] = is_array($decoded) ? $decoded : [];
                }
                
                // Get package amenities
                $amenitiesStmt = $db->prepare("
                    SELECT a.id, a.name, a.description, a.category, a.icon, a.is_featured, 
                           pa.is_highlighted, pa.custom_note 
                    FROM amenities a 
                    JOIN package_amenities pa ON a.id = pa.amenity_id 
                    WHERE pa.package_id = ? AND a.is_active = 1 
                    ORDER BY pa.is_highlighted DESC, a.category, a.display_order, a.name
                ");
                $amenitiesStmt->execute([$package['id']]);
                $package['amenities'] = $amenitiesStmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $package]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Package not found']);
            }
        } else {
            // Get all packages with optional date filtering
            $checkIn = $_GET['check_in'] ?? null;
            $checkOut = $_GET['check_out'] ?? null;
            
            if ($checkIn && $checkOut) {
                // Filter packages by room availability for specified dates
                $stmt = $db->prepare("
                    SELECT DISTINCT p.* 
                    FROM packages p
                    JOIN package_rooms pr ON p.id = pr.package_id
                    JOIN rooms r ON pr.room_id = r.id
                    WHERE p.is_active = 1 
                    AND (p.valid_from IS NULL OR p.valid_from <= :check_in)
                    AND (p.valid_until IS NULL OR p.valid_until >= :check_out)
                    AND r.id NOT IN (
                        SELECT DISTINCT b.room_id 
                        FROM bookings b 
                        WHERE b.room_id = r.id 
                        AND b.status NOT IN ('cancelled', 'no_show')
                        AND NOT (b.check_out <= :check_in OR b.check_in >= :check_out)
                    )
                    ORDER BY p.created_at DESC
                ");
                $stmt->execute([
                    'check_in' => $checkIn,
                    'check_out' => $checkOut
                ]);
                $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                // Get all packages without date filtering
                $stmt = $db->query("SELECT * FROM packages WHERE is_active = 1 ORDER BY created_at DESC");
                $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            // Decode JSON fields for all packages (handle both 'includes' and 'inclusions')
            foreach ($packages as &$package) {
                // Handle 'includes' field from database
                if (isset($package['includes']) && $package['includes']) {
                    $decoded = json_decode($package['includes'], true);
                    $package['inclusions'] = is_array($decoded) ? $decoded : [];
                    $package['includes'] = $package['inclusions']; // For backward compatibility
                }
                
                // Handle legacy 'inclusions' field if it exists
                if (isset($package['inclusions']) && $package['inclusions'] && !is_array($package['inclusions'])) {
                    $decoded = json_decode($package['inclusions'], true);
                    $package['inclusions'] = is_array($decoded) ? $decoded : [];
                }
                
                // Handle exclusions
                if (isset($package['exclusions']) && $package['exclusions'] && !is_array($package['exclusions'])) {
                    $decoded = json_decode($package['exclusions'], true);
                    $package['exclusions'] = is_array($decoded) ? $decoded : [];
                }
                
                // Handle images
                if (isset($package['images']) && $package['images'] && !is_array($package['images'])) {
                    $decoded = json_decode($package['images'], true);
                    $package['images'] = is_array($decoded) ? $decoded : [];
                }
                
                // Get package amenities
                $amenitiesStmt = $db->prepare("
                    SELECT a.id, a.name, a.description, a.category, a.icon, a.is_featured, 
                           pa.is_highlighted, pa.custom_note 
                    FROM amenities a 
                    JOIN package_amenities pa ON a.id = pa.amenity_id 
                    WHERE pa.package_id = ? AND a.is_active = 1 
                    ORDER BY pa.is_highlighted DESC, a.category, a.display_order, a.name
                ");
                $amenitiesStmt->execute([$package['id']]);
                $package['amenities'] = $amenitiesStmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode(['success' => true, 'data' => $packages]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handlePost($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['name']) || (!isset($input['price']) && !isset($input['base_price']))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Name and price are required']);
            return;
        }
        
        $stmt = $db->prepare("
            INSERT INTO packages (name, description, package_type, base_price, max_guests, min_nights, max_nights,
                                discount_percentage, is_active, includes, exclusions, images, valid_from, valid_until, 
                                terms_conditions, available, featured, base_room_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $includes = isset($input['inclusions']) ? json_encode($input['inclusions']) : 
                   (isset($input['includes']) ? json_encode($input['includes']) : null);
        $exclusions = isset($input['exclusions']) ? json_encode($input['exclusions']) : null;
        $images = isset($input['images']) ? json_encode($input['images']) : null;
        $packageType = $input['type'] ?? $input['package_type'] ?? 'Standard';
        
        $stmt->execute([
            $input['name'],
            $input['description'] ?? '',
            $packageType,
            $input['price'] ?? $input['base_price'] ?? 0, // Support both field names
            $input['max_guests'] ?? 2,
            $input['min_nights'] ?? $input['duration_days'] ?? 1, // Map duration_days to min_nights
            $input['max_nights'] ?? 30,
            $input['discount_percentage'] ?? 0,
            $input['is_active'] ?? 1,
            $includes,
            $exclusions,
            $images,
            $input['valid_from'] ?? null,
            $input['valid_until'] ?? null,
            $input['terms_conditions'] ?? $input['terms'] ?? null,
            $input['available'] ?? 1,
            $input['featured'] ?? 0,
            $input['base_room_id'] ?? null
        ]);
        
        $lastInsertId = $db->lastInsertId();
        
        echo json_encode(['success' => true, 'data' => ['id' => $lastInsertId]]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handlePut($db) {
    try {
        // Get and validate input
        $rawInput = file_get_contents('php://input');
        error_log("PUT Raw Input: " . $rawInput);
        
        $input = json_decode($rawInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON: ' . json_last_error_msg()]);
            return;
        }
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Package ID is required', 'received_data' => $input]);
            return;
        }
        
        // Validate package exists
        $checkStmt = $db->prepare("SELECT id FROM packages WHERE id = ?");
        $checkStmt->execute([$input['id']]);
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Package not found', 'id' => $input['id']]);
            return;
        }
        
        // Use correct column names from database schema - UPDATE ALL EXISTING FIELDS
        $stmt = $db->prepare("
            UPDATE packages SET 
                name = ?, description = ?, package_type = ?, base_price = ?, 
                max_guests = ?, is_active = ?, includes = ?, exclusions = ?, 
                min_nights = ?, max_nights = ?, discount_percentage = ?,
                images = ?, valid_from = ?, valid_until = ?, 
                terms_conditions = ?, base_room_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        // Handle different field name variations from frontend with proper mapping
        $packageType = $input['package_type'] ?? $input['type'] ?? 'Standard';
        $basePrice = $input['base_price'] ?? $input['price'] ?? 0;
        $isActive = $input['is_active'] ?? ($input['available'] ? 1 : 0) ?? 1;
        // Handle JSON fields properly - ensure valid JSON or NULL
        $includes = null;
        if (isset($input['includes'])) {
            if (is_string($input['includes'])) {
                $input['includes'] = trim($input['includes']);
                if ($input['includes'] !== '' && $input['includes'] !== '[]') {
                    // Validate JSON string
                    json_decode($input['includes']);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $includes = $input['includes'];
                    } else {
                        error_log("Invalid JSON in includes: " . $input['includes']);
                        $includes = null;
                    }
                }
            } elseif (is_array($input['includes']) && count($input['includes']) > 0) {
                $includes = json_encode($input['includes']);
            }
        } elseif (isset($input['inclusions'])) {
            if (is_string($input['inclusions'])) {
                $input['inclusions'] = trim($input['inclusions']);
                if ($input['inclusions'] !== '' && $input['inclusions'] !== '[]') {
                    json_decode($input['inclusions']);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $includes = $input['inclusions'];
                    } else {
                        $includes = null;
                    }
                }
            } elseif (is_array($input['inclusions']) && count($input['inclusions']) > 0) {
                $includes = json_encode($input['inclusions']);
            }
        }
        
        $exclusions = null;
        if (isset($input['exclusions'])) {
            if (is_string($input['exclusions'])) {
                $input['exclusions'] = trim($input['exclusions']);
                if ($input['exclusions'] !== '' && $input['exclusions'] !== '[]') {
                    // Validate JSON string
                    json_decode($input['exclusions']);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $exclusions = $input['exclusions'];
                    } else {
                        error_log("Invalid JSON in exclusions: " . $input['exclusions']);
                        $exclusions = null;
                    }
                }
            } elseif (is_array($input['exclusions']) && count($input['exclusions']) > 0) {
                $exclusions = json_encode($input['exclusions']);
            }
            // If empty array or empty string, leave as null
        }
        
        $images = null;
        if (isset($input['images'])) {
            if (is_string($input['images'])) {
                $input['images'] = trim($input['images']);
                if ($input['images'] !== '' && $input['images'] !== '[]') {
                    // Validate JSON string
                    json_decode($input['images']);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $images = $input['images'];
                    } else {
                        error_log("Invalid JSON in images: " . $input['images']);
                        $images = null;
                    }
                }
            } elseif (is_array($input['images']) && count($input['images']) > 0) {
                $images = json_encode($input['images']);
            }
        }
        $minNights = $input['min_nights'] ?? $input['duration_days'] ?? 1;
        $maxNights = $input['max_nights'] ?? 30;
        $discountPercentage = $input['discount_percentage'] ?? 0;
        $validFrom = (!empty($input['valid_from'])) ? $input['valid_from'] : null;
        $validUntil = (!empty($input['valid_until'])) ? $input['valid_until'] : null;
        $termsConditions = $input['terms_conditions'] ?? null;
        $baseRoomId = $input['base_room_id'] ?? null;
        
        error_log("PUT Update Data: " . json_encode([
            'package_type' => $packageType,
            'base_price' => $basePrice,
            'is_active' => $isActive,
            'includes' => $includes,
            'exclusions' => $exclusions,
            'images' => $images,
            'min_nights' => $minNights,
            'base_room_id' => $baseRoomId
        ]));
        
        // Prepare parameters array
        $params = [
            $input['name'] ?? '',
            $input['description'] ?? '',
            $packageType,
            $basePrice,
            $input['max_guests'] ?? 2,
            $isActive,
            $includes,
            $exclusions,
            $minNights,
            $maxNights,
            $discountPercentage,
            $images,
            $validFrom,
            $validUntil,
            $termsConditions,
            $baseRoomId,
            $input['id']
        ];
        
        error_log("PUT Parameters: " . json_encode($params));
        
        $result = $stmt->execute($params);
        
        if ($result) {
            $affectedRows = $stmt->rowCount();
            error_log("PUT Success: Package {$input['id']} updated, affected rows: $affectedRows");
            
            echo json_encode([
                'success' => true, 
                'data' => [
                    'updated' => true, 
                    'affected_rows' => $affectedRows,
                    'id' => $input['id']
                ]
            ]);
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("PUT Failed: " . json_encode($errorInfo));
            
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'error' => 'Failed to update package',
                'sql_error' => $errorInfo
            ]);
        }
        
    } catch (PDOException $e) {
        error_log("PUT PDO Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'error' => 'Database error: ' . $e->getMessage(),
            'code' => $e->getCode()
        ]);
    } catch (Exception $e) {
        error_log("PUT General Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'error' => 'Server error: ' . $e->getMessage()
        ]);
    }
}

function handleDelete($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Package ID is required']);
            return;
        }
        
        $stmt = $db->prepare("DELETE FROM packages WHERE id = ?");
        $stmt->execute([$input['id']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'data' => ['deleted' => true]]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Package not found']);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>