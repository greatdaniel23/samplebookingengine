# DOKU Payment Gateway Integration (Spec)

## ⚠️ Status & Scope

This document is an **implementation specification / guide**.

- **Current repo status**: The DOKU backend endpoints described here (e.g. `api/payment/doku.php`, callback, redirect) are **not implemented** in this repository at the time of writing.
- **Important**: DOKU API endpoints, headers, and signature formats vary by product and version. Any concrete endpoint paths/signature logic shown below must be verified against **your official DOKU documentation**.

---

## 📋 Overview

This document outlines a recommended approach for integrating **DOKU Payment Gateway** into the booking system (PHP API + React frontend).

---

## 🔑 Prerequisites

### 1. Doku Account Setup
- Register for a Doku merchant account at https://www.doku.com
- Obtain your credentials:
  - **Client ID**: Your merchant identifier
  - **Secret Key**: For generating signatures
  - **Shared Key**: For request validation
  - **Merchant Code**: Your unique merchant code

### 2. Environment Configuration
Provide DOKU credentials via environment variables or a PHP config file (avoid committing secrets):

```php
// api/config/payment.php (example)
<?php
return [
    'doku' => [
        'environment' => 'sandbox', // 'sandbox' or 'production'
        'client_id' => 'YOUR_CLIENT_ID',
        'secret_key' => 'YOUR_SECRET_KEY',
        'shared_key' => 'YOUR_SHARED_KEY',
        'merchant_code' => 'YOUR_MERCHANT_CODE',

        // Base URL / API version MUST come from official DOKU docs for your product
        'api_base_url' => 'https://<from-doku-docs>',
    ]
];
```

---

## ✅ What You Must Prepare (and Where to Get It)

This section is the practical checklist: **what values you need**, **who provides them**, and **where you typically get them**.

### A) From DOKU (Merchant / Dashboard / Support)

| Item | Used For | Where to get it | Notes |
|------|----------|------------------|-------|
| Merchant account approval | Enables production processing | DOKU onboarding / contract | Required before production keys are issued |
| **Client ID** | Identifies your integration | DOKU Merchant Portal / provided by DOKU | Usually different for sandbox vs production |
| **Secret Key** | Request signing/authentication (depends on product) | DOKU Merchant Portal / provided by DOKU | Treat like a password; never commit to git |
| **Shared Key** | Signature validation / callback validation (depends on product) | DOKU Merchant Portal / provided by DOKU | Naming/usage differs by product/version |
| **Merchant Code** | Merchant identity in payload (product specific) | DOKU Merchant Portal / provided by DOKU | Sometimes called “Mall ID” or similar |
| **DOKU product + API version** | Determines endpoints, payload, signature scheme | Official DOKU documentation for your account | This is what makes specific endpoints (e.g. payment-link) valid or not |
| **Sandbox access** | Testing without real settlement | DOKU Merchant Portal / DOKU support | Confirm if sandbox is enabled for your account |
| **Enabled payment methods** | Controls what users can pay with | DOKU dashboard configuration | Credit card / VA / e-wallet availability varies |
| **Callback/webhook requirements** | Verifying notifications | Official DOKU docs + DOKU support | Includes headers, signature, and retry behavior |
| **Source IP list (if any)** | Optional allowlist for callback security | DOKU documentation/support | Only apply if DOKU publishes stable IP ranges |

### B) From Your System (You provide these)

| Item | Used For | Where to get it | Notes |
|------|----------|------------------|-------|
| **PUBLIC_API_BASE_URL** | Public URL for callbacks (server-to-server) | Your hosting/domain setup | Must be publicly reachable over HTTPS |
| **PUBLIC_WEB_BASE_URL** | Redirect URL back to UI | Your frontend domain | Used after payment (success/pending/fail) |
| Callback endpoint URLs | DOKU notifies your server | Your API routes | Example: `/api/payment/doku-callback.php` |
| Redirect/return URL | DOKU sends user back to your site | Your frontend routes | Example: `/payment-success?booking=...` |
| HTTPS + valid TLS cert | Required for payment callbacks/redirects | Your hosting provider | Don’t use HTTP in production |
| Booking/payment status mapping | Updates bookings after callback | Your booking rules | Define how gateway statuses map to your DB |
| Database table for transactions | Audit + reconciliation | Your MySQL schema | Example table shown later in this doc |

### C) Environment Variables (recommended)

Set these in your server environment (or a secure config store):

```
DOKU_ENV=sandbox
DOKU_CLIENT_ID=...
DOKU_SECRET_KEY=...
DOKU_SHARED_KEY=...
DOKU_MERCHANT_CODE=...
DOKU_API_BASE_URL=https://<from-doku-docs>

PUBLIC_API_BASE_URL=https://api.<your-domain>
PUBLIC_WEB_BASE_URL=https://<your-domain>
```

