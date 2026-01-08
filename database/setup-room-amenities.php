<?php
/**
 * Web-based database initialization for room amenities functionality
 * Access this file via browser: http://localhost/frontend-booking-engine/database/setup-room-amenities.php
 */

// Include the database configuration
require_once __DIR__ . '/../api/config/database.php';

// Create database connection
try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    echo "<h2>🔄 Room Amenities Setup</h2>\n";
    echo "<pre>\n";
    
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
    echo "</pre>\n";
    
} catch(PDOException $e) {
    echo "<pre>❌ Database error: " . $e->getMessage() . "</pre>\n";
} catch(Exception $e) {
    echo "<pre>❌ Error: " . $e->getMessage() . "</pre>\n";
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Room Amenities Setup</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        pre { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        h2 { color: #333; }
    </style>
</head>
<body>
    <p><a href="../admin-dashboard.html">← Back to Admin Dashboard</a></p>
    <p><strong>Instructions:</strong> This script creates the room_amenities table needed for the room amenities functionality.</p>
</body>
</html>