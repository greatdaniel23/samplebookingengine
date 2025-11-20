<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once 'config/database.php';
    
    $db = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Get all tables in the database
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Check if specific tables exist
    $expectedTables = ['villa_info', 'rooms', 'bookings', 'packages', 'admin_users', 'amenities'];
    $tableStatus = [];
    
    foreach ($expectedTables as $table) {
        $exists = in_array($table, $tables);
        $tableStatus[$table] = [
            'exists' => $exists,
            'status' => $exists ? 'Found' : 'Missing'
        ];
        
        // If table exists, get row count
        if ($exists) {
            try {
                $countStmt = $db->query("SELECT COUNT(*) as count FROM `$table`");
                $count = $countStmt->fetch()['count'];
                $tableStatus[$table]['rows'] = $count;
            } catch (Exception $e) {
                $tableStatus[$table]['rows'] = 'Error: ' . $e->getMessage();
            }
        }
    }

    echo json_encode([
        'success' => true,
        'database_name' => $database,
        'all_tables' => $tables,
        'table_status' => $tableStatus,
        'total_tables' => count($tables)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug_info' => [
            'file' => __FILE__,
            'line' => __LINE__
        ]
    ]);
}
?>