---

## 🏗️ Architecture

### Payment Flow
```
1. User completes booking → 2. Create Doku payment request → 3. Redirect to Doku
                                                                      ↓
5. Update booking status ← 4. User completes payment ← Doku payment page
         ↓
6. Send confirmation email → 7. Show success page
```

---

## 📦 Implementation Files

### Suggested File Structure (proposed)
```
api/
├── config/
│   └── payment.php          # Payment configuration
├── payment/
│   ├── doku.php            # Doku payment handler
│   ├── doku-callback.php   # Payment notification handler
│   └── doku-redirect.php   # Payment redirect handler
└── bookings.php            # Updated with payment integration
```

---

## 🔧 API Implementation (Example Templates)

### 1. Payment Configuration File
**File**: `api/config/payment.php`

```php
<?php
/**
 * Payment Gateway Configuration
 */

class PaymentConfig {
    private static $config = null;
    
    public static function getDokuConfig() {
        if (self::$config === null) {
            self::$config = [
                'environment' => getenv('DOKU_ENV') ?: 'sandbox',
                'client_id' => getenv('DOKU_CLIENT_ID') ?: '',
                'secret_key' => getenv('DOKU_SECRET_KEY') ?: '',
                'shared_key' => getenv('DOKU_SHARED_KEY') ?: '',
                'merchant_code' => getenv('DOKU_MERCHANT_CODE') ?: '',
                // MUST be set according to official DOKU docs for your product
                'api_url' => getenv('DOKU_API_BASE_URL') ?: '',
            ];
        }
        
        return self::$config;
    }
    
    public static function isConfigured() {
        $config = self::getDokuConfig();
        return !empty($config['client_id']) && 
               !empty($config['secret_key']) && 
               !empty($config['shared_key']) &&
               !empty($config['api_url']);
    }
}
```

---

### 2. Doku Payment Handler
**File**: `api/payment/doku.php`

```php
<?php
/**
 * Doku Payment Gateway Handler
 * Endpoint (example): {PUBLIC_API_BASE_URL}/api/payment/doku.php
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../config/payment.php';

class DokuPayment {
    private $config;
    private $db;
    
    public function __construct($db) {
        $this->config = PaymentConfig::getDokuConfig();
        $this->db = $db;
    }
    
    /**
     * Generate signature for Doku API
     */
    private function generateSignature($data) {
        // NOTE: Placeholder only. Implement according to official DOKU docs.
        // The exact signature scheme depends on DOKU product/version.
        throw new Exception('Signature generation not implemented. Follow official DOKU documentation.');
    }
    
    /**
     * Create payment request
     */
    public function createPayment($bookingId, $amount, $customerInfo) {
        try {
            // Get booking details
            $stmt = $this->db->prepare("SELECT * FROM bookings WHERE id = ?");
            $stmt->execute([$bookingId]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$booking) {
                throw new Exception("Booking not found");
            }
            
            // Generate unique invoice number
            $invoiceNumber = 'INV-' . $booking['booking_reference'] . '-' . time();
            
            // Prepare payment request
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
                    // Use your publicly accessible API + frontend URLs
                    'payment' => getenv('PUBLIC_API_BASE_URL') . '/api/payment/doku-callback.php',
                    'redirect' => getenv('PUBLIC_WEB_BASE_URL') . '/payment-success?booking=' . $bookingId,
                ],
            ];
            
            // Generate signature
            $signatureData = [
                $this->config['client_id'],
                $requestData['order']['invoice_number'],
                $requestData['order']['amount'],
                $requestData['order']['currency'],
            ];
            $signature = $this->generateSignature($signatureData);
            
            // Make API request to Doku
            $endpointPath = '/<from-doku-docs>'; // e.g. /payment-link (VERIFY)
            $ch = curl_init(rtrim($this->config['api_url'], '/') . $endpointPath);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                // Header names may differ per DOKU product/version
                'Client-Id: ' . $this->config['client_id'],
                'Request-Id: ' . uniqid(),
                'Request-Timestamp: ' . date('Y-m-d\TH:i:s\Z'),
                'Signature: ' . $signature,
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200) {
                throw new Exception("Doku API error: HTTP $httpCode");
            }
            
            $result = json_decode($response, true);
            
            if (!isset($result['payment_url'])) {
                throw new Exception("Invalid response from DOKU (expected payment_url)");
            }
            
            // Store payment information in database
            $stmt = $this->db->prepare("
                INSERT INTO payment_transactions 
                (booking_id, invoice_number, payment_method, amount, currency, status, payment_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $bookingId,
                $invoiceNumber,
                'doku',
                $amount,
                'IDR',
                'pending',
                $result['payment_url']
            ]);
            
            // Update booking payment status
            $stmt = $this->db->prepare("UPDATE bookings SET payment_status = 'pending' WHERE id = ?");
            $stmt->execute([$bookingId]);
            
            return [
                'success' => true,
                'payment_url' => $result['payment_url'],
                'invoice_number' => $invoiceNumber,
            ];
            
        } catch (Exception $e) {
            error_log("Doku payment error: " . $e->getMessage());
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
        
        // Validate required fields
        if (!isset($input['booking_id']) || !isset($input['amount'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
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
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
```

