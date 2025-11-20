<?php
// Test database connection and packages table structure
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "✅ Database connection successful\n\n";
    
    // Check if packages table exists and get its structure
    $stmt = $db->query("DESCRIBE packages");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📋 Packages table structure:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) " . 
             ($column['Null'] === 'NO' ? 'NOT NULL' : 'NULL') . 
             ($column['Default'] ? " DEFAULT {$column['Default']}" : '') . "\n";
    }
    
    // Test a simple SELECT to make sure table has data
    $stmt = $db->query("SELECT COUNT(*) as count FROM packages");
    $count = $stmt->fetchColumn();
    echo "\n📊 Total packages in database: {$count}\n";
    
    // Test a sample package
    if ($count > 0) {
        $stmt = $db->query("SELECT id, name, package_type, base_price, is_active FROM packages LIMIT 1");
        $sample = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "\n🔍 Sample package:\n";
        print_r($sample);
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>