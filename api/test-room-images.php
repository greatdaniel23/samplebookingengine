<?php
require_once 'config/database-local.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== ROOM IMAGES - DATABASE TEST ===\n";
    
    // Check rooms
    $stmt = $db->query("SELECT id, name, type, price FROM rooms ORDER BY id");
    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Available rooms:\n";
    foreach ($rooms as $room) {
        echo "- ID: {$room['id']}, Name: {$room['name']}, Type: {$room['type']}, Price: ${$room['price']}\n";
    }
    
    // Test room images API locally
    echo "\nTesting room image API for room ID " . $rooms[0]['id'] . ":\n";
    
    $roomId = $rooms[0]['id'];
    $stmt = $db->prepare("SELECT id, name, room_image, image_folder, image_selected_at FROM rooms WHERE id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($room) {
        echo "✅ Room found: {$room['name']}\n";
        echo "  - Room Image: " . ($room['room_image'] ?? 'None') . "\n";
        echo "  - Image Folder: " . ($room['image_folder'] ?? 'None') . "\n";
        echo "  - Selected At: " . ($room['image_selected_at'] ?? 'Never') . "\n";
    } else {
        echo "❌ Room not found\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>