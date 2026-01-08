<?php
/**
 * Local Development Database Configuration
 * This file overrides the production config for local XAMPP development
 */

class LocalDatabase {
    private $host = 'localhost';
    private $db_name = 'booking_engine';
    private $username = 'root';
    private $password = '';
    private $conn;

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
                'error' => 'Local Connection error: ' . $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}

// Override the Database class for local development
class Database extends LocalDatabase {
    // Inherits all functionality from LocalDatabase
}
?>