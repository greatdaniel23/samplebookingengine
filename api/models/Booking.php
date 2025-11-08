<?php
/**
 * Booking Model
 */

require_once __DIR__ . '/../config/database.php';

class Booking {
    private $conn;
    private $table = 'bookings';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($data) {
        try {
            // Generate a unique reference
            $reference = 'BK-' . time() . '-' . rand(100, 999);
            
            // Insert booking with actual database column names
            $query = "INSERT INTO " . $this->table . " 
                      (reference, room_id, check_in, check_out, guests, first_name, last_name, email, phone, total_amount, status) 
                      VALUES (:reference, :room_id, :check_in, :check_out, :guests, :first_name, :last_name, :email, :phone, :total_amount, :status)";

            $stmt = $this->conn->prepare($query);

            // Bind parameters with actual column names
            $stmt->bindParam(':reference', $reference);
            $stmt->bindParam(':room_id', $data['room_id']);
            $stmt->bindParam(':check_in', $data['check_in']);
            $stmt->bindParam(':check_out', $data['check_out']);
            $stmt->bindParam(':guests', $data['guests']);
            $stmt->bindParam(':first_name', $data['first_name']);
            $stmt->bindParam(':last_name', $data['last_name']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':phone', $data['phone']);
            $stmt->bindParam(':total_amount', $data['total_amount']);
            $stmt->bindParam(':status', $data['status']);

            if ($stmt->execute()) {
                $bookingId = $this->conn->lastInsertId();
                
                return [
                    'success' => true,
                    'data' => [
                        'id' => $bookingId,
                        'reference' => $reference
                    ]
                ];
            } else {
                throw new Exception('Failed to insert booking');
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to create booking: ' . $e->getMessage()
            ];
        }
    }
    


    public function getAll() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function checkAvailability($room_id, $check_in, $check_out) {
        $query = "SELECT COUNT(*) as booking_count FROM " . $this->table . " 
                  WHERE room_id = :room_id 
                  AND status != 'cancelled'
                  AND (
                      (check_in <= :check_in AND check_out > :check_in) OR
                      (check_in < :check_out AND check_out >= :check_out) OR
                      (check_in >= :check_in AND check_out <= :check_out)
                  )";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':room_id', $room_id);
        $stmt->bindParam(':check_in', $check_in);
        $stmt->bindParam(':check_out', $check_out);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['booking_count'] == 0;
    }
}
?>