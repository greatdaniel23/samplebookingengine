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
    
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $package_id = $_GET['package_id'] ?? null;
    $inclusion_id = $_GET['inclusion_id'] ?? null;
    
    if (!$package_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'package_id is required']);
        exit;
    }
    
    switch ($action) {
        case 'list':
            listPackageInclusions($pdo, $package_id);
            break;
            
        case 'add':
            if (!$inclusion_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'inclusion_id is required for add operation']);
                exit;
            }
            addPackageInclusion($pdo, $package_id, $inclusion_id);
            break;
            
        case 'remove':
            if (!$inclusion_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'inclusion_id is required for remove operation']);
                exit;
            }
            removePackageInclusion($pdo, $package_id, $inclusion_id);
            break;
            
        case 'update-order':
            updatePackageInclusionOrder($pdo, $package_id);
            break;
            
        default:
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'error' => 'Invalid action',
                'available_actions' => ['list', 'add', 'remove', 'update-order']
            ]);
    }
    
} catch (Exception $e) {
    error_log("Package Inclusions API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}

/**
 * List all inclusions for a package
 */
function listPackageInclusions($pdo, $package_id) {
    $sql = "
        SELECT 
            pi.id as relationship_id,
            pi.package_id,
            pi.inclusion_id,
            pi.display_order,
            pi.created_at as assigned_at,
            i.name,
            i.category,
            i.description,
            i.icon,
            i.is_featured,
            i.is_active
        FROM package_inclusions pi
        JOIN inclusions i ON pi.inclusion_id = i.id
        WHERE pi.package_id = ?
        ORDER BY pi.display_order, i.category, i.display_order
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$package_id]);
    $inclusions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group by category
    $grouped = [];
    foreach ($inclusions as $inclusion) {
        $grouped[$inclusion['category']][] = $inclusion;
    }
    
    echo json_encode([
        'success' => true,
        'package_id' => $package_id,
        'inclusions' => $inclusions,
        'grouped_by_category' => $grouped,
        'total_count' => count($inclusions)
    ]);
}

/**
 * Add an inclusion to a package
 */
function addPackageInclusion($pdo, $package_id, $inclusion_id) {
    // Check if relationship already exists
    $checkSql = "SELECT id FROM package_inclusions WHERE package_id = ? AND inclusion_id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$package_id, $inclusion_id]);
    
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'error' => 'Inclusion already assigned to this package'
        ]);
        return;
    }
    
    // Verify inclusion exists and is active
    $inclusionCheckSql = "SELECT name, category FROM inclusions WHERE id = ? AND is_active = 1";
    $inclusionStmt = $pdo->prepare($inclusionCheckSql);
    $inclusionStmt->execute([$inclusion_id]);
    $inclusion = $inclusionStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$inclusion) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Inclusion not found or inactive'
        ]);
        return;
    }
    
    // Get next display order
    $orderSql = "SELECT COALESCE(MAX(display_order), 0) + 1 FROM package_inclusions WHERE package_id = ?";
    $orderStmt = $pdo->prepare($orderSql);
    $orderStmt->execute([$package_id]);
    $nextOrder = $orderStmt->fetchColumn();
    
    // Add the relationship
    $insertSql = "INSERT INTO package_inclusions (package_id, inclusion_id, display_order) VALUES (?, ?, ?)";
    $insertStmt = $pdo->prepare($insertSql);
    $result = $insertStmt->execute([$package_id, $inclusion_id, $nextOrder]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => "Inclusion '{$inclusion['name']}' added to package",
            'relationship_id' => $pdo->lastInsertId(),
            'display_order' => $nextOrder
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to add inclusion to package'
        ]);
    }
}

/**
 * Remove an inclusion from a package
 */
function removePackageInclusion($pdo, $package_id, $inclusion_id) {
    // Check if relationship exists
    $checkSql = "
        SELECT pi.id, i.name 
        FROM package_inclusions pi
        JOIN inclusions i ON pi.inclusion_id = i.id
        WHERE pi.package_id = ? AND pi.inclusion_id = ?
    ";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$package_id, $inclusion_id]);
    $relationship = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$relationship) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Package-inclusion relationship not found'
        ]);
        return;
    }
    
    // Remove the relationship
    $deleteSql = "DELETE FROM package_inclusions WHERE package_id = ? AND inclusion_id = ?";
    $deleteStmt = $pdo->prepare($deleteSql);
    $result = $deleteStmt->execute([$package_id, $inclusion_id]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => "Inclusion '{$relationship['name']}' removed from package"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to remove inclusion from package'
        ]);
    }
}

/**
 * Update display order of package inclusions
 */
function updatePackageInclusionOrder($pdo, $package_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        return;
    }
    
    if (!isset($input['inclusion_orders']) || !is_array($input['inclusion_orders'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'inclusion_orders array is required']);
        return;
    }
    
    $pdo->beginTransaction();
    
    try {
        $updateSql = "UPDATE package_inclusions SET display_order = ? WHERE package_id = ? AND inclusion_id = ?";
        $updateStmt = $pdo->prepare($updateSql);
        
        foreach ($input['inclusion_orders'] as $order) {
            if (!isset($order['inclusion_id'], $order['display_order'])) {
                throw new Exception('Each order item must have inclusion_id and display_order');
            }
            
            $updateStmt->execute([
                $order['display_order'],
                $package_id,
                $order['inclusion_id']
            ]);
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Display order updated successfully',
            'updated_count' => count($input['inclusion_orders'])
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to update display order: ' . $e->getMessage()
        ]);
    }
}
?>