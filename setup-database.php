<?php
/**
 * Database Setup Script
 * Run this file to automatically create the database and tables
 */

// Database connection settings
$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Connect to MySQL server (without specifying database)
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to MySQL server successfully.<br>";
    
    // Read and execute the schema.sql file
    $schema = file_get_contents(__DIR__ . '/database/schema.sql');
    
    if ($schema === false) {
        throw new Exception("Could not read schema.sql file");
    }
    
    // Split the SQL into individual statements
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }
    
    echo "Database setup completed successfully!<br>";
    echo "Database 'booking_engine' created with all tables and sample data.<br>";
    echo "<a href='api/rooms'>Test API: /api/rooms</a><br>";
    echo "<a href='index.html'>Go to Booking Engine</a>";
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "<br>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
}
?>