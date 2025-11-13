<?php
/**
 * Create Local Database for XAMPP Development
 */

try {
    // Connect to MySQL server (without specifying database)
    $pdo = new PDO("mysql:host=localhost", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to MySQL server\n";
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS villa_booking");
    echo "✅ Database 'villa_booking' created/verified\n";
    
    // Use the database
    $pdo->exec("USE villa_booking");
    echo "✅ Using villa_booking database\n";
    
    // Read and execute the SQL install script
    $sqlFile = __DIR__ . '/database/enhanced-install-complete.sql';
    if (file_exists($sqlFile)) {
        $sql = file_get_contents($sqlFile);
        
        // Split SQL statements by semicolon and execute each one
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                try {
                    $pdo->exec($statement);
                } catch (PDOException $e) {
                    // Skip errors for CREATE TABLE IF NOT EXISTS, etc.
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        echo "⚠️  SQL Warning: " . $e->getMessage() . "\n";
                    }
                }
            }
        }
        
        echo "✅ Database schema installed successfully\n";
    } else {
        echo "❌ SQL file not found: $sqlFile\n";
    }
    
    // Test basic operations
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "📋 Created tables: " . implode(', ', $tables) . "\n";
    echo "🎉 Local database setup complete!\n";
    
} catch (PDOException $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
}
?>