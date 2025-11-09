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
            // Get specific room
            $stmt = $db->prepare("SELECT * FROM rooms WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($room) {
                // Decode JSON fields
                if ($room['features']) {
                    $room['features'] = json_decode($room['features'], true);
                }
                if ($room['amenities']) {
                    $room['amenities'] = json_decode($room['amenities'], true);
                }
                if ($room['images']) {
                    $room['images'] = json_decode($room['images'], true);
                }
                echo json_encode(['success' => true, 'data' => $room]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Room not found']);
            }
        } else {
            // Get all rooms
            $stmt = $db->query("SELECT * FROM rooms ORDER BY created_at DESC");
            $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decode JSON fields for all rooms
            foreach ($rooms as &$room) {
                if ($room['features']) {
                    $room['features'] = json_decode($room['features'], true);
                }
                if ($room['amenities']) {
                    $room['amenities'] = json_decode($room['amenities'], true);
                }
                if ($room['images']) {
                    $room['images'] = json_decode($room['images'], true);
                }
            }
            
            echo json_encode(['success' => true, 'data' => $rooms]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handlePost($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['name']) || !isset($input['price'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Name and price are required']);
            return;
        }
        
        // Generate ID from name
        $id = strtolower(str_replace(' ', '-', preg_replace('/[^a-zA-Z0-9\s]/', '', $input['name'])));
        
        $stmt = $db->prepare("
            INSERT INTO rooms (id, name, type, price, capacity, description, size, beds, 
                             features, amenities, images, available) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $features = isset($input['features']) ? json_encode($input['features']) : '[]';
        $amenities = isset($input['amenities']) ? json_encode($input['amenities']) : '[]';
        $images = isset($input['images']) ? json_encode($input['images']) : '[]';
        
        $stmt->execute([
            $id,
            $input['name'],
            $input['type'] ?? 'Standard',
            $input['price'],
            $input['capacity'] ?? 2,
            $input['description'] ?? '',
            $input['size'] ?? '',
            $input['beds'] ?? '',
            $features,
            $amenities,
            $images,
            $input['available'] ?? 1
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
            echo json_encode(['success' => false, 'error' => 'Room ID is required']);
            return;
        }
        
        $stmt = $db->prepare("
            UPDATE rooms SET 
                name = ?, type = ?, price = ?, capacity = ?, description = ?, 
                size = ?, beds = ?, features = ?, amenities = ?, images = ?, 
                available = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        $features = isset($input['features']) ? json_encode($input['features']) : '[]';
        $amenities = isset($input['amenities']) ? json_encode($input['amenities']) : '[]';
        $images = isset($input['images']) ? json_encode($input['images']) : '[]';
        
        $stmt->execute([
            $input['name'],
            $input['type'] ?? 'Standard',
            $input['price'],
            $input['capacity'] ?? 2,
            $input['description'] ?? '',
            $input['size'] ?? '',
            $input['beds'] ?? '',
            $features,
            $amenities,
            $images,
            $input['available'] ?? 1,
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
            echo json_encode(['success' => false, 'error' => 'Room ID is required']);
            return;
        }
        
        $stmt = $db->prepare("DELETE FROM rooms WHERE id = ?");
        $stmt->execute([$input['id']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'data' => ['deleted' => true]]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Room not found']);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>