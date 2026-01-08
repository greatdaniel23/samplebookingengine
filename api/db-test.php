<?php
// Minimal database connection test
header('Content-Type: text/plain');

try {
    $host = 'localhost';
    $database = 'u289291769_booking'; 
    $username = 'u289291769_booking';
    $password = 'Kanibal123!!!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Database connection: SUCCESS\n";
    
    // Test villa_info table
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM villa_info");
    $result = $stmt->fetch();
    echo "Villa info records: " . $result['count'] . "\n";
    
    echo "Status: OK";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>