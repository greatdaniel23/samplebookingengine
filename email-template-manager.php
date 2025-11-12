<?php
/**
 * Email Template Configuration
 * Villa Booking Engine - Template Management System
 */

class EmailTemplateManager {
    
    private $templatePath;
    private $villa_name = 'Villa Daisy Cantik';
    
    public function __construct($templatePath = null) {
        $this->templatePath = $templatePath ?: __DIR__ . '/email-templates/';
    }
    
    /**
     * Load and process HTML email template
     */
    public function loadTemplate($templateName, $data = []) {
        $templateFile = $this->templatePath . $templateName . '.html';
        
        if (!file_exists($templateFile)) {
            throw new Exception("Template file not found: $templateFile");
        }
        
        $template = file_get_contents($templateFile);
        return $this->processTemplate($template, $data);
    }
    
    /**
     * Load and process text email template
     */
    public function loadTextTemplate($templateName, $data = []) {
        $templateFile = $this->templatePath . $templateName . '.txt';
        
        if (!file_exists($templateFile)) {
            throw new Exception("Text template file not found: $templateFile");
        }
        
        $template = file_get_contents($templateFile);
        return $this->processTemplate($template, $data);
    }
    
    /**
     * Process template with data substitution
     */
    private function processTemplate($template, $data) {
        // Add default villa information
        $data = array_merge([
            'villa_name' => $this->villa_name,
            'booking_timestamp' => date('Y-m-d H:i:s'),
            'current_year' => date('Y')
        ], $data);
        
        // Calculate additional fields
        if (isset($data['check_in']) && isset($data['check_out'])) {
            $checkIn = new DateTime($data['check_in']);
            $checkOut = new DateTime($data['check_out']);
            $nights = $checkIn->diff($checkOut)->days;
            $data['nights_count'] = $nights;
            
            if (isset($data['total_amount']) && $nights > 0) {
                $data['avg_per_night'] = number_format($data['total_amount'] / $nights, 2);
            }
            
            $today = new DateTime();
            $data['days_until_checkin'] = $checkIn > $today ? $today->diff($checkIn)->days : 0;
        }
        
        // Set default values for optional fields
        $data['guest_phone'] = $data['guest_phone'] ?? $data['phone'] ?? 'Not provided';
        $data['adults_count'] = $data['adults'] ?? 1;
        $data['children_count'] = $data['children'] ?? 0;
        $data['room_name'] = $data['room_name'] ?? $this->getRoomDisplayName($data['room_id'] ?? '');
        
        // Handle special requests
        if (empty($data['special_requests'])) {
            $data['special_requests'] = null;
        }
        
        // Replace template variables
        $processed = $template;
        
        // Handle simple {{variable}} replacements
        foreach ($data as $key => $value) {
            if ($value !== null) {
                $processed = str_replace('{{' . $key . '}}', htmlspecialchars($value), $processed);
            }
        }
        
        // Handle conditional blocks {{#if variable}}...{{/if}}
        $processed = $this->processConditionals($processed, $data);
        
        // Clean up any remaining template variables
        $processed = preg_replace('/\{\{[^}]+\}\}/', '', $processed);
        
        return $processed;
    }
    
    /**
     * Process conditional template blocks
     */
    private function processConditionals($template, $data) {
        // Handle {{#if variable}}content{{/if}} blocks
        $pattern = '/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/s';
        
        return preg_replace_callback($pattern, function($matches) use ($data) {
            $variable = $matches[1];
            $content = $matches[2];
            
            // Show content if variable exists and is not empty
            if (isset($data[$variable]) && !empty($data[$variable])) {
                return $content;
            }
            
            return ''; // Hide content if variable is empty or not set
        }, $template);
    }
    
    /**
     * Get display name for room ID
     */
    private function getRoomDisplayName($roomId) {
        $roomNames = [
            'deluxe-suite' => 'Deluxe Suite',
            'master-suite' => 'Master Suite',
            'family-room' => 'Family Room',
            'standard-room' => 'Standard Room',
            'economy-room' => 'Economy Room'
        ];
        
        return $roomNames[$roomId] ?? 'Villa Room';
    }
    
    /**
     * Get booking confirmation template data
     */
    public function getBookingConfirmationData($bookingData) {
        return [
            'booking_reference' => $bookingData['booking_reference'] ?? 'BK-' . rand(10000, 99999),
            'guest_name' => $bookingData['guest_name'] ?? 'Guest',
            'guest_email' => $bookingData['guest_email'] ?? '',
            'guest_phone' => $bookingData['guest_phone'] ?? $bookingData['phone'] ?? 'Not provided',
            'check_in' => $bookingData['check_in'] ?? 'TBD',
            'check_out' => $bookingData['check_out'] ?? 'TBD',
            'guests' => $bookingData['guests'] ?? 1,
            'adults' => $bookingData['adults'] ?? 1,
            'children' => $bookingData['children'] ?? 0,
            'room_id' => $bookingData['room_id'] ?? 'standard-room',
            'room_name' => $bookingData['room_name'] ?? $this->getRoomDisplayName($bookingData['room_id'] ?? ''),
            'total_amount' => $bookingData['total_amount'] ?? '0.00',
            'special_requests' => $bookingData['special_requests'] ?? null
        ];
    }
    
    /**
     * Get admin notification template data
     */
    public function getAdminNotificationData($bookingData) {
        $data = $this->getBookingConfirmationData($bookingData);
        
        // Add admin-specific fields
        $data['booking_timestamp'] = date('Y-m-d H:i:s');
        
        return $data;
    }
}
?>