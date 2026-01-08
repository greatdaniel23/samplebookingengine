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

require_once __DIR__ . '/config/database.php';

// Production error handling
error_reporting(0);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

try {
    $pdo = (new Database())->getConnection();
    
    // Parse URL path for routing
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $path_info = $_SERVER['PATH_INFO'] ?? '';
    
    // Extract endpoint and ID from URL
    $request = [];
    $endpoint = '';
    
    if (!empty($path_info)) {
        $parts = array_filter(explode('/', trim($path_info, '/')));
        if (!empty($parts)) {
            $endpoint = $parts[0];
            $request = array_slice($parts, 1);
        }
    }
    
    // Default to 'inclusions' endpoint if no specific endpoint provided
    if (empty($endpoint)) {
        $endpoint = 'inclusions';
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Route to appropriate handler
    switch ($endpoint) {
        case 'inclusions':
            handleInclusionsCRUD($pdo, $request, $method);
            break;
            
        case 'package-inclusions':
            handlePackageInclusions($pdo, $request, $method);
            break;
            
        case 'categories':
            handleCategories($pdo, $request, $method);
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Endpoint not found',
                'available_endpoints' => ['inclusions', 'package-inclusions', 'categories']
            ]);
    }
    
} catch (Exception $e) {
    error_log("Inclusions API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}

/**
 * Handle CRUD operations for inclusions
 */
function handleInclusionsCRUD($pdo, $request, $method) {
    switch ($method) {
        case 'GET':
            handleGetInclusions($pdo, $request);
            break;
        case 'POST':
            handleCreateInclusion($pdo, $request);
            break;
        case 'PUT':
            handleUpdateInclusion($pdo, $request);
            break;
        case 'DELETE':
            handleDeleteInclusion($pdo, $request);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

/**
 * GET - Retrieve inclusions
 */
function handleGetInclusions($pdo, $request) {
    $inclusionId = $request[0] ?? $_GET['id'] ?? null;
    
    if ($inclusionId) {
        // Get specific inclusion
        $sql = "SELECT * FROM inclusions WHERE id = ? AND is_active = 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$inclusionId]);
        $inclusion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$inclusion) {
            http_response_code(404);
            echo json_encode(['error' => 'Inclusion not found']);
            return;
        }
        
        echo json_encode(['success' => true, 'inclusion' => $inclusion]);
        return;
    }
    
    // Get all inclusions with optional filtering
    $category = $_GET['category'] ?? null;
    $featured = $_GET['featured'] ?? null;
    $includeInactive = $_GET['include_inactive'] ?? false;
    
    $sql = "SELECT * FROM inclusions";
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
    $inclusions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group by category
    $grouped = [];
    foreach ($inclusions as $inclusion) {
        $grouped[$inclusion['category']][] = $inclusion;
    }
    
    echo json_encode([
        'success' => true,
        'inclusions' => $inclusions,
        'grouped_by_category' => $grouped,
        'total' => count($inclusions)
    ]);
}

/**
 * POST - Create new inclusion
 */
function handleCreateInclusion($pdo, $request) {
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
    $checkSql = "SELECT id FROM inclusions WHERE name = ? AND is_active = 1";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([trim($input['name'])]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Inclusion with this name already exists']);
        return;
    }
    
    // Get next display order for category
    $category = $input['category'] ?? 'general';
    $orderSql = "SELECT COALESCE(MAX(display_order), 0) + 1 FROM inclusions WHERE category = ?";
    $orderStmt = $pdo->prepare($orderSql);
    $orderStmt->execute([$category]);
    $nextOrder = $orderStmt->fetchColumn();
    
    // Insert new inclusion
    $sql = "INSERT INTO inclusions (name, category, description, icon, display_order, is_featured, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        trim($input['name']),
        $category,
        $input['description'] ?? '',
        $input['icon'] ?? 'check-circle',
        $input['display_order'] ?? $nextOrder,
        $input['is_featured'] ?? 0,
        $input['is_active'] ?? 1
    ]);
    
    if ($result) {
        $newId = $pdo->lastInsertId();
        
        // Return the created inclusion
        $selectSql = "SELECT * FROM inclusions WHERE id = ?";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([$newId]);
        $newInclusion = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode(['success' => true, 'inclusion' => $newInclusion]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create inclusion']);
    }
}

/**
 * PUT - Update existing inclusion
 */
function handleUpdateInclusion($pdo, $request) {
    $inclusionId = $_GET['id'] ?? $request[0] ?? null;
    
    if (!$inclusionId) {
        http_response_code(400);
        echo json_encode(['error' => 'Inclusion ID required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON: ' . json_last_error_msg()]);
        return;
    }
    
    // Check if inclusion exists
    $checkSql = "SELECT * FROM inclusions WHERE id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$inclusionId]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['error' => 'Inclusion not found']);
        return;
    }
    
    // Update inclusion
    $sql = "UPDATE inclusions SET 
            name = ?, category = ?, description = ?, icon = ?, 
            display_order = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        $input['name'] ?? $existing['name'],
        $input['category'] ?? $existing['category'],
        $input['description'] ?? $existing['description'],
        $input['icon'] ?? $existing['icon'],
        $input['display_order'] ?? $existing['display_order'],
        $input['is_featured'] ?? $existing['is_featured'],
        $input['is_active'] ?? $existing['is_active'],
        $inclusionId
    ]);
    
    if ($result) {
        // Return updated inclusion
        $selectSql = "SELECT * FROM inclusions WHERE id = ?";
        $selectStmt = $pdo->prepare($selectSql);
        $selectStmt->execute([$inclusionId]);
        $updatedInclusion = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'inclusion' => $updatedInclusion]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update inclusion']);
    }
}

