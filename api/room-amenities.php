<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
header("Cache-Control: no-cache, must-revalidate");
header("Expires: " . gmdate('D, d M Y H:i:s', time() - 3600) . ' GMT');
header("X-API-Version: " . time()); // Cache buster

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';

// Production error handling
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

try {
    $pdo = (new Database())->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Since hosting server converts POST to GET, handle actions via URL parameters
    $action = $_GET['action'] ?? 'list';

    switch ($action) {
        case 'add':
            handleAddRoomAmenity($pdo);
            break;
        case 'remove':
            handleRemoveRoomAmenity($pdo);
            break;
        case 'list':
        default:
            handleGetRoomAmenities($pdo);
            break;
    }
    
} catch (Exception $e) {
    error_log("Room Amenities API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}

function handleGetRoomAmenities($pdo) {
    try {
        $roomId = $_GET['room_id'] ?? null;
        
        if ($roomId) {
            // Get amenities for specific room
            $sql = "SELECT 
                ra.id,
                ra.room_id,
                ra.amenity_id,
                a.name as amenity_name,
                a.category as amenity_category,
                a.icon as amenity_icon,
                a.description as amenity_description,
                IF(a.is_featured = 1, true, false) as is_featured,
                IF(a.is_active = 1, true, false) as is_active
                FROM room_amenities ra 
                JOIN amenities a ON ra.amenity_id = a.id 
                WHERE ra.room_id = ? AND a.is_active = 1
                ORDER BY a.name";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$roomId]);
            $amenities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert numeric booleans to actual booleans for JSON
            foreach ($amenities as &$amenity) {
                if (isset($amenity['is_featured'])) {
                    $amenity['is_featured'] = (bool)$amenity['is_featured'];
                }
                if (isset($amenity['is_active'])) {
                    $amenity['is_active'] = (bool)$amenity['is_active'];
                }
            }
            
            echo json_encode([
                'success' => true,
                'room_id' => $roomId,
                'amenities' => $amenities
            ]);
        } else {
            // Get all available amenities for room assignment
            $sql = "SELECT id, name, category, description, icon, 
                       IF(is_featured = 1, true, false) as is_featured, 
                       IF(is_active = 1, true, false) as is_active 
                FROM amenities 
                WHERE is_active = 1 
                ORDER BY category, display_order, name";
            $stmt = $pdo->query($sql);
            $amenities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert numeric booleans to actual booleans for JSON
            foreach ($amenities as &$amenity) {
                if (isset($amenity['is_featured'])) {
                    $amenity['is_featured'] = (bool)$amenity['is_featured'];
                }
                if (isset($amenity['is_active'])) {
                    $amenity['is_active'] = (bool)$amenity['is_active'];
                }
            }
            
            echo json_encode([
                'success' => true,
                'amenities' => $amenities
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Error getting room amenities: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handleAddRoomAmenity($pdo) {
    try {
        // Get parameters from GET since server converts POST to GET
        $roomId = $_GET['room_id'] ?? null;
        $amenityId = $_GET['amenity_id'] ?? null;
        
        if (!$roomId || !$amenityId) {
            throw new Exception("Room ID and Amenity ID are required");
        }
        
        // Check if room exists
        $roomCheck = $pdo->prepare("SELECT id FROM rooms WHERE id = ?");
        $roomCheck->execute([$roomId]);
        if (!$roomCheck->fetchColumn()) {
            throw new Exception("Room not found");
        }
        
        // Check if amenity exists
        $amenityCheck = $pdo->prepare("SELECT id FROM amenities WHERE id = ? AND is_active = 1");
        $amenityCheck->execute([$amenityId]);
        if (!$amenityCheck->fetchColumn()) {
            throw new Exception("Amenity not found or inactive");
        }
        
        // Insert room-amenity relationship (ON DUPLICATE KEY UPDATE for upsert)
        $sql = "INSERT INTO room_amenities (room_id, amenity_id) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE 
                room_id = VALUES(room_id)";
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$roomId, $amenityId]);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Amenity added to room successfully',
                'room_id' => $roomId,
                'amenity_id' => $amenityId,
                'affected_rows' => $stmt->rowCount()
            ]);
        } else {
            throw new Exception("Failed to add amenity to room");
        }
        
    } catch (Exception $e) {
        error_log("Error adding room amenity: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handleRemoveRoomAmenity($pdo) {
    try {
        $roomId = $_GET['room_id'] ?? null;
        $amenityId = $_GET['amenity_id'] ?? null;
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            // Remove by room_amenities ID
            $sql = "DELETE FROM room_amenities WHERE id = ?";
            $params = [$id];
        } elseif ($roomId && $amenityId) {
            // Remove by room_id and amenity_id
            $sql = "DELETE FROM room_amenities WHERE room_id = ? AND amenity_id = ?";
            $params = [$roomId, $amenityId];
        } else {
            throw new Exception("Either ID or both Room ID and Amenity ID are required");
        }
        
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute($params)) {
            echo json_encode([
                'success' => true,
                'message' => 'Amenity removed from room successfully'
            ]);
        } else {
            throw new Exception("Failed to remove amenity from room");
        }
        
    } catch (Exception $e) {
        error_log("Error removing room amenity: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>