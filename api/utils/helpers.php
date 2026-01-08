<?php
/**
 * Helper functions for API
 */

// Enable CORS for all requests
function enableCORS() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// JSON response helper
function jsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit();
}

// Error response helper
function errorResponse($message, $status_code = 400) {
    jsonResponse([
        'success' => false,
        'error' => $message
    ], $status_code);
}

// Success response helper
function successResponse($data, $message = null) {
    $response = [
        'success' => true,
        'data' => $data
    ];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    jsonResponse($response);
}

// Validate required fields
function validateRequired($data, $required_fields) {
    $missing = [];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        errorResponse('Missing required fields: ' . implode(', ', $missing));
    }
}

// Sanitize input
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags($data));
}
?>