<?php
// File: debug-rooms-database.php
header('Content-Type: text/plain');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Try both possible database names
    $databases = ['spa_booking', 'booking_engine'];
    
    foreach ($databases as $dbName) {
        echo "=== TESTING DATABASE: $dbName ===\n";
        
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=$dbName;charset=utf8mb4", 'root', '');
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            echo "✅ Connected to $dbName successfully\n";
            
            // Check if rooms table exists
            $stmt = $pdo->query("SHOW TABLES LIKE 'rooms'");
            if ($stmt->rowCount() > 0) {
                echo "✅ Rooms table exists\n";
                
                // Count rooms
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM rooms");
                $count = $stmt->fetch()['count'];
                echo "📊 Total rooms in database: $count\n";
                
                if ($count > 0) {
                    // Show sample room data
                    $stmt = $pdo->query("SELECT id, name, type, price, available FROM rooms LIMIT 3");
                    $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    echo "📋 Sample room data:\n";
                    foreach ($rooms as $room) {
                        echo "  - ID: {$room['id']}, Name: {$room['name']}, Type: {$room['type']}, Price: {$room['price']}, Available: {$room['available']}\n";
                    }
                } else {
                    echo "⚠️  Rooms table is empty!\n";
                    echo "💡 SOLUTION: You need to populate the rooms table with sample data.\n";
                }
                
                // Check table structure
                echo "\n🏗️  Table structure:\n";
                $stmt = $pdo->query("DESCRIBE rooms");
                $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($columns as $col) {
                    echo "  - {$col['Field']}: {$col['Type']}\n";
                }
                
            } else {
                echo "❌ Rooms table does not exist\n";
                echo "💡 SOLUTION: You need to create the rooms table first.\n";
            }
            
        } catch (PDOException $e) {
            echo "❌ Failed to connect to $dbName: " . $e->getMessage() . "\n";
        }
        
        echo "\n" . str_repeat("-", 50) . "\n\n";
    }
    
    // Test API endpoint availability
    echo "=== TESTING API ENDPOINT ===\n";
    
    $apiUrl = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/api/rooms.php';
    echo "Testing: $apiUrl\n";
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'ignore_errors' => true
        ]
    ]);
    
    $response = @file_get_contents($apiUrl, false, $context);
    
    if ($response !== false) {
        echo "✅ API endpoint is accessible\n";
        echo "📡 Response: " . substr($response, 0, 200) . (strlen($response) > 200 ? "..." : "") . "\n";
        
        $decodedResponse = json_decode($response, true);
        if ($decodedResponse) {
            echo "📊 JSON Response parsed successfully\n";
            echo "Success: " . ($decodedResponse['success'] ? 'true' : 'false') . "\n";
            echo "Data count: " . (isset($decodedResponse['data']) ? count($decodedResponse['data']) : 'N/A') . "\n";
        } else {
            echo "❌ Failed to parse JSON response\n";
        }
    } else {
        echo "❌ API endpoint is not accessible\n";
        echo "💡 Check if XAMPP is running and the path is correct\n";
    }
    
} catch (Exception $e) {
    echo "💥 General error: " . $e->getMessage() . "\n";
}

echo "\n=== SUMMARY & NEXT STEPS ===\n";
echo "1. If rooms table is empty, run the sample data insertion\n";
echo "2. If API is not accessible, check XAMPP services\n";
echo "3. If database doesn't exist, run database setup scripts\n";
echo "4. Check the ROOMS_TROUBLESHOOTING_GUIDE.md for detailed solutions\n";
?>