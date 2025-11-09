<?php
// Check bookings table structure
require_once '../api/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get table structure
    $stmt = $db->query("DESCRIBE bookings");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Bookings table structure:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} (Default: {$column['Default']})\n";
    }
    
    // Get sample data
    echo "\nSample booking data:\n";
    $stmt = $db->query("SELECT * FROM bookings LIMIT 3");
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($bookings as $booking) {
        echo "ID: {$booking['id']}, Reference: {$booking['reference']}, Room: {$booking['room_id']}, Guest: {$booking['first_name']} {$booking['last_name']}, Status: {$booking['status']}\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>