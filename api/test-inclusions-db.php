<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . '/config/database.php';

try {
    $pdo = (new Database())->getConnection();
    
    // Check if inclusions table exists
    $checkTable = $pdo->query("SHOW TABLES LIKE 'inclusions'");
    $inclusionsTableExists = $checkTable->rowCount() > 0;
    
    // Check if package_inclusions table exists  
    $checkTable2 = $pdo->query("SHOW TABLES LIKE 'package_inclusions'");
    $packageInclusionsTableExists = $checkTable2->rowCount() > 0;
    
    $result = [
        'success' => true,
        'inclusions_table_exists' => $inclusionsTableExists,
        'package_inclusions_table_exists' => $packageInclusionsTableExists,
        'database_connection' => 'OK'
    ];
    
    if ($inclusionsTableExists) {
        // Count inclusions
        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM inclusions");
        $result['inclusions_count'] = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    }
    
    if ($packageInclusionsTableExists) {
        // Count package inclusions relationships
        $countStmt2 = $pdo->query("SELECT COUNT(*) as count FROM package_inclusions");
        $result['package_inclusions_count'] = $countStmt2->fetch(PDO::FETCH_ASSOC)['count'];
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>