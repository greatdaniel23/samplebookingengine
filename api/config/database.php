<?php
/**
 * Database Configuration
 */

class Database {
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
                'error' => 'Connection error: ' . $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}
?>