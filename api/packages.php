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
            $stmt = $db->query("SELECT type as package_type, COUNT(*) as count FROM packages GROUP BY type ORDER BY type");
            $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $types]);
        } elseif (isset($_GET['id'])) {
            // Get specific package
            $stmt = $db->prepare("SELECT * FROM packages WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $package = $stmt->fetch(PDO::FETCH_ASSOC);
            
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
                echo json_encode(['success' => true, 'data' => $package]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Package not found']);
            }
        } else {
            // Get all packages
            $stmt = $db->query("SELECT * FROM packages ORDER BY created_at DESC");
            $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
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