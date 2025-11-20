<?php
/**
 * TEST PACKAGE CREATION AFTER FIX
 * Quick test to verify package creation works now
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== TESTING PACKAGE CREATION AFTER FIX ===\n\n";

$packageData = [
    'name' => 'Test Romance Package Fixed',
    'description' => 'Perfect romantic getaway - testing fix',
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

echo "Testing Package Data:\n";
echo json_encode($packageData, JSON_PRETTY_PRINT) . "\n\n";

$url = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api/packages.php';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($packageData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Results:\n";
echo "HTTP Code: $httpCode\n";
if ($error) {
    echo "CURL Error: $error\n";
}
echo "Response: $response\n\n";

if ($httpCode == 200 || $httpCode == 201) {
    echo "✅ SUCCESS: Package creation is now working!\n";
} else {
    echo "❌ FAILED: Package creation still has issues\n";
}

echo "\nTest completed at: " . date('Y-m-d H:i:s') . "\n";
?>