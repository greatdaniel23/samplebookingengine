<?php
/**
 * CHECK PACKAGES TABLE SCHEMA
 * See what columns actually exist in the packages table
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== CHECKING PACKAGES TABLE SCHEMA ===\n\n";

try {
    // Using simpler database connection for localhost
    $host = 'localhost';
    $dbname = 'booking_engine';  // Correct local database name
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully\n\n";
    
    // Check packages table structure
    $stmt = $pdo->query("DESCRIBE packages");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "PACKAGES TABLE COLUMNS:\n";
    echo str_repeat("-", 60) . "\n";
    printf("%-20s %-15s %-8s %-8s %-15s\n", "Column", "Type", "Null", "Key", "Default");
    echo str_repeat("-", 60) . "\n";
    
    foreach ($columns as $column) {
        printf("%-20s %-15s %-8s %-8s %-15s\n", 
            $column['Field'], 
            $column['Type'], 
            $column['Null'], 
            $column['Key'], 
            $column['Default'] ?? 'NULL'
        );
    }
    
    echo "\nAnd let me check a sample package record:\n";
    $stmt = $pdo->query("SELECT * FROM packages LIMIT 1");
    $sample = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($sample) {
        echo "Sample Package Record:\n";
        foreach ($sample as $key => $value) {
            echo "  $key: " . (is_null($value) ? 'NULL' : $value) . "\n";
        }
    } else {
        echo "No packages found in the table\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nSchema check completed at: " . date('Y-m-d H:i:s') . "\n";
?>