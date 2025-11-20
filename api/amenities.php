<?php
/**
 * AMENITIES MANAGEMENT API
 * Full CRUD operations for amenities system with rooms and packages
 * 
 * Date: November 19, 2025
 * Project: Villa Booking Engine
 */

// Reliable path resolution for database config
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Production error handling
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Graceful handling when PATH_INFO is not set (e.g. direct script call)
$rawPath = isset($_SERVER['PATH_INFO']) ? trim($_SERVER['PATH_INFO'], '/') : '';
$request = $rawPath !== '' ? explode('/', $rawPath) : [];

// Determine endpoint robustly (some environments may strip query variables)
$endpoint = '';
if (!empty($request) && $request[0] !== '') {
    $endpoint = $request[0];
} elseif (isset($_GET['endpoint']) && $_GET['endpoint'] !== '') {
    $endpoint = $_GET['endpoint'];
} else {
    // Manual parse of QUERY_STRING as fallback
    $qs = $_SERVER['QUERY_STRING'] ?? '';
    if ($qs !== '') {
        parse_str($qs, $manualParams);
        if (!empty($manualParams['endpoint'])) {
            $endpoint = $manualParams['endpoint'];
        }
    }
}

// Final safety: default to 'amenities' when calling base script with no endpoint
// to allow simple GET /amenities.php usage.
if ($endpoint === '') {
    $endpoint = 'amenities';
    $endpoint_auto_default = true;
} else {
    $endpoint_auto_default = false;
}

// Handle preflight OPTIONS request
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit();
}

try {
    // Instantiate database (no singleton present)
    $pdo = (new Database())->getConnection();
    
    // Route to appropriate handler based on endpoint and HTTP method
    switch ($endpoint) {
        case 'room-amenities':
            handleRoomAmenities($pdo, $request, $method);
            break;
            
        case 'package-amenities':
            handlePackageAmenities($pdo, $request, $method);
            break;
            
        case 'amenities':
            handleAmenitiesCRUD($pdo, $request, $method);
            break;
            
        case 'sales-tool':
            handleSalesTool($pdo, $request);
            break;
            
        case 'categories':
            handleCategories($pdo, $request, $method);
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Endpoint not found',
                'available_endpoints' => ['amenities', 'room-amenities', 'package-amenities', 'categories', 'sales-tool']
            ]);
    }
    
} catch (Exception $e) {
    // Log detailed error information for debugging
    error_log("Amenities API Error: " . $e->getMessage() . " in " . $e->getFile() . " line " . $e->getLine());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}

/**
 * Handle room-amenities relationships
 * GET - Get amenities for a room
 * POST - Add amenity to room
 * DELETE - Remove amenity from room
 */
function handleRoomAmenities($pdo, $request, $method) {
    switch ($method) {
        case 'GET':
            handleGetRoomAmenities($pdo, $request);
            break;
        case 'POST':
            handleAddRoomAmenity($pdo, $request);
            break;
        case 'DELETE':
            handleRemoveRoomAmenity($pdo, $request);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

/**
 * GET - Get all amenities for a specific room
 * Example: GET /api/amenities.php/room-amenities/deluxe-suite
 */
function handleGetRoomAmenities($pdo, $request) {
    $roomId = $request[1] ?? null;
    
    if (!$roomId) {
        http_response_code(400);
        echo json_encode(['error' => 'Room ID required']);
        return;
    }
    
    // Check if room exists
    $roomCheckSql = "SELECT name FROM rooms WHERE id = ?";
    $roomCheckStmt = $pdo->prepare($roomCheckSql);
    $roomCheckStmt->execute([$roomId]);
    $room = $roomCheckStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$room) {
        http_response_code(404);
        echo json_encode(['error' => 'Room not found']);
        return;
    }
    
    $sql = "
        SELECT 
            a.id,
            a.name,
            a.category,
            a.description,
            a.icon,
            ra.is_highlighted,
            ra.custom_note
        FROM amenities a
        JOIN room_amenities ra ON a.id = ra.amenity_id
        WHERE ra.room_id = ? AND a.is_active = 1
        ORDER BY a.category, a.display_order
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$roomId]);
    $amenities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'room_id' => $roomId,
        'room_name' => $room['name'],
        'amenities' => $amenities,
        'total' => count($amenities)
    ]);
}

