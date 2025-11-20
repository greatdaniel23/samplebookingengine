<?php
/**
 * API CREATE ENDPOINT TESTING
 * Test script to verify why amenities, packages, and rooms cannot be created
 * Date: November 19, 2025
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== API CREATE ENDPOINT TESTING ===\n";
echo "Testing amenities, packages, and rooms creation\n\n";

// Test base URLs
$baseUrl = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api';

function testAPI($url, $data, $name) {
    echo "Testing $name Creation:\n";
    echo "URL: $url\n";
    echo "Data: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_VERBOSE, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    if ($error) {
        echo "CURL Error: $error\n";
    }
    echo "Response: $response\n";
    echo str_repeat("-", 80) . "\n\n";
    
    return [
        'success' => $httpCode == 200 || $httpCode == 201,
        'httpCode' => $httpCode,
        'response' => $response,
        'error' => $error
    ];
}

// Test 1: Create New Amenity
echo "1. TESTING AMENITIES CREATION\n";
$amenityData = [
    'name' => 'Test WiFi Access',
    'category' => 'connectivity',
    'description' => 'High-speed wireless internet access',
    'icon' => 'wifi',
    'is_featured' => 1,
    'is_active' => 1
];

$amenityResult = testAPI("$baseUrl/amenities.php", $amenityData, "Amenity");

// Test 2: Create New Package
echo "2. TESTING PACKAGES CREATION\n";
$packageData = [
    'name' => 'Test Romance Package',
    'description' => 'Perfect romantic getaway',
    'type' => 'Romance',
    'price' => 1500000,
    'base_price' => 1500000,
    'max_guests' => 2,
    'duration_days' => 2,
    'available' => 1,
    'is_active' => 1,
    'inclusions' => ['Breakfast', 'Dinner', 'Spa Treatment'],
    'valid_from' => date('Y-m-d'),
    'valid_until' => date('Y-m-d', strtotime('+1 year'))
];

$packageResult = testAPI("$baseUrl/packages.php", $packageData, "Package");

// Test 3: Create New Room
echo "3. TESTING ROOMS CREATION\n";
$roomData = [
    'name' => 'Test Deluxe Suite',
    'type' => 'Deluxe',
    'price' => 800000,
    'capacity' => 2,
    'description' => 'Luxurious deluxe suite with modern amenities',
    'size' => '45m²',
    'beds' => '1 King Bed',
    'available' => 1,
    'features' => ['Air Conditioning', 'Private Balcony', 'Ocean View'],
    'amenities' => ['WiFi', 'Mini Bar', 'Safe'],
    'images' => []
];

$roomResult = testAPI("$baseUrl/rooms.php", $roomData, "Room");

// Test 4: Test with different PATH_INFO approach for amenities
echo "4. TESTING AMENITIES WITH PATH_INFO\n";
$amenityData2 = [
    'name' => 'Test Air Conditioning',
    'category' => 'comfort',
    'description' => 'Central air conditioning system',
    'icon' => 'thermometer',
    'is_featured' => 0,
    'is_active' => 1
];

$amenityResult2 = testAPI("$baseUrl/amenities.php/amenities", $amenityData2, "Amenity (PATH_INFO)");

// Summary
echo "=== SUMMARY ===\n";
echo "Amenity Creation: " . ($amenityResult['success'] ? 'SUCCESS' : 'FAILED') . " (HTTP {$amenityResult['httpCode']})\n";
echo "Package Creation: " . ($packageResult['success'] ? 'SUCCESS' : 'FAILED') . " (HTTP {$packageResult['httpCode']})\n";
echo "Room Creation: " . ($roomResult['success'] ? 'SUCCESS' : 'FAILED') . " (HTTP {$roomResult['httpCode']})\n";
echo "Amenity (PATH_INFO): " . ($amenityResult2['success'] ? 'SUCCESS' : 'FAILED') . " (HTTP {$amenityResult2['httpCode']})\n";

// Check database tables exist
echo "\n=== DATABASE TABLE CHECK ===\n";
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    $tables = ['amenities', 'packages', 'rooms'];
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("DESCRIBE $table");
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo "$table table: EXISTS (" . count($columns) . " columns)\n";
            echo "  Columns: " . implode(', ', $columns) . "\n";
        } catch (Exception $e) {
            echo "$table table: MISSING or ERROR - " . $e->getMessage() . "\n";
        }
    }
} catch (Exception $e) {
    echo "Database connection error: " . $e->getMessage() . "\n";
}

echo "\nTest completed at: " . date('Y-m-d H:i:s') . "\n";
?>