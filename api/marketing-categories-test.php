<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Simple test endpoint
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Test without database connection first
    if (!isset($_GET['test_db'])) {
        echo json_encode([
            'success' => true,
            'message' => 'Marketing categories API is working',
            'data' => [
                [
                    'id' => 1,
                    'name' => 'Romance',
                    'slug' => 'romance',
                    'description' => 'Romantic packages for couples and special occasions',
                    'color' => '#e91e63',
                    'icon' => '💕',
                    'is_active' => true,
                    'sort_order' => 1
                ],
                [
                    'id' => 2,
                    'name' => 'Family',
                    'slug' => 'family',
                    'description' => 'Family-friendly packages with activities for all ages',
                    'color' => '#2196f3',
                    'icon' => '👨‍👩‍👧‍👦',
                    'is_active' => true,
                    'sort_order' => 2
                ]
            ],
            'total' => 2
        ]);
        exit();
    }
    
    // Test with database connection
    require_once __DIR__ . '/config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Test query
    $query = "SELECT COUNT(*) as count FROM marketing_categories";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'categories_count' => $result['count']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>