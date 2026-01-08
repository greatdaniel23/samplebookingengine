<?php
/**
 * Simple Image Folder Checker for API Server
 * Checks actual existence of image folders and files
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test paths based on CONFIRMED server structure
$possible_image_paths = [
    // PRIMARY: Confirmed structure paths
    '../images',                          // CONFIRMED: api/ -> images/ (sibling)
    '../images/rooms',                    // Expected: api/ -> images/rooms/
    
    // CONFIRMED absolute paths
    '/home/u289291769/domains/rumahdaisycantik.com/public_html/images',
    '/home/u289291769/domains/rumahdaisycantik.com/public_html/images/rooms',
    
    // Document root variations
    $_SERVER['DOCUMENT_ROOT'] . '/../images',
    $_SERVER['DOCUMENT_ROOT'] . '/../images/rooms',
    $_SERVER['DOCUMENT_ROOT'] . '/images',
    $_SERVER['DOCUMENT_ROOT'] . '/images/rooms',
    
    // Legacy fallback paths
    './images',
    './images/rooms',
    '../../images', 
    '../../images/rooms',
];

$results = [];
foreach ($possible_image_paths as $path) {
    $real_path = realpath($path);
    $result = [
        'test_path' => $path,
        'real_path' => $real_path ?: 'NOT_FOUND',
        'exists' => is_dir($path),
        'readable' => is_dir($path) && is_readable($path),
        'file_count' => 0,
        'sample_files' => []
    ];
    
    if ($result['exists'] && $result['readable']) {
        try {
            $files = array_slice(glob($path . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE) ?: [], 0, 5);
            $result['file_count'] = count($files);
            $result['sample_files'] = array_map('basename', $files);
            
            // Check for subdirectories
            $dirs = array_filter(glob($path . '/*'), 'is_dir');
            $result['subdirectories'] = array_map('basename', $dirs);
        } catch (Exception $e) {
            $result['error'] = $e->getMessage();
        }
    }
    
    $results[] = $result;
}

// Find the first working path
$working_path = null;
foreach ($results as $result) {
    if ($result['exists'] && $result['readable']) {
        $working_path = $result;
        break;
    }
}

echo json_encode([
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
        'current_dir' => getcwd(),
        'current_user' => get_current_user(),
        'script_path' => __FILE__
    ],
    'all_tests' => $results,
    'working_path' => $working_path,
    'summary' => [
        'total_paths_tested' => count($possible_image_paths),
        'paths_found' => count(array_filter($results, function($r) { return $r['exists']; })),
        'working_image_path' => $working_path ? $working_path['real_path'] : 'NONE_FOUND'
    ]
]);
?>