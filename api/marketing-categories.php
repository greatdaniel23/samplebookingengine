<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch($method) {
        case 'GET':
            // Get all marketing categories
            $query = "SELECT * FROM marketing_categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $categories = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $categories[] = $row;
            }
            
            echo json_encode([
                'success' => true,
                'data' => $categories,
                'total' => count($categories)
            ]);
            break;
            
        case 'POST':
            // Create new marketing category
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['name']) || empty(trim($input['name']))) {
                throw new Exception('Category name is required');
            }
            
            $name = trim($input['name']);
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
            $description = isset($input['description']) ? trim($input['description']) : null;
            $color = isset($input['color']) ? $input['color'] : '#6B7280';
            $icon = isset($input['icon']) ? $input['icon'] : null;
            $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
            
            // Check if slug already exists
            $checkQuery = "SELECT id FROM marketing_categories WHERE slug = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([$slug]);
            
            if ($checkStmt->fetch()) {
                throw new Exception('A category with similar name already exists');
            }
            
            $insertQuery = "INSERT INTO marketing_categories (name, slug, description, color, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)";
            $insertStmt = $db->prepare($insertQuery);
            $result = $insertStmt->execute([$name, $slug, $description, $color, $icon, $sort_order]);
            
            if ($result) {
                $newId = $db->lastInsertId();
                echo json_encode([
                    'success' => true,
                    'message' => 'Marketing category created successfully',
                    'id' => $newId
                ]);
            } else {
                throw new Exception('Failed to create marketing category');
            }
            break;
            
        case 'PUT':
            // Update marketing category
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id']) || !isset($input['name'])) {
                throw new Exception('Category ID and name are required');
            }
            
            $id = (int)$input['id'];
            $name = trim($input['name']);
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
            $description = isset($input['description']) ? trim($input['description']) : null;
            $color = isset($input['color']) ? $input['color'] : '#6B7280';
            $icon = isset($input['icon']) ? $input['icon'] : null;
            $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
            $is_active = isset($input['is_active']) ? (bool)$input['is_active'] : true;
            
            // Check if slug already exists (excluding current record)
            $checkQuery = "SELECT id FROM marketing_categories WHERE slug = ? AND id != ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([$slug, $id]);
            
            if ($checkStmt->fetch()) {
                throw new Exception('A category with similar name already exists');
            }
            
            $updateQuery = "UPDATE marketing_categories SET name = ?, slug = ?, description = ?, color = ?, icon = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            $updateStmt = $db->prepare($updateQuery);
            $result = $updateStmt->execute([$name, $slug, $description, $color, $icon, $sort_order, $is_active ? 1 : 0, $id]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Marketing category updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update marketing category');
            }
            break;
            
        case 'DELETE':
            // Delete marketing category
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['id'])) {
                throw new Exception('Category ID is required');
            }
            
            $id = (int)$input['id'];
            
            // Check if category is being used by any packages
            $checkUsageQuery = "SELECT COUNT(*) as count FROM packages WHERE package_type = (SELECT slug FROM marketing_categories WHERE id = ?)";
            $checkUsageStmt = $db->prepare($checkUsageQuery);
            $checkUsageStmt->execute([$id]);
            $usage = $checkUsageStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($usage['count'] > 0) {
                throw new Exception('Cannot delete category that is being used by packages. Please reassign packages first.');
            }
            
            $deleteQuery = "DELETE FROM marketing_categories WHERE id = ?";
            $deleteStmt = $db->prepare($deleteQuery);
            $result = $deleteStmt->execute([$id]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Marketing category deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete marketing category');
            }
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
} catch (Error $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>