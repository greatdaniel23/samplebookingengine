<?php
// Debug script to test database connection and PUT functionality
header("Content-Type: text/plain");

echo "🧪 Testing Database Connection and PUT Functionality\n\n";

// Test database connection first
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    echo "✅ Database connection successful\n\n";
    
    // Check packages table structure
    $stmt = $db->query("DESCRIBE packages");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "📋 Packages table columns:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']})\n";
    }
    echo "\n";
    
    // Test data for PUT request
    $testPackageData = [
        'id' => 1,
        'name' => 'Test Updated Package',
        'description' => 'Updated description for testing',
        'type' => 'Romance',
        'price' => 299.99,
        'max_guests' => 2,
        'available' => 1,
        'inclusions' => ['Champagne', 'Rose petals', 'Spa treatment'],
        'min_nights' => 2,
        'max_nights' => 5,
        'discount_percentage' => 15
    ];
    
    echo "📤 Test PUT data:\n";
    echo json_encode($testPackageData, JSON_PRETTY_PRINT) . "\n\n";
    
    // Test the UPDATE query directly
    $stmt = $db->prepare("
        UPDATE packages SET 
            name = ?, description = ?, package_type = ?, base_price = ?, 
            max_guests = ?, is_active = ?, includes = ?, min_nights = ?, max_nights = ?, discount_percentage = ?
        WHERE id = ?
    ");
    
    $packageType = $testPackageData['type'];
    $basePrice = $testPackageData['price'];
    $isActive = $testPackageData['available'];
    $includes = json_encode($testPackageData['inclusions']);
    
    $result = $stmt->execute([
        $testPackageData['name'],
        $testPackageData['description'],
        $packageType,
        $basePrice,
        $testPackageData['max_guests'],
        $isActive,
        $includes,
        $testPackageData['min_nights'],
        $testPackageData['max_nights'],
        $testPackageData['discount_percentage'],
        $testPackageData['id']
    ]);
    
    if ($result) {
        echo "✅ UPDATE query successful! Affected rows: " . $stmt->rowCount() . "\n";
        
        // Verify the update
        $stmt = $db->prepare("SELECT * FROM packages WHERE id = ?");
        $stmt->execute([$testPackageData['id']]);
        $updated = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($updated) {
            echo "\n� Updated package data:\n";
            print_r($updated);
        }
    } else {
        echo "❌ UPDATE query failed\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Error details:\n";
    echo "- File: " . $e->getFile() . "\n";
    echo "- Line: " . $e->getLine() . "\n";
    echo "- Trace: " . $e->getTraceAsString() . "\n";
}
?>