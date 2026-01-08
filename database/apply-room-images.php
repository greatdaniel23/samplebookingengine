<?php
/**
 * Apply Room Images Schema
 * Applies the room image columns to the rooms table
 */

require_once '../api/config/database.php';

try {
    echo "Connecting to database...\n";
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Applying room images schema...\n";
    
    // Read and execute the SQL file
    $sql = file_get_contents('room-images-schema.sql');
    $statements = explode(';', $sql);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement)) continue;
        
        echo "Executing: " . substr($statement, 0, 50) . "...\n";
        $db->exec($statement);
    }
    
    echo "✅ Room images schema applied successfully!\n";
    
    // Verify the changes
    echo "\nVerifying schema changes:\n";
    $stmt = $db->query("DESCRIBE rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $imageColumns = array_filter($columns, function($col) {
        return in_array($col['Field'], ['room_image', 'image_folder', 'image_selected_at', 'image_selected_by']);
    });
    
    if (count($imageColumns) > 0) {
        echo "✅ Room image columns found:\n";
        foreach ($imageColumns as $col) {
            echo "  - {$col['Field']}: {$col['Type']}\n";
        }
    } else {
        echo "❌ Room image columns not found!\n";
    }
    
    // Check if usage table was created
    $stmt = $db->query("SHOW TABLES LIKE 'room_image_usage'");
    $usageTable = $stmt->fetch();
    
    if ($usageTable) {
        echo "✅ room_image_usage table created successfully\n";
    } else {
        echo "ℹ️  room_image_usage table not created (optional)\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>