<?php
/**
 * Villa Booking Engine - Email Notification Service
 * Handles booking confirmation emails using the centralized email service
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function sendBookingNotification($bookingData) {
    try {
        // Determine email service URL based on environment
        $email_service_url = 'http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/email-service.php';
        
        // In production, uncomment this line:
        // $email_service_url = 'https://booking.rumahdaisycantik.com/email-service.php';
        
        // Prepare email data in the format expected by email-service.php
        $email_data = [
            'action' => 'send_booking_confirmation',
            'booking_data' => [
                'booking_reference' => $bookingData['reference'] ?? 'BK-' . date('Ymd') . '-' . rand(1000, 9999),
                'guest_name' => trim(($bookingData['first_name'] ?? '') . ' ' . ($bookingData['last_name'] ?? '')),
                'guest_email' => $bookingData['email'] ?? '',
                'check_in' => $bookingData['check_in'] ?? '',
                'check_out' => $bookingData['check_out'] ?? '',
                'room_type' => $bookingData['room_id'] ?? 'Standard Room',
                'package' => $bookingData['package_name'] ?? 'No Package Selected',
                'guests' => $bookingData['guests'] ?? 1,
                'total_amount' => $bookingData['total_price'] ?? 0,
                'special_requests' => $bookingData['special_requests'] ?? 'None',
                'phone' => $bookingData['phone'] ?? '',
                'booking_date' => date('Y-m-d H:i:s'),
                'nights' => calculateNights($bookingData['check_in'], $bookingData['check_out'])
            ]
        ];
        
        // Make HTTP request to email service
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => [
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                'content' => json_encode($email_data),
                'timeout' => 30
            ]
        ]);
        
        $response = file_get_contents($email_service_url, false, $context);
        
        if ($response === false) {
            return [
                'success' => false, 
                'message' => 'Failed to connect to email service',
                'debug' => 'Could not reach: ' . $email_service_url
            ];
        }
        
        $result = json_decode($response, true);
        
        if (!$result) {
            return [
                'success' => false, 
                'message' => 'Invalid response from email service',
                'debug' => 'Response: ' . substr($response, 0, 200)
            ];
        }
        
        // Check if both guest and admin emails were sent successfully
        $guest_success = isset($result['guest_email']['success']) && $result['guest_email']['success'];
        $admin_success = isset($result['admin_email']['success']) && $result['admin_email']['success'];
        
        if ($guest_success && $admin_success) {
            return [
                'success' => true, 
                'message' => 'Both guest confirmation and admin notification emails sent successfully',
                'guest_email' => $result['guest_email'],
                'admin_email' => $result['admin_email']
            ];
        } else if ($guest_success) {
            return [
                'success' => true, 
                'message' => 'Guest confirmation sent, admin notification failed',
                'guest_email' => $result['guest_email'],
                'admin_email' => $result['admin_email'] ?? ['success' => false]
            ];
        } else {
            return [
                'success' => false, 
                'message' => 'Email sending failed',
                'guest_email' => $result['guest_email'] ?? ['success' => false],
                'admin_email' => $result['admin_email'] ?? ['success' => false],
                'debug' => $result
            ];
        }
        
    } catch (Exception $e) {
        return [
            'success' => false, 
            'message' => 'Email service error: ' . $e->getMessage(),
            'debug' => [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]
        ];
    }
}

function calculateNights($check_in, $check_out) {
    try {
        $checkin_date = new DateTime($check_in);
        $checkout_date = new DateTime($check_out);
        $interval = $checkin_date->diff($checkout_date);
        return $interval->days;
    } catch (Exception $e) {
        return 1; // Default to 1 night if calculation fails
    }
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get and validate input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'error' => 'Invalid JSON data received'
            ]);
            exit;
        }
        
        // Log the received data for debugging
        error_log('Notify.php received data: ' . json_encode($input));
        
        // Validate required fields
        $required_fields = ['first_name', 'last_name', 'email', 'check_in', 'check_out', 'total_price'];
        $missing_fields = [];
        
        foreach ($required_fields as $field) {
            if (!isset($input[$field]) || (is_string($input[$field]) && trim($input[$field]) === '')) {
                $missing_fields[] = $field;
            }
        }
        
        if (!empty($missing_fields)) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'error' => 'Missing required fields: ' . implode(', ', $missing_fields),
                'received_data' => array_keys($input)
            ]);
            exit;
        }
        
        // Send notification email
        $result = sendBookingNotification($input);
        
        // Always return success to not block booking, but include email status
        echo json_encode([
            'success' => true, 
            'message' => $result['message'],
            'email_sent' => $result['success'],
            'email_details' => $result,
            'booking_data' => [
                'reference' => $input['reference'] ?? 'Generated',
                'guest' => trim(($input['first_name'] ?? '') . ' ' . ($input['last_name'] ?? '')),
                'email' => $input['email'] ?? ''
            ]
        ]);
        
    } catch (Exception $e) {
        // Log the error but don't fail the booking
        error_log('Notify.php error: ' . $e->getMessage());
        
        echo json_encode([
            'success' => true, 
            'message' => 'Booking saved but email notification failed: ' . $e->getMessage(),
            'email_sent' => false,
            'error_details' => [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'error' => 'Method not allowed. POST required.'
    ]);
}
?>