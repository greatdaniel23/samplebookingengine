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
        if (isset($_GET['id'])) {
            // Get specific package
            $stmt = $db->prepare("SELECT * FROM packages WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $package = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($package) {
                // Decode JSON includes
                if ($package['includes']) {
                    $package['includes'] = json_decode($package['includes'], true);
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
            
            // Decode JSON includes for all packages
            foreach ($packages as &$package) {
                if ($package['includes']) {
                    $package['includes'] = json_decode($package['includes'], true);
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
        
        if (!$input || !isset($input['name']) || !isset($input['base_price'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Name and base_price are required']);
            return;
        }
        
        // Generate ID from name
        $id = strtolower(str_replace(' ', '-', preg_replace('/[^a-zA-Z0-9\s]/', '', $input['name'])));
        
        $stmt = $db->prepare("
            INSERT INTO packages (id, name, description, package_type, base_price, discount_percentage, 
                                min_nights, max_nights, max_guests, is_active, includes, valid_from, valid_until, terms, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $includes = isset($input['includes']) ? json_encode($input['includes']) : '[]';
        $packageType = strtolower($input['package_type'] ?? 'business');
        
        $stmt->execute([
            $id,
            $input['name'],
            $input['description'] ?? '',
            $packageType,
            $input['base_price'],
            $input['discount_percentage'] ?? 0,
            $input['min_nights'] ?? 1,
            $input['max_nights'] ?? 30,
            $input['max_guests'] ?? 2,
            $input['is_active'] ?? 1,
            $includes,
            $input['valid_from'] ?? date('Y-m-d'),
            $input['valid_until'] ?? date('Y-m-d', strtotime('+1 year')),
            $input['terms'] ?? '',
            $input['image_url'] ?? ''
        ]);
        
        echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        
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
                name = ?, description = ?, package_type = ?, base_price = ?, 
                discount_percentage = ?, min_nights = ?, max_nights = ?, 
                max_guests = ?, is_active = ?, includes = ?, valid_from = ?, 
                valid_until = ?, terms = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        $includes = isset($input['includes']) ? json_encode($input['includes']) : '[]';
        $packageType = strtolower($input['package_type'] ?? 'business');
        
        $stmt->execute([
            $input['name'],
            $input['description'] ?? '',
            $packageType,
            $input['base_price'],
            $input['discount_percentage'] ?? 0,
            $input['min_nights'] ?? 1,
            $input['max_nights'] ?? 30,
            $input['max_guests'] ?? 2,
            $input['is_active'] ?? 1,
            $includes,
            $input['valid_from'] ?? date('Y-m-d'),
            $input['valid_until'] ?? date('Y-m-d', strtotime('+1 year')),
            $input['terms'] ?? '',
            $input['image_url'] ?? '',
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