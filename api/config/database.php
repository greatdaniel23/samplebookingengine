<?php
/**
 * Database Configuration - Environment-Aware (Development & Production)
 */

// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/../../.env')) {
    $lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    
    public function __construct() {
        // Production Configuration for rumahdaisycantik.com hosting
        // ✅ CONFIGURED: Production database credentials updated for Hostinger
        
        // Method 1: Environment variables (if .env file exists) - DISABLED, using direct config
        // $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        // $this->db_name = $_ENV['DB_NAME'] ?? 'YOUR_ACTUAL_DB_NAME';
        // $this->username = $_ENV['DB_USERNAME'] ?? 'YOUR_ACTUAL_DB_USER';
        // $this->password = $_ENV['DB_PASSWORD'] ?? 'YOUR_ACTUAL_DB_PASSWORD';
        
        // Method 2: Direct configuration - FORCE HOSTINGER PRODUCTION DATABASE
        // Always use Hostinger database for consistency between local dev and production
        
        // Production Hostinger Configuration - ALWAYS USE THIS
        $this->host = 'localhost';             // Hostinger shared hosting
        $this->db_name = 'u289291769_booking'; // Database name from cPanel
        $this->username = 'u289291769_booking'; // Database admin username from cPanel  
        $this->password = 'Kanibal123!!!';     // Database password from cPanel
        
        // Optional: Local XAMPP fallback (commented out - use Hostinger instead)
        /*
        if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
            // XAMPP Local Development Configuration (DISABLED)
            $this->host = 'localhost';
            $this->db_name = 'booking_engine';
            $this->username = 'root';
            $this->password = '';
        }
        */
        
        // Configuration complete - ready for production deployment
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo json_encode([
                'success' => false,
                'error' => 'Connection error: ' . $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}
?>