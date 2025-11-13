<?php
/**
 * Villa Booking Engine - Email Service
 * Production-ready email functionality using PHPMailer and Gmail SMTP
 * 
 * Usage:
 * - Booking confirmations
 * - Admin notifications  
 * - Guest communications
 * - System alerts
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Dynamic PHPMailer path resolution for production compatibility
$phpmailer_base = __DIR__ . '/PHPMailer/src/';

// Try different possible locations
if (!file_exists($phpmailer_base . 'PHPMailer.php')) {
    $phpmailer_base = __DIR__ . '/../PHPMailer/src/';
}
if (!file_exists($phpmailer_base . 'PHPMailer.php')) {
    $phpmailer_base = dirname(__DIR__) . '/PHPMailer/src/';
}

require_once $phpmailer_base . 'Exception.php';
require_once $phpmailer_base . 'PHPMailer.php';
require_once $phpmailer_base . 'SMTP.php';

class VillaEmailService {
    
    private $smtp_username = 'danielsantosomarketing2017@gmail.com';
    private $smtp_password = 'araemhfoirpelkiz';
    private $sender_name = 'Villa Booking Engine';
    private $villa_name = 'Villa Daisy Cantik';
    
    /**
     * Send booking confirmation email to guest
     */
    public function sendBookingConfirmation($booking_data) {
        $subject = "🎉 Booking Confirmation - {$this->villa_name}";
        
        $html_body = $this->getBookingConfirmationHTML($booking_data);
        $text_body = $this->getBookingConfirmationText($booking_data);
        
        return $this->sendEmail(
            $booking_data['guest_email'],
            $booking_data['guest_name'],
            $subject,
            $html_body,
            $text_body
        );
    }
    
    /**
     * Send admin notification about new booking
     */
    public function sendAdminNotification($booking_data) {
        $subject = "🔔 New Booking Alert - {$this->villa_name}";
        
        $html_body = $this->getAdminNotificationHTML($booking_data);
        $text_body = $this->getAdminNotificationText($booking_data);
        
        return $this->sendEmail(
            'greatdaniel87@gmail.com', // Admin email
            'Villa Administrator',
            $subject,
            $html_body,
            $text_body
        );
    }
    
    /**
     * Core email sending function
     */
    private function sendEmail($to_email, $to_name, $subject, $html_body, $text_body) {
        $mail = new PHPMailer(true);
        
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtp_username;
            $mail->Password = $this->smtp_password;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            
            // SSL settings for localhost
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            
            // Recipients
            $mail->setFrom($this->smtp_username, $this->sender_name);
            $mail->addAddress($to_email, $to_name);
            
            // Content
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';
            $mail->Subject = $subject;
            $mail->Body = $html_body;
            $mail->AltBody = $text_body;
            
            $mail->send();
            return ['success' => true, 'message' => 'Email sent successfully'];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => "Email error: {$mail->ErrorInfo}"];
        }
    }
    
    /**
     * Get booking confirmation HTML email template
     */
    private function getBookingConfirmationHTML($booking) {
        return '
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2E8B57; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: #f9f9f9; }
                .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; color: #2E8B57; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .highlight { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏨 ' . $this->villa_name . '</h1>
                    <h2>Booking Confirmation</h2>
                </div>
                <div class="content">
                    <div class="highlight">
                        <h3>✅ Your booking has been confirmed!</h3>
                        <p><strong>Booking Reference:</strong> ' . ($booking['booking_reference'] ?? 'BK-' . rand(10000, 99999)) . '</p>
                    </div>
                    
                    <div class="booking-details">
                        <h3>📋 Booking Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Guest Name:</span> ' . ($booking['guest_name'] ?? 'Guest') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span> ' . ($booking['guest_email'] ?? '') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Check-in:</span> ' . ($booking['check_in'] ?? 'TBD') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Check-out:</span> ' . ($booking['check_out'] ?? 'TBD') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Guests:</span> ' . ($booking['guests'] ?? '1') . ' guest(s)
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Room/Package:</span> ' . ($booking['room_name'] ?? 'Standard Room') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Total Amount:</span> $' . ($booking['total_amount'] ?? '0.00') . '
                        </div>
                    </div>
                    
                    <div class="highlight">
                        <h3>📍 Villa Information</h3>
                        <p><strong>Location:</strong> Ubud, Bali, Indonesia</p>
                        <p><strong>Contact:</strong> info@villadaisycantik.com</p>
                        <p><strong>Phone:</strong> +62 361 234 5678</p>
                    </div>
                    
                    <p>We look forward to welcoming you to ' . $this->villa_name . '!</p>
                </div>
                <div class="footer">
                    <p>Sent from ' . $this->villa_name . ' - Production Ready Booking System</p>
                    <p>November 12, 2025</p>
                </div>
            </div>
        </body>
        </html>';
    }
    
    /**
     * Get booking confirmation text email template
     */
    private function getBookingConfirmationText($booking) {
        return "
🏨 " . $this->villa_name . " - Booking Confirmation

✅ Your booking has been confirmed!
Booking Reference: " . ($booking['booking_reference'] ?? 'BK-' . rand(10000, 99999)) . "

📋 Booking Details:
Guest Name: " . ($booking['guest_name'] ?? 'Guest') . "
Email: " . ($booking['guest_email'] ?? '') . "
Check-in: " . ($booking['check_in'] ?? 'TBD') . "
Check-out: " . ($booking['check_out'] ?? 'TBD') . "
Guests: " . ($booking['guests'] ?? '1') . " guest(s)
Room/Package: " . ($booking['room_name'] ?? 'Standard Room') . "
Total Amount: $" . ($booking['total_amount'] ?? '0.00') . "

📍 Villa Information:
Location: Ubud, Bali, Indonesia
Contact: info@villadaisycantik.com
Phone: +62 361 234 5678

We look forward to welcoming you to " . $this->villa_name . "!

Sent from " . $this->villa_name . " - Production Ready Booking System
November 12, 2025
        ";
    }
    
    /**
     * Get admin notification HTML template
     */
    private function getAdminNotificationHTML($booking) {
        return '
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: #f9f9f9; }
                .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
                .detail-label { font-weight: bold; color: #FF6B35; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .alert { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #FF6B35; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 New Booking Alert</h1>
                    <h2>' . $this->villa_name . '</h2>
                </div>
                <div class="content">
                    <div class="alert">
                        <h3>⚡ New booking received!</h3>
                        <p><strong>Action Required:</strong> Review and confirm booking details</p>
                    </div>
                    
                    <div class="booking-details">
                        <h3>📋 Booking Information</h3>
                        <div class="detail-row">
                            <span class="detail-label">Booking Reference:</span> ' . ($booking['booking_reference'] ?? 'BK-' . rand(10000, 99999)) . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Guest Name:</span> ' . ($booking['guest_name'] ?? 'Guest') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span> ' . ($booking['guest_email'] ?? '') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Phone:</span> ' . ($booking['guest_phone'] ?? 'Not provided') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Check-in:</span> ' . ($booking['check_in'] ?? 'TBD') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Check-out:</span> ' . ($booking['check_out'] ?? 'TBD') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Guests:</span> ' . ($booking['guests'] ?? '1') . ' guest(s)
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Room/Package:</span> ' . ($booking['room_name'] ?? 'Standard Room') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Total Amount:</span> $' . ($booking['total_amount'] ?? '0.00') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Special Requests:</span> ' . ($booking['special_requests'] ?? 'None') . '
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Booking Time:</span> ' . date('Y-m-d H:i:s') . '
                        </div>
                    </div>
                    
                    <div class="alert">
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Review booking details in admin dashboard</li>
                            <li>Confirm room availability</li>
                            <li>Contact guest if needed</li>
                            <li>Update booking status</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>Villa Booking Engine - Admin Notification System</p>
                    <p>November 12, 2025</p>
                </div>
            </div>
        </body>
        </html>';
    }
    
    /**
     * Get admin notification text template
     */
    private function getAdminNotificationText($booking) {
        return "
🔔 NEW BOOKING ALERT - " . $this->villa_name . "

⚡ New booking received!
Action Required: Review and confirm booking details

📋 Booking Information:
Booking Reference: " . ($booking['booking_reference'] ?? 'BK-' . rand(10000, 99999)) . "
Guest Name: " . ($booking['guest_name'] ?? 'Guest') . "
Email: " . ($booking['guest_email'] ?? '') . "
Phone: " . ($booking['guest_phone'] ?? 'Not provided') . "
Check-in: " . ($booking['check_in'] ?? 'TBD') . "
Check-out: " . ($booking['check_out'] ?? 'TBD') . "
Guests: " . ($booking['guests'] ?? '1') . " guest(s)
Room/Package: " . ($booking['room_name'] ?? 'Standard Room') . "
Total Amount: $" . ($booking['total_amount'] ?? '0.00') . "
Special Requests: " . ($booking['special_requests'] ?? 'None') . "
Booking Time: " . date('Y-m-d H:i:s') . "

Next Steps:
- Review booking details in admin dashboard
- Confirm room availability  
- Contact guest if needed
- Update booking status

Villa Booking Engine - Admin Notification System
November 12, 2025
        ";
    }
}

