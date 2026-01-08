<?php
/**
 * Setup Local Database for Room Images Development
 * This creates a local booking_engine database and applies our room images schema
 */

try {
    echo "=== ROOM IMAGES - LOCAL DATABASE SETUP ===\n";
    
    // Connect to MySQL server (without specifying database)
    $pdo = new PDO("mysql:host=localhost", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected to MySQL server\n";
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS booking_engine");
    echo "✅ Database 'booking_engine' created/verified\n";
    
    // Use the database
    $pdo->exec("USE booking_engine");
    echo "✅ Using booking_engine database\n";
    
    // Create basic rooms table if it doesn't exist
    echo "Creating basic rooms table structure...\n";
    $createRooms = "
    CREATE TABLE IF NOT EXISTS rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL DEFAULT 'Standard',
        price DECIMAL(10,2) NOT NULL DEFAULT 100.00,
        capacity INT NOT NULL DEFAULT 2,
        description TEXT,
        size VARCHAR(100),
        beds VARCHAR(100),
        available BOOLEAN DEFAULT TRUE,
        features JSON,
        amenities JSON,
        images JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($createRooms);
    echo "✅ Rooms table ready\n";
    
    // Add some sample rooms if table is empty
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rooms");
    $count = $stmt->fetch()['count'];
    
    if ($count == 0) {
        echo "Adding sample rooms...\n";
        $sampleRooms = [
            ['Deluxe Suite', 'Deluxe', 250.00, 4, 'Spacious suite with mountain view', '45 sqm', '1 King bed'],
            ['Standard Room', 'Standard', 150.00, 2, 'Comfortable standard accommodation', '25 sqm', '1 Queen bed'],
            ['Family Room', 'Family', 300.00, 6, 'Perfect for families with children', '60 sqm', '2 Queen beds'],
            ['Master Suite', 'Presidential', 450.00, 2, 'Luxurious master suite with all amenities', '80 sqm', '1 King bed + Sofa'],
            ['Economy Room', 'Economy', 100.00, 2, 'Budget-friendly option', '20 sqm', '2 Single beds']
        ];
        
        $insertStmt = $pdo->prepare("
            INSERT INTO rooms (name, type, price, capacity, description, size, beds) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($sampleRooms as $room) {
            $insertStmt->execute($room);
        }
        echo "✅ Added 5 sample rooms\n";
    } else {
        echo "ℹ️  Found $count existing rooms\n";
    }
    
    // Now apply the room images schema
    echo "\nApplying room images schema...\n";
    
    // Add room image columns
    $alterStatements = [
        "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_image VARCHAR(500) NULL COMMENT 'Path to selected room image'",
        "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_folder VARCHAR(100) NULL COMMENT 'Folder containing the image'", 
        "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_selected_at TIMESTAMP NULL COMMENT 'When image was last updated'",
        "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_selected_by VARCHAR(100) DEFAULT 'admin' COMMENT 'Who selected the image'"
    ];
    
    foreach ($alterStatements as $sql) {
        try {
            $pdo->exec($sql);
            echo "✅ " . substr($sql, 0, 50) . "...\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                echo "ℹ️  Column already exists: " . substr($sql, 0, 50) . "...\n";
            } else {
                echo "⚠️  Warning: " . $e->getMessage() . "\n";
            }
        }
    }
    
    // Add indexes for performance
    $indexStatements = [
        "ALTER TABLE rooms ADD INDEX IF NOT EXISTS idx_room_image (room_image)",
        "ALTER TABLE rooms ADD INDEX IF NOT EXISTS idx_image_folder (image_folder)"
    ];
    
    foreach ($indexStatements as $sql) {
        try {
            $pdo->exec($sql);
            echo "✅ " . substr($sql, 0, 40) . "...\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate key') !== false) {
                echo "ℹ️  Index already exists\n";
            } else {
                echo "⚠️  Index warning: " . $e->getMessage() . "\n";
            }
        }
    }
    
    // Create optional usage tracking table
    echo "\nCreating room image usage tracking table...\n";
    $createUsageTable = "
    CREATE TABLE IF NOT EXISTS room_image_usage (
        id INT PRIMARY KEY AUTO_INCREMENT,
        room_id INT NOT NULL,
        image_path VARCHAR(500) NOT NULL,
        image_folder VARCHAR(100) NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by VARCHAR(100) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        INDEX idx_room_usage (room_id),
        INDEX idx_active_usage (is_active)
    )";
    $pdo->exec($createUsageTable);
    echo "✅ Room image usage table ready\n";
    
    // Final verification
    echo "\n=== VERIFICATION ===\n";
    $stmt = $pdo->query("DESCRIBE rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $imageColumns = array_filter($columns, function($col) {
        return in_array($col['Field'], ['room_image', 'image_folder', 'image_selected_at', 'image_selected_by']);
    });
    
    if (count($imageColumns) > 0) {
        echo "✅ Room image columns successfully added:\n";
        foreach ($imageColumns as $col) {
            echo "  - {$col['Field']}: {$col['Type']}\n";
        }
    }
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM rooms");
    $roomCount = $stmt->fetch()['count'];
    echo "📊 Total rooms available: $roomCount\n";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'room_image_usage'");
    $usageTable = $stmt->fetch();
    echo $usageTable ? "✅ Usage tracking table: Available\n" : "❌ Usage tracking table: Missing\n";
    
    echo "\n🎉 LOCAL DATABASE SETUP COMPLETE!\n";
    echo "📍 Database: booking_engine (local)\n";
    echo "🔗 Access: http://localhost/phpmyadmin\n";
    echo "🚀 Ready for room image selection testing!\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "💡 Make sure XAMPP MySQL is running\n";
}
?>