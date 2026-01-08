<?php
// Add missing columns to villa_info table
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // List of columns to add with their definitions
    $columnsToAdd = [
        'phone' => 'VARCHAR(50) DEFAULT ""',
        'email' => 'VARCHAR(255) DEFAULT ""',
        'website' => 'VARCHAR(255) DEFAULT ""',
        'address' => 'TEXT DEFAULT ""',
        'city' => 'VARCHAR(100) DEFAULT ""',
        'state' => 'VARCHAR(100) DEFAULT ""',
        'zip_code' => 'VARCHAR(20) DEFAULT ""',
        'country' => 'VARCHAR(100) DEFAULT "Indonesia"',
        'check_in_time' => 'VARCHAR(20) DEFAULT "15:00"',
        'check_out_time' => 'VARCHAR(20) DEFAULT "11:00"',
        'max_guests' => 'INT DEFAULT 8',
        'bedrooms' => 'INT DEFAULT 4',
        'bathrooms' => 'INT DEFAULT 3', 
        'price_per_night' => 'DECIMAL(10,2) DEFAULT 0.00',
        'currency' => 'VARCHAR(10) DEFAULT "USD"',
        'cancellation_policy' => 'TEXT DEFAULT ""',
        'house_rules' => 'TEXT DEFAULT ""',
        'social_media' => 'JSON'
    ];
    
    $results = [];
    
    foreach ($columnsToAdd as $column => $definition) {
        try {
            // Check if column exists
            $checkColumn = "SHOW COLUMNS FROM villa_info LIKE '$column'";
            $stmt = $db->prepare($checkColumn);
            $stmt->execute();
            
            if ($stmt->rowCount() == 0) {
                // Column doesn't exist, add it
                $addColumn = "ALTER TABLE villa_info ADD COLUMN $column $definition";
                $db->exec($addColumn);
                $results[] = "Added column: $column";
            } else {
                $results[] = "Column already exists: $column";
            }
        } catch (Exception $e) {
            $results[] = "Error adding column $column: " . $e->getMessage();
        }
    }
    
    echo json_encode([
        "success" => true, 
        "message" => "Database migration completed",
        "results" => $results
    ]);
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>