// Usage example for API integration
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    $emailService = new VillaEmailService();
    
    switch ($action) {
        case 'booking_confirmation':
            $result = $emailService->sendBookingConfirmation($input['booking_data']);
            echo json_encode($result);
            break;
            
        case 'admin_notification':
            $result = $emailService->sendAdminNotification($input['booking_data']);
            echo json_encode($result);
            break;
            
        case 'send_booking_confirmation':
            // Send both guest confirmation and admin notification
            $guestResult = $emailService->sendBookingConfirmation($input['booking_data']);
            $adminResult = $emailService->sendAdminNotification($input['booking_data']);
            
            echo json_encode([
                'guest_email' => $guestResult,
                'admin_email' => $adminResult,
                'booking_data' => $input['booking_data']
            ]);
            break;
            
        case 'test_booking':
            // Test with sample data
            $test_booking = [
                'booking_reference' => 'BK-TEST-' . rand(10000, 99999),
                'guest_name' => 'John Test User',
                'guest_email' => 'greatdaniel87@gmail.com',
                'guest_phone' => '+1-555-123-4567',
                'check_in' => '2025-12-01',
                'check_out' => '2025-12-05',
                'guests' => '2',
                'room_name' => 'Deluxe Suite (Test Booking)',
                'total_amount' => '750.00',
                'special_requests' => 'Late check-in requested (test)'
            ];
            
            $result1 = $emailService->sendBookingConfirmation($test_booking);
            $result2 = $emailService->sendAdminNotification($test_booking);
            
            echo json_encode([
                'guest_email' => $result1,
                'admin_email' => $result2,
                'test_data' => $test_booking
            ]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    // Display usage information
    echo '<h1>🏨 Villa Booking Engine - Email Service</h1>';
    echo '<p>✅ Email system is ready for production use!</p>';
    echo '<h3>Available Actions:</h3>';
    echo '<ul>';
    echo '<li><strong>booking_confirmation</strong> - Send confirmation to guest</li>';
    echo '<li><strong>admin_notification</strong> - Send alert to admin</li>';
    echo '<li><strong>test_booking</strong> - Send test emails</li>';
    echo '</ul>';
    echo '<p><strong>Usage:</strong> POST JSON data with action and booking_data</p>';
    echo '<p><strong>Status:</strong> Production Ready (November 12, 2025)</p>';
}
?>