<?php
/**
 * Simple diagnostic script to check production server status
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'Server is running',
    'php_version' => phpversion(),
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => $_SERVER['HTTP_HOST'] ?? 'Unknown',
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time')
]);
?>