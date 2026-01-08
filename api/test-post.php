<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    echo json_encode([
        'success' => true,
        'message' => 'POST request received successfully',
        'method' => $method,
        'data' => $input,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Simple test API',
        'method' => $method,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>