/**
 * POST - Add amenity to room
 * Body: {"amenity_id": 1, "is_highlighted": true, "custom_note": ""}
 */
function handleAddRoomAmenity($pdo, $request) {
    $roomId = $request[1] ?? null;
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$roomId) {
        http_response_code(400);
        echo json_encode(['error' => 'Room ID required']);
        return;
    }
    
    if (!isset($input['amenity_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Amenity ID required']);
        return;
    }
    
    // Check if room exists
    $roomCheckSql = "SELECT id FROM rooms WHERE id = ?";
    $roomCheckStmt = $pdo->prepare($roomCheckSql);
    $roomCheckStmt->execute([$roomId]);
    if (!$roomCheckStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Room not found']);
        return;
    }
    
    // Check if amenity exists
    $amenityCheckSql = "SELECT id FROM amenities WHERE id = ? AND is_active = 1";
    $amenityCheckStmt = $pdo->prepare($amenityCheckSql);
    $amenityCheckStmt->execute([$input['amenity_id']]);
    if (!$amenityCheckStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Amenity not found']);
        return;
    }
    
    // Check if relationship already exists
    $existCheckSql = "SELECT id FROM room_amenities WHERE room_id = ? AND amenity_id = ?";
    $existCheckStmt = $pdo->prepare($existCheckSql);
    $existCheckStmt->execute([$roomId, $input['amenity_id']]);
    if ($existCheckStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Amenity already assigned to this room']);
        return;
    }
    
    // Add relationship
    $insertSql = "INSERT INTO room_amenities (room_id, amenity_id, is_highlighted, custom_note) VALUES (?, ?, ?, ?)";
    $insertStmt = $pdo->prepare($insertSql);
    $result = $insertStmt->execute([
        $roomId,
        $input['amenity_id'],
        $input['is_highlighted'] ?? 0,
        $input['custom_note'] ?? null
    ]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Amenity added to room successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add amenity to room']);
    }
}

/**
 * DELETE - Remove amenity from room
 * Example: DELETE /api/amenities.php/room-amenities/{room_id}?amenity_id={id}
 */
function handleRemoveRoomAmenity($pdo, $request) {
    $roomId = $request[1] ?? null;
    $amenityId = $_GET['amenity_id'] ?? null;
    
    if (!$roomId || !$amenityId) {
        http_response_code(400);
        echo json_encode(['error' => 'Room ID and amenity_id required']);
        return;
    }
    
    // Check if relationship exists
    $checkSql = "SELECT id FROM room_amenities WHERE room_id = ? AND amenity_id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$roomId, $amenityId]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Room-amenity relationship not found']);
        return;
    }
    
    // Remove relationship
    $deleteSql = "DELETE FROM room_amenities WHERE room_id = ? AND amenity_id = ?";
    $deleteStmt = $pdo->prepare($deleteSql);
    $result = $deleteStmt->execute([$roomId, $amenityId]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Amenity removed from room successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to remove amenity from room']);
    }
}

/**
 * Get all amenities for a specific package
 * Example: /api/amenities.php/package-amenities/1
 */
function handlePackageAmenities($pdo, $request) {
    $packageId = $request[1] ?? null;
    
    if (!$packageId) {
        http_response_code(400);
        echo json_encode(['error' => 'Package ID required']);
        return;
    }
    
    $sql = "
        SELECT 
            p.name as package_name,
            a.id,
            a.name,
            a.category,
            a.description,
            a.icon,
            pa.is_highlighted,
            pa.custom_note
        FROM packages p
        JOIN package_amenities pa ON p.id = pa.package_id
        JOIN amenities a ON pa.amenity_id = a.id
        WHERE p.id = ? AND a.is_active = 1
        ORDER BY a.display_order
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$packageId]);
    $amenities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'package_id' => $packageId,
        'amenities' => $amenities,
        'total' => count($amenities)
    ]);
}

