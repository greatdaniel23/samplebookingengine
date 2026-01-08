<?php
/**
 * Quick test for image discovery
 * Tests both file system and HTTP methods
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test if we can access booking domain images directly
$test_images = [
    'https://booking.rumahdaisycantik.com/images/rooms/hero-1.jpg',
    'https://booking.rumahdaisycantik.com/images/rooms/hero-2.jpg',
    'https://booking.rumahdaisycantik.com/images/rooms/1.jpg',
    'https://booking.rumahdaisycantik.com/images/rooms/2.jpg',
    'https://booking.rumahdaisycantik.com/images/rooms/deluxe/1.jpg',
    'https://booking.rumahdaisycantik.com/images/rooms/standard/1.jpg'
];

$results = [];
foreach ($test_images as $img_url) {
    $headers = @get_headers($img_url, 1);
    $exists = $headers && strpos($headers[0], '200') !== false;
    $results[] = [
        'url' => $img_url,
        'exists' => $exists,
        'status' => $headers[0] ?? 'No response'
    ];
}

// Test potential folder access
$test_folders = [
    'https://booking.rumahdaisycantik.com/images/rooms/deluxe/',
    'https://booking.rumahdaisycantik.com/images/rooms/standard/',
    'https://booking.rumahdaisycantik.com/images/rooms/family/',
    'https://booking.rumahdaisycantik.com/images/rooms/ocean/',
    'https://booking.rumahdaisycantik.com/images/rooms/pool/'
];

$folder_results = [];
foreach ($test_folders as $folder_url) {
    $headers = @get_headers($folder_url, 1);
    $accessible = $headers && (strpos($headers[0], '200') !== false || strpos($headers[0], '403') !== false);
    $folder_results[] = [
        'url' => $folder_url,
        'accessible' => $accessible,
        'status' => $headers[0] ?? 'No response'
    ];
}

echo json_encode([
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'image_tests' => $results,
    'folder_tests' => $folder_results,
    'working_images' => array_filter($results, function($r) { return $r['exists']; }),
    'accessible_folders' => array_filter($folder_results, function($r) { return $r['accessible']; }),
    'server_info' => [
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
        'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'N/A',
        'current_dir' => getcwd()
    ]
]);
?>