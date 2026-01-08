<?php
/**
 * DOKU Payment Redirect Handler
 * 
 * Endpoint: GET /api/payment/doku-redirect.php
 * 
 * Handles user return from DOKU payment page
 * Redirects user back to frontend with payment status
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/payment.php';

$config = PaymentConfig::getDokuConfig();
$webBase = rtrim($config['public_web_url'], '/');

if (empty($webBase)) {
    $webBase = '/';
}

// Get parameters from DOKU redirect
// TODO: Adjust parameter names per your DOKU product
$invoiceNumber = $_GET['invoice'] ?? $_GET['invoice_number'] ?? '';
$status = $_GET['status'] ?? $_GET['payment_status'] ?? '';
$bookingId = $_GET['booking_id'] ?? '';

error_log("DOKU Redirect - Invoice: {$invoiceNumber}, Status: {$status}, Booking: {$bookingId}");
error_log("DOKU Redirect - All params: " . json_encode($_GET));

if ($invoiceNumber) {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Get payment transaction
        $stmt = $db->prepare("SELECT booking_id, status FROM payment_transactions WHERE invoice_number = ?");
        $stmt->execute([$invoiceNumber]);
        $payment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($payment) {
            $bookingId = $payment['booking_id'];
            $paymentStatus = $payment['status'];
            
            error_log("DOKU Redirect - Found booking #{$bookingId} with status: {$paymentStatus}");
            
            // Determine redirect based on payment status
            $redirectStatus = 'pending';
            if (in_array(strtoupper($paymentStatus), ['SUCCESS', 'PAID', 'COMPLETED'])) {
                $redirectStatus = 'success';
            } elseif (in_array(strtoupper($paymentStatus), ['FAILED', 'EXPIRED', 'CANCELLED'])) {
                $redirectStatus = 'failed';
            }
            
            // Redirect to booking confirmation page with payment status
            $redirectUrl = "{$webBase}/confirmation/{$bookingId}?payment={$redirectStatus}";
            error_log("DOKU Redirect - Redirecting to: {$redirectUrl}");
            header("Location: {$redirectUrl}");
            exit;
        } else {
            error_log("DOKU Redirect - Payment record not found for invoice {$invoiceNumber}");
        }
    } catch (Exception $e) {
        error_log("DOKU Redirect - Error: " . $e->getMessage());
    }
}

// Fallback: if we have booking ID from params, use it
if ($bookingId) {
    $redirectStatus = ($status === 'success' || strtoupper($status) === 'SUCCESS') ? 'success' : 'pending';
    $redirectUrl = "{$webBase}/confirmation/{$bookingId}?payment={$redirectStatus}";
    error_log("DOKU Redirect - Fallback redirect to: {$redirectUrl}");
    header("Location: {$redirectUrl}");
    exit;
}

// Last resort: redirect to home
error_log("DOKU Redirect - No booking info found, redirecting to home");
header("Location: {$webBase}/");
exit;
