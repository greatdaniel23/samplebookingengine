<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

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
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
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
                // Decode JSON inclusions and exclusions
                if ($package['inclusions']) {
                    $package['inclusions'] = json_decode($package['inclusions'], true);
                }
                if ($package['exclusions']) {
                    $package['exclusions'] = json_decode($package['exclusions'], true);
                }
                if ($package['images']) {
                    $package['images'] = json_decode($package['images'], true);
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
            
            // Decode JSON inclusions for all packages
            foreach ($packages as &$package) {
                if ($package['inclusions']) {
                    $package['inclusions'] = json_decode($package['inclusions'], true);
                }
                if ($package['exclusions']) {
                    $package['exclusions'] = json_decode($package['exclusions'], true);
                }
                if ($package['images']) {
                    $package['images'] = json_decode($package['images'], true);
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
            INSERT INTO packages (name, description, type, price, duration_days, max_guests, 
                                available, inclusions, exclusions, images, valid_from, valid_until, terms_conditions) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $inclusions = isset($input['inclusions']) ? json_encode($input['inclusions']) : null;
        $exclusions = isset($input['exclusions']) ? json_encode($input['exclusions']) : null;
        $images = isset($input['images']) ? json_encode($input['images']) : null;
        $packageType = $input['type'] ?? $input['package_type'] ?? 'Romance';
        
        $stmt->execute([
            $input['name'],
            $input['description'] ?? '',
            $packageType,
            $input['price'] ?? $input['base_price'], // Support both field names
            $input['duration_days'] ?? 1,
            $input['max_guests'] ?? 2,
            $input['available'] ?? $input['is_active'] ?? 1,
            $inclusions,
            $exclusions,
            $images,
            $input['valid_from'] ?? date('Y-m-d'),
            $input['valid_until'] ?? date('Y-m-d', strtotime('+1 year')),
            $input['terms_conditions'] ?? $input['terms'] ?? ''
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
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Package ID is required']);
            return;
        }
        
        $stmt = $db->prepare("
            UPDATE packages SET 
                name = ?, description = ?, type = ?, price = ?, 
                duration_days = ?, max_guests = ?, available = ?, inclusions = ?, 
                exclusions = ?, images = ?, valid_from = ?, valid_until = ?, terms_conditions = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        $inclusions = isset($input['inclusions']) ? json_encode($input['inclusions']) : null;
        $exclusions = isset($input['exclusions']) ? json_encode($input['exclusions']) : null;
        $images = isset($input['images']) ? json_encode($input['images']) : null;
        $packageType = $input['type'] ?? $input['package_type'] ?? 'Romance';
        
        $stmt->execute([
            $input['name'],
            $input['description'] ?? '',
            $packageType,
            $input['price'] ?? $input['base_price'], // Support both field names
            $input['duration_days'] ?? 1,
            $input['max_guests'] ?? 2,
            $input['available'] ?? $input['is_active'] ?? 1,
            $inclusions,
            $exclusions,
            $images,
            $input['valid_from'] ?? date('Y-m-d'),
            $input['valid_until'] ?? date('Y-m-d', strtotime('+1 year')),
            $input['terms_conditions'] ?? $input['terms'] ?? '',
            $input['id']
        ]);
        
        echo json_encode(['success' => true, 'data' => ['updated' => true]]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
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