/**
 * DELETE - Delete inclusion
 */
function handleDeleteInclusion($pdo, $request) {
    $inclusionId = $_GET['id'] ?? $request[0] ?? null;
    
    if (!$inclusionId) {
        http_response_code(400);
        echo json_encode(['error' => 'Inclusion ID required']);
        return;
    }
    
    // Check if inclusion exists
    $checkSql = "SELECT * FROM inclusions WHERE id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$inclusionId]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['error' => 'Inclusion not found']);
        return;
    }
    
    // Check for relationships
    $relationSql = "SELECT COUNT(*) FROM package_inclusions WHERE inclusion_id = ?";
    $relationStmt = $pdo->prepare($relationSql);
    $relationStmt->execute([$inclusionId]);
    $relationCount = $relationStmt->fetchColumn();
    
    if ($relationCount > 0) {
        // Soft delete - set as inactive
        $softDeleteSql = "UPDATE inclusions SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $softDeleteStmt = $pdo->prepare($softDeleteSql);
        $result = $softDeleteStmt->execute([$inclusionId]);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Inclusion deactivated (soft delete due to existing relationships)',
                'relationships_found' => $relationCount
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to deactivate inclusion']);
        }
    } else {
        // Hard delete - no relationships exist
        $deleteSql = "DELETE FROM inclusions WHERE id = ?";
        $deleteStmt = $pdo->prepare($deleteSql);
        $result = $deleteStmt->execute([$inclusionId]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Inclusion deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete inclusion']);
        }
    }
}

/**
 * Handle package-inclusions relationships
 */
function handlePackageInclusions($pdo, $request, $method) {
    $packageId = $request[0] ?? null;
    
    if (!$packageId) {
        http_response_code(400);
        echo json_encode(['error' => 'Package ID required']);
        return;
    }
    
    switch ($method) {
        case 'GET':
            handleGetPackageInclusions($pdo, $packageId);
            break;
        case 'POST':
            handleAddPackageInclusion($pdo, $packageId);
            break;
        case 'DELETE':
            handleRemovePackageInclusion($pdo, $packageId);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

/**
 * GET package inclusions
 */
function handleGetPackageInclusions($pdo, $packageId) {
    $sql = "
        SELECT 
            pi.*,
            i.name,
            i.category,
            i.description,
            i.icon,
            i.is_featured
        FROM package_inclusions pi
        JOIN inclusions i ON pi.inclusion_id = i.id
        WHERE pi.package_id = ? AND i.is_active = 1
        ORDER BY pi.display_order, i.category, i.display_order
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$packageId]);
    $inclusions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'package_id' => $packageId,
        'inclusions' => $inclusions,
        'total' => count($inclusions)
    ]);
}

/**
 * Handle categories
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
            COUNT(*) as inclusion_count,
            COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_count,
            COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count
        FROM inclusions 
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
?>