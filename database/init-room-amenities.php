<?php
/**
 * Database initialization script for room amenities functionality
 * Run this file once to set up the room_amenities table
 */

require_once __DIR__ . '/../api/config/database.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔄 Creating room_amenities table...\n";
    
    // Create room_amenities table
    $sql = "
    CREATE TABLE IF NOT EXISTS `room_amenities` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `room_id` int(11) NOT NULL,
      `amenity_id` int(11) NOT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (`id`),
      UNIQUE KEY `unique_room_amenity` (`room_id`, `amenity_id`),
      KEY `idx_room_id` (`room_id`),
      KEY `idx_amenity_id` (`amenity_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
    echo "✅ room_amenities table created successfully\n";
    
    // Check if we have any sample data to add
    $roomCount = $pdo->query("SELECT COUNT(*) FROM rooms")->fetchColumn();
    $amenityCount = $pdo->query("SELECT COUNT(*) FROM amenities")->fetchColumn();
    
    echo "📊 Current data: {$roomCount} rooms, {$amenityCount} amenities\n";
    
    if ($roomCount > 0 && $amenityCount > 0) {
        echo "🎯 You can now assign amenities to rooms through the admin interface!\n";
        echo "👉 Go to Admin Panel > Room Inventory Management > Click 'Amenities' on any room card\n";
    } else {
        if ($roomCount == 0) {
            echo "⚠️  No rooms found. Create some rooms first in the admin panel.\n";
        }
        if ($amenityCount == 0) {
            echo "⚠️  No amenities found. Create some amenities first in the admin panel.\n";
        }
    }
    
    echo "\n🚀 Room amenities functionality is now ready!\n";
    
} catch(PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
} catch(Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>