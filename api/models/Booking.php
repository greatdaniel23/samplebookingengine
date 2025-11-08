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
            // Start transaction
            $this->conn->beginTransaction();
            
            // 1. Create or find guest record
            $guestId = $this->createOrFindGuest($data);
            
            // 2. Get room ID from room identifier (string to int mapping)
            $roomId = $this->getRoomIdFromIdentifier($data['room_id']);
            
            if (!$roomId) {
                throw new Exception('Invalid room identifier: ' . $data['room_id']);
            }
            
            // 3. Insert booking with correct column names
            $query = "INSERT INTO " . $this->table . " 
                      (guest_id, room_id, check_in_date, check_out_date, total_price, status, created_at) 
                      VALUES (:guest_id, :room_id, :check_in_date, :check_out_date, :total_price, :status, NOW())";

            $stmt = $this->conn->prepare($query);

            // Bind parameters with correct names
            $stmt->bindParam(':guest_id', $guestId);
            $stmt->bindParam(':room_id', $roomId);
            $stmt->bindParam(':check_in_date', $data['check_in']);
            $stmt->bindParam(':check_out_date', $data['check_out']);
            $stmt->bindParam(':total_price', $data['total_amount']);
            $stmt->bindParam(':status', $data['status']);

            if ($stmt->execute()) {
                $bookingId = $this->conn->lastInsertId();
                
                // Commit transaction
                $this->conn->commit();
                
                return [
                    'success' => true,
                    'booking' => [
                        'id' => $bookingId,
                        'reference' => 'BK-' . str_pad($bookingId, 6, '0', STR_PAD_LEFT)
                    ]
                ];
            } else {
                throw new Exception('Failed to insert booking');
            }
            
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->conn->rollback();
            
            return [
                'success' => false,
                'error' => 'Failed to create booking: ' . $e->getMessage()
            ];
        }
    }
    
    private function createOrFindGuest($data) {
        // Check if guest exists by email
        $query = "SELECT id FROM guests WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $data['email']);
        $stmt->execute();
        
        $existingGuest = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($existingGuest) {
            // Update guest info if needed
            $updateQuery = "UPDATE guests SET name = :name, phone = :phone WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $fullName = trim($data['first_name'] . ' ' . $data['last_name']);
            $updateStmt->bindParam(':name', $fullName);
            $updateStmt->bindParam(':phone', $data['phone']);
            $updateStmt->bindParam(':id', $existingGuest['id']);
            $updateStmt->execute();
            
            return $existingGuest['id'];
        }
        
        // Create new guest
        $insertQuery = "INSERT INTO guests (name, email, phone, created_at) VALUES (:name, :email, :phone, NOW())";
        $insertStmt = $this->conn->prepare($insertQuery);
        $fullName = trim($data['first_name'] . ' ' . $data['last_name']);
        $insertStmt->bindParam(':name', $fullName);
        $insertStmt->bindParam(':email', $data['email']);
        $insertStmt->bindParam(':phone', $data['phone']);
        
        if ($insertStmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        throw new Exception('Failed to create guest record');
    }
    
    private function getRoomIdFromIdentifier($roomIdentifier) {
        // Map string room identifiers to actual database IDs
        $roomMap = [
            'master-suite' => 1,          // Deluxe Suite
            'deluxe-room' => 1,           // Deluxe Suite  
            'standard-room' => 2,         // Standard Room
            'executive-suite' => 3,       // Executive Suite
            'ocean-view-suite' => 4,      // Ocean View Suite
            'beach-bungalow' => 5,        // Beach Bungalow
            'business-room' => 6,         // Business Room
            'economy-room' => 7,          // Economy Room
            'mountain-view-suite' => 8    // Mountain View Suite
        ];
        
        if (isset($roomMap[$roomIdentifier])) {
            return $roomMap[$roomIdentifier];
        }
        
        // Try to find room by room_type if direct mapping fails
        $query = "SELECT id FROM rooms WHERE room_type LIKE :room_type";
        $stmt = $this->conn->prepare($query);
        $searchTerm = '%' . str_replace(['-', '_'], ' ', $roomIdentifier) . '%';
        $stmt->bindParam(':room_type', $searchTerm);
        $stmt->execute();
        
        $room = $stmt->fetch(PDO::FETCH_ASSOC);
        return $room ? $room['id'] : null;
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
                      (check_in_date <= :check_in AND check_out_date > :check_in) OR
                      (check_in_date < :check_out AND check_out_date >= :check_out) OR
                      (check_in_date >= :check_in AND check_out_date <= :check_out)
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