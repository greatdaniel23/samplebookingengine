<?php
/**
 * Seed Room-Amenity Relationships
 * Quick seeding script to populate room_amenities table for testing
 */

require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "🌱 Seeding room-amenity relationships...\n\n";
    
    // Clear existing relationships
    $pdo->exec("DELETE FROM room_amenities");
    $pdo->exec("DELETE FROM package_amenities");
    echo "✅ Cleared existing relationships\n";
    
    // Define room-amenity mappings
    $roomAmenities = [
        'deluxe-suite' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 21], // Premium amenities
        'master-suite' => [1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 21, 25], // Ultra luxury
        'family-room' => [1, 2, 3, 4, 5, 10, 22, 23], // Family friendly
        'standard-room' => [1, 2, 3, 4, 7], // Basic amenities
        'economy-room' => [1, 3, 4] // Essential only
    ];
    
    // Define package-amenity mappings (perks)
    $packageAmenities = [
        1 => [11, 14, 16, 20], // Romantic Getaway
        2 => [11, 15, 18, 19], // Family Adventure  
        3 => [11, 13, 15, 24], // Business Executive
        4 => [16, 17, 18, 20], // Luxury Wellness
        5 => [11, 18, 22, 25]  // Adventure Explorer
    ];
    
    // Insert room-amenity relationships
    foreach ($roomAmenities as $roomId => $amenityIds) {
        foreach ($amenityIds as $amenityId) {
            $isHighlighted = in_array($amenityId, [1, 2, 8, 9, 21]) ? 1 : 0; // Highlight key amenities
            
            $stmt = $pdo->prepare("INSERT INTO room_amenities (room_id, amenity_id, is_highlighted) VALUES (?, ?, ?)");
            $stmt->execute([$roomId, $amenityId, $isHighlighted]);
        }
        echo "✅ Added amenities for room: $roomId\n";
    }
    
    // Insert package-amenity relationships  
    foreach ($packageAmenities as $packageId => $amenityIds) {
        foreach ($amenityIds as $amenityId) {
            $isHighlighted = in_array($amenityId, [11, 16, 25]) ? 1 : 0; // Highlight premium perks
            
            $stmt = $pdo->prepare("INSERT INTO package_amenities (package_id, amenity_id, is_highlighted) VALUES (?, ?, ?)");
            $stmt->execute([$packageId, $amenityId, $isHighlighted]);
        }
        echo "✅ Added perks for package: $packageId\n";
    }
    
    // Show summary
    $roomCount = $pdo->query("SELECT COUNT(*) FROM room_amenities")->fetchColumn();
    $packageCount = $pdo->query("SELECT COUNT(*) FROM package_amenities")->fetchColumn();
    
    echo "\n🎉 Seeding complete!\n";
    echo "📊 Room-amenity relationships: $roomCount\n";
    echo "📦 Package-amenity relationships: $packageCount\n";
    echo "\n🧪 Test URLs:\n";
    echo "- GET /amenities.php/room-amenities/deluxe-suite\n";
    echo "- GET /amenities.php/package-amenities/1\n";
    echo "- GET /amenities.php/sales-tool/1\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Details: " . $e->getFile() . " line " . $e->getLine() . "\n";
}
?>