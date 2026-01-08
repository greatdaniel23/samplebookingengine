<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Image Path Checker
 * This script helps identify the correct path structure for serving images
 * on different server environments (local XAMPP vs production hosting)
 */

function checkPath($path, $description) {
    $fullPath = __DIR__ . $path;
    $exists = file_exists($fullPath);
    $isReadable = $exists ? is_readable($fullPath) : false;
    $isDir = $exists ? is_dir($fullPath) : false;
    $permissions = $exists ? substr(sprintf('%o', fileperms($fullPath)), -4) : null;
    
    return [
        'path' => $path,
        'full_path' => $fullPath,
        'description' => $description,
        'exists' => $exists,
        'readable' => $isReadable,
        'is_directory' => $isDir,
        'permissions' => $permissions,
        'files_count' => ($exists && $isDir) ? count(scandir($fullPath)) - 2 : null // -2 for . and ..
    ];
}

function checkImageFile($imagePath, $description) {
    $fullPath = __DIR__ . $imagePath;
    $exists = file_exists($fullPath);
    $size = $exists ? filesize($fullPath) : null;
    $mimeType = $exists ? mime_content_type($fullPath) : null;
    
    return [
        'path' => $imagePath,
        'full_path' => $fullPath,
        'description' => $description,
        'exists' => $exists,
        'size' => $size,
        'mime_type' => $mimeType,
        'is_image' => $exists && strpos($mimeType, 'image/') === 0
    ];
}

function scanForImages($dir, $extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']) {
    $images = [];
    if (!is_dir($dir)) return $images;
    
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $fullPath = $dir . '/' . $file;
        if (is_file($fullPath)) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($ext, $extensions)) {
                $images[] = [
                    'filename' => $file,
                    'path' => $fullPath,
                    'size' => filesize($fullPath),
                    'extension' => $ext
                ];
            }
        }
    }
    return $images;
}

// Get current working directory info
$currentDir = __DIR__;
$documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? 'Not set';
$serverName = $_SERVER['SERVER_NAME'] ?? 'Unknown';
$requestUri = $_SERVER['REQUEST_URI'] ?? '';

// Check various possible image directory structures
$pathChecks = [
    // Local XAMPP structure
    '/public/images' => 'Local XAMPP: /public/images',
    '/public/images/hero' => 'Local XAMPP: /public/images/hero',
    '/public/images/packages' => 'Local XAMPP: /public/images/packages',
    
    // Alternative structures
    '/images' => 'Direct: /images',
    '/images/hero' => 'Direct: /images/hero',
    '/assets/images' => 'Assets: /assets/images',
    '/static/images' => 'Static: /static/images',
    '/media/images' => 'Media: /media/images',
    '/files/images' => 'Files: /files/images',
    '/uploads' => 'Uploads: /uploads',
    '/img' => 'Img: /img',
    
    // Relative to document root
    '../public/images' => 'Parent: ../public/images',
    '../../public/images' => 'Grandparent: ../../public/images',
    
    // Common hosting structures
    '/public_html/images' => 'cPanel: /public_html/images',
    '/htdocs/images' => 'Plesk: /htdocs/images',
    '/www/images' => 'WWW: /www/images',
    
    // Check current directory structure
    '.' => 'Current directory',
    './public' => 'Current/public',
    './images' => 'Current/images',
    './sandbox' => 'Current/sandbox',
    './sandbox/images' => 'Current/sandbox/images'
];

// Check for specific image files in different locations
$imageFileChecks = [
    '/public/images/hero/villa-exterior-1.jpg' => 'XAMPP: villa-exterior-1.jpg',
    '/public/images/hero/villa-exterior-1.webp' => 'XAMPP: villa-exterior-1.webp',
    '/images/hero/villa-exterior-1.jpg' => 'Direct: villa-exterior-1.jpg',
    '/images/hero/villa-exterior-1.webp' => 'Direct: villa-exterior-1.webp',
    '/sandbox/images/hero/villa-exterior-1.jpg' => 'Sandbox: villa-exterior-1.jpg',
    '/sandbox/images/hero/villa-exterior-1.webp' => 'Sandbox: villa-exterior-1.webp'
];

// Perform checks
$results = [
    'server_info' => [
        'current_directory' => $currentDir,
        'document_root' => $documentRoot,
        'server_name' => $serverName,
        'request_uri' => $requestUri,
        'php_version' => PHP_VERSION,
        'timestamp' => date('Y-m-d H:i:s')
    ],
    'directory_checks' => [],
    'image_file_checks' => [],
    'image_scan_results' => []
];

// Check directories
foreach ($pathChecks as $path => $description) {
    $results['directory_checks'][] = checkPath($path, $description);
}

// Check specific image files
foreach ($imageFileChecks as $path => $description) {
    $results['image_file_checks'][] = checkImageFile($path, $description);
}

// Scan for images in existing directories
foreach ($results['directory_checks'] as $dirCheck) {
    if ($dirCheck['exists'] && $dirCheck['is_directory'] && $dirCheck['readable']) {
        $images = scanForImages($dirCheck['full_path']);
        if (!empty($images)) {
            $results['image_scan_results'][] = [
                'directory' => $dirCheck['path'],
                'description' => $dirCheck['description'],
                'image_count' => count($images),
                'images' => array_slice($images, 0, 10), // Limit to first 10 images
                'sample_image' => $images[0] ?? null
            ];
        }
    }
}

// Add URL generation tests
$results['url_tests'] = [];
$baseDomains = [
    'https://rumahdaisycantik.com',
    'https://api.rumahdaisycantik.com',
    'https://booking.rumahdaisycantik.com'
];

$testPaths = [
    '/public/images/hero/villa-exterior-1.jpg',
    '/images/hero/villa-exterior-1.jpg',
    '/sandbox/images/hero/villa-exterior-1.jpg',
    '/assets/images/hero/villa-exterior-1.jpg'
];

foreach ($baseDomains as $domain) {
    foreach ($testPaths as $path) {
        $results['url_tests'][] = [
            'url' => $domain . $path,
            'domain' => $domain,
            'path' => $path
        ];
    }
}

// Find best match for image serving
$bestImageDir = null;
$maxImageCount = 0;

foreach ($results['image_scan_results'] as $scan) {
    if ($scan['image_count'] > $maxImageCount) {
        $maxImageCount = $scan['image_count'];
        $bestImageDir = $scan;
    }
}

$results['recommendations'] = [
    'best_image_directory' => $bestImageDir,
    'suggested_base_path' => $bestImageDir ? $bestImageDir['directory'] : null,
    'total_directories_found' => count(array_filter($results['directory_checks'], function($check) {
        return $check['exists'] && $check['is_directory'];
    })),
    'total_images_found' => array_sum(array_column($results['image_scan_results'], 'image_count'))
];

// Return results
echo json_encode($results, JSON_PRETTY_PRINT);
?>