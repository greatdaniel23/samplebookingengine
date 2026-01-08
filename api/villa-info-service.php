<?php
/**
 * Villa Information Service
 * Handles dynamic villa information from database for email templates and general use
 * Updated to match production database structure from Hostinger
 */

class VillaInfoService {
    private $conn;
    private $cache = [];
    private $cache_ttl = 3600; // 1 hour cache
    
    public function __construct() {
        try {
            require_once __DIR__ . '/config/database.php';
            $db = new Database();
            $this->conn = $db->getConnection();
        } catch (Exception $e) {
            error_log("Villa Info Service DB Error: " . $e->getMessage());
            $this->conn = null;
        }
    }
    
    /**
     * Get villa information from production database structure
     */
    public function getVillaInfo() {
        try {
            if (!$this->conn) {
                return $this->getDefaultVillaInfo();
            }
            
            $stmt = $this->conn->prepare("SELECT * FROM villa_info WHERE id = 1 LIMIT 1");
            $stmt->execute();
            $villa_data = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$villa_data) {
                return $this->getDefaultVillaInfo();
            }
            
            // Convert production data to email template format
            return [
                'villa_name' => $villa_data['name'] ?? 'Rumah Daisy Cantik',
                'villa_tagline' => 'Luxury Villa Experience',
                'contact_email' => $villa_data['email'] ?? 'rumahdaisycantikreservations@gmail.com',
                'admin_email' => $villa_data['email'] ?? 'rumahdaisycantikreservations@gmail.com',
                'reservations_email' => $villa_data['email'] ?? 'rumahdaisycantikreservations@gmail.com',
                'phone_main' => $villa_data['phone'] ?? '0822-2119-3425',
                'phone_whatsapp' => $villa_data['phone'] ?? '0822-2119-3425',
                'address_street' => $villa_data['address'] ?? 'Nyambu, Kediri, Tabanan Regency, Bali',
                'address_city' => $villa_data['city'] ?? 'Tabanan',
                'address_state' => $villa_data['state'] ?? 'Bali',
                'address_country' => $villa_data['country'] ?? 'Indonesia',
                'address_postal_code' => $villa_data['postal_code'] ?? '',
                'location_full' => $this->buildLocationString($villa_data),
                'coordinates_lat' => $villa_data['latitude'] ?? null,
                'coordinates_lng' => $villa_data['longitude'] ?? null,
                'website_url' => $villa_data['website'] ?? 'https://rumahdaisycantik.com/',
                'booking_url' => 'https://booking.rumahdaisycantik.com',
                'api_url' => 'https://api.rumahdaisycantik.com',
                'check_in_time' => $villa_data['check_in_time'] ?? '15:00',
                'check_out_time' => $villa_data['check_out_time'] ?? '11:00',
                'currency_code' => $villa_data['currency'] ?? 'USD',
                'currency_symbol' => '$',
                'timezone' => $villa_data['timezone'] ?? 'UTC',
                'language' => $villa_data['language'] ?? 'en',
                'tax_rate' => $villa_data['tax_rate'] ?? '0.00',
                'service_fee' => $villa_data['service_fee'] ?? '0.00',
                'rating' => $villa_data['rating'] ?? '4.9',
                'reviews' => $villa_data['reviews'] ?? '0',
                'description' => $villa_data['description'] ?? '',
                'amenities' => $this->parseJsonField($villa_data['amenities'] ?? null),
                'nearby_attractions' => $this->parseJsonField($villa_data['nearby_attractions'] ?? null),
                'images' => $this->parseJsonField($villa_data['images'] ?? null),
                'social_media' => $this->parseJsonField($villa_data['social_media'] ?? null),
                'email_footer_text' => 'Thank you for choosing ' . ($villa_data['name'] ?? 'Rumah Daisy Cantik') . ' for your Bali getaway.',
                'email_signature' => ($villa_data['name'] ?? 'Rumah Daisy Cantik') . ' Team',
                'booking_confirmation_note' => 'We look forward to welcoming you!',
                'admin_notification_note' => 'New booking requires attention',
            ];
            
        } catch (PDOException $e) {
            error_log("Villa Info Service Error: " . $e->getMessage());
            return $this->getDefaultVillaInfo();
        }
    }
    
    /**
     * Build location string from database fields
     */
    private function buildLocationString($villa_data) {
        $parts = [];
        
        if (!empty($villa_data['city'])) $parts[] = $villa_data['city'];
        if (!empty($villa_data['state'])) $parts[] = $villa_data['state'];
        if (!empty($villa_data['country'])) $parts[] = $villa_data['country'];
        
        return !empty($parts) ? implode(', ', $parts) : 'Tabanan, Bali, Indonesia';
    }
    
    /**
     * Parse JSON fields safely
     */
    private function parseJsonField($json_string) {
        if (empty($json_string)) return null;
        
        $decoded = json_decode($json_string, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }
    
    /**
     * Get default villa information (fallback) - Based on production data
     */
    private function getDefaultVillaInfo() {
        return [
            'villa_name' => 'Rumah Daisy Cantik',
            'villa_tagline' => 'Luxury Villa Experience in Bali',
            'contact_email' => 'rumahdaisycantikreservations@gmail.com',
            'admin_email' => 'rumahdaisycantikreservations@gmail.com',
            'reservations_email' => 'rumahdaisycantikreservations@gmail.com',
            'phone_main' => '0822-2119-3425',
            'phone_whatsapp' => '0822-2119-3425',
            'address_street' => 'Nyambu, Kediri, Tabanan Regency, Bali',
            'address_city' => 'Tabanan',
            'address_state' => 'Bali',
            'address_country' => 'Indonesia',
            'location_full' => 'Tabanan, Bali, Indonesia',
            'website_url' => 'https://rumahdaisycantik.com/',
            'booking_url' => 'https://booking.rumahdaisycantik.com',
            'api_url' => 'https://api.rumahdaisycantik.com',
            'check_in_time' => '15:00',
            'check_out_time' => '11:00',
            'currency_code' => 'USD',
            'currency_symbol' => '$',
            'timezone' => 'UTC',
            'language' => 'en',
            'tax_rate' => '0.00',
            'service_fee' => '0.00',
            'rating' => '4.9',
            'reviews' => '0',
            'email_footer_text' => 'Thank you for choosing Rumah Daisy Cantik for your Bali getaway.',
            'email_signature' => 'Rumah Daisy Cantik Team',
            'booking_confirmation_note' => 'We look forward to welcoming you!',
            'admin_notification_note' => 'New booking requires attention',
        ];
    }
    
    /**
     * Get specific villa information by key
     */
    public function getVillaInfoValue($key, $default = null) {
        $villa_info = $this->getVillaInfo();
        return $villa_info[$key] ?? $default;
    }
    
    /**
     * Get contact information for email templates
     */
    public function getContactInfo() {
        $villa_info = $this->getVillaInfo();
        
        return [
            'villa_name' => $villa_info['villa_name'],
            'contact_email' => $villa_info['contact_email'],
            'admin_email' => $villa_info['admin_email'],
            'phone_main' => $villa_info['phone_main'],
            'phone_whatsapp' => $villa_info['phone_whatsapp'],
            'location_full' => $villa_info['location_full'],
            'website_url' => $villa_info['website_url'],
            'booking_url' => $villa_info['booking_url'],
        ];
    }
    
    /**
     * Get email template specific information
     */
    public function getEmailTemplateInfo() {
        $villa_info = $this->getVillaInfo();
        
        return [
            'villa_name' => $villa_info['villa_name'],
            'villa_tagline' => $villa_info['villa_tagline'],
            'contact_email' => $villa_info['contact_email'],
            'admin_email' => $villa_info['admin_email'],
            'phone_main' => $villa_info['phone_main'],
            'location_full' => $villa_info['location_full'],
            'website_url' => $villa_info['website_url'],
            'email_footer_text' => $villa_info['email_footer_text'],
            'email_signature' => $villa_info['email_signature'],
            'booking_confirmation_note' => $villa_info['booking_confirmation_note'],
            'admin_notification_note' => $villa_info['admin_notification_note'],
        ];
    }
    
    /**
     * Get business information
     */
    public function getBusinessInfo() {
        $villa_info = $this->getVillaInfo();
        
        return [
            'check_in_time' => $villa_info['check_in_time'],
            'check_out_time' => $villa_info['check_out_time'],
            'currency_code' => $villa_info['currency_code'],
            'currency_symbol' => $villa_info['currency_symbol'],
            'timezone' => $villa_info['timezone'],
            'language' => $villa_info['language'],
            'tax_rate' => $villa_info['tax_rate'],
            'service_fee' => $villa_info['service_fee'],
        ];
    }
    
    /**
     * Test database connection
     */
    public function testConnection() {
        try {
            if (!$this->conn) {
                return [
                    'success' => false,
                    'error' => 'No database connection available'
                ];
            }
            
            $stmt = $this->conn->prepare("SELECT COUNT(*) as count FROM villa_info");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'message' => 'Database connection successful',
                'villa_records' => $result['count'] ?? 0
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Update villa information (for admin use)
     */
    public function updateVillaInfo($key, $value) {
        try {
            if (!$this->conn) {
                return ['success' => false, 'error' => 'No database connection'];
            }
            
            // Map template keys to database columns
            $column_mapping = [
                'villa_name' => 'name',
                'contact_email' => 'email',
                'phone_main' => 'phone',
                'website_url' => 'website',
                'address_street' => 'address',
                'address_city' => 'city',
                'address_state' => 'state',
                'address_country' => 'country',
                'check_in_time' => 'check_in_time',
                'check_out_time' => 'check_out_time',
                'currency_code' => 'currency',
            ];
            
            if (!isset($column_mapping[$key])) {
                return ['success' => false, 'error' => 'Invalid field key'];
            }
            
            $column = $column_mapping[$key];
            
            $stmt = $this->conn->prepare("UPDATE villa_info SET {$column} = ?, updated_at = NOW() WHERE id = 1");
            $result = $stmt->execute([$value]);
            
            if ($result) {
                // Clear cache
                $this->cache = [];
                
                return ['success' => true, 'message' => "Updated {$key} successfully"];
            } else {
                return ['success' => false, 'error' => 'Failed to update database'];
            }
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}

?>