<?php
/**
 * Debug script to check database structure
 */

require_once __DIR__ . '/api/config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "<h3>Database Connection Test</h3>";
    echo "Connected successfully!<br><br>";
    
    // Show all databases
    echo "<h3>Available Databases:</h3>";
    $stmt = $conn->query("SHOW DATABASES");
    while ($row = $stmt->fetch()) {
        echo "- " . $row[0] . "<br>";
    }
    
    // Check if booking_engine database exists and select it
    echo "<br><h3>Tables in booking_engine database:</h3>";
    $conn->exec("USE booking_engine");
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "No tables found in booking_engine database!<br>";
    } else {
        foreach ($tables as $table) {
            echo "- $table<br>";
        }
        
        // Show structure of rooms table if it exists
        if (in_array('rooms', $tables)) {
            echo "<br><h3>Structure of 'rooms' table:</h3>";
            $stmt = $conn->query("DESCRIBE rooms");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "<table border='1'>";
            echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
            foreach ($columns as $column) {
                echo "<tr>";
                echo "<td>" . $column['Field'] . "</td>";
                echo "<td>" . $column['Type'] . "</td>";
                echo "<td>" . $column['Null'] . "</td>";
                echo "<td>" . $column['Key'] . "</td>";
                echo "<td>" . $column['Default'] . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>