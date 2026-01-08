<?php
// Package-specific calendar synchronization with external platforms
// Supports one-to-one mapping between packages and external calendars (Airbnb, VRBO, etc.)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    switch ($action) {
        case 'setup_airbnb':
            // Setup Airbnb calendar for a specific package
            if ($method !== 'POST') {
                throw new Exception('POST method required');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $packageId = $input['package_id'] ?? null;
            $airbnbUrl = $input['airbnb_url'] ?? null;
            
            if (!$packageId || !$airbnbUrl) {
                throw new Exception('package_id and airbnb_url are required');
            }
            
            // Validate Airbnb URL
            if (!preg_match('/^https:\/\/www\.airbnb\.com\/calendar\/ical\/[A-Za-z0-9_.-]+\.ics\?s=[A-Za-z0-9]+$/', $airbnbUrl)) {
                throw new Exception('Invalid Airbnb calendar URL format');
            }
            
            // Store in platform_integrations table
            $stmt = $pdo->prepare("
                INSERT INTO platform_integrations 
                (platform_name, platform_type, integration_key, api_endpoint, sync_direction, config_data, active) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                api_endpoint = VALUES(api_endpoint), 
                config_data = VALUES(config_data), 
                updated_at = CURRENT_TIMESTAMP
            ");
            
            $configData = json_encode([
                'package_id' => $packageId,
                'mapping_type' => 'package',
                'airbnb_url' => $airbnbUrl,
                'auto_sync' => true,
                'conflict_resolution' => 'block_external'
            ]);
            
            $integrationKey = "airbnb_package_{$packageId}";
            
            $stmt->execute([
                'airbnb',
                'calendar', 
                $integrationKey,
                $airbnbUrl,
                'import',
                $configData,
                1
            ]);
            
            // Perform initial sync
            $syncResult = syncAirbnbForPackage($pdo, $packageId, $airbnbUrl);
            
            echo json_encode([
                'success' => true,
                'message' => 'Airbnb calendar setup completed for package',
                'package_id' => $packageId,
                'integration_key' => $integrationKey,
                'sync_result' => $syncResult
            ]);
            break;
            
        case 'sync_package':
            // Sync specific package with its Airbnb calendar
            $packageId = $_GET['package_id'] ?? null;
            if (!$packageId) {
                throw new Exception('package_id parameter required');
            }
            
            // Get integration config for this package
            $stmt = $pdo->prepare("
                SELECT api_endpoint, config_data 
                FROM platform_integrations 
                WHERE platform_name = 'airbnb' 
                AND integration_key = ? 
                AND active = 1
            ");
            $stmt->execute(["airbnb_package_{$packageId}"]);
            $integration = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$integration) {
                throw new Exception('No Airbnb integration found for this package');
            }
            
            $airbnbUrl = $integration['api_endpoint'];
            $syncResult = syncAirbnbForPackage($pdo, $packageId, $airbnbUrl);
            
            echo json_encode([
                'success' => true,
                'package_id' => $packageId,
                'sync_result' => $syncResult
            ]);
            break;
            
        case 'get_package_integrations':
            // Get all calendar integrations for a package
            $packageId = $_GET['package_id'] ?? null;
            if (!$packageId) {
                throw new Exception('package_id parameter required');
            }
            
            $stmt = $pdo->prepare("
                SELECT platform_name, api_endpoint, sync_status, last_sync_at, config_data
                FROM platform_integrations 
                WHERE config_data LIKE ? 
                AND active = 1
            ");
            $stmt->execute(["%\"package_id\":{$packageId}%"]);
            $integrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get external blocks for this package
            $stmt = $pdo->prepare("
                SELECT source, COUNT(*) as block_count, MIN(start_date) as earliest_block, MAX(end_date) as latest_block
                FROM external_blocks 
                WHERE package_id = ? 
                GROUP BY source
            ");
            $stmt->execute([$packageId]);
            $blocks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'package_id' => $packageId,
                'integrations' => $integrations,
                'external_blocks' => $blocks
            ]);
            break;
            
        case 'remove_integration':
            // Remove calendar integration for a package
            if ($method !== 'DELETE') {
                throw new Exception('DELETE method required');
            }
            
            $packageId = $_GET['package_id'] ?? null;
            $platform = $_GET['platform'] ?? 'airbnb';
            
            if (!$packageId) {
                throw new Exception('package_id parameter required');
            }
            
            $integrationKey = "{$platform}_package_{$packageId}";
            
            // Remove from platform_integrations
            $stmt = $pdo->prepare("DELETE FROM platform_integrations WHERE integration_key = ?");
            $stmt->execute([$integrationKey]);
            
            // Remove external blocks for this package and platform
            $stmt = $pdo->prepare("DELETE FROM external_blocks WHERE package_id = ? AND source = ?");
            $stmt->execute([$packageId, $platform]);
            
            echo json_encode([
                'success' => true,
                'message' => "Removed {$platform} integration for package {$packageId}",
                'removed_integration' => $integrationKey
            ]);
            break;
            
        default:
            throw new Exception('Invalid action. Use: setup_airbnb, sync_package, get_package_integrations, remove_integration');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Sync Airbnb calendar for a specific package
 */
function syncAirbnbForPackage($pdo, $packageId, $airbnbUrl) {
    // Call the import API internally
    $importUrl = "https://api.rumahdaisycantik.com/ical_import_airbnb.php";
    $importUrl .= "?source=" . urlencode($airbnbUrl) . "&package_id=" . $packageId;
    
    $ch = curl_init($importUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Failed to sync Airbnb calendar: HTTP ' . $httpCode);
    }
    
    $result = json_decode($response, true);
    if (!$result['success']) {
        throw new Exception('Airbnb sync failed: ' . ($result['error'] ?? 'Unknown error'));
    }
    
    // Update last sync time
    $stmt = $pdo->prepare("
        UPDATE platform_integrations 
        SET last_sync_at = CURRENT_TIMESTAMP, sync_status = 'active' 
        WHERE integration_key = ?
    ");
    $stmt->execute(["airbnb_package_{$packageId}"]);
    
    return $result;
}
?>