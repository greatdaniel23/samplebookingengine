<?php
// API Health Check Script
echo "=== BOOKING ENGINE API HEALTH CHECK ===\n\n";

$base_url = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api';

$endpoints = [
    'Rooms' => '/rooms.php',
    'Packages' => '/packages.php',
    'Villa Info' => '/villa.php',
    'Bookings' => '/bookings.php'
];

foreach ($endpoints as $name => $endpoint) {
    echo "Testing $name ($endpoint)...\n";
    
    try {
        $response = file_get_contents($base_url . $endpoint);
        $data = json_decode($response, true);
        
        if ($data && isset($data['success']) && $data['success']) {
            $count = isset($data['data']) ? (is_array($data['data']) ? count($data['data']) : 1) : 0;
            echo "✅ $name: SUCCESS ($count records)\n";
        } else {
            echo "❌ $name: FAILED - " . ($data['error'] ?? 'Unknown error') . "\n";
        }
    } catch (Exception $e) {
        echo "❌ $name: ERROR - " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

echo "=== HEALTH CHECK COMPLETE ===\n";
?>