/**
 * Handle amenity categories
 * GET - Get all unique categories with counts
 */
function handleCategories($pdo, $request, $method) {
    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Only GET method allowed for categories']);
        return;
    }
    
    $sql = "
        SELECT 
            category,
            COUNT(*) as amenity_count,
            COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_count,
            COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count
        FROM amenities 
        GROUP BY category 
        ORDER BY category
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'categories' => $categories,
        'total' => count($categories)
    ]);
}
/**
 * Handle CRUD operations for amenities
 */
function handleAmenitiesCRUD($pdo, $request, $method) {
    switch ($method) {
        case 'GET':
            handleGetAmenities($pdo, $request);
            break;
        case 'POST':
            handleCreateAmenity($pdo, $request);
            break;
        case 'PUT':
            handleUpdateAmenity($pdo, $request);
            break;
        case 'DELETE':
            handleDeleteAmenity($pdo, $request);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

/**
 * GET - Retrieve amenities
 * Supports filtering by category, featured status, etc.
 */
function handleGetAmenities($pdo, $request) {
    // Check if specific amenity ID is requested
    $amenityId = $request[1] ?? $_GET['id'] ?? null;
    
    if ($amenityId) {
        // Get specific amenity
        $sql = "SELECT * FROM amenities WHERE id = ? AND is_active = 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$amenityId]);
        $amenity = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$amenity) {
            http_response_code(404);
            echo json_encode(['error' => 'Amenity not found']);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'amenity' => $amenity
        ]);
        return;
    }
    
    // Get all amenities with optional filtering
    $category = $_GET['category'] ?? null;
    $featured = $_GET['featured'] ?? null;
    $includeInactive = $_GET['include_inactive'] ?? false;
    
    $sql = "SELECT * FROM amenities";
    $params = [];
    $conditions = [];
    
    if (!$includeInactive) {
        $conditions[] = "is_active = 1";
    }
    
    if ($category) {
        $conditions[] = "category = ?";
        $params[] = $category;
    }
    
    if ($featured !== null) {
        $conditions[] = "is_featured = ?";
        $params[] = $featured ? 1 : 0;
    }
    
    if ($conditions) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }
    
    $sql .= " ORDER BY category, display_order, name";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $amenities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group by category
    $grouped = [];
    foreach ($amenities as $amenity) {
        $grouped[$amenity['category']][] = $amenity;
    }
    
    echo json_encode([
        'success' => true,
        'amenities' => $amenities,
        'grouped_by_category' => $grouped,
        'total' => count($amenities)
    ]);
}

/**
 * POST - Create new amenity
 */
function handleCreateAmenity($pdo, $request) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
        return;
    }
    
    // Validate required fields
    if (!isset($input['name']) || trim($input['name']) === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        return;
    }
    
    // Check for duplicate name
    $checkSql = "SELECT id FROM amenities WHERE name = ? AND is_active = 1";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([trim($input['name'])]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Amenity with this name already exists']);
        return;
    }
    
    // Get next display order for category
    $category = $input['category'] ?? 'general';
    $orderSql = "SELECT COALESCE(MAX(display_order), 0) + 1 FROM amenities WHERE category = ?";
    $orderStmt = $pdo->prepare($orderSql);
    $orderStmt->execute([$category]);
    $nextOrder = $orderStmt->fetchColumn();
    
    // Insert new amenity
    $sql = "INSERT INTO amenities (name, category, description, icon, display_order, is_featured, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        trim($input['name']),
        $category,
        $input['description'] ?? '',
        $input['icon'] ?? 'star',
        $input['display_order'] ?? $nextOrder,
        $input['is_featured'] ?? 0,
        $input['is_active'] ?? 1
    ]);
    
    if ($result) {
        $newId = $pdo->lastInsertId();
        
        // Return the created amenity
        $selectSql = "SELECT * FROM amenities WHERE id = ?";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([$newId]);
        $newAmenity = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Amenity created successfully',
            'amenity' => $newAmenity
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create amenity']);
    }
}

