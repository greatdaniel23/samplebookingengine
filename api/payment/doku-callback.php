<?php
/**
 * DOKU Payment Callback Handler
 * 
 * Endpoint: POST /api/payment/doku-callback.php
 * 
 * Receives payment notifications from DOKU (webhook)
 * Updates booking and payment status
 * 
 * TODO: Implement signature verification per official DOKU docs
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    require_once __DIR__ . '/../config/database.php';
} catch (Exception $e) {
    error_log("DOKU Callback - Failed to load database.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database config not found']);
    exit;
}

try {
    require_once __DIR__ . '/../config/payment.php';
} catch (Exception $e) {
    error_log("DOKU Callback - Failed to load payment.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Payment config not found']);
    exit;
}

// Log all incoming data for debugging
$rawInput = file_get_contents('php://input');

// getallheaders() might not be available in all environments
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}
$headers = getallheaders();

error_log("DOKU Callback - Received at " . date('Y-m-d H:i:s'));
error_log("DOKU Callback - Raw body: " . $rawInput);
error_log("DOKU Callback - Headers: " . json_encode($headers));

try {
    error_log("DOKU Callback - Creating database connection...");
    $database = new Database();
    
    error_log("DOKU Callback - Getting database connection...");
    $db = $database->getConnection();
    
    error_log("DOKU Callback - Loading DOKU config...");
    $config = PaymentConfig::getDokuConfig();
    
    error_log("DOKU Callback - Parsing JSON...");
    // Get callback data
    $callbackData = json_decode($rawInput, true);
    
    if (!$callbackData) {
        error_log("DOKU Callback - Invalid JSON received");
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        exit;
    }
    
    error_log("DOKU Callback - Parsed data: " . json_encode($callbackData));
    
    // Verify signature
    // TODO: Implement per DOKU docs for your product
    // Common patterns:
    // - Check specific header (e.g., X-Signature, Signature)
    // - Compute expected signature from callback body + shared key
    // - Compare with received signature
    
    $receivedSignature = $headers['Signature'] ?? $headers['X-Signature'] ?? $_SERVER['HTTP_SIGNATURE'] ?? '';
    
    error_log("DOKU Callback - Received signature: " . $receivedSignature);
    
    // PLACEHOLDER: Signature verification
    // Example (adjust per DOKU docs):
    // $signatureData = [
    //     $config['client_id'],
    //     $callbackData['order']['invoice_number'],
    //     $callbackData['order']['amount'],
    //     $callbackData['transaction']['status'],
    // ];
    // $expectedSignature = hash_hmac('sha256', implode('', $signatureData), $config['shared_key']);
    
    // For sandbox testing, you might temporarily skip signature verification
    // IMPORTANT: Enable this in production
    $skipSignatureVerification = ($config['environment'] === 'sandbox');
    
    if (!$skipSignatureVerification) {
        // TODO: Implement actual signature verification
        $expectedSignature = ''; // Compute this per DOKU docs
        
        if (empty($expectedSignature) || $receivedSignature !== $expectedSignature) {
            error_log("DOKU Callback - Signature verification failed");
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid signature']);
            exit;
        }
    } else {
        error_log("DOKU Callback - Signature verification skipped (sandbox mode)");
    }
    
    // Extract payment info from callback
    // TODO: Adjust field names per your DOKU product
    $invoiceNumber = $callbackData['order']['invoice_number'] ?? '';
    $paymentStatus = $callbackData['transaction']['status'] ?? '';
    $transactionId = $callbackData['transaction']['id'] ?? '';
    $amount = $callbackData['order']['amount'] ?? 0;
    $providedBookingId = $callbackData['booking_id'] ?? null;  // For test simulator
    
    if (empty($invoiceNumber)) {
        error_log("DOKU Callback - Missing invoice number");
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing invoice number']);
        exit;
    }
    
    error_log("DOKU Callback - Invoice: {$invoiceNumber}, Status: {$paymentStatus}, Transaction ID: {$transactionId}");
    
    // Update payment transaction
    $stmt = $db->prepare("
        UPDATE payment_transactions 
        SET status = ?, transaction_id = ?, updated_at = NOW(), callback_data = ?
        WHERE invoice_number = ?
    ");
    $updated = $stmt->execute([
        $paymentStatus,
        $transactionId,
        json_encode($callbackData),
        $invoiceNumber
    ]);
    
    if (!$updated) {
        error_log("DOKU Callback - Failed to update payment transaction");
    }
    
    // Get booking ID
    $stmt = $db->prepare("SELECT booking_id FROM payment_transactions WHERE invoice_number = ?");
    $stmt->execute([$invoiceNumber]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Use booking ID from database, or fall back to provided one (for test simulator)
    $bookingId = $payment ? $payment['booking_id'] : $providedBookingId;
    
    if ($bookingId) {
        
        // Map DOKU status to booking status
        // TODO: Adjust status values per your DOKU product
        $bookingPaymentStatus = 'pending';
        $bookingStatus = 'pending';
        
        // Common DOKU status values (verify with your docs):
        // SUCCESS, PAID, COMPLETED = successful payment
        // FAILED, EXPIRED, CANCELLED = failed payment
        if (in_array(strtoupper($paymentStatus), ['SUCCESS', 'PAID', 'COMPLETED'])) {
            $bookingPaymentStatus = 'paid';
            $bookingStatus = 'confirmed';
            error_log("DOKU Callback - Payment successful for booking #{$bookingId}");
        } elseif (in_array(strtoupper($paymentStatus), ['FAILED', 'EXPIRED', 'CANCELLED'])) {
            $bookingPaymentStatus = 'failed';
            $bookingStatus = 'pending';
            error_log("DOKU Callback - Payment failed for booking #{$bookingId}");
        } else {
            error_log("DOKU Callback - Unknown status '{$paymentStatus}' for booking #{$bookingId}");
        }
        
        // Update booking
        $stmt = $db->prepare("
            UPDATE bookings 
            SET payment_status = ?, status = ? 
            WHERE id = ?
        ");
        $stmt->execute([
            $bookingPaymentStatus,
            $bookingStatus,
            $bookingId
        ]);
        
        // Send confirmation email if payment successful
        if ($bookingPaymentStatus === 'paid') {
            error_log("DOKU Callback - Triggering confirmation email for booking #{$bookingId}");
            
            // Get booking details for email
            $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
            $stmt->execute([$bookingId]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($booking) {
                // Trigger email notification via existing notify endpoint
                $notifyUrl = rtrim($config['public_api_url'], '/') . '/api/notify.php?booking_id=' . $bookingId;
                
                // Use file_get_contents or curl to trigger notification
                // Note: This is fire-and-forget; don't wait for response
                try {
                    $context = stream_context_create([
                        'http' => [
                            'timeout' => 2, // 2 second timeout
                            'ignore_errors' => true
                        ]
                    ]);
                    @file_get_contents($notifyUrl, false, $context);
                    error_log("DOKU Callback - Email notification triggered");
                } catch (Exception $e) {
                    error_log("DOKU Callback - Email notification failed: " . $e->getMessage());
                }
            }
        }
    } else {
        error_log("DOKU Callback - Payment record not found for invoice {$invoiceNumber}");
    }
    
    // Always return 200 OK to DOKU to prevent retries
    http_response_code(200);
    echo json_encode([
        'success' => true, 
        'message' => 'Callback processed',
        'booking_id' => $bookingId ?? null
    ]);
    
} catch (Exception $e) {
    error_log("DOKU Callback - Fatal error: " . $e->getMessage());
    error_log("DOKU Callback - Trace: " . $e->getTraceAsString());
    
    // Return error details for debugging
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal error', 'message' => $e->getMessage()]);
}
