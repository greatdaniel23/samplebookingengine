<?php
// Multiple Room Images Migration Script
// Run this script once to update your database for multiple images support

require_once 'api/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Starting Multiple Room Images Migration...\n\n";
    
    // Read and execute the migration SQL
    $migrationSql = file_get_contents('database/multiple-room-images-schema.sql');
    
    if (!$migrationSql) {
        throw new Exception('Could not read migration file');
    }
    
    // Split into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $migrationSql)), 
        function($stmt) {
            return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
        }
    );
    
    $success_count = 0;
    $error_count = 0;
    
    foreach ($statements as $statement) {
        try {
            if (trim($statement)) {
                $db->exec($statement);
                $success_count++;
                echo "✅ Executed: " . substr(trim($statement), 0, 60) . "...\n";
            }
        } catch (PDOException $e) {
            $error_count++;
            // Some errors are expected (like "column already exists")
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "ℹ️  Column already exists: " . substr(trim($statement), 0, 60) . "...\n";
            } else {
                echo "❌ Error: " . $e->getMessage() . "\n";
                echo "   Statement: " . substr(trim($statement), 0, 60) . "...\n";
            }
        }
    }
    
    echo "\n=== Migration Summary ===\n";
    echo "✅ Successful statements: $success_count\n";
    echo "❌ Failed statements: $error_count\n";
    
    // Test the new columns
    echo "\n=== Testing New Columns ===\n";
    
    $test_query = "DESCRIBE rooms";
    $stmt = $db->query($test_query);
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $expected_columns = ['room_images', 'images_count', 'primary_image', 'images_updated_at', 'images_updated_by'];
    $found_columns = [];
    
    foreach ($columns as $column) {
        if (in_array($column['Field'], $expected_columns)) {
            $found_columns[] = $column['Field'];
            echo "✅ Column '{$column['Field']}' exists (Type: {$column['Type']})\n";
        }
    }
    
    $missing_columns = array_diff($expected_columns, $found_columns);
    if (empty($missing_columns)) {
        echo "✅ All required columns are present!\n";
    } else {
        echo "❌ Missing columns: " . implode(', ', $missing_columns) . "\n";
    }
    
    // Test migration of existing data
    echo "\n=== Testing Data Migration ===\n";
    
    $test_rooms = "SELECT id, name, room_image, image_folder, room_images, images_count FROM rooms WHERE room_image IS NOT NULL LIMIT 5";
    $stmt = $db->query($test_rooms);
    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($rooms) {
        echo "Sample rooms after migration:\n";
        foreach ($rooms as $room) {
            echo "  Room: {$room['name']}\n";
            echo "    - Old image: {$room['room_image']}\n";
            echo "    - Images count: {$room['images_count']}\n";
            
            if ($room['room_images']) {
                $images = json_decode($room['room_images'], true);
                echo "    - New format: " . count($images) . " image(s)\n";
                if (!empty($images)) {
                    echo "      * Primary: {$images[0]['filename']} (folder: {$images[0]['folder']})\n";
                }
            }
            echo "\n";
        }
    } else {
        echo "No rooms with images found for testing.\n";
    }
    
    echo "\n🎉 Migration completed successfully!\n";
    echo "You can now use the multiple images API endpoints.\n\n";
    
    echo "=== API Usage Examples ===\n";
    echo "Add image:    PUT /api/rooms.php {\"id\": 1, \"action\": \"add_image\", \"image_data\": {...}}\n";
    echo "Remove image: PUT /api/rooms.php {\"id\": 1, \"action\": \"remove_image\", \"filename\": \"image.webp\"}\n";
    echo "Set primary:  PUT /api/rooms.php {\"id\": 1, \"action\": \"set_primary_image\", \"filename\": \"image.webp\"}\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>