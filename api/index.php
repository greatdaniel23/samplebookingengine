<?php
/**
 * API Router - Main entry point for all API requests
 */

require_once __DIR__ . '/controllers/BookingController.php';
require_once __DIR__ . '/controllers/RoomController.php';
require_once __DIR__ . '/controllers/PackageController.php';
require_once __DIR__ . '/controllers/VillaController.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/helpers.php';

// Enable CORS
enableCORS();

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Get the request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Remove query string and get path
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove base path (adjust this based on your setup)
// Auto-detect if we're in a subfolder or root
$isLocalhost = $_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false;

if ($isLocalhost) {
    // Local development: usually in subfolder
    $base_path = '/fontend-bookingengine-100/frontend-booking-engine-1/api';
} else {
    // Production: api.rumahdaisycantik.com/ - files are at root level
    $base_path = '';
}

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
            } else if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $controller->create($input);
            } else if ($method === 'PUT' && $id) {
                $input = json_decode(file_get_contents('php://input'), true);
                $controller->update($id, $input);
            } else if ($method === 'DELETE' && $id) {
                $controller->delete($id);
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
            } else if ($method === 'PUT' && $id) {
                if (isset($_GET['action']) && $_GET['action'] === 'status') {
                    $controller->updateStatus($id);
                } else {
                    $controller->update($id);
                }
            } else if ($method === 'DELETE' && $id) {
                $controller->delete($id);
            } else {
                errorResponse('Method not allowed', 405);
            }
            break;

        case 'packages':
            $controller = new PackageController();
            $params = [];
            if ($id) {
                $params['id'] = $id;
            }
            $controller->handleRequest($method, $params);
            break;

        case 'villa':
            $controller = new VillaController($db);
            if ($method === 'GET') {
                $controller->get();
            } else if ($method === 'POST' || $method === 'PUT') {
                $controller->update();
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