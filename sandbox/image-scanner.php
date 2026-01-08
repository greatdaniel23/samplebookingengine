<?php
/**
 * Image Scanner PHP Backend
 * Scans directories for image files and returns JSON response
 * Works with any hosting environment
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuration for production (api.rumahdaisycantik.com)
$config = [
    'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'],
    'max_files' => 500, // Increased for production
    'production_base_path' => '/var/www/html/images/rooms', // Production server path
    'default_domain' => 'booking.rumahdaisycantik.com/images/rooms'
];

// Cross-domain paths: api.rumahdaisycantik.com accessing booking.rumahdaisycantik.com/images/rooms
$possible_paths = [
    // Shared hosting - both domains in same account
    '/home/rumahdaisycantik/public_html/booking.rumahdaisycantik.com/images/rooms',
    '/home/rumahdaisycantik/domains/booking.rumahdaisycantik.com/public_html/images/rooms',
    '/home/rumahdaisycantik/subdomains/booking/public_html/images/rooms',
    
    // cPanel addon domain structure
    '/home/rumahdaisycantik/public_html/subdomains/booking/images/rooms',
    '/home/rumahdaisycantik/booking.rumahdaisycantik.com/images/rooms',
    
    // Alternative shared structures
    '/var/www/html/booking.rumahdaisycantik.com/images/rooms',
    '/var/www/booking.rumahdaisycantik.com/images/rooms',
    
    // Document root variations
    $_SERVER['DOCUMENT_ROOT'] . '/../booking.rumahdaisycantik.com/images/rooms',
    $_SERVER['DOCUMENT_ROOT'] . '/../../booking.rumahdaisycantik.com/images/rooms',
    $_SERVER['DOCUMENT_ROOT'] . '/../domains/booking.rumahdaisycantik.com/public_html/images/rooms',
    
    // Relative from API to booking domain
    '../booking.rumahdaisycantik.com/images/rooms',
    '../../booking.rumahdaisycantik.com/images/rooms',
    '../../../booking.rumahdaisycantik.com/images/rooms',
    
    // Standard fallback paths
    '/home/rumahdaisycantik/public_html/images/rooms',
    '/var/www/html/images/rooms',
    '../images/rooms',
    './images/rooms'
];

function findBasePath($possible_paths, $custom_base_path = null) {
    // If custom basePath is provided (like booking.rumahdaisycantik.com/images/rooms)
    if ($custom_base_path) {
        // Extract the local path part from URL
        if (strpos($custom_base_path, 'http') === 0) {
            $parsed = parse_url($custom_base_path);
            $local_path = ltrim($parsed['path'], '/');
            
            // Production server path variants for booking.rumahdaisycantik.com/images/rooms
            $local_variants = [
                '/var/www/html/' . $local_path,              // Standard server path
                '/home/rumahdaisycantik/public_html/' . $local_path, // cPanel path
                '../' . $local_path,                          // Relative from api
                './' . $local_path,                           // Direct path
                $local_path,                                  // Simple path
                '../public/' . basename($local_path),         // XAMPP: public/rooms
                './public/' . basename($local_path),          // XAMPP alternative
                '/public_html/' . $local_path                 // Alternative cPanel
            ];
            
            foreach ($local_variants as $variant) {
                if (is_dir($variant)) {
                    return $variant;
                }
            }
        } else {
            // Direct path provided
            if (is_dir($custom_base_path)) {
                return $custom_base_path;
            }
        }
    }
    
    // Try standard production paths first, then fallback
    foreach ($possible_paths as $path) {
        if (is_dir($path)) {
            return $path;
        }
    }
    return null;
}

// Function to scan for folders via HTTP when file system access fails
function scanFoldersViaHTTP($base_url) {
    $folders = [];
    
    // Try to discover folders by testing common room types
    $test_folders = ['standard', 'deluxe', 'suites', 'villas', 'family', 'ocean', 'pool', 'garden', 'business', 'presidential'];
    
    foreach ($test_folders as $folder) {
        // Test if folder exists by trying to access it
        $test_url = $base_url . '/' . $folder . '/';
        
        $context = stream_context_create([
            'http' => [
                'method' => 'HEAD',
                'timeout' => 5,
                'ignore_errors' => true
            ]
        ]);
        
        $headers = @get_headers($test_url, 1, $context);
        if ($headers && (strpos($headers[0], '200') !== false || strpos($headers[0], '403') !== false)) {
            // 403 might indicate folder exists but directory listing is disabled
            $folders[] = $folder;
        }
    }
    
    return $folders;
}

// Function to scan for actual folders within a directory
function scanForFolders($base_path) {
    $folders = [];
    
    if (!is_dir($base_path)) {
        return $folders;
    }
    
    try {
        $items = scandir($base_path);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            
            $item_path = $base_path . '/' . $item;
            
            // Check if it's a directory
            if (is_dir($item_path)) {
                // Check if folder contains any images
                $has_images = false;
                $folder_items = scandir($item_path);
                
                foreach ($folder_items as $file) {
                    if ($file === '.' || $file === '..') continue;
                    
                    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'])) {
                        $has_images = true;
                        break;
                    }
                }
                
                if ($has_images) {
                    $folders[] = $item;
                }
            }
        }
        
        sort($folders); // Sort alphabetically
        
    } catch (Exception $e) {
        // Return empty array on error
    }
    
    return $folders;
}

// HTTP-based image discovery for cross-domain access
function scanImagesViaHTTP($base_url, $folder_name, $allowed_extensions, $max_files) {
    $images = [];
    
    // Construct folder URL
    $folder_url = $base_url;
    if ($folder_name && $folder_name !== 'rooms') {
        $folder_url .= '/' . ltrim($folder_name, 'rooms/');
    }
    
    // Test common image names for this folder type
    $test_images = [
        'image1.jpg', 'image2.jpg', 'room1.jpg', 'room2.jpg',
        $folder_name . '1.jpg', $folder_name . '2.webp',
        'main.jpg', 'hero.jpg', 'thumb.jpg', 'gallery1.jpg'
    ];
    
    $count = 0;
    foreach ($test_images as $test_img) {
        if ($count >= $max_files) break;
        
        $img_url = $folder_url . '/' . $test_img;
        $headers = @get_headers($img_url, 1);
        
        if ($headers && strpos($headers[0], '200') !== false) {
            $ext = strtolower(pathinfo($test_img, PATHINFO_EXTENSION));
            if (in_array($ext, $allowed_extensions)) {
                $images[] = [
                    'name' => $test_img,
                    'size' => 0, // Unknown via HTTP
                    'size_mb' => 0,
                    'modified' => date('Y-m-d H:i:s'),
                    'extension' => $ext,
                    'source' => 'http_discovery'
                ];
                $count++;
            }
        }
    }
    
    return [
        'success' => count($images) > 0,
        'images' => $images,
        'count' => count($images),
        'path' => $folder_url,
        'method' => 'http_discovery'
    ];
}

function scanImageFolder($base_path, $folder_name, $allowed_extensions, $max_files) {
    $images = [];
    
    // Handle subfolder paths (e.g., 'rooms/deluxe')
    if (strpos($folder_name, '/') !== false) {
        $full_path = $base_path . '/' . $folder_name;
    } else {
        // Single folder name
        $full_path = $base_path . '/' . $folder_name;
        
        // If subfolder doesn't exist, scan base path for all images
        if (!is_dir($full_path) && is_dir($base_path)) {
            $full_path = $base_path;
        }
    }
    
    if (!is_dir($full_path)) {
        return [
            'success' => false,
            'error' => "Folder not found: $full_path",
            'images' => []
        ];
    }
    
    try {
        $files = scandir($full_path);
        $count = 0;
        
        foreach ($files as $file) {
            if ($count >= $max_files) break;
            
            if ($file === '.' || $file === '..') continue;
            
            $file_path = $full_path . '/' . $file;
            
            // Check if it's a file (not directory)
            if (!is_file($file_path)) continue;
            
            // Check extension
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowed_extensions)) continue;
            
            // Get file info
            $file_size = filesize($file_path);
            $file_modified = filemtime($file_path);
            
            $images[] = [
                'name' => $file,
                'size' => $file_size,
                'size_mb' => round($file_size / 1024 / 1024, 2),
                'modified' => date('Y-m-d H:i:s', $file_modified),
                'extension' => $ext
            ];
            
            $count++;
        }
        
        return [
            'success' => true,
            'images' => $images,
            'count' => count($images),
            'path' => $full_path
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage(),
            'images' => []
        ];
    }
}

// Main execution
try {
    // Check if this is a folder discovery request
    $action = $_GET['action'] ?? '';
    $custom_base_path = $_GET['basePath'] ?? null;
    
    if ($action === 'folders') {
        // Find the correct base path
        $base_path = findBasePath($possible_paths, $custom_base_path);
        
        if (!$base_path) {
            // Add more debug info to help locate images
            $debug_info = [];
            foreach ($possible_paths as $test_path) {
                $debug_info[] = $test_path . ' -> ' . (is_dir($test_path) ? 'EXISTS' : 'NOT FOUND');
            }
            
            echo json_encode([
                'success' => false,
                'error' => 'Base path not found. Tried: ' . implode(', ', $possible_paths),
                'folders' => [],
                'debug_paths' => $debug_info,
                'server_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
                'current_dir' => getcwd(),
                'custom_base_path' => $custom_base_path
            ]);
            exit;
        }
        
        // Scan for actual folders
        $folders = scanForFolders($base_path);
        $message = 'Found actual subfolders with images';
        
        if (empty($folders) && $custom_base_path) {
            // Try HTTP-based discovery for cross-domain access
            $folders = scanFoldersViaHTTP($custom_base_path);
            if (!empty($folders)) {
                $message = 'Found subfolders via HTTP discovery (cross-domain)';
            }
        }
        
        if (empty($folders)) {
            // Final fallback: return common room folder names
            $folders = ['standard', 'deluxe', 'suites', 'villas', 'family', 'ocean', 'pool', 'garden'];
            $message = 'No subfolders found, returning fallback room categories';
        }
        
        echo json_encode([
            'success' => true,
            'folders' => $folders,
            'count' => count($folders),
            'base_path' => $base_path,
            'message' => $message,
            'custom_base_path' => $custom_base_path,
            'server_info' => [
                'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
                'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'N/A'
            ]
        ]);
        exit;
    }
    
    // Get folder parameter
    $folder = $_GET['folder'] ?? '';
    
    if (empty($folder)) {
        throw new Exception('Folder parameter is required');
    }
    
    // Sanitize folder name (security)
    $folder = preg_replace('/[^a-zA-Z0-9\-_\/]/', '', $folder);
    
    if (empty($folder)) {
        throw new Exception('Invalid folder name');
    }
    
    // Get custom basePath if provided
    $custom_base_path = $_GET['basePath'] ?? null;
    
    // Find the correct base path
    $base_path = findBasePath($possible_paths, $custom_base_path);
    
    if (!$base_path) {
        throw new Exception('Images directory not found. Tried: ' . implode(', ', $possible_paths));
    }
    
    // Scan the folder
    $result = scanImageFolder(
        $base_path, 
        $folder, 
        $config['allowed_extensions'], 
        $config['max_files']
    );
    
    // If file system scanning failed and we have a custom base path, try HTTP
    if (!$result['success'] && $custom_base_path) {
        $result = scanImagesViaHTTP(
            $custom_base_path,
            $folder,
            $config['allowed_extensions'],
            $config['max_files']
        );
    }
    
    // Add metadata
    $result['base_path'] = $base_path;
    $result['requested_folder'] = $folder;
    $result['timestamp'] = date('Y-m-d H:i:s');
    
    // Return simple array of image names for compatibility
    if ($result['success']) {
        $image_names = array_map(function($img) { 
            return $img['name']; 
        }, $result['images']);
        
        echo json_encode([
            'success' => true,
            'images' => $image_names,
            'count' => count($image_names),
            'metadata' => $result,
            'debug' => [
                'custom_base_path' => $custom_base_path,
                'resolved_base_path' => $base_path,
                'requested_folder' => $folder
            ]
        ]);
    } else {
        echo json_encode($result);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'images' => [],
        'fallback_suggested' => true
    ]);
}
?>