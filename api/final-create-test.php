<?php
/**
 * FINAL COMPREHENSIVE TEST
 * Verify all three APIs (amenities, packages, rooms) can create records
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== FINAL COMPREHENSIVE CREATE TEST ===\n";
echo "Testing all three APIs after fixes\n\n";

$baseUrl = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api';

function testAPIQuick($url, $data, $name) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $success = ($httpCode == 200 || $httpCode == 201);
    echo sprintf("%-20s: %s (HTTP %d)\n", $name, $success ? '✅ SUCCESS' : '❌ FAILED', $httpCode);
    
    if (!$success) {
        echo "   Error: $response\n";
    }
    
    return $success;
}

// Test 1: Amenity Creation
$amenityData = [
    'name' => 'Test Pool Access',
    'category' => 'recreation',
    'description' => 'Access to swimming pool',
    'is_active' => 1
];
$amenitySuccess = testAPIQuick("$baseUrl/amenities.php", $amenityData, "Amenity Creation");

// Test 2: Package Creation
$packageData = [
    'name' => 'Test Family Package',
    'description' => 'Perfect for families',
    'type' => 'Family',
    'base_price' => 2000000,
    'max_guests' => 4,
    'inclusions' => ['Breakfast', 'Pool Access']
];
$packageSuccess = testAPIQuick("$baseUrl/packages.php", $packageData, "Package Creation");

// Test 3: Room Creation
$roomData = [
    'name' => 'Test Family Suite',
    'type' => 'Family',
    'price' => 1200000,
    'capacity' => 4,
    'description' => 'Spacious family suite'
];
$roomSuccess = testAPIQuick("$baseUrl/rooms.php", $roomData, "Room Creation");

echo "\n=== SUMMARY ===\n";
$totalTests = 3;
$passedTests = ($amenitySuccess ? 1 : 0) + ($packageSuccess ? 1 : 0) + ($roomSuccess ? 1 : 0);

echo "Passed: $passedTests/$totalTests tests\n";

if ($passedTests == $totalTests) {
    echo "🎉 ALL APIS ARE NOW WORKING! You can create amenities, packages, and rooms.\n";
} else {
    echo "⚠️  Some APIs still need attention.\n";
}

echo "\nTest completed at: " . date('Y-m-d H:i:s') . "\n";
?>