---

### 3. Payment Callback Handler
**File**: `api/payment/doku-callback.php`

```php
<?php
/**
 * DOKU Payment Callback Handler
 * Receives payment notifications from DOKU
 */

require_once '../config/database.php';
require_once '../config/payment.php';

// Log incoming request
error_log("Doku Callback received: " . file_get_contents('php://input'));

try {
    $database = new Database();
    $db = $database->getConnection();
    $config = PaymentConfig::getDokuConfig();
    
    // Get callback data
    $callbackData = json_decode(file_get_contents('php://input'), true);
    
    // Verify signature (MUST follow official DOKU docs)
    $receivedSignature = $_SERVER['HTTP_SIGNATURE'] ?? '';
    // Placeholder: compute $expectedSignature according to DOKU docs for your product/version.
    $expectedSignature = '';
    
    if (empty($expectedSignature) || $receivedSignature !== $expectedSignature) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid signature']);
        exit;
    }
    
    $invoiceNumber = $callbackData['order']['invoice_number'];
    $paymentStatus = $callbackData['transaction']['status'];
    $transactionId = $callbackData['transaction']['id'] ?? '';
    
    // Update payment transaction
    $stmt = $db->prepare("
        UPDATE payment_transactions 
        SET status = ?, transaction_id = ?, updated_at = NOW(), callback_data = ?
        WHERE invoice_number = ?
    ");
    $stmt->execute([
        $paymentStatus,
        $transactionId,
        json_encode($callbackData),
        $invoiceNumber
    ]);
    
    // Get booking ID
    $stmt = $db->prepare("SELECT booking_id FROM payment_transactions WHERE invoice_number = ?");
    $stmt->execute([$invoiceNumber]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($payment) {
        // Update booking payment status
        $bookingPaymentStatus = 'pending';
        if ($paymentStatus === 'SUCCESS') {
            $bookingPaymentStatus = 'paid';
        } elseif ($paymentStatus === 'FAILED' || $paymentStatus === 'EXPIRED') {
            $bookingPaymentStatus = 'failed';
        }
        
        $stmt = $db->prepare("
            UPDATE bookings 
            SET payment_status = ?, status = ? 
            WHERE id = ?
        ");
        $stmt->execute([
            $bookingPaymentStatus,
            $paymentStatus === 'SUCCESS' ? 'confirmed' : 'pending',
            $payment['booking_id']
        ]);
        
        // Send confirmation email if payment successful
        if ($paymentStatus === 'SUCCESS') {
            // Trigger email notification
            $stmt = $db->prepare("SELECT * FROM bookings WHERE id = ?");
            $stmt->execute([$payment['booking_id']]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($booking) {
                // Send email via notify.php
                $emailData = [
                    'booking_id' => $booking['id'],
                    'booking_reference' => $booking['booking_reference'],
                    'customer_email' => $booking['email'],
                    'customer_name' => $booking['first_name'] . ' ' . $booking['last_name'],
                ];
                
                // NOTE: Prefer a server-side function call or a configurable base URL.
                // Example (verify your own routing):
                // file_get_contents(getenv('PUBLIC_API_BASE_URL') . '/api/notify.php?' . http_build_query([
                //     'booking_id' => $booking['id']
                // ]));
            }
        }
    }
    
    http_response_code(200);
    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    error_log("Doku callback error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
```

---

### 4. Payment Redirect Handler
**File**: `api/payment/doku-redirect.php`

