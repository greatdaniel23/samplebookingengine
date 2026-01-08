<?php
/**
 * Room Image Management API
 * 
 * Handles image assignment for rooms using the existing image gallery system
 * 
 * Endpoints:
 * GET /room-images.php?room_id=123 - Get room's current image
 * POST /room-images.php - Assign image to room
 * PUT /room-images.php?room_id=123 - Update room image
 * DELETE /room-images.php?room_id=123 - Remove room image
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Use local database for development
if (file_exists('config/database-local.php') && 
    ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) {
    require_once 'config/database-local.php';
} else {
    require_once 'config/database.php';
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Configuration
$config = [
    'allowed_folders' => ['hero', 'packages', 'amenities', 'ui', 'uploads'],
    'base_image_path' => '../images',
    'max_image_path_length' => 500
];

// Helper function to validate image path
function validateImagePath($imagePath, $imageFolder, $config) {
    // Check if folder is allowed
    if (!in_array($imageFolder, $config['allowed_folders'])) {
        return ['valid' => false, 'error' => 'Invalid image folder'];
    }
    
    // Check path length
    if (strlen($imagePath) > $config['max_image_path_length']) {
        return ['valid' => false, 'error' => 'Image path too long'];
    }
    
    // Check if path looks safe (basic validation)
    if (strpos($imagePath, '..') !== false || strpos($imagePath, '//') !== false) {
        return ['valid' => false, 'error' => 'Invalid image path format'];
    }
    
    return ['valid' => true];
}

// Helper function to build full image URL
function buildImageUrl($imagePath) {
    if (empty($imagePath)) {
        return null;
    }
    
    // Images are hosted on main domain with direct /images/ path
    return 'https://rumahdaisycantik.com/images/' . $imagePath;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get room's current image
            $roomId = $_GET['room_id'] ?? null;
            
            if (!$roomId) {
                throw new Exception('Room ID is required');
            }
            
            $stmt = $db->prepare("
                SELECT id, name, room_image, image_folder, image_selected_at, image_selected_by 
                FROM rooms 
                WHERE id = ?
            ");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$room) {
                throw new Exception('Room not found');
            }
            
            $response = [
                'success' => true,
                'room_id' => $room['id'],
                'room_name' => $room['name'],
                'image_path' => $room['room_image'],
                'image_folder' => $room['image_folder'],
                'image_url' => buildImageUrl($room['room_image']),
                'selected_at' => $room['image_selected_at'],
                'selected_by' => $room['image_selected_by']
            ];
            
            echo json_encode($response);
            break;
            
        case 'POST':
            // Assign image to room
            $input = json_decode(file_get_contents('php://input'), true);
            
            $roomId = $input['room_id'] ?? null;
            $imagePath = $input['image_path'] ?? null;
            $imageFolder = $input['image_folder'] ?? null;
            $selectedBy = $input['selected_by'] ?? 'admin';
            
            if (!$roomId || !$imagePath || !$imageFolder) {
                throw new Exception('Room ID, image path, and image folder are required');
            }
            
            // Validate image path
            $validation = validateImagePath($imagePath, $imageFolder, $config);
            if (!$validation['valid']) {
                throw new Exception($validation['error']);
            }
            
            // Check if room exists
            $stmt = $db->prepare("SELECT id, name FROM rooms WHERE id = ?");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$room) {
                throw new Exception('Room not found');
            }
            
            // Update room with image
            $stmt = $db->prepare("
                UPDATE rooms 
                SET room_image = ?, 
                    image_folder = ?, 
                    image_selected_at = CURRENT_TIMESTAMP,
                    image_selected_by = ?
                WHERE id = ?
            ");
            $stmt->execute([$imagePath, $imageFolder, $selectedBy, $roomId]);
            
            // Log usage (optional tracking)
            $stmt = $db->prepare("
                INSERT INTO room_image_usage 
                (room_id, image_path, image_folder, assigned_by, is_active) 
                VALUES (?, ?, ?, ?, 1)
            ");
            $stmt->execute([$roomId, $imagePath, $imageFolder, $selectedBy]);
            
            $response = [
                'success' => true,
                'message' => 'Image assigned successfully',
                'room_id' => $roomId,
                'room_name' => $room['name'],
                'image_path' => $imagePath,
                'image_folder' => $imageFolder,
                'image_url' => buildImageUrl($imagePath)
            ];
            
            echo json_encode($response);
            break;
            
        case 'PUT':
            // Update room image (same as POST but for existing images)
            $roomId = $_GET['room_id'] ?? null;
            $input = json_decode(file_get_contents('php://input'), true);
            
            $imagePath = $input['image_path'] ?? null;
            $imageFolder = $input['image_folder'] ?? null;
            $selectedBy = $input['selected_by'] ?? 'admin';
            
            if (!$roomId || !$imagePath || !$imageFolder) {
                throw new Exception('Room ID, image path, and image folder are required');
            }
            
            // Validate image path
            $validation = validateImagePath($imagePath, $imageFolder, $config);
            if (!$validation['valid']) {
                throw new Exception($validation['error']);
            }
            
            // Check if room exists
            $stmt = $db->prepare("SELECT id, name FROM rooms WHERE id = ?");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$room) {
                throw new Exception('Room not found');
            }
            
            // Update room with new image
            $stmt = $db->prepare("
                UPDATE rooms 
                SET room_image = ?, 
                    image_folder = ?, 
                    image_selected_at = CURRENT_TIMESTAMP,
                    image_selected_by = ?
                WHERE id = ?
            ");
            $stmt->execute([$imagePath, $imageFolder, $selectedBy, $roomId]);
            
            $response = [
                'success' => true,
                'message' => 'Image updated successfully',
                'room_id' => $roomId,
                'room_name' => $room['name'],
                'image_path' => $imagePath,
                'image_folder' => $imageFolder,
                'image_url' => buildImageUrl($imagePath)
            ];
            
            echo json_encode($response);
            break;
            
        case 'DELETE':
            // Remove room image
            $roomId = $_GET['room_id'] ?? null;
            
            if (!$roomId) {
                throw new Exception('Room ID is required');
            }
            
            // Check if room exists
            $stmt = $db->prepare("SELECT id, name, room_image FROM rooms WHERE id = ?");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$room) {
                throw new Exception('Room not found');
            }
            
            // Remove image from room
            $stmt = $db->prepare("
                UPDATE rooms 
                SET room_image = NULL, 
                    image_folder = NULL, 
                    image_selected_at = NULL,
                    image_selected_by = NULL
                WHERE id = ?
            ");
            $stmt->execute([$roomId]);
            
            // Mark usage as inactive
            $stmt = $db->prepare("
                UPDATE room_image_usage 
                SET is_active = 0 
                WHERE room_id = ? AND is_active = 1
            ");
            $stmt->execute([$roomId]);
            
            $response = [
                'success' => true,
                'message' => 'Image removed successfully',
                'room_id' => $roomId,
                'room_name' => $room['name']
            ];
            
            echo json_encode($response);
            break;
            
        default:
            throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>