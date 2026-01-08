<?php
/**
 * Package Controller
 * Handles package-related API endpoints
 */

require_once __DIR__ . '/../models/Package.php';
require_once __DIR__ . '/../utils/helpers.php';

class PackageController {
    private $package;

    public function __construct() {
        $this->package = new Package();
    }

    /**
     * Handle package requests
     */
    public function handleRequest($method, $params = []) {
        // Set CORS headers
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Content-Type: application/json');

        if ($method === 'OPTIONS') {
            http_response_code(204);
            return;
        }

        try {
            switch ($method) {
                case 'GET':
                    $this->handleGet($params);
                    break;
                case 'POST':
                    $this->handlePost($params);
                    break;
                case 'PUT':
                    $this->handlePut($params);
                    break;
                case 'DELETE':
                    $this->handleDelete($params);
                    break;
                default:
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Handle GET requests
     */
    private function handleGet($params) {
        // Check for specific package ID
        if (!empty($params['id'])) {
            $this->getPackageById($params['id']);
            return;
        }

        // Check for room-specific packages
        if (!empty($_GET['room_id'])) {
            $this->getPackagesByRoom($_GET['room_id']);
            return;
        }

        // Check for package pricing calculation
        if (!empty($_GET['action']) && $_GET['action'] === 'calculate') {
            $this->calculatePackagePrice();
            return;
        }

        // Check for package types
        if (!empty($_GET['action']) && $_GET['action'] === 'types') {
            $this->getPackageTypes();
            return;
        }

        // Get all packages with filters
        $this->getAllPackages();
    }

    /**
     * Get all packages with optional filters
     */
    private function getAllPackages() {
        $filters = [];

        // Date filters
        if (!empty($_GET['check_in']) && !empty($_GET['check_out'])) {
            $filters['check_in'] = $_GET['check_in'];
            $filters['check_out'] = $_GET['check_out'];
        }

        // Package type filter
        if (!empty($_GET['type'])) {
            $filters['type'] = $_GET['type'];
        }

        // Guest count filter
        if (!empty($_GET['guests'])) {
            $filters['guests'] = intval($_GET['guests']);
        }

        $packages = $this->package->getAll($filters);

        echo json_encode([
            'success' => true,
            'data' => $packages,
            'message' => 'Packages retrieved successfully',
            'count' => count($packages)
        ]);
    }

    /**
     * Get package by ID
     */
    private function getPackageById($id) {
        $package = $this->package->getById($id);

        if ($package) {
            echo json_encode([
                'success' => true,
                'data' => $package,
                'message' => 'Package retrieved successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Package not found'
            ]);
        }
    }

    /**
     * Get packages available for a specific room
     */
    private function getPackagesByRoom($roomId) {
        $checkIn = $_GET['check_in'] ?? null;
        $checkOut = $_GET['check_out'] ?? null;

        $packages = $this->package->getByRoomId($roomId, $checkIn, $checkOut);

        echo json_encode([
            'success' => true,
            'data' => $packages,
            'message' => 'Room packages retrieved successfully',
            'room_id' => $roomId,
            'count' => count($packages)
        ]);
    }

    /**
     * Calculate package pricing
     */
    private function calculatePackagePrice() {
        $required = ['package_id', 'room_id', 'nights'];
        $missing = [];

        foreach ($required as $field) {
            if (empty($_GET[$field])) {
                $missing[] = $field;
            }
        }

        if (!empty($missing)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Missing required parameters: ' . implode(', ', $missing)
            ]);
            return;
        }

        $packageId = $_GET['package_id'];
        $roomId = $_GET['room_id'];
        $nights = intval($_GET['nights']);
        $guests = intval($_GET['guests'] ?? 2);

        $pricing = $this->package->calculatePackagePrice($packageId, $roomId, $nights, $guests);

        if ($pricing) {
            echo json_encode([
                'success' => true,
                'data' => $pricing,
                'message' => 'Package pricing calculated successfully'
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid package or room combination'
            ]);
        }
    }

    /**
     * Get available package types
     */
    private function getPackageTypes() {
        $types = $this->package->getPackageTypes();

        echo json_encode([
            'success' => true,
            'data' => $types,
            'message' => 'Package types retrieved successfully'
        ]);
    }

    /**
     * Handle POST requests (create new package)
     */
    private function handlePost($params) {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON input'
            ]);
            return;
        }

        $this->createPackage($input);
    }

    /**
     * Handle PUT requests (update package)
     */
    private function handlePut($params) {
        if (empty($params['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Package ID is required for update'
            ]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON input'
            ]);
            return;
        }

        $this->updatePackage($params['id'], $input);
    }

    /**
     * Handle DELETE requests (delete package)
     */
    private function handleDelete($params) {
        if (empty($params['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Package ID is required for deletion'
            ]);
            return;
        }

        $this->deletePackage($params['id']);
    }

    /**
     * Create new package
     */
    private function createPackage($data) {
        try {
            // Validate required fields
            $required = ['id', 'name', 'package_type', 'base_price'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => "Field '$field' is required"
                    ]);
                    return;
                }
            }

            $result = $this->package->create($data);
            
            if ($result) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Package created successfully',
                    'data' => $data
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to create package'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error creating package: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update existing package
     */
    private function updatePackage($id, $data) {
        try {
            $result = $this->package->update($id, $data);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Package updated successfully',
                    'data' => $data
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Package not found or failed to update'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error updating package: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete package
     */
    private function deletePackage($id) {
        try {
            $result = $this->package->delete($id);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Package deleted successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Package not found or failed to delete'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting package: ' . $e->getMessage()
            ]);
        }
    }
}

// Handle the request if this file is called directly
if (basename($_SERVER['PHP_SELF']) === 'PackageController.php') {
    $controller = new PackageController();
    $method = $_SERVER['REQUEST_METHOD'];
    $params = [];
    
    // Extract ID from URL if present
    $uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
    $segments = explode('/', $uri);
    
    // Look for package ID in URL segments
    if (count($segments) > 1) {
        $params['id'] = end($segments);
    }
    
    $controller->handleRequest($method, $params);
}
?>