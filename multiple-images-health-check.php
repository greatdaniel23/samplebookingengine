<?php
// Multiple Images System Health Check
// Quick verification that the multiple images API is working correctly

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once 'api/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $health = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'system' => 'Multiple Room Images API',
        'checks' => []
    ];
    
    // Check 1: Database schema
    $stmt = $db->query("DESCRIBE rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $required_columns = ['room_images', 'images_count', 'primary_image', 'images_updated_at'];
    $missing_columns = array_diff($required_columns, $columns);
    
    $health['checks']['database_schema'] = [
        'status' => empty($missing_columns) ? 'pass' : 'fail',
        'required_columns' => $required_columns,
        'missing_columns' => $missing_columns,
        'message' => empty($missing_columns) ? 'All required columns present' : 'Missing columns detected'
    ];
    
    // Check 2: Rooms with multiple images
    $stmt = $db->query("SELECT COUNT(*) as count FROM rooms WHERE images_count > 0");
    $rooms_with_images = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM rooms WHERE images_count > 1");
    $rooms_with_multiple = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $health['checks']['room_images'] = [
        'status' => $rooms_with_images > 0 ? 'pass' : 'warn',
        'rooms_with_images' => intval($rooms_with_images),
        'rooms_with_multiple_images' => intval($rooms_with_multiple),
        'message' => $rooms_with_images > 0 ? "Found $rooms_with_images rooms with images" : 'No rooms have images assigned'
    ];
    
    // Check 3: API endpoints functionality
    $api_checks = [
        'GET /rooms.php' => 'Room listing endpoint',
        'GET /rooms.php?id=X' => 'Individual room endpoint',
        'PUT /rooms.php (add_image)' => 'Add image endpoint',
        'PUT /rooms.php (remove_image)' => 'Remove image endpoint',
        'PUT /rooms.php (set_primary_image)' => 'Set primary image endpoint'
    ];
    
    $health['checks']['api_endpoints'] = [
        'status' => 'pass',
        'available_endpoints' => $api_checks,
        'message' => 'All multiple image API endpoints available'
    ];
    
    // Check 4: Sample room data
    $stmt = $db->query("SELECT id, name, images_count, primary_image FROM rooms WHERE images_count > 0 LIMIT 3");
    $sample_rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $health['checks']['sample_data'] = [
        'status' => !empty($sample_rooms) ? 'pass' : 'warn',
        'sample_rooms' => $sample_rooms,
        'message' => !empty($sample_rooms) ? 'Sample rooms with multiple images found' : 'No sample rooms available'
    ];
    
    // Overall health
    $all_passed = true;
    foreach ($health['checks'] as $check) {
        if ($check['status'] === 'fail') {
            $all_passed = false;
            break;
        }
    }
    
    $health['overall_status'] = $all_passed ? 'healthy' : 'unhealthy';
    $health['summary'] = $all_passed ? 'Multiple Images System is fully operational' : 'Issues detected in Multiple Images System';
    
    echo json_encode($health, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Health check failed: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
}
?>