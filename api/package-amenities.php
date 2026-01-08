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
            handleAddPackageAmenity($pdo);
            break;
        case 'remove':
            handleRemovePackageAmenity($pdo);
            break;
        case 'list':
        default:
            handleGetPackageAmenities($pdo);
            break;
    }
    
} catch (Exception $e) {
    error_log("Package Amenities API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error']);
}

function handleGetPackageAmenities($pdo) {
    try {
        $packageId = $_GET['package_id'] ?? null;
        
        if ($packageId) {
            // Get amenities for specific package
                // Return only user-facing fields to avoid leaking internal values like display_order
                $sql = "SELECT 
                    a.id,
                    a.name,
                    a.category,
                    a.description,
                    a.icon,
                    IF(pa.is_highlighted = 1, true, false) as is_highlighted,
                    pa.custom_note
                    FROM amenities a 
                    JOIN package_amenities pa ON a.id = pa.amenity_id 
                    WHERE pa.package_id = ? AND a.is_active = 1 
                    ORDER BY a.category, a.display_order, a.name";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$packageId]);
            $amenities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convert numeric booleans to actual booleans for JSON
            foreach ($amenities as &$amenity) {
                if (isset($amenity['is_highlighted'])) {
                    $amenity['is_highlighted'] = (bool)$amenity['is_highlighted'];
                }
            }
            
            echo json_encode([
                'success' => true,
                'package_id' => $packageId,
                'amenities' => $amenities
            ]);
        } else {
            // Get all available amenities for package assignment
                // Limit to fields needed by UI; exclude internal fields like display_order
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
        error_log("Error getting package amenities: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handleAddPackageAmenity($pdo) {
    try {
        // Get parameters from GET since server converts POST to GET
        $packageId = $_GET['package_id'] ?? null;
        $amenityId = $_GET['amenity_id'] ?? null;
        $isHighlighted = isset($_GET['is_highlighted']) ? (bool)$_GET['is_highlighted'] : false;
        $customNote = $_GET['custom_note'] ?? null;
        
        if (!$packageId || !$amenityId) {
            throw new Exception("Package ID and Amenity ID are required");
        }
        
        // Check if package exists
        $packageCheck = $pdo->prepare("SELECT id FROM packages WHERE id = ?");
        $packageCheck->execute([$packageId]);
        if (!$packageCheck->fetchColumn()) {
            throw new Exception("Package not found");
        }
        
        // Check if amenity exists
        $amenityCheck = $pdo->prepare("SELECT id FROM amenities WHERE id = ? AND is_active = 1");
        $amenityCheck->execute([$amenityId]);
        if (!$amenityCheck->fetchColumn()) {
            throw new Exception("Amenity not found or inactive");
        }
        
        // Insert package-amenity relationship (ON DUPLICATE KEY UPDATE for upsert)
        $sql = "INSERT INTO package_amenities (package_id, amenity_id, is_highlighted, custom_note) 
                VALUES (?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                is_highlighted = VALUES(is_highlighted), 
                custom_note = VALUES(custom_note)";
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$packageId, $amenityId, $isHighlighted, $customNote]);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Amenity added to package successfully',
                'package_id' => $packageId,
                'amenity_id' => $amenityId,
                'affected_rows' => $stmt->rowCount()
            ]);
        } else {
            throw new Exception("Failed to add amenity to package");
        }
        
    } catch (Exception $e) {
        error_log("Error adding package amenity: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handleRemovePackageAmenity($pdo) {
    try {
        $packageId = $_GET['package_id'] ?? null;
        $amenityId = $_GET['amenity_id'] ?? null;
        
        if (!$packageId || !$amenityId) {
            throw new Exception("Package ID and Amenity ID are required");
        }
        
        $sql = "DELETE FROM package_amenities WHERE package_id = ? AND amenity_id = ?";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute([$packageId, $amenityId])) {
            echo json_encode([
                'success' => true,
                'message' => 'Amenity removed from package successfully'
            ]);
        } else {
            throw new Exception("Failed to remove amenity from package");
        }
        
    } catch (Exception $e) {
        error_log("Error removing package amenity: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>