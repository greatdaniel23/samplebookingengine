<?php
/**
 * Villa Booking Engine - Email Service with Template Support
 * Load beautiful email templates from /email-templates/ folder
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

class VillaEmailService {
    
    private $smtp_username = 'danielsantosomarketing2017@gmail.com';
    private $smtp_password = 'araemhfoirpelkiz';
    private $sender_name = 'Villa Booking Engine';
    private $villa_name = 'Villa Daisy Cantik';
    
    /**
     * Load email template from file and replace placeholders
     */
    private function loadTemplate($template_name, $data) {
        $template_path = __DIR__ . '/email-templates/' . $template_name;
        
        if (file_exists($template_path)) {
            $template = file_get_contents($template_path);
            
            // Replace placeholders with actual data
            $placeholders = [
                '{{villa_name}}' => $this->villa_name,
                '{{guest_name}}' => $data['guest_name'] ?? '',
                '{{booking_reference}}' => $data['booking_reference'] ?? '',
                '{{check_in}}' => $data['check_in'] ?? '',
                '{{check_out}}' => $data['check_out'] ?? '',
                '{{room_name}}' => $data['room_name'] ?? '',
                '{{total_price}}' => $data['total_price'] ?? '',
                '{{guests}}' => $data['guests'] ?? '',
                '{{special_requests}}' => $data['special_requests'] ?? 'None',
                '{{guest_email}}' => $data['guest_email'] ?? '',
                '{{guest_phone}}' => $data['guest_phone'] ?? '',
                '{{villa_phone}}' => '+62 361 123456',
                '{{villa_email}}' => 'info@rumahdaisycantik.com',
                '{{villa_address}}' => 'Ubud, Bali, Indonesia',
                '{{current_year}}' => date('Y')
            ];
            
            return str_replace(array_keys($placeholders), array_values($placeholders), $template);
        }
        
        // Fallback to basic template if file not found
        return $this->getBasicTemplate($data);
    }
    
    /**
     * Send booking confirmation email to guest
     */
    public function sendBookingConfirmation($booking_data) {
        $subject = "🎉 Booking Confirmation - {$this->villa_name}";
        
        $html_body = $this->loadTemplate('booking-confirmation.html', $booking_data);
        $text_body = $this->loadTemplate('booking-confirmation.txt', $booking_data);
        
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
        
        $html_body = $this->loadTemplate('admin-notification.html', $booking_data);
        $text_body = $this->loadTemplate('admin-notification.txt', $booking_data);
        
        return $this->sendEmail(
            'danielsantosomarketing2017@gmail.com', // Admin email
            'Villa Manager',
            $subject,
            $html_body,
            $text_body
        );
    }
    
    /**
     * Core email sending function
     */
    private function sendEmail($to_email, $to_name, $subject, $html_body, $text_body = null) {
        $mail = new PHPMailer(true);
        
        try {
            // SMTP Configuration
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtp_username;
            $mail->Password = $this->smtp_password;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';
            
            // Sender
            $mail->setFrom($this->smtp_username, $this->sender_name);
            
            // Recipient
            $mail->addAddress($to_email, $to_name);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $html_body;
            if ($text_body) {
                $mail->AltBody = $text_body;
            }
            
            $mail->send();
            return ['success' => true, 'message' => 'Email sent successfully'];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => $mail->ErrorInfo];
        }
    }
    
    /**
     * Fallback basic template if template files not found
     */
    private function getBasicTemplate($booking) {
        return '
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2E8B57; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f9f9f9; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏨 ' . $this->villa_name . '</h1>
                    <p>Your booking is confirmed!</p>
                </div>
                <div class="content">
                    <h2>Booking Details</h2>
                    <p><strong>Reference:</strong> ' . ($booking['booking_reference'] ?? 'N/A') . '</p>
                    <p><strong>Guest:</strong> ' . ($booking['guest_name'] ?? 'N/A') . '</p>
                    <p><strong>Check-in:</strong> ' . ($booking['check_in'] ?? 'N/A') . '</p>
                    <p><strong>Check-out:</strong> ' . ($booking['check_out'] ?? 'N/A') . '</p>
                    <p><strong>Total:</strong> $' . ($booking['total_price'] ?? 'N/A') . '</p>
                </div>
            </div>
        </body>
        </html>';
    }
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $emailService = new VillaEmailService();
    
    if ($input['action'] === 'send_booking_confirmation') {
        $result = $emailService->sendBookingConfirmation($input['booking_data']);
        echo json_encode($result);
    } 
    elseif ($input['action'] === 'send_admin_notification') {
        $result = $emailService->sendAdminNotification($input['booking_data']);
        echo json_encode($result);
    }
    elseif ($input['action'] === 'test_booking') {
        // Test with sample data
        $test_data = [
            'guest_name' => 'John Doe',
            'guest_email' => 'test@example.com',
            'booking_reference' => 'VDC-' . date('Ymd') . '-' . rand(1000, 9999),
            'check_in' => '2025-12-25',
            'check_out' => '2025-12-30',
            'room_name' => 'Deluxe Ocean View',
            'total_price' => '2500',
            'guests' => '2',
            'special_requests' => 'Early check-in requested'
        ];
        
        $guest_result = $emailService->sendBookingConfirmation($test_data);
        $admin_result = $emailService->sendAdminNotification($test_data);
        
        echo json_encode([
            'guest_email' => $guest_result,
            'admin_email' => $admin_result,
            'test_data' => $test_data
        ]);
    }
}
?>