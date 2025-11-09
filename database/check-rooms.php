<?php
// Check rooms table structure
require_once '../api/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get table structure
    $stmt = $db->query("DESCRIBE rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Rooms table structure:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} (Default: {$column['Default']})\n";
    }
    
    // Get sample data
    echo "\nSample room data:\n";
    $stmt = $db->query("SELECT * FROM rooms LIMIT 3");
    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($rooms as $room) {
        echo "ID: {$room['id']}, Name: {$room['name']}, Type: {$room['type']}, Price: {$room['price']}\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>