```php
<?php
/**
 * Doku Payment Redirect Handler
 * Handles user return from Doku payment page
 */

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$invoiceNumber = $_GET['invoice'] ?? '';
$status = $_GET['status'] ?? '';

if ($invoiceNumber) {
    // Get payment transaction
    $stmt = $db->prepare("SELECT * FROM payment_transactions WHERE invoice_number = ?");
    $stmt->execute([$invoiceNumber]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($payment) {
        // Redirect to booking confirmation page
        $bookingId = $payment['booking_id'];
        
        $webBase = rtrim(getenv('PUBLIC_WEB_BASE_URL') ?: '', '/');
        if (empty($webBase)) {
            $webBase = '/';
        }

        if ($status === 'success') {
            header("Location: {$webBase}/confirmation/{$bookingId}?payment=success");
        } else {
            header("Location: {$webBase}/confirmation/{$bookingId}?payment=pending");
        }
        exit;
    }
}

// Fallback redirect
header("Location: " . (getenv('PUBLIC_WEB_BASE_URL') ?: '/'));
exit;
```

---

## 🗄️ Database Schema

### Payment Transactions Table
```sql
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'doku',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_url TEXT,
    callback_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_status (status),
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔌 Frontend Integration

### 1. Update Booking Flow
**File**: `src/pages/Booking.tsx`

```tsx
const handlePayment = async () => {
  try {
    setLoading(true);
    
    // Create payment request
        const response = await fetch(`${API_BASE_URL}/api/payment/doku.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        amount: totalPrice,
        customer_name: `${guestForm.firstName} ${guestForm.lastName}`,
        customer_email: guestForm.email,
        customer_phone: guestForm.phone,
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirect to Doku payment page
      window.location.href = result.payment_url;
    } else {
      showError(result.error || 'Payment failed');
    }
  } catch (error) {
    showError('Failed to initiate payment');
  } finally {
    setLoading(false);
  }
};
```

### 2. Payment Button Component
```tsx
<Button
  onClick={handlePayment}
  disabled={!isFormValid || loading}
  className="w-full bg-blue-600 text-white py-3"
>
  {loading ? (
    <>
      <RefreshCw className="animate-spin mr-2 h-4 w-4" />
      Processing...
    </>
  ) : (
    <>
      <CreditCard className="mr-2 h-4 w-4" />
      Pay with Doku
    </>
  )}
</Button>
```

---

## 🧪 Testing

Use the **sandbox credentials and test instruments provided by DOKU** inside your merchant account/documentation.
Avoid embedding test PAN/card numbers or real-looking credentials in repo documentation.

### Testing Flow
1. Create a test booking
2. Initiate payment
3. Use test card on Doku page
4. Verify callback received
5. Check booking status updated
6. Verify email sent

---

## 📊 Payment Status Flow

```
pending → processing → success
                    ↓
                  failed
                    ↓
                  expired
```

**Status Mapping:**
- `pending`: Payment link created, awaiting payment
- `processing`: User is on Doku payment page
- `success`: Payment completed successfully
- `failed`: Payment failed
- `expired`: Payment link expired

---

## 🔐 Security Considerations

1. **Signature Verification**: Always verify signatures on callbacks
2. **HTTPS Only**: Use HTTPS for all payment endpoints
3. **Secret Storage**: Store keys in environment variables, never in code
4. **Amount Validation**: Verify payment amount matches booking
5. **Idempotency**: Handle duplicate callbacks gracefully
6. **Rate Limiting**: Implement rate limiting on payment endpoints
7. **Logging**: Log all payment transactions for audit

---

## 📱 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payment/doku.php` | POST | Create payment request |
| `/api/payment/doku-callback.php` | POST | Receive payment notifications |
| `/api/payment/doku-redirect.php` | GET | Handle user return |

---

## 🐛 Troubleshooting

### Common Issues

**1. Invalid Signature Error**
```
Solution: Verify shared key and signature generation logic
Check that all signature data is in correct order
```

**2. Payment URL Not Returned**
```
Solution: Check API credentials
Verify environment (sandbox vs production)
Check Doku API status
```

**3. Callback Not Received**
```
Solution: Verify callback URL is publicly accessible
Check firewall settings
Enable error logging
```

**4. Email Not Sent After Payment**
```
Solution: Verify notify.php is working
Check email service configuration
Review email logs
```

---

## 📚 Additional Resources

- **Doku Documentation**: https://docs.doku.com
- **API Reference**: https://developers.doku.com
- **Support**: support@doku.com
- **Status Page**: https://status.doku.com

---

## ✅ Implementation Checklist

- [ ] Doku merchant account created
- [ ] API credentials obtained
- [ ] Payment configuration file created
- [ ] Database table created
- [ ] Payment handler implemented
- [ ] Callback handler implemented
- [ ] Redirect handler implemented
- [ ] Frontend integration completed
- [ ] Sandbox testing completed
- [ ] Production credentials configured
- [ ] Security review completed
- [ ] Error logging implemented
- [ ] Documentation updated

---

**Last Updated**: December 18, 2025  
**Version**: 1.0.1  
**Status**: Draft (Spec / Not Implemented)
