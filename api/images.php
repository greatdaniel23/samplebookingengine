<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Function to recursively scan directory for images
function scanImageDirectory($dir, $baseDir = '') {
    $images = [];
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    
    if (!is_dir($dir)) {
        return $images;
    }
    
    $files = scandir($dir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..' || $file === 'README.md' || $file === 'IMAGE_MANAGEMENT.md') {
            continue;
        }
        
        $fullPath = $dir . '/' . $file;
        $relativePath = $baseDir ? $baseDir . '/' . $file : $file;
        
        if (is_dir($fullPath)) {
            // Recursively scan subdirectories
            $subImages = scanImageDirectory($fullPath, $relativePath);
            $images = array_merge($images, $subImages);
        } else {
            // Check if file is an image
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($extension, $imageExtensions)) {
                $images[] = [
                    'name' => $file,
                    'path' => $relativePath,
                    'category' => explode('/', $relativePath)[0] ?? 'root',
                    'type' => $extension,
                    'size' => filesize($fullPath),
                    'modified' => filemtime($fullPath),
                    'url' => '/images/' . $relativePath,
                    'fullUrl' => 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/public/images/' . $relativePath
                ];
            }
        }
    }
    
    return $images;
}

try {
    // Define the images directory path
    $imagesDir = __DIR__ . '/../public/images';
    
    // Scan for all images
    $allImages = scanImageDirectory($imagesDir);
    
    // Group images by category
    $imagesByCategory = [];
    $totalCount = 0;
    
    foreach ($allImages as $image) {
        $category = $image['category'];
        if (!isset($imagesByCategory[$category])) {
            $imagesByCategory[$category] = [];
        }
        $imagesByCategory[$category][] = $image;
        $totalCount++;
    }
    
    // Get statistics
    $statistics = [
        'totalImages' => $totalCount,
        'totalCategories' => count($imagesByCategory),
        'categoryCounts' => array_map('count', $imagesByCategory),
        'lastUpdated' => date('Y-m-d H:i:s')
    ];
    
    // Response
    $response = [
        'success' => true,
        'data' => [
            'images' => $allImages,
            'imagesByCategory' => $imagesByCategory,
            'statistics' => $statistics
        ],
        'message' => 'Images retrieved successfully'
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'message' => 'Failed to retrieve images'
    ]);
}
?>