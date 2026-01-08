<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Test just the delete functionality
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['action']) && $input['action'] === 'delete') {
            // Simple delete test
            $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
            $result = $stmt->execute([$input['id']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Deleted successfully', 'rows_affected' => $stmt->rowCount()]);
            } else {
                echo json_encode(['success' => false, 'error' => 'No booking found with that ID']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Only POST method supported in test']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Exception: ' . $e->getMessage(), 'line' => $e->getLine()]);
}
?>