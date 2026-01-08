<?php
/**
 * Path Strategy Test for New Structure
 * public_html/api/ public_html/booking/ public_html/images/
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Test the new path strategy
$test_paths = [
    '../images/rooms',                                    // Sibling folder
    $_SERVER['DOCUMENT_ROOT'] . '/../images/rooms',       // Document root relative
    './images/rooms',                                     // Current dir
    '../../images/rooms',                                 // Up two levels
];

$results = [];
foreach ($test_paths as $path) {
    $expanded = $path;
    
    // Handle $_SERVER variables
    if (strpos($path, '$_SERVER') !== false) {
        $expanded = $_SERVER['DOCUMENT_ROOT'] . '/../images/rooms';
    }
    
    $results[] = [
        'path' => $path,
        'expanded' => $expanded,
        'exists' => is_dir($expanded),
        'readable' => is_dir($expanded) && is_readable($expanded),
        'files_count' => is_dir($expanded) ? count(glob($expanded . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE)) : 0
    ];
}

// Test for specific known images
$image_tests = [];
foreach ($test_paths as $path) {
    $expanded = $path;
    if (strpos($path, '$_SERVER') !== false) {
        $expanded = $_SERVER['DOCUMENT_ROOT'] . '/../images/rooms';
    }
    
    if (is_dir($expanded)) {
        $test_images = ['hero-1.jpg', 'hero-2.jpg', '1.jpg', '2.jpg'];
        foreach ($test_images as $img) {
            $img_path = $expanded . '/' . $img;
            if (file_exists($img_path)) {
                $image_tests[] = [
                    'image' => $img,
                    'path' => $img_path,
                    'size' => filesize($img_path),
                    'base_directory' => $expanded
                ];
            }
        }
        break; // Only test first working directory
    }
}

// Test subfolder access
$subfolder_tests = [];
foreach ($test_paths as $path) {
    $expanded = $path;
    if (strpos($path, '$_SERVER') !== false) {
        $expanded = $_SERVER['DOCUMENT_ROOT'] . '/../images/rooms';
    }
    
    if (is_dir($expanded)) {
        $test_folders = ['deluxe', 'standard', 'family'];
        foreach ($test_folders as $folder) {
            $folder_path = $expanded . '/' . $folder;
            if (is_dir($folder_path)) {
                $images_in_folder = count(glob($folder_path . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE));
                $subfolder_tests[] = [
                    'folder' => $folder,
                    'path' => $folder_path,
                    'exists' => true,
                    'image_count' => $images_in_folder
                ];
            }
        }
        break; // Only test first working directory
    }
}

echo json_encode([
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'document_root' => $_SERVER['DOCUMENT_ROOT'],
        'script_name' => $_SERVER['SCRIPT_NAME'],
        'current_dir' => getcwd()
    ],
    'path_tests' => $results,
    'found_images' => $image_tests,
    'subfolder_tests' => $subfolder_tests,
    'working_path' => array_filter($results, function($r) { return $r['exists']; })[0]['expanded'] ?? 'NONE',
    'strategy' => 'public_html structure: api/ booking/ images/ as siblings'
]);
?>