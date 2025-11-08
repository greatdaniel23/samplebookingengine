<?php
/**
 * API Router - Main entry point for all API requests
 */

require_once __DIR__ . '/controllers/BookingController.php';
require_once __DIR__ . '/controllers/RoomController.php';
require_once __DIR__ . '/utils/helpers.php';

// Enable CORS
enableCORS();

// Get the request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Remove query string and get path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove base path (adjust this based on your setup)
$base_path = '/fontend-bookingengine-100/frontend-booking-engine/api';
$path = str_replace($base_path, '', $path);

// Remove leading slash
$path = ltrim($path, '/');

// Split path into segments
$segments = explode('/', $path);
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

try {
    switch ($resource) {
        case 'rooms':
            $controller = new RoomController();
            if ($method === 'GET') {
                if ($id) {
                    $controller->getById($id);
                } else {
                    $controller->getAll();
                }
            } else {
                errorResponse('Method not allowed', 405);
            }
            break;

        case 'bookings':
            $controller = new BookingController();
            if ($method === 'GET') {
                if ($id) {
                    $controller->getById($id);
                } else if (isset($_GET['action']) && $_GET['action'] === 'availability') {
                    $controller->checkAvailability();
                } else {
                    $controller->getAll();
                }
            } else if ($method === 'POST') {
                $controller->create();
            } else {
                errorResponse('Method not allowed', 405);
            }
            break;

        case 'test':
            successResponse([
                'message' => 'API is working!',
                'timestamp' => date('Y-m-d H:i:s'),
                'method' => $method,
                'path' => $path
            ], 'Test endpoint successful');
            break;

        default:
            errorResponse('Endpoint not found', 404);
            break;
    }
} catch (Exception $e) {
    errorResponse('Internal server error: ' . $e->getMessage(), 500);
}
?>