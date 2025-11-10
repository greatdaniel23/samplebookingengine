<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Email configuration - Update these settings
$SMTP_HOST = 'smtp.gmail.com';  // Your SMTP server
$SMTP_PORT = 587;
$SMTP_USERNAME = 'your-email@gmail.com';  // Your email
$SMTP_PASSWORD = 'your-app-password';     // Your app password
$FROM_EMAIL = 'your-email@gmail.com';
$FROM_NAME = 'Villa Booking System';
$TO_EMAIL = 'bookings@rumahdaisycantik.com';  // Where booking notifications go

function sendBookingNotification($bookingData) {
    global $SMTP_HOST, $SMTP_PORT, $SMTP_USERNAME, $SMTP_PASSWORD, $FROM_EMAIL, $FROM_NAME, $TO_EMAIL;
    
    try {
        // Create email content
        $subject = "New Booking Confirmation - " . $bookingData['reference'];
        
        $message = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .booking-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
                .label { font-weight: bold; color: #2c5aa0; }
                .value { color: #333; }
                .total { background-color: #e8f4f8; padding: 10px; font-size: 18px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>New Booking Received!</h2>
                    <p>Booking Reference: " . $bookingData['reference'] . "</p>
                </div>
                
                <div class='content'>
                    <h3>Booking Details</h3>
                    <div class='booking-details'>
                        <div class='detail-row'>
                            <span class='label'>Guest Name:</span>
                            <span class='value'>" . $bookingData['first_name'] . " " . $bookingData['last_name'] . "</span>
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Email:</span>
                            <span class='value'>" . $bookingData['email'] . "</span>
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Phone:</span>
                            <span class='value'>" . $bookingData['phone'] . "</span>
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Check-in:</span>
                            <span class='value'>" . $bookingData['check_in'] . "</span>
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Check-out:</span>
                            <span class='value'>" . $bookingData['check_out'] . "</span>
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Guests:</span>
                            <span class='value'>" . $bookingData['guests'] . "</span>
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Room/Package:</span>
                            <span class='value'>" . $bookingData['room_id'] . "</span>
                        </div>
                        " . (!empty($bookingData['special_requests']) ? "
                        <div class='detail-row'>
                            <span class='label'>Special Requests:</span>
                            <span class='value'>" . $bookingData['special_requests'] . "</span>
                        </div>
                        " : "") . "
                        <div class='detail-row total'>
                            <span class='label'>Total Amount:</span>
                            <span class='value'>$" . number_format($bookingData['total_price'], 2) . "</span>
                        </div>
                    </div>
                    
                    <h3>Next Steps</h3>
                    <p>1. Contact the guest to confirm payment arrangements</p>
                    <p>2. Send payment instructions if needed</p>
                    <p>3. Update booking status in admin dashboard</p>
                    <p>4. Prepare for guest arrival</p>
                    
                    <p style='margin-top: 20px; font-size: 12px; color: #666;'>
                        This booking was created automatically through your villa booking system.
                        <br>Booking ID: " . $bookingData['id'] . "
                        <br>Created: " . date('Y-m-d H:i:s') . "
                    </p>
                </div>
            </div>
        </body>
        </html>";

        // Headers
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: $FROM_NAME <$FROM_EMAIL>" . "\r\n";
        $headers .= "Reply-To: $FROM_EMAIL" . "\r\n";

        // Send email using PHP mail() function
        $success = mail($TO_EMAIL, $subject, $message, $headers);
        
        if ($success) {
            return ['success' => true, 'message' => 'Booking notification sent successfully'];
        } else {
            return ['success' => false, 'message' => 'Failed to send booking notification'];
        }
        
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Email error: ' . $e->getMessage()];
    }
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
            exit;
        }
        
        // Validate required fields
        $required_fields = ['first_name', 'last_name', 'email', 'check_in', 'check_out', 'total_price'];
        foreach ($required_fields as $field) {
            if (!isset($input[$field]) || empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
                exit;
            }
        }
        
        // Send notification email
        $result = sendBookingNotification($input);
        
        if ($result['success']) {
            echo json_encode([
                'success' => true, 
                'message' => 'Booking notification sent successfully',
                'email_sent' => true
            ]);
        } else {
            // Don't fail the booking if email fails
            echo json_encode([
                'success' => true, 
                'message' => 'Booking saved but email notification failed: ' . $result['message'],
                'email_sent' => false
            ]);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>