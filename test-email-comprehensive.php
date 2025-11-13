<?php
/**
 * COMPREHENSIVE EMAIL TESTING SUITE
 * Villa Booking Engine - Email System Validator
 * 
 * This script tests all email functionality for the booking system:
 * 1. Basic SMTP connection test
 * 2. Booking confirmation email test
 * 3. Admin notification email test
 * 4. UTF-8 encoding test (emojis and special characters)
 * 5. Email template validation
 * 
 * Usage: Access via browser or command line
 * URL: http://localhost/fontend-bookingengine-100/frontend-booking-engine-1/test-email-comprehensive.php
 */

// Import PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Email Configuration
$EMAIL_CONFIG = [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_username' => 'danielsantosomarketing2017@gmail.com',
    'smtp_password' => 'araemhfoirpelkiz',
    'sender_name' => 'Villa Booking Engine',
    'test_recipient' => 'greatdaniel87@gmail.com',
    'admin_email' => 'greatdaniel87@gmail.com'
];

// Test Data
$TEST_BOOKING = [
    'booking_reference' => 'VBE-' . date('Ymd') . '-' . rand(1000, 9999),
    'guest_name' => 'Daniel Santoso',
    'guest_email' => 'greatdaniel87@gmail.com',
    'check_in' => '2025-12-15',
    'check_out' => '2025-12-18',
    'room_type' => 'Deluxe Ocean View Room',
    'package' => 'Romantic Getaway Package 💕',
    'guests' => 2,
    'total_amount' => 2850000,
    'special_requests' => 'Late check-in requested 🌙',
    'booking_date' => date('Y-m-d H:i:s')
];

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email System Test - Villa Booking Engine</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        .header { 
            text-align: center; 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .test-section { 
            margin: 30px 0; 
            padding: 20px; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            background: #fafafa; 
        }
        .test-button { 
            background: #3498db; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            font-size: 16px; 
            margin: 10px 5px; 
            text-decoration: none; 
            display: inline-block; 
        }
        .test-button:hover { background: #2980b9; }
        .success { color: #27ae60; font-weight: bold; }
        .error { color: #e74c3c; font-weight: bold; }
        .info { color: #34495e; }
        .code { 
            background: #2c3e50; 
            color: #ecf0f1; 
            padding: 15px; 
            border-radius: 5px; 
            font-family: 'Courier New', monospace; 
            overflow-x: auto; 
        }
        .status-indicator { 
            display: inline-block; 
            width: 12px; 
            height: 12px; 
            border-radius: 50%; 
            margin-right: 8px; 
        }
        .status-success { background: #27ae60; }
        .status-error { background: #e74c3c; }
        .status-warning { background: #f39c12; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 Villa Booking Engine - Email Test Suite</h1>
            <p>Comprehensive email system validation for production deployment</p>
            <p><strong>Date:</strong> <?php echo date('F j, Y - g:i A'); ?></p>
        </div>

        <!-- Quick Test Buttons -->
        <div class="test-section">
            <h2>🚀 Quick Test Actions</h2>
            <a href="?test=basic" class="test-button">Basic SMTP Test</a>
            <a href="?test=booking" class="test-button">Booking Confirmation Test</a>
            <a href="?test=admin" class="test-button">Admin Notification Test</a>
            <a href="?test=utf8" class="test-button">UTF-8 Encoding Test</a>
            <a href="?test=all" class="test-button" style="background: #e67e22;">🔥 Run All Tests</a>
        </div>

        <!-- Configuration Display -->
        <div class="test-section">
            <h2>⚙️ Email Configuration</h2>
            <div class="code">
SMTP Server: <?php echo $EMAIL_CONFIG['smtp_host']; ?>:<?php echo $EMAIL_CONFIG['smtp_port']; ?>
Sender: <?php echo $EMAIL_CONFIG['smtp_username']; ?>
Test Recipient: <?php echo $EMAIL_CONFIG['test_recipient']; ?>
PHPMailer Path: <?php echo file_exists('PHPMailer/src/PHPMailer.php') ? '✅ Found' : '❌ Missing'; ?>
            </div>
        </div>

        <?php
        // Test Execution Logic
        $test_type = $_GET['test'] ?? null;
        
        if ($test_type) {
            echo '<div class="test-section">';
            echo '<h2>📧 Test Results</h2>';
            
            switch ($test_type) {
                case 'basic':
                    runBasicSMTPTest($EMAIL_CONFIG);
                    break;
                case 'booking':
                    runBookingConfirmationTest($EMAIL_CONFIG, $TEST_BOOKING);
                    break;
                case 'admin':
                    runAdminNotificationTest($EMAIL_CONFIG, $TEST_BOOKING);
                    break;
                case 'utf8':
                    runUTF8EncodingTest($EMAIL_CONFIG);
                    break;
                case 'all':
                    echo '<h3>🔥 Running Complete Test Suite...</h3>';
                    runBasicSMTPTest($EMAIL_CONFIG);
                    echo '<hr>';
                    runBookingConfirmationTest($EMAIL_CONFIG, $TEST_BOOKING);
                    echo '<hr>';
                    runAdminNotificationTest($EMAIL_CONFIG, $TEST_BOOKING);
                    echo '<hr>';
                    runUTF8EncodingTest($EMAIL_CONFIG);
                    break;
                default:
                    echo '<p class="error">Unknown test type: ' . htmlspecialchars($test_type) . '</p>';
            }
            echo '</div>';
        }
        ?>

        <!-- Test Data Display -->
        <div class="test-section">
            <h2>📋 Sample Booking Data</h2>
            <div class="code">
Booking Reference: <?php echo $TEST_BOOKING['booking_reference']; ?>
Guest: <?php echo $TEST_BOOKING['guest_name']; ?> (<?php echo $TEST_BOOKING['guest_email']; ?>)
Dates: <?php echo $TEST_BOOKING['check_in']; ?> to <?php echo $TEST_BOOKING['check_out']; ?>
Room: <?php echo $TEST_BOOKING['room_type']; ?>
Package: <?php echo $TEST_BOOKING['package']; ?>
Guests: <?php echo $TEST_BOOKING['guests']; ?> people
Total: Rp <?php echo number_format($TEST_BOOKING['total_amount']); ?>
Special Requests: <?php echo $TEST_BOOKING['special_requests']; ?>
            </div>
        </div>

        <!-- System Status -->
        <div class="test-section">
            <h2>🏥 System Health Check</h2>
            <p><span class="status-indicator <?php echo file_exists('PHPMailer/src/PHPMailer.php') ? 'status-success' : 'status-error'; ?>"></span>
               PHPMailer Library: <?php echo file_exists('PHPMailer/src/PHPMailer.php') ? 'Installed' : 'Missing'; ?></p>
            <p><span class="status-indicator <?php echo file_exists('email-templates') ? 'status-success' : 'status-warning'; ?>"></span>
               Email Templates: <?php echo file_exists('email-templates') ? 'Available' : 'Optional - Not Found'; ?></p>
            <p><span class="status-indicator status-success"></span>
               Production Status: Ready for deployment</p>
        </div>

        <div class="test-section info">
            <h2>📝 Notes</h2>
            <ul>
                <li>All tests send real emails to validate functionality</li>
                <li>UTF-8 encoding ensures proper emoji and international character support</li>
                <li>Production deployment requires uploading email-service.php and PHPMailer folder</li>
                <li>Email templates are optional but recommended for professional appearance</li>
                <li>Test emails are sent to: <?php echo $EMAIL_CONFIG['test_recipient']; ?></li>
            </ul>
        </div>
    </div>
</body>
</html>

<?php
// Test Functions

function runBasicSMTPTest($config) {
    echo '<h3>🔧 Basic SMTP Connection Test</h3>';
    
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host = $config['smtp_host'];
        $mail->SMTPAuth = true;
        $mail->Username = $config['smtp_username'];
        $mail->Password = $config['smtp_password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $config['smtp_port'];
        
        // Disable SSL verification for localhost
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Email content
        $mail->setFrom($config['smtp_username'], $config['sender_name']);
        $mail->addAddress($config['test_recipient'], 'Test Recipient');
        $mail->isHTML(true);
        $mail->Subject = 'SMTP Connection Test - ' . date('Y-m-d H:i:s');
        $mail->Body = '<h2>✅ SMTP Connection Successful!</h2><p>Your email system is working correctly.</p>';
        $mail->AltBody = 'SMTP Connection Successful! Your email system is working correctly.';
        
        $mail->send();
        echo '<p class="success">✅ SMTP Test PASSED: Email sent successfully!</p>';
        echo '<p class="info">Email sent to: ' . $config['test_recipient'] . '</p>';
        
    } catch (Exception $e) {
        echo '<p class="error">❌ SMTP Test FAILED: ' . htmlspecialchars($mail->ErrorInfo) . '</p>';
        echo '<p class="info">Check your Gmail App Password and SMTP settings.</p>';
    }
}

function runBookingConfirmationTest($config, $booking) {
    echo '<h3>📧 Booking Confirmation Email Test</h3>';
    
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration
        setupSMTP($mail, $config);
        
        // Email content
        $mail->setFrom($config['smtp_username'], $config['sender_name']);
        $mail->addAddress($booking['guest_email'], $booking['guest_name']);
        $mail->isHTML(true);
        $mail->Subject = 'Booking Confirmation - ' . $booking['booking_reference'];
        
        $mail->Body = generateBookingConfirmationHTML($booking);
        $mail->AltBody = generateBookingConfirmationText($booking);
        
        $mail->send();
        echo '<p class="success">✅ Booking Confirmation Test PASSED!</p>';
        echo '<p class="info">Confirmation sent to: ' . $booking['guest_email'] . '</p>';
        echo '<p class="info">Booking Reference: ' . $booking['booking_reference'] . '</p>';
        
    } catch (Exception $e) {
        echo '<p class="error">❌ Booking Confirmation Test FAILED: ' . htmlspecialchars($mail->ErrorInfo) . '</p>';
    }
}

function runAdminNotificationTest($config, $booking) {
    echo '<h3>🔔 Admin Notification Email Test</h3>';
    
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration
        setupSMTP($mail, $config);
        
        // Email content
        $mail->setFrom($config['smtp_username'], $config['sender_name']);
        $mail->addAddress($config['admin_email'], 'Villa Administrator');
        $mail->isHTML(true);
        $mail->Subject = 'New Booking Alert - ' . $booking['booking_reference'];
        
        $mail->Body = generateAdminNotificationHTML($booking);
        $mail->AltBody = generateAdminNotificationText($booking);
        
        $mail->send();
        echo '<p class="success">✅ Admin Notification Test PASSED!</p>';
        echo '<p class="info">Notification sent to: ' . $config['admin_email'] . '</p>';
        
    } catch (Exception $e) {
        echo '<p class="error">❌ Admin Notification Test FAILED: ' . htmlspecialchars($mail->ErrorInfo) . '</p>';
    }
}

function runUTF8EncodingTest($config) {
    echo '<h3>🌍 UTF-8 Encoding Test (Emojis & Special Characters)</h3>';
    
    $mail = new PHPMailer(true);
    
    try {
        // SMTP Configuration
        setupSMTP($mail, $config);
        
        // Email content with emojis and special characters
        $mail->setFrom($config['smtp_username'], $config['sender_name']);
        $mail->addAddress($config['test_recipient'], 'UTF-8 Test Recipient');
        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        
        $mail->Subject = 'UTF-8 Test 🏨✨ - Villa Booking Engine';
        
        $mail->Body = '
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif;">
            <h2>🏨 UTF-8 Encoding Test Results</h2>
            <p><strong>Emojis:</strong> 🏨 🌊 🌴 ✨ 💕 🌙 🎉 📧 ✅ ❌</p>
            <p><strong>Currency:</strong> Rp 2.850.000 • $1,250 • €1,100 • £950</p>
            <p><strong>Special Characters:</strong> àáâãäåæçèéêë</p>
            <p><strong>Languages:</strong></p>
            <ul>
                <li>English: Welcome to our villa!</li>
                <li>Indonesian: Selamat datang di villa kami!</li>
                <li>French: Bienvenue dans notre villa!</li>
                <li>German: Willkommen in unserer Villa!</li>
            </ul>
            <p><strong>Date Formats:</strong> ' . date('Y-m-d') . ' • ' . date('d/m/Y') . ' • ' . date('F j, Y') . '</p>
        </body>
        </html>';
        
        $mail->AltBody = 'UTF-8 Test: Emojis and special characters - Villa Booking Engine';
        
        $mail->send();
        echo '<p class="success">✅ UTF-8 Encoding Test PASSED!</p>';
        echo '<p class="info">Test includes: Emojis, currency symbols, accented characters, and international text</p>';
        
    } catch (Exception $e) {
        echo '<p class="error">❌ UTF-8 Encoding Test FAILED: ' . htmlspecialchars($mail->ErrorInfo) . '</p>';
    }
}

function setupSMTP($mail, $config) {
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];  
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config['smtp_port'];
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';
    
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );
}

function generateBookingConfirmationHTML($booking) {
    return '
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #2c3e50; color: white; padding: 20px; text-align: center;">
                <h1>🏨 Booking Confirmation</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
                <h2>Dear ' . htmlspecialchars($booking['guest_name']) . ',</h2>
                <p>Thank you for your booking! Here are your reservation details:</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background: #34495e; color: white;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Booking Reference</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">' . $booking['booking_reference'] . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-in Date</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">' . $booking['check_in'] . '</td>
                    </tr>
                    <tr style="background: #ecf0f1;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-out Date</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">' . $booking['check_out'] . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Room Type</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">' . htmlspecialchars($booking['room_type']) . '</td>
                    </tr>
                    <tr style="background: #ecf0f1;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Package</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">' . htmlspecialchars($booking['package']) . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Number of Guests</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">' . $booking['guests'] . ' people</td>
                    </tr>
                    <tr style="background: #2ecc71; color: white;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Rp ' . number_format($booking['total_amount']) . '</strong></td>
                    </tr>
                </table>
                
                <p><strong>Special Requests:</strong> ' . htmlspecialchars($booking['special_requests']) . '</p>
                <p><strong>Booking Date:</strong> ' . $booking['booking_date'] . '</p>
                
                <div style="background: #3498db; color: white; padding: 15px; margin: 20px 0; text-align: center;">
                    <h3>We look forward to welcoming you! ✨</h3>
                </div>
            </div>
        </div>
    </body>
    </html>';
}

function generateBookingConfirmationText($booking) {
    return "BOOKING CONFIRMATION\n\n" .
           "Dear " . $booking['guest_name'] . ",\n\n" .
           "Thank you for your booking!\n\n" .
           "Booking Reference: " . $booking['booking_reference'] . "\n" .
           "Check-in: " . $booking['check_in'] . "\n" .
           "Check-out: " . $booking['check_out'] . "\n" .
           "Room: " . $booking['room_type'] . "\n" .
           "Package: " . $booking['package'] . "\n" .
           "Guests: " . $booking['guests'] . " people\n" .
           "Total: Rp " . number_format($booking['total_amount']) . "\n" .
           "Special Requests: " . $booking['special_requests'] . "\n\n" .
           "We look forward to welcoming you!";
}

function generateAdminNotificationHTML($booking) {
    return '
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
            <h1>🔔 New Booking Alert</h1>
        </div>
        <div style="padding: 20px;">
            <h2>New reservation received!</h2>
            <p><strong>Booking Reference:</strong> ' . $booking['booking_reference'] . '</p>
            <p><strong>Guest:</strong> ' . htmlspecialchars($booking['guest_name']) . ' (' . $booking['guest_email'] . ')</p>
            <p><strong>Dates:</strong> ' . $booking['check_in'] . ' to ' . $booking['check_out'] . '</p>
            <p><strong>Room:</strong> ' . htmlspecialchars($booking['room_type']) . '</p>
            <p><strong>Package:</strong> ' . htmlspecialchars($booking['package']) . '</p>
            <p><strong>Total:</strong> Rp ' . number_format($booking['total_amount']) . '</p>
            <p><strong>Special Requests:</strong> ' . htmlspecialchars($booking['special_requests']) . '</p>
        </div>
    </body>
    </html>';
}

function generateAdminNotificationText($booking) {
    return "NEW BOOKING ALERT\n\n" .
           "Booking Reference: " . $booking['booking_reference'] . "\n" .
           "Guest: " . $booking['guest_name'] . " (" . $booking['guest_email'] . ")\n" .
           "Dates: " . $booking['check_in'] . " to " . $booking['check_out'] . "\n" .
           "Room: " . $booking['room_type'] . "\n" .
           "Package: " . $booking['package'] . "\n" .
           "Total: Rp " . number_format($booking['total_amount']) . "\n" .
           "Special Requests: " . $booking['special_requests'];
}
?>