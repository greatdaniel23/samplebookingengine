<?php
/**
 * Payment Gateway Configuration
 * 
 * IMPORTANT: Set environment variables on your server (not in this file):
 * - DOKU_ENV (sandbox|production)
 * - DOKU_CLIENT_ID
 * - DOKU_SECRET_KEY
 * - DOKU_SHARED_KEY (if your DOKU product requires it)
 * - DOKU_MERCHANT_CODE (if your DOKU product requires it)
 * - DOKU_API_BASE_URL (from official DOKU docs for your product)
 * - PUBLIC_API_BASE_URL (your hosted API domain)
 * - PUBLIC_WEB_BASE_URL (your hosted frontend domain)
 */

class PaymentConfig {
    private static $config = null;
    private static $envLoaded = false;
    
    /**
     * Load .env file if it exists
     */
    private static function loadEnv() {
        if (self::$envLoaded) {
            return;
        }
        
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                // Skip comments
                if (strpos(trim($line), '#') === 0) {
                    continue;
                }
                
                // Parse KEY=VALUE
                if (strpos($line, '=') !== false) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    
                    // Remove quotes if present
                    if (preg_match('/^["\'](.*)["\']\s*$/', $value, $matches)) {
                        $value = $matches[1];
                    }
                    
                    // Set environment variable if not already set
                    if (!getenv($key)) {
                        putenv("$key=$value");
                    }
                }
            }
        }
        
        self::$envLoaded = true;
    }
    
    /**
     * Get DOKU payment configuration
     * @return array Configuration array
     */
    public static function getDokuConfig() {
        // Load .env file
        self::loadEnv();
        
        if (self::$config === null) {
            self::$config = [
                'environment' => getenv('DOKU_ENV') ?: 'sandbox',
                'client_id' => getenv('DOKU_CLIENT_ID') ?: '',
                'secret_key' => getenv('DOKU_SECRET_KEY') ?: '',
                'shared_key' => getenv('DOKU_SHARED_KEY') ?: '',
                'merchant_code' => getenv('DOKU_MERCHANT_CODE') ?: '',
                'api_url' => getenv('DOKU_API_BASE_URL') ?: '',
                'public_api_url' => getenv('PUBLIC_API_BASE_URL') ?: '',
                'public_web_url' => getenv('PUBLIC_WEB_BASE_URL') ?: '',
            ];
        }
        
        return self::$config;
    }
    
    /**
     * Check if DOKU is properly configured
     * @return bool True if all required config is present
     */
    public static function isConfigured() {
        $config = self::getDokuConfig();
        return !empty($config['client_id']) && 
               !empty($config['secret_key']) && 
               !empty($config['api_url']) &&
               !empty($config['public_api_url']) &&
               !empty($config['public_web_url']);
    }
    
    /**
     * Get public key for signature verification
     * @return string|null Public key or null if not configured
     */
    public static function getPublicKey() {
        // If DOKU provides a public key file path via env var
        $publicKeyPath = getenv('DOKU_PUBLIC_KEY_PATH');
        if ($publicKeyPath && file_exists($publicKeyPath)) {
            return file_get_contents($publicKeyPath);
        }
        
        // Or store the public key directly in env (base64 encoded)
        $publicKeyBase64 = getenv('DOKU_PUBLIC_KEY');
        if ($publicKeyBase64) {
            return base64_decode($publicKeyBase64);
        }
        
        return null;
    }
}
