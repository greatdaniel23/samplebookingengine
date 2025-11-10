<?php
/**
 * Database Configuration - Production Ready for Hostinger
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'u289291769_booking';
    private $username = 'u289291769_booking';
    private $password = 'Kanibal123!!!';
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