/**
 * PUT - Update existing amenity
 */
function handleUpdateAmenity($pdo, $request) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
        return;
    }
    
    $amenityId = $request[1] ?? $input['id'] ?? null;
    
    if (!$amenityId) {
        http_response_code(400);
        echo json_encode(['error' => 'Amenity ID is required']);
        return;
    }
    
    // Check if amenity exists
    $checkSql = "SELECT * FROM amenities WHERE id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$amenityId]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['error' => 'Amenity not found']);
        return;
    }
    
    // Check for duplicate name (excluding current amenity)
    if (isset($input['name'])) {
        $namecheckSql = "SELECT id FROM amenities WHERE name = ? AND id != ? AND is_active = 1";
        $nameCheckStmt = $pdo->prepare($namecheckSql);
        $nameCheckStmt->execute([trim($input['name']), $amenityId]);
        if ($nameCheckStmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Amenity with this name already exists']);
            return;
        }
    }
    
    // Update amenity
    $sql = "UPDATE amenities SET 
            name = ?, category = ?, description = ?, icon = ?, 
            display_order = ?, is_featured = ?, is_active = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $input['name'] ?? $existing['name'],
        $input['category'] ?? $existing['category'],
        $input['description'] ?? $existing['description'],
        $input['icon'] ?? $existing['icon'],
        $input['display_order'] ?? $existing['display_order'],
        isset($input['is_featured']) ? ($input['is_featured'] ? 1 : 0) : $existing['is_featured'],
        isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : $existing['is_active'],
        $amenityId
    ]);
    
    if ($result) {
        // Return updated amenity
        $selectSql = "SELECT * FROM amenities WHERE id = ?";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([$amenityId]);
        $updatedAmenity = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Amenity updated successfully',
            'amenity' => $updatedAmenity,
            'affected_rows' => $stmt->rowCount()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update amenity']);
    }
}

/**
 * DELETE - Soft delete amenity (set is_active = 0)
 */
function handleDeleteAmenity($pdo, $request) {
    $amenityId = $request[1] ?? $_GET['id'] ?? null;
    
    if (!$amenityId) {
        http_response_code(400);
        echo json_encode(['error' => 'Amenity ID is required']);
        return;
    }
    
    // Check if amenity exists
    $checkSql = "SELECT * FROM amenities WHERE id = ? AND is_active = 1";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$amenityId]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['error' => 'Amenity not found or already deleted']);
        return;
    }
    
    // Check if amenity is in use (has relationships)
    $usageSql = "SELECT 
                    (SELECT COUNT(*) FROM room_amenities WHERE amenity_id = ?) as room_count,
                    (SELECT COUNT(*) FROM package_amenities WHERE amenity_id = ?) as package_count";
    $usageStmt = $pdo->prepare($usageSql);
    $usageStmt->execute([$amenityId, $amenityId]);
    $usage = $usageStmt->fetch(PDO::FETCH_ASSOC);
    
    $forceDelete = $_GET['force'] ?? false;
    
    if (($usage['room_count'] > 0 || $usage['package_count'] > 0) && !$forceDelete) {
        http_response_code(409);
        echo json_encode([
            'error' => 'Cannot delete amenity that is in use',
            'usage' => [
                'rooms' => $usage['room_count'],
                'packages' => $usage['package_count']
            ],
            'hint' => 'Add ?force=1 to force delete and remove all relationships'
        ]);
        return;
    }
    
    $pdo->beginTransaction();
    
    try {
        if ($forceDelete) {
            // Remove relationships
            $pdo->prepare("DELETE FROM room_amenities WHERE amenity_id = ?")->execute([$amenityId]);
            $pdo->prepare("DELETE FROM package_amenities WHERE amenity_id = ?")->execute([$amenityId]);
        }
        
        // Soft delete amenity
        $deleteSql = "UPDATE amenities SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $deleteStmt = $pdo->prepare($deleteSql);
        $deleteStmt->execute([$amenityId]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Amenity deleted successfully',
            'force_delete' => (bool)$forceDelete,
            'relationships_removed' => $forceDelete ? ($usage['room_count'] + $usage['package_count']) : 0
        ]);
        
    } catch (Exception $e) {
        $pdo->rollback();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete amenity: ' . $e->getMessage()]);
    }
}

