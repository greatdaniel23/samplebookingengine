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
        
        // Method 2: Direct configuration - AUTO-DETECT ENVIRONMENT
        // Check if we're running on localhost (XAMPP) or production (Hostinger)
        $isLocalhost = $_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false;
        
        if ($isLocalhost) {
            // XAMPP Local Development Configuration
            $this->host = 'localhost';
            $this->db_name = 'booking_engine';     // Consistent with project database name
            $this->username = 'root';              // XAMPP default username
            $this->password = '';                  // XAMPP default password (empty)
        } else {
            // Production Hostinger Configuration - CORRECTED CREDENTIALS
            $this->host = 'localhost';             // Hostinger shared hosting
            $this->db_name = 'u289291769_booking'; // Database name from cPanel
            $this->username = 'u289291769_booking'; // Database admin username from cPanel  
            $this->password = 'Kanibal123!!!';     // Database password from cPanel
        }
        
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