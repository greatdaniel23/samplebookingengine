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

// Room image configuration for CONFIRMED working structure
class RoomImageHelper {
    private static $base_image_url = 'https://rumahdaisycantik.com/images/rooms';
    private static $discovered_folders = null;
    
    public static function discoverAvailableFolders() {
        if (self::$discovered_folders !== null) {
            return self::$discovered_folders;
        }
        
        // Use local image scanner (CONFIRMED working structure)
        $base_url = '';
        if (isset($_SERVER['REQUEST_SCHEME']) && isset($_SERVER['HTTP_HOST'])) {
            $base_url = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);
        }
        // Point to confirmed working scanner
        $scanner_url = $base_url . '/image-scanner.php?action=folders&basePath=../images/rooms';
        
        $folders_data = null;
        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $scanner_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $response = curl_exec($ch);
            curl_close($ch);
            $folders_data = json_decode($response, true);
        }
        
        if ($folders_data && $folders_data['success'] && !empty($folders_data['folders'])) {
            self::$discovered_folders = $folders_data['folders'];
        } else {
            // Fallback: return empty array or scan local if possible
            self::$discovered_folders = [];
            // Log debug info for troubleshooting
            error_log('RoomImageHelper: Failed to discover folders. Scanner URL: ' . $scanner_url . ', Response: ' . json_encode($folders_data));
        }
        
        return self::$discovered_folders;
    }
    
    public static function getRoomImageFolder($room_type) {
        $available_folders = self::discoverAvailableFolders();
        
        if (empty($available_folders)) {
            // No folders discovered, use root rooms folder
            return '';
        }
        
        $type_lower = strtolower($room_type ?? '');
        
        // Direct matching with discovered folder names
        foreach ($available_folders as $folder) {
            $folder_lower = strtolower($folder);
            if (strpos($type_lower, $folder_lower) !== false || strpos($folder_lower, $type_lower) !== false) {
                return $folder;
            }
        }
        
        // If no match, return first available Villa folder
        foreach ($available_folders as $folder) {
            if (strpos($folder, 'Villa') === 0) {
                return $folder;
            }
        }
        
        return $available_folders[0] ?? '';
    }
    
    public static function buildImageUrl($folder, $filename) {
        if (empty($folder)) {
            // Images directly in rooms folder
            return self::$base_image_url . '/' . $filename;
        }
        return self::$base_image_url . '/' . $folder . '/' . $filename;
    }
    
    public static function getAllRoomCategories() {
        $folders = self::discoverAvailableFolders();
        
        $categories = [];
        foreach ($folders as $folder) {
            // Format folder name for display
            $display_name = ucwords(str_replace(['-', '_'], ' ', $folder));
            $categories[$folder] = $display_name;
        }
        
        return $categories;
    }
    
    public static function processRoomImages($room) {
        // Handle new room_images JSON column
        $images = [];
        
        if (isset($room['room_images']) && !empty($room['room_images'])) {
            // New JSON format
            $room_images = is_string($room['room_images']) ? json_decode($room['room_images'], true) : $room['room_images'];
            if ($room_images && is_array($room_images)) {
                $images = $room_images;
            }
        } elseif (isset($room['images']) && !empty($room['images'])) {
            // Legacy images column
            $legacy_images = is_string($room['images']) ? json_decode($room['images'], true) : $room['images'];
            if ($legacy_images && is_array($legacy_images)) {
                $images = $legacy_images;
            }
        }
        
        if (empty($images)) {
            // If no images in new format, check legacy single image
            if (!empty($room['room_image'])) {
                $folder = $room['image_folder'] ?? self::getRoomImageFolder($room['type'] ?? 'standard');
                $images = [[
                    'filename' => $room['room_image'],
                    'folder' => $folder,
                    'is_primary' => true,
                    'caption' => 'Primary image for ' . ($room['name'] ?? 'room'),
                    'migrated' => true
                ]];
            } else {
                return $room;
            }
        }
        
        // Process each image to include full URL
        $processed_images = [];
        $primary_image = null;
        
        foreach ($images as $image) {
            if (is_string($image)) {
                // Convert simple filename to structured format
                $folder = self::getRoomImageFolder($room['type'] ?? 'standard');
                $structured_image = [
                    'filename' => $image,
                    'folder' => $folder,
                    'url' => self::buildImageUrl($folder, $image),
                    'is_primary' => count($processed_images) === 0,
                    'caption' => ''
                ];
                $processed_images[] = $structured_image;
                
                if ($structured_image['is_primary']) {
                    $primary_image = $structured_image;
                }
            } elseif (is_array($image) && isset($image['filename'])) {
                // Already structured - add URL and validate folder
                $folder = $image['folder'] ?? self::getRoomImageFolder($room['type'] ?? 'standard');
                $image['folder'] = $folder;
                $image['url'] = self::buildImageUrl($folder, $image['filename']);
                
                if (!isset($image['is_primary'])) {
                    $image['is_primary'] = count($processed_images) === 0;
                }
                
                $processed_images[] = $image;
                
                if ($image['is_primary']) {
                    $primary_image = $image;
                }
            }
        }
        
        $room['images'] = $processed_images;
        $room['images_count'] = count($processed_images);
        $room['primary_image_url'] = $primary_image ? $primary_image['url'] : null;
        
        return $room;
    }
    
    public static function getSampleImagesForRoomType($room_type, $limit = 5) {
        $folder = self::getRoomImageFolder($room_type);
        
        if (empty($folder)) {
            return [];
        }
        
        // Use image scanner to get actual images
        $base_url = '';
        if (isset($_SERVER['REQUEST_SCHEME']) && isset($_SERVER['HTTP_HOST'])) {
            $base_url = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);
        }
        $scanner_url = $base_url . '/image-scanner.php?folder=' . $folder . '&basePath=../images/rooms';
        
        $images_data = null;
        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $scanner_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $response = curl_exec($ch);
            curl_close($ch);
            $images_data = json_decode($response, true);
        }
        
        $sample_images = [];
        if ($images_data && $images_data['success'] && !empty($images_data['images'])) {
            $images = array_slice($images_data['images'], 0, $limit);
            foreach ($images as $image) {
                $sample_images[] = [
                    'filename' => $image,
                    'url' => self::buildImageUrl($folder, $image),
                    'folder' => $folder,
                    'room_type' => $room_type
                ];
            }
        }
        
        return $sample_images;
    }
    
    public static function addImageToRoom($db, $room_id, $image_data) {
        try {
            // Get current images
            $stmt = $db->prepare("SELECT room_images, images_count FROM rooms WHERE id = ?");
            $stmt->execute([$room_id]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$room) {
                throw new Exception('Room not found');
            }
            
            $current_images = [];
            if (!empty($room['room_images'])) {
                $current_images = json_decode($room['room_images'], true) ?: [];
            }
            
            // Add metadata to new image
            $new_image = array_merge($image_data, [
                'added_at' => date('Y-m-d H:i:s'),
                'is_primary' => empty($current_images) // First image is primary
            ]);
            
            $current_images[] = $new_image;
            
            // Update database
            $stmt = $db->prepare("
                UPDATE rooms 
                SET room_images = ?, 
                    images_count = ?, 
                    primary_image = ?, 
                    images_updated_at = NOW()
                WHERE id = ?
            ");
            
            $primary_image = $new_image['is_primary'] ? $new_image['filename'] : 
                           ($room['primary_image'] ?? $new_image['filename']);
            
            $stmt->execute([
                json_encode($current_images),
                count($current_images),
                $primary_image,
                $room_id
            ]);
            
            return $current_images;
            
        } catch (Exception $e) {
            throw new Exception('Failed to add image: ' . $e->getMessage());
        }
    }
    
    public static function removeImageFromRoom($db, $room_id, $filename) {
        try {
            $stmt = $db->prepare("SELECT room_images FROM rooms WHERE id = ?");
            $stmt->execute([$room_id]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$room) {
                throw new Exception('Room not found');
            }
            
            $current_images = [];
            if (!empty($room['room_images'])) {
                $current_images = json_decode($room['room_images'], true) ?: [];
            }
            
            // Remove the specified image
            $updated_images = array_filter($current_images, function($img) use ($filename) {
                return $img['filename'] !== $filename;
            });
            
            // Re-index array
            $updated_images = array_values($updated_images);
            
            // If we removed the primary image, make first remaining image primary
            $has_primary = false;
            foreach ($updated_images as &$img) {
                if ($img['is_primary']) {
                    $has_primary = true;
                    break;
                }
            }
            
            if (!$has_primary && !empty($updated_images)) {
                $updated_images[0]['is_primary'] = true;
            }
            
            $primary_image = null;
            foreach ($updated_images as $img) {
                if ($img['is_primary']) {
                    $primary_image = $img['filename'];
                    break;
                }
            }
            
            // Update database
            $stmt = $db->prepare("
                UPDATE rooms 
                SET room_images = ?, 
                    images_count = ?, 
                    primary_image = ?, 
                    images_updated_at = NOW()
                WHERE id = ?
            ");
            
            $stmt->execute([
                json_encode($updated_images),
                count($updated_images),
                $primary_image,
                $room_id
            ]);
            
            return $updated_images;
            
        } catch (Exception $e) {
            throw new Exception('Failed to remove image: ' . $e->getMessage());
        }
    }
    
    public static function setPrimaryImage($db, $room_id, $filename) {
        try {
            $stmt = $db->prepare("SELECT room_images FROM rooms WHERE id = ?");
            $stmt->execute([$room_id]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$room) {
                throw new Exception('Room not found');
            }
            
            $current_images = [];
            if (!empty($room['room_images'])) {
                $current_images = json_decode($room['room_images'], true) ?: [];
            }
            
            // Update primary image flags
            foreach ($current_images as &$img) {
                $img['is_primary'] = ($img['filename'] === $filename);
            }
            
            // Update database
            $stmt = $db->prepare("
                UPDATE rooms 
                SET room_images = ?, 
                    primary_image = ?, 
                    images_updated_at = NOW()
                WHERE id = ?
            ");
            
            $stmt->execute([
                json_encode($current_images),
                $filename,
                $room_id
            ]);
            
            return $current_images;
            
        } catch (Exception $e) {
            throw new Exception('Failed to set primary image: ' . $e->getMessage());
        }
    }
}

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
                if ($room['room_images']) {
                    $room['room_images'] = json_decode($room['room_images'], true);
                }
                
                // Process room images with subfolder structure (supports multiple images)
                $room = RoomImageHelper::processRoomImages($room);
                
                echo json_encode(['success' => true, 'data' => $room]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Room not found']);
            }
        } elseif (isset($_GET['categories'])) {
            // Get room categories and image folders (discovered dynamically)
            $available_folders = RoomImageHelper::discoverAvailableFolders();
            echo json_encode([
                'success' => true, 
                'data' => [
                    'categories' => RoomImageHelper::getAllRoomCategories(),
                    'available_folders' => $available_folders,
                    'base_url' => 'https://rumahdaisycantik.com/images/rooms',
                    'folder_count' => count($available_folders)
                ]
            ]);
        } elseif (isset($_GET['images'])) {
            // Get available images from a specific room folder
            $folder = $_GET['images'];
            $folder = preg_replace('/[^a-zA-Z0-9\-_]/', '', $folder); // Sanitize
            
            // Use confirmed working image scanner
            $base_url = '';
            if (isset($_SERVER['REQUEST_SCHEME']) && isset($_SERVER['HTTP_HOST'])) {
                $base_url = $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);
            }
            $scanner_url = $base_url . '/image-scanner.php?folder=' . $folder . '&basePath=../images/rooms';
            
            // Try to get images using file_get_contents or curl
            $images_data = null;
            if (function_exists('curl_init')) {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $scanner_url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                $response = curl_exec($ch);
                curl_close($ch);
                $images_data = json_decode($response, true);
            } else {
                // Fallback method
                $context = stream_context_create([
                    'http' => ['method' => 'GET', 'timeout' => 10]
                ]);
                $response = @file_get_contents($scanner_url, false, $context);
                if ($response) {
                    $images_data = json_decode($response, true);
                }
            }
            
            if ($images_data && $images_data['success']) {
                $processed_images = [];
                foreach ($images_data['images'] as $image) {
                    $processed_images[] = [
                        'filename' => $image,
                        'url' => RoomImageHelper::buildImageUrl($folder, $image),
                        'folder' => $folder
                    ];
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'folder' => $folder,
                        'images' => $processed_images,
                        'count' => count($processed_images)
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => 'Could not fetch images for folder: ' . $folder,
                    'data' => []
                ]);
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
                if ($room['room_images']) {
                    $room['room_images'] = json_decode($room['room_images'], true);
                }
                
                // Process room images with subfolder structure (supports multiple images)
                $room = RoomImageHelper::processRoomImages($room);
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
        
        // Handle different types of PUT operations
        if (isset($input['action'])) {
            switch ($input['action']) {
                case 'add_image':
                    if (!isset($input['image_data'])) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Image data is required']);
                        return;
                    }
                    
                    $updated_images = RoomImageHelper::addImageToRoom($db, $input['id'], $input['image_data']);
                    echo json_encode(['success' => true, 'data' => ['images' => $updated_images]]);
                    return;
                    
                case 'remove_image':
                    if (!isset($input['filename'])) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Filename is required']);
                        return;
                    }
                    
                    $updated_images = RoomImageHelper::removeImageFromRoom($db, $input['id'], $input['filename']);
                    echo json_encode(['success' => true, 'data' => ['images' => $updated_images]]);
                    return;
                    
                case 'set_primary_image':
                    if (!isset($input['filename'])) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Filename is required']);
                        return;
                    }
                    
                    $updated_images = RoomImageHelper::setPrimaryImage($db, $input['id'], $input['filename']);
                    echo json_encode(['success' => true, 'data' => ['images' => $updated_images]]);
                    return;
                    
                case 'bulk_add_images':
                    if (!isset($input['images']) || !is_array($input['images'])) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Images array is required']);
                        return;
                    }
                    
                    $updated_images = null;
                    foreach ($input['images'] as $image_data) {
                        $updated_images = RoomImageHelper::addImageToRoom($db, $input['id'], $image_data);
                    }
                    
                    echo json_encode(['success' => true, 'data' => ['images' => $updated_images]]);
                    return;
            }
        }
        
        // Legacy single image assignment (for backward compatibility)
        if (isset($input['image']) && isset($input['folder'])) {
            $image_data = [
                'filename' => $input['image'],
                'folder' => $input['folder'],
                'caption' => $input['caption'] ?? '',
                'added_by' => $input['user'] ?? 'admin'
            ];
            
            // Check if this is replacing existing single image or adding to multiple
            $stmt = $db->prepare("SELECT room_images, images_count FROM rooms WHERE id = ?");
            $stmt->execute([$input['id']]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($room && $room['images_count'] > 0) {
                // Add to existing images
                $updated_images = RoomImageHelper::addImageToRoom($db, $input['id'], $image_data);
            } else {
                // Set as first/primary image
                $updated_images = RoomImageHelper::addImageToRoom($db, $input['id'], $image_data);
            }
            
            echo json_encode(['success' => true, 'data' => ['images' => $updated_images]]);
            return;
        }
        
        // Standard room update (without image changes)
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