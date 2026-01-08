<?php
/**
 * Shared Hosting Directory Scanner
 * Scans and reports actual directory structure under public_html
 * NO ASSUMPTIONS - Only reports what actually exists
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

function scanDirectory($path, $max_depth = 3, $current_depth = 0) {
    $result = [
        'path' => $path,
        'exists' => false,
        'readable' => false,
        'type' => 'unknown',
        'contents' => []
    ];
    
    if (!is_dir($path)) {
        return $result;
    }
    
    $result['exists'] = true;
    $result['readable'] = is_readable($path);
    $result['type'] = 'directory';
    
    if (!$result['readable'] || $current_depth >= $max_depth) {
        return $result;
    }
    
    try {
        $items = scandir($path);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            
            $item_path = $path . '/' . $item;
            
            if (is_dir($item_path)) {
                // Recursively scan subdirectories
                $result['contents'][$item] = scanDirectory($item_path, $max_depth, $current_depth + 1);
            } else {
                // File information
                $result['contents'][$item] = [
                    'path' => $item_path,
                    'exists' => true,
                    'readable' => is_readable($item_path),
                    'type' => 'file',
                    'size' => filesize($item_path),
                    'extension' => pathinfo($item, PATHINFO_EXTENSION),
                    'modified' => date('Y-m-d H:i:s', filemtime($item_path))
                ];
            }
        }
    } catch (Exception $e) {
        $result['error'] = $e->getMessage();
    }
    
    return $result;
}

// Get server information
$server_info = [
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
    'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'N/A',
    'current_dir' => getcwd(),
    'server_name' => $_SERVER['SERVER_NAME'] ?? 'N/A',
    'http_host' => $_SERVER['HTTP_HOST'] ?? 'N/A'
];

// Paths to scan - start from various possible locations
$scan_paths = [
    // Current directory and relatives
    '.',
    '..',
    '../..',
    
    // Document root variations
    $_SERVER['DOCUMENT_ROOT'],
    $_SERVER['DOCUMENT_ROOT'] . '/..',
    $_SERVER['DOCUMENT_ROOT'] . '/../..',
    
    // Common shared hosting paths
    '/home/' . get_current_user(),
    '/home/' . get_current_user() . '/public_html',
    '/home/' . get_current_user() . '/domains',
    
    // Alternative paths
    '/var/www/html',
    '/public_html',
    dirname($_SERVER['DOCUMENT_ROOT']),
];

$scan_results = [];
foreach ($scan_paths as $path) {
    if ($path && $path !== 'N/A') {
        $real_path = realpath($path);
        if ($real_path && !isset($scan_results[$real_path])) {
            $scan_results[$real_path] = scanDirectory($real_path, 2); // Limit depth to 2 for performance
        }
    }
}

// Look specifically for common web folders
$web_folders = ['api', 'booking', 'images', 'public', 'www', 'htdocs'];
$found_web_folders = [];

foreach ($scan_results as $base_path => $data) {
    if ($data['exists'] && is_array($data['contents'])) {
        foreach ($web_folders as $folder) {
            if (isset($data['contents'][$folder])) {
                $found_web_folders[$folder] = [
                    'path' => $base_path . '/' . $folder,
                    'data' => $data['contents'][$folder]
                ];
            }
        }
    }
}

// Look for images specifically
$image_locations = [];
foreach ($scan_results as $base_path => $data) {
    if ($data['exists'] && is_array($data['contents'])) {
        foreach ($data['contents'] as $name => $item) {
            if ($name === 'images' || $name === 'img' || $name === 'assets') {
                $image_locations[$name] = [
                    'path' => $base_path . '/' . $name,
                    'data' => $item
                ];
            }
        }
    }
}

// Summary of findings
$summary = [
    'total_paths_scanned' => count($scan_paths),
    'accessible_paths' => count(array_filter($scan_results, function($r) { return $r['exists']; })),
    'web_folders_found' => array_keys($found_web_folders),
    'image_folders_found' => array_keys($image_locations),
    'current_user' => get_current_user(),
    'php_version' => PHP_VERSION
];

// Response
echo json_encode([
    'success' => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => $server_info,
    'summary' => $summary,
    'scan_results' => $scan_results,
    'web_folders' => $found_web_folders,
    'image_locations' => $image_locations,
    'recommendations' => [
        'next_steps' => [
            'Check web_folders for api/, booking/, images/ structure',
            'Look in image_locations for actual image files',
            'Use scan_results to understand full directory structure'
        ]
    ]
], JSON_PRETTY_PRINT);
?>