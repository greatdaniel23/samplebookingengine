<?php
// Simple test script to initialize villa data
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    require_once __DIR__ . '/config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Create villa_info table if it doesn't exist
    $createTable = "
    CREATE TABLE IF NOT EXISTS villa_info (
        id INT PRIMARY KEY DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        rating DECIMAL(2,1) DEFAULT 4.9,
        reviews INT DEFAULT 0,
        images JSON,
        amenities JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $db->exec($createTable);
    
    // Insert default data
    $defaultData = [
        'name' => 'Serene Mountain Retreat',
        'location' => 'Aspen, Colorado',
        'description' => 'Escape to this stunning mountain retreat where modern luxury meets rustic charm. Nestled in the heart of the Rockies, this villa offers breathtaking views, unparalleled comfort, and direct access to world-class ski slopes and hiking trails. Perfect for family vacations, romantic getaways, or corporate retreats.',
        'rating' => 4.9,
        'reviews' => 128,
        'images' => json_encode([
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1613977257363-3116958f136b?q=80&w=2670&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1593696140826-c58b02198d4a?q=80&w=2670&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop'
        ]),
        'amenities' => json_encode([
            ['name' => 'High-speed Wifi', 'icon' => 'Wifi'],
            ['name' => 'Private Hot Tub', 'icon' => 'Bath'],
            ['name' => 'Indoor Fireplace', 'icon' => 'Flame'],
            ['name' => 'Fully Equipped Kitchen', 'icon' => 'CookingPot'],
            ['name' => 'Free Parking on Premises', 'icon' => 'Car'],
            ['name' => 'Central Air & Heating', 'icon' => 'AirVent']
        ])
    ];
    
    $insertSQL = "
    INSERT INTO villa_info (id, name, location, description, rating, reviews, images, amenities, created_at, updated_at) 
    VALUES (1, :name, :location, :description, :rating, :reviews, :images, :amenities, NOW(), NOW())
    ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        location = VALUES(location),
        description = VALUES(description),
        rating = VALUES(rating),
        reviews = VALUES(reviews),
        images = VALUES(images),
        amenities = VALUES(amenities),
        updated_at = NOW()
    ";
    
    $stmt = $db->prepare($insertSQL);
    $stmt->execute($defaultData);
    
    // Fetch the data to verify
    $selectSQL = "SELECT * FROM villa_info WHERE id = 1";
    $stmt = $db->prepare($selectSQL);
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        $data['images'] = json_decode($data['images'], true);
        $data['amenities'] = json_decode($data['amenities'], true);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Villa information initialized successfully',
        'data' => $data
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>