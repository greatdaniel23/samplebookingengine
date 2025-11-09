<?php
// Check packages table structure
require_once '../api/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get table structure
    $stmt = $db->query("DESCRIBE packages");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Packages table structure:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} (Default: {$column['Default']})\n";
    }
    
    // Get sample data
    echo "\nSample package data:\n";
    $stmt = $db->query("SELECT id, name, package_type, base_price, is_active FROM packages LIMIT 2");
    $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($packages as $pkg) {
        echo "ID: {$pkg['id']}, Name: {$pkg['name']}, Type: {$pkg['package_type']}, Price: {$pkg['base_price']}, Active: {$pkg['is_active']}\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>