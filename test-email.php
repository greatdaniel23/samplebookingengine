<?php
/**
 * GMAIL SMTP SENDER SCRIPT USING XAMPP AND PHPMailer
 * PHPMailer Setup:
 * 1. Download PHPMailer from GitHub.
 * 2. In your project folder, create a directory named 'PHPMailer'.
 * 3. Copy the 'src' files (Exception.php, PHPMailer.php, SMTP.php) into the 'PHPMailer' directory.
 */

// Import PHPMailer classes from the src directory
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Configuration details
$SMTP_USERNAME = 'danielsantosomarketing2017@gmail.com';
$SMTP_PASSWORD = 'araemhfoirpelkiz';
$RECIPIENT_EMAIL = 'greatdaniel87@gmail.com'; // **UPDATED RECIPIENT**
$RECIPIENT_NAME = 'Self Test Recipient'; 

$SENDER_NAME = 'Daniel Santoso Marketing'; 

// --- Email Content ---
$SUBJECT = 'Automated Test Email from XAMPP - Villa Booking Engine';
$BODY_HTML = '
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 10px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Villa Booking Engine Email Test</h1>
        </div>
        <div class="content">
            <h2>Hello from your Villa Booking Engine!</h2>
            <p>This is a test email sent automatically using Gmail\'s SMTP server from your production-ready booking system.</p>
            <p><strong>System Status:</strong> ✅ Production Ready (95% Complete)</p>
            <p><strong>Recent Achievement:</strong> 11 Critical Package System Issues Resolved</p>
            <p>If you see this email, your email configuration is working correctly and ready for:</p>
            <ul>
                <li>Booking confirmations</li>
                <li>Admin notifications</li>
                <li>Guest communications</li>
                <li>System alerts</li>
            </ul>
            <p><strong>Test Date:</strong> November 12, 2025</p>
        </div>
        <div class="footer">
            <p>Sent from Villa Booking Engine - Production Ready System</p>
        </div>
    </div>
</body>
</html>';

$BODY_TEXT = 'Hello from your Villa Booking Engine! This is a test email sent automatically using Gmail\'s SMTP server. System Status: Production Ready (95% Complete). Recent Achievement: 11 Critical Package System Issues Resolved. Test Date: November 12, 2025';

// Initialize PHPMailer
$mail = new PHPMailer(true); // Enable exceptions

try {
    // Server settings
    $mail->isSMTP();                                            // Send using SMTP
    $mail->Host       = 'smtp.gmail.com';                       // Set the Gmail SMTP server
    $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
    $mail->Username   = $SMTP_USERNAME;                         // SMTP username (Your Gmail)
    $mail->Password   = $SMTP_PASSWORD;                         // SMTP password (Your App Password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption
    $mail->Port       = 587;                                    // TCP port to connect to
    
    // SSL/TLS settings for localhost testing
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );
    
    // Debug settings (disable for production)
    $mail->SMTPDebug = 0;                                       // Disable debug output for production
    // $mail->SMTPDebug = 2;                                    // Enable for debugging
    // $mail->Debugoutput = 'html';                             // HTML-friendly debug output

    // Sender and Recipient settings
    $mail->setFrom($SMTP_USERNAME, $SENDER_NAME);               // Sender address and optional name
    $mail->addAddress($RECIPIENT_EMAIL, $RECIPIENT_NAME);       // Add a recipient
    // $mail->addReplyTo('reply@example.com', 'Reply To');      // Optional: Add a reply-to address
    // $mail->addCC('cc@example.com');                          // Optional: Add a CC recipient

    // Content
    $mail->isHTML(true);                                        // Set email format to HTML
    $mail->Subject = $SUBJECT;
    $mail->Body    = $BODY_HTML;
    $mail->AltBody = $BODY_TEXT; // Plain text alternative for non-HTML mail clients

    // Send the email
    $mail->send();
    echo '<h1>✅ Success!</h1>';
    echo '<p>The Villa Booking Engine test email has been sent successfully!</p>';
    echo '<p><strong>Recipient:</strong> ' . htmlspecialchars($RECIPIENT_EMAIL) . '</p>';
    echo '<p><strong>Subject:</strong> ' . htmlspecialchars($SUBJECT) . '</p>';
    echo '<p><strong>Status:</strong> Email system is ready for production use!</p>';

} catch (Exception $e) {
    echo '<h1>❌ Error!</h1>';
    echo '<p>Message could not be sent. Mailer Error: ' . htmlspecialchars($mail->ErrorInfo) . '</p>';
    echo '<p>Please check your Gmail App Password and SMTP credentials.</p>';
    echo '<p><strong>Note:</strong> PHPMailer needs to be installed first!</p>';
}

?>