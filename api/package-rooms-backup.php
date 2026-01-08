<?php
/**
 * Package-Room Relationships API
 * Endpoint: https://api.rumahdaisycantik.com/package-rooms.php
 * 
 * Manages many-to-many relationships between packages and rooms
 * with pricing adjustments and room options
 */

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
            function handleGet($db) {
                try {
                    $includeInactive = isset($_GET['include_inactive']) && ($_GET['include_inactive'] === '1' || strtolower($_GET['include_inactive']) === 'true');

                    if (isset($_GET['package_id'])) {
                        // Get rooms for a specific package
                        $packageId = $_GET['package_id'];

                        $sql = "
                            SELECT 
                                pr.id, pr.package_id, pr.room_id, pr.is_default, pr.price_adjustment, pr.adjustment_type,
                                pr.max_occupancy_override, pr.availability_priority, pr.is_active, pr.description,
                                r.name AS room_name
                            FROM package_rooms pr
                            LEFT JOIN rooms r ON pr.room_id = r.id
                            WHERE pr.package_id = ? " . ($includeInactive ? "" : "AND pr.is_active = 1") . "
                            ORDER BY pr.availability_priority ASC, pr.is_default DESC
                        ";
                        $stmt = $db->prepare($sql);
                        $stmt->execute([$packageId]);
                        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        echo json_encode(['success' => true, 'data' => $rooms]);

                    } elseif (isset($_GET['room_id'])) {
                        // Get packages for a specific room
                        $roomId = $_GET['room_id'];

                        $sql = "
                            SELECT 
                                pr.id, pr.package_id, pr.room_id, pr.is_default, pr.price_adjustment, pr.adjustment_type,
                                pr.max_occupancy_override, pr.availability_priority, pr.is_active, pr.description,
                                p.name AS package_name, p.type AS package_type
                            FROM package_rooms pr
                            LEFT JOIN packages p ON pr.package_id = p.id
                            WHERE pr.room_id = ? " . ($includeInactive ? "" : "AND pr.is_active = 1") . "
                            ORDER BY p.name ASC
                        ";
                        $stmt = $db->prepare($sql);
                        $stmt->execute([$roomId]);
                        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        echo json_encode(['success' => true, 'data' => $packages]);

                    } else {
                        // Get all package-room relationships
                        $sql = "
                            SELECT 
                                pr.id, pr.package_id, pr.room_id, pr.is_default, pr.price_adjustment, pr.adjustment_type,
                                pr.max_occupancy_override, pr.availability_priority, pr.is_active, pr.description,
                                p.name AS package_name, r.name AS room_name
                            FROM package_rooms pr
                            LEFT JOIN packages p ON pr.package_id = p.id
                            LEFT JOIN rooms r ON pr.room_id = r.id
                            " . ($includeInactive ? "" : "WHERE pr.is_active = 1") . "
                            ORDER BY p.name ASC, pr.availability_priority ASC
                        ";
                        $stmt = $db->query($sql);
                        $relationships = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        echo json_encode(['success' => true, 'data' => $relationships]);
                    }
                } catch (Exception $e) {
                    error_log("Get Package-Room Error: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Failed to retrieve data', 'details' => $e->getMessage()]);
                }
            $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $packages]);
            
        } else {
            // Get all package-room relationships
            $stmt = $db->query("
                SELECT pr.*, p.name as package_name, r.name as room_name
                $stmt = $db->prepare("\n                SELECT pr.id, pr.package_id, pr.room_id, pr.is_default, pr.price_adjustment, pr.adjustment_type,\n                       pr.max_occupancy_override, pr.availability_priority, pr.is_active, pr.description,\n                       p.name as package_name, p.type as package_type\n                FROM package_rooms pr\n                JOIN packages p ON pr.package_id = p.id\n                WHERE pr.room_id = ? AND pr.is_active = 1\n                ORDER BY p.name ASC\n            ");
                JOIN packages p ON pr.package_id = p.id
                JOIN rooms r ON pr.room_id = r.id
                WHERE pr.is_active = 1
                ORDER BY p.name ASC, pr.availability_priority ASC
            ");
            $relationships = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $relationships]);
        }
        
    } catch (Exception $e) {
        error_log("Get Package-Room Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to retrieve data']);
    }
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to retrieve data', 'details' => $e->getMessage()]);
function handlePost($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
            return;
        }
        
        // Validate required fields
        $required = ['package_id', 'room_id'];
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
                return;
            }
        }
        
        // Check if relationship already exists
        $stmt = $db->prepare("SELECT id FROM package_rooms WHERE package_id = ? AND room_id = ?");
        $stmt->execute([$input['package_id'], $input['room_id']]);
        
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Package-room relationship already exists']);
            return;
        }
        
        // Insert new relationship
        $stmt = $db->prepare("
            INSERT INTO package_rooms (
                package_id, room_id, is_default, price_adjustment, adjustment_type,
                max_occupancy_override, availability_priority, is_active, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $success = $stmt->execute([
            $input['package_id'],
            $input['room_id'],
            $input['is_default'] ?? 0,
            $input['price_adjustment'] ?? 0.00,
            $input['adjustment_type'] ?? 'fixed',
            $input['max_occupancy_override'] ?? null,
            $input['availability_priority'] ?? 1,
            $input['is_active'] ?? 1,
            $input['description'] ?? null
        ]);
        
        if ($success) {
            $relationshipId = $db->lastInsertId();
            
            // If this is set as default, remove default from other rooms
            if (!empty($input['is_default'])) {
                $stmt = $db->prepare("
                    UPDATE package_rooms 
                    SET is_default = 0 
                    WHERE package_id = ? AND id != ?
                ");
                $stmt->execute([$input['package_id'], $relationshipId]);
            }
            
            echo json_encode([
                'success' => true, 
                'message' => 'Package-room relationship created successfully',
                'data' => ['id' => intval($relationshipId)]
            ]);
        } else {
            throw new Exception('Failed to create package-room relationship');
        }
        
    } catch (Exception $e) {
        error_log("Create Package-Room Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create relationship']);
    }
}

function handlePut($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid input or missing ID']);
            return;
        }
        
        $relationshipId = $_GET['id'];
        
        // Build dynamic update query
        $updateFields = [];
        $values = [];
        
        $allowedFields = [
            'is_default', 'price_adjustment', 'adjustment_type',
            'max_occupancy_override', 'availability_priority', 'is_active', 'description'
        ];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateFields[] = "$field = ?";
                $values[] = $input[$field];
            }
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No valid fields to update']);
            return;
        }
        
        $values[] = $relationshipId;
        
        $stmt = $db->prepare("
            UPDATE package_rooms 
            SET " . implode(', ', $updateFields) . ", updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        
        $success = $stmt->execute($values);
        
        if ($success) {
            // If setting as default, remove default from other rooms in same package
            if (!empty($input['is_default'])) {
                $stmt = $db->prepare("
                    SELECT package_id FROM package_rooms WHERE id = ?
                ");
                $stmt->execute([$relationshipId]);
                $packageId = $stmt->fetchColumn();
                
                if ($packageId) {
                    $stmt = $db->prepare("
                        UPDATE package_rooms 
                        SET is_default = 0 
                        WHERE package_id = ? AND id != ?
                    ");
                    $stmt->execute([$packageId, $relationshipId]);
                }
            }
            
            echo json_encode([
                'success' => true, 
                'message' => 'Package-room relationship updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update package-room relationship');
        }
        
    } catch (Exception $e) {
        error_log("Update Package-Room Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update relationship']);
    }
}

function handleDelete($db) {
    try {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing relationship ID']);
            return;
        }
        
        $relationshipId = $_GET['id'];
        
        // Check if relationship exists
        $stmt = $db->prepare("SELECT id FROM package_rooms WHERE id = ?");
        $stmt->execute([$relationshipId]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Package-room relationship not found']);
            return;
        }
        
        // Soft delete (set is_active = 0) or hard delete
        if (isset($_GET['hard_delete']) && $_GET['hard_delete'] === 'true') {
            $stmt = $db->prepare("DELETE FROM package_rooms WHERE id = ?");
        } else {
            $stmt = $db->prepare("UPDATE package_rooms SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        }
        
        $success = $stmt->execute([$relationshipId]);
        
        if ($success) {
            echo json_encode([
                'success' => true, 
                'message' => 'Package-room relationship removed successfully'
            ]);
        } else {
            throw new Exception('Failed to remove package-room relationship');
        }
        
    } catch (Exception $e) {
        error_log("Delete Package-Room Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to remove relationship']);
    }
}
?>