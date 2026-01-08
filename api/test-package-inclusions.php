<?php
// Simple test to verify package-inclusions API functionality
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . '/config/database.php';

try {
    $pdo = (new Database())->getConnection();
    
    // Test: Add a few sample inclusions to package 1 for demonstration
    $testInclusions = [
        ['package_id' => 1, 'inclusion_id' => 1], // Welcome Breakfast
        ['package_id' => 1, 'inclusion_id' => 7], // Airport Transfer
        ['package_id' => 1, 'inclusion_id' => 19], // 24/7 Concierge Service
        ['package_id' => 1, 'inclusion_id' => 25], // Pool & Spa Access
    ];
    
    foreach ($testInclusions as $test) {
        // Check if already exists
        $check = $pdo->prepare("SELECT id FROM package_inclusions WHERE package_id = ? AND inclusion_id = ?");
        $check->execute([$test['package_id'], $test['inclusion_id']]);
        
        if (!$check->fetch()) {
            // Insert if doesn't exist
            $insert = $pdo->prepare("INSERT INTO package_inclusions (package_id, inclusion_id, display_order) VALUES (?, ?, ?)");
            $insert->execute([$test['package_id'], $test['inclusion_id'], 1]);
        }
    }
    
    // Now fetch the results
    $sql = "
        SELECT 
            pi.id as relationship_id,
            pi.package_id,
            pi.inclusion_id,
            pi.display_order,
            i.name,
            i.category,
            i.description,
            i.icon,
            i.is_featured
        FROM package_inclusions pi
        JOIN inclusions i ON pi.inclusion_id = i.id
        WHERE pi.package_id = 1
        ORDER BY pi.display_order, i.category, i.display_order
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $inclusions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Test data added and retrieved successfully',
        'package_id' => 1,
        'inclusions' => $inclusions,
        'total_count' => count($inclusions)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>