/**
 * Get complete sales tool data for a package (room + package amenities)
 * This demonstrates the "sales tool" concept with combined room and package amenities
 * Example: /api/amenities.php/sales-tool/1
 */
function handleSalesTool($pdo, $request) {
    $packageId = $request[1] ?? null;
    
    if (!$packageId) {
        http_response_code(400);
        echo json_encode(['error' => 'Package ID required']);
        return;
    }
    
    // Get package info first
    $packageSql = "SELECT * FROM packages WHERE id = ?";
    $stmt = $pdo->prepare($packageSql);
    $stmt->execute([$packageId]);
    $package = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$package) {
        http_response_code(404);
        echo json_encode(['error' => 'Package not found']);
        return;
    }
    
    // Determine a representative room for the package.
    // Strategy:
    // 1. If there is a booking for this package use its room_id.
    // 2. Else try to infer from a future mapping table (not yet implemented).
    // 3. Else omit room features (no hard-coded default).
    $roomForPackage = null;
    $roomLookupSql = "SELECT room_id FROM bookings WHERE package_id = ? ORDER BY check_in ASC LIMIT 1";
    $stmt = $pdo->prepare($roomLookupSql);
    $stmt->execute([$packageId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && !empty($row['room_id'])) {
        $roomForPackage = $row['room_id'];
    }

    $roomAmenities = [];
    if ($roomForPackage) {
        $roomAmenitiesSql = "
            SELECT 
                a.id,
                a.name,
                a.category,
                a.description,
                a.icon,
                ra.is_highlighted,
                'room_feature' AS source_type
            FROM amenities a
            JOIN room_amenities ra ON a.id = ra.amenity_id
            WHERE ra.room_id = ? AND a.is_active = 1
            ORDER BY a.display_order";
        $stmt = $pdo->prepare($roomAmenitiesSql);
        $stmt->execute([$roomForPackage]);
        $roomAmenities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Get package amenities (what the package adds)
    $packageAmenitiesSql = "
        SELECT 
            a.id,
            a.name,
            a.category,
            a.description,
            a.icon,
            pa.is_highlighted,
            'package_perk' as source_type
        FROM amenities a
        JOIN package_amenities pa ON a.id = pa.amenity_id
        WHERE pa.package_id = ?
        AND a.is_active = 1
        ORDER BY a.display_order
    ";
    
    $stmt = $pdo->prepare($packageAmenitiesSql);
    $stmt->execute([$packageId]);
    $packageAmenities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create sales tool presentation
    $salesTool = [
        'package_info' => $package,
        'sales_presentation' => [
            'title' => $package['name'],
            'tagline' => 'Luxury Accommodation + Exclusive Perks',
            'room_features' => $roomAmenities,
            'package_perks' => $packageAmenities,
            'total_value_items' => count($roomAmenities) + count($packageAmenities),
            'highlighted_features' => array_filter($roomAmenities, fn($a) => $a['is_highlighted']),
            'highlighted_perks' => array_filter($packageAmenities, fn($a) => $a['is_highlighted'])
        ],
        'business_logic' => [
            'concept' => 'Sales Tool - combines room inventory with service perks',
            'inventory_source' => 'Room availability controls package availability',
            'marketing_angle' => 'Bundle presentation for customer attraction'
        ],
        'room_context' => [
            'room_determined' => (bool)$roomForPackage,
            'room_id' => $roomForPackage
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'sales_tool' => $salesTool
    ]);
}
?>