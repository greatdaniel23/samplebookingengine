<?php
/**
 * DOKU Payment Gateway Handler
 * 
 * Endpoint: POST /api/payment/doku.php
 * 
 * Creates a payment request to DOKU and returns payment URL
 * 
 * TODO: Implement signature generation per official DOKU docs for your product/version
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/payment.php';

class DokuPayment {
    private $config;
    private $db;
    
    public function __construct($db) {
        $this->config = PaymentConfig::getDokuConfig();
        $this->db = $db;
        
        // Log configuration status (without exposing secrets)
        error_log("DOKU Payment - Environment: " . $this->config['environment']);
        error_log("DOKU Payment - API URL: " . $this->config['api_url']);
    }
    
    /**
     * Generate signature for DOKU API request
     * 
     * TODO: Implement this per your official DOKU documentation
     * The signature scheme varies by DOKU product/version
     * 
     * Common approaches:
     * - HMAC-SHA256 with secret key
     * - RSA signature with private key
     * - Concatenated fields + hash
     * 
     * @param array $data Data to sign
     * @return string Signature
     * @throws Exception If not implemented
     */
    private function generateSignature($data) {
        // PLACEHOLDER: Replace with actual signature generation
        // Example (verify with DOKU docs):
        // $signatureString = implode('', $data);
        // return hash_hmac('sha256', $signatureString, $this->config['secret_key']);
        
        error_log("DOKU Payment - generateSignature called with data: " . json_encode($data));
        
        // For initial sandbox testing, you might temporarily return empty or test value
        // IMPORTANT: Replace this with real signature before production
        throw new Exception('Signature generation not implemented. Check official DOKU documentation for your product.');
    }
    
    /**
     * Create payment request
     * 
     * @param int $bookingId Booking ID
     * @param float $amount Payment amount
     * @param array $customerInfo Customer information
     * @return array Result with success flag and payment URL or error
     */
    public function createPayment($bookingId, $amount, $customerInfo) {
        try {
            // Validate configuration
            if (!PaymentConfig::isConfigured()) {
                throw new Exception("DOKU payment gateway is not properly configured");
            }
            
            // Get booking details
            $stmt = $this->db->prepare("SELECT * FROM bookings WHERE id = ?");
            $stmt->execute([$bookingId]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$booking) {
                throw new Exception("Booking not found");
            }
            
            // Generate unique invoice number
            $invoiceNumber = 'INV-' . $booking['booking_reference'] . '-' . time();
            
            error_log("DOKU Payment - Creating payment for booking #{$bookingId}, invoice: {$invoiceNumber}, amount: {$amount}");
            
            // Prepare payment request
            // TODO: Adjust field names per your DOKU product documentation
            $requestData = [
                'order' => [
                    'invoice_number' => $invoiceNumber,
                    'amount' => (float)$amount,
                    'currency' => 'IDR',
                ],
                'payment' => [
                    'payment_due_date' => date('Y-m-d H:i:s', strtotime('+1 day')),
                ],
                'customer' => [
                    'name' => $customerInfo['name'],
                    'email' => $customerInfo['email'],
                    'phone' => $customerInfo['phone'] ?? '',
                ],
                'callback' => [
                    'payment' => rtrim($this->config['public_api_url'], '/') . '/api/payment/doku-callback.php',
                    'redirect' => rtrim($this->config['public_web_url'], '/') . '/payment-success?booking=' . $bookingId,
                ],
            ];
            
            error_log("DOKU Payment - Request data: " . json_encode($requestData));
            
            // Generate signature
            // TODO: Adjust signature data per DOKU docs
            $signatureData = [
                $this->config['client_id'],
                $requestData['order']['invoice_number'],
                $requestData['order']['amount'],
                $requestData['order']['currency'],
            ];
            
            // TEST MODE: Skip DOKU API call for testing transaction flow
            // Set DOKU_TEST_MODE=true in .env to enable
            $testMode = getenv('DOKU_TEST_MODE') === 'true' || $this->config['environment'] === 'sandbox';
            
            if ($testMode) {
                error_log("DOKU Payment - TEST MODE ENABLED - Skipping real DOKU API call");
                
                // Generate fake payment URL for testing
                $result = [
                    'payment_url' => rtrim($this->config['public_web_url'], '/') . '/payment-test.html?invoice=' . $invoiceNumber . '&booking=' . $bookingId . '&amount=' . $amount,
                    'transaction_id' => 'TEST-' . uniqid(),
                    'status' => 'pending'
                ];
            } else {
                // REAL MODE: Call DOKU API
                try {
                    $signature = $this->generateSignature($signatureData);
                } catch (Exception $e) {
                    error_log("DOKU Payment - Signature generation failed: " . $e->getMessage());
                    throw $e;
                }
                
                // Make API request to DOKU
                // TODO: Adjust endpoint path per DOKU docs (e.g., /payment-link, /checkout, etc.)
                $endpointPath = '/payment-link'; // VERIFY THIS WITH DOKU DOCS
                $apiUrl = rtrim($this->config['api_url'], '/') . $endpointPath;
                
                error_log("DOKU Payment - Calling API: {$apiUrl}");
                
                $ch = curl_init($apiUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    // TODO: Adjust header names per DOKU docs
                    'Client-Id: ' . $this->config['client_id'],
                    'Request-Id: ' . uniqid(),
                    'Request-Timestamp: ' . date('Y-m-d\TH:i:s\Z'),
                    'Signature: ' . ($signature ?? ''),
                ]);
                
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $curlError = curl_error($ch);
                curl_close($ch);
                
                error_log("DOKU Payment - API response code: {$httpCode}");
                error_log("DOKU Payment - API response body: " . $response);
                
                if ($curlError) {
                    throw new Exception("CURL error: {$curlError}");
                }
                
                if ($httpCode !== 200) {
                    throw new Exception("DOKU API error: HTTP {$httpCode}. Response: {$response}");
                }
                
                $result = json_decode($response, true);
                
                if (!isset($result['payment_url'])) {
                    throw new Exception("Invalid response from DOKU (expected payment_url). Response: " . json_encode($result));
                }
            }
            
            // Store payment information in database
            $stmt = $this->db->prepare("
                INSERT INTO payment_transactions 
                (booking_id, invoice_number, payment_method, amount, currency, status, payment_url, request_data, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $bookingId,
                $invoiceNumber,
                'doku',
                $amount,
                'IDR',
                'pending',
                $result['payment_url'],
                json_encode($requestData)
            ]);
            
            // Update booking payment status
            $stmt = $this->db->prepare("UPDATE bookings SET payment_status = 'pending' WHERE id = ?");
            $stmt->execute([$bookingId]);
            
            error_log("DOKU Payment - Payment created successfully, URL: " . $result['payment_url']);
            
            return [
                'success' => true,
                'payment_url' => $result['payment_url'],
                'invoice_number' => $invoiceNumber,
            ];
            
        } catch (Exception $e) {
            error_log("DOKU Payment - Error: " . $e->getMessage());
            error_log("DOKU Payment - Trace: " . $e->getTraceAsString());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        error_log("DOKU Payment - Received request: " . json_encode($input));
        
        // Validate required fields
        if (!isset($input['booking_id']) || !isset($input['amount'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields: booking_id, amount']);
            exit;
        }
        
        $customerInfo = [
            'name' => $input['customer_name'] ?? '',
            'email' => $input['customer_email'] ?? '',
            'phone' => $input['customer_phone'] ?? '',
        ];
        
        $doku = new DokuPayment($db);
        $result = $doku->createPayment(
            $input['booking_id'],
            $input['amount'],
            $customerInfo
        );
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("DOKU Payment - Fatal error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
