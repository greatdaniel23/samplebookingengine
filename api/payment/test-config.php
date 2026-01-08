<?php
/**
 * DOKU Payment Test Script
 * 
 * Tests DOKU payment configuration and endpoint
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/payment.php';

header("Content-Type: application/json");

$results = [];

// 1. Check database connection
try {
    $database = new Database();
    $db = $database->getConnection();
    $results['database'] = 'Connected';
} catch (Exception $e) {
    $results['database'] = 'Failed: ' . $e->getMessage();
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit;
}

// 2. Check if payment_transactions table exists
try {
    $stmt = $db->query("SHOW TABLES LIKE 'payment_transactions'");
    if ($stmt->rowCount() > 0) {
        $results['payment_table'] = 'EXISTS';
    } else {
        $results['payment_table'] = 'MISSING - Run database/payment-transactions.sql';
    }
} catch (Exception $e) {
    $results['payment_table'] = 'Error: ' . $e->getMessage();
}

// 3. Check DOKU configuration
$config = PaymentConfig::getDokuConfig();
$results['doku_config'] = [
    'environment' => $config['environment'],
    'client_id_set' => !empty($config['client_id']),
    'secret_key_set' => !empty($config['secret_key']),
    'shared_key_set' => !empty($config['shared_key']),
    'api_url_set' => !empty($config['api_url']),
    'public_api_url_set' => !empty($config['public_api_url']),
    'public_web_url_set' => !empty($config['public_web_url']),
    'is_configured' => PaymentConfig::isConfigured(),
];

// 4. Check if we can find a test booking
try {
    $stmt = $db->query("SELECT id, booking_reference FROM bookings ORDER BY id DESC LIMIT 1");
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($booking) {
        $results['test_booking'] = [
            'id' => $booking['id'],
            'reference' => $booking['booking_reference']
        ];
    } else {
        $results['test_booking'] = 'No bookings found';
    }
} catch (Exception $e) {
    $results['test_booking'] = 'Error: ' . $e->getMessage();
}

// 5. Check PHP extensions
$results['php_extensions'] = [
    'curl' => extension_loaded('curl'),
    'json' => extension_loaded('json'),
    'pdo' => extension_loaded('pdo'),
];

echo json_encode($results, JSON_PRETTY_PRINT);
