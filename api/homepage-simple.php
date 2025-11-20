<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Simple homepage data retrieval
try {
    // Database connection
    $host = 'localhost';
    $database = 'u289291769_booking'; 
    $username = 'u289291769_booking';
    $password = 'Kanibal123!!!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get villa info
    $stmt = $pdo->prepare("SELECT * FROM villa_info WHERE id = 1 LIMIT 1");
    $stmt->execute();
    $villa = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($villa) {
        // Transform to homepage format
        $data = [
            'success' => true,
            'data' => [
                'hero_title' => $villa['name'] ?? 'Villa Daisy Cantik',
                'hero_description' => $villa['description'] ?? 'Luxury Villa Experience',
                'property_name' => $villa['name'] ?? 'Villa Daisy Cantik',
                'contact_phone' => $villa['phone'] ?? '+62 361 123456',
                'contact_email' => $villa['email'] ?? 'info@villadaisycantik.com',
                'address' => $villa['address'] ?? 'Bali, Indonesia',
                'images' => json_decode($villa['images'] ?? '[]', true),
                'amenities' => json_decode($villa['amenities'] ?? '[]', true),
                'updated_at' => $villa['updated_at'] ?? date('Y-m-d H:i:s')
            ]
        ];
        
        echo json_encode($data, JSON_PRETTY_PRINT);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No villa data found'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>