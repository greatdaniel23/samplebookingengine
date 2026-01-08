<?php
require_once __DIR__ . '/../models/VillaInfo.php';

class VillaController {
    private $villaInfo;

    public function __construct($db) {
        $this->villaInfo = new VillaInfo($db);
    }

    // Get villa information
    public function get() {
        try {
            $data = $this->villaInfo->get();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to retrieve villa information: ' . $e->getMessage()
            ]);
        }
    }

    // Update villa information
    public function update() {
        try {
            // Get JSON input
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON data'
                ]);
                return;
            }

            // Validate required fields
            $required = ['name', 'location', 'description', 'rating', 'reviews'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => "Missing required field: $field"
                    ]);
                    return;
                }
            }

            // Validate rating
            if ($input['rating'] < 0 || $input['rating'] > 5) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Rating must be between 0 and 5'
                ]);
                return;
            }

            // Validate reviews
            if ($input['reviews'] < 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Reviews count cannot be negative'
                ]);
                return;
            }

            // Ensure images and amenities are arrays
            if (!isset($input['images']) || !is_array($input['images'])) {
                $input['images'] = [];
            }
            if (!isset($input['amenities']) || !is_array($input['amenities'])) {
                $input['amenities'] = [];
            }

            $result = $this->villaInfo->update($input);
            
            if ($result) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Villa information updated successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to update villa information'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update villa information: ' . $e->getMessage()
            ]);
        }
    }

    // Initialize default data
    public function initialize() {
        try {
            $result = $this->villaInfo->createDefault();
            
            if ($result) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Villa information initialized successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to initialize villa information'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Failed to initialize villa information: ' . $e->getMessage()
            ]);
        }
    }
}