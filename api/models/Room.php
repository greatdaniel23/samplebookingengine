<?php
/**
 * Room Model
 */

require_once __DIR__ . '/../config/database.php';

class Room {
    private $conn;
    private $table = 'rooms';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table . " WHERE available = 1 ORDER BY name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add image URLs to each room
        foreach ($rooms as &$room) {
            $room = $this->addImageUrls($room);
        }
        
        return $rooms;
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id AND available = 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        $room = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($room) {
            $room = $this->addImageUrls($room);
        }
        
        return $room;
    }
    
    /**
     * Add image URLs to room data
     */
    private function addImageUrls($room) {
        $roomId = $room['id'];
        $baseUrl = '/images/rooms/' . $roomId;
        
        // Add structured image URLs
        $room['image_url'] = $baseUrl . '/main.jpg';
        $room['thumbnail_url'] = $baseUrl . '/thumbnail.jpg';
        $room['gallery_images'] = [
            $baseUrl . '/gallery-1.jpg',
            $baseUrl . '/gallery-2.jpg',
            $baseUrl . '/gallery-3.jpg',
            $baseUrl . '/gallery-4.jpg'
        ];
        
        return $room;
    }

    public function getAllForAdmin() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByIdForAdmin($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (id, name, type, price, capacity, description, size, beds, features, amenities, available) 
                  VALUES (:id, :name, :type, :price, :capacity, :description, :size, :beds, :features, :amenities, :available)";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $data['id']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':capacity', $data['capacity']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':size', $data['size']);
        $stmt->bindParam(':beds', $data['beds']);
        
        $features = json_encode($data['features']);
        $amenities = json_encode($data['amenities']);
        $stmt->bindParam(':features', $features);
        $stmt->bindParam(':amenities', $amenities);
        $stmt->bindParam(':available', $data['available'], PDO::PARAM_BOOL);
        
        return $stmt->execute();
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table . " 
                  SET name = :name, type = :type, price = :price, capacity = :capacity, 
                      description = :description, size = :size, beds = :beds, 
                      features = :features, amenities = :amenities, available = :available,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':price', $data['price']);
        $stmt->bindParam(':capacity', $data['capacity']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':size', $data['size']);
        $stmt->bindParam(':beds', $data['beds']);
        
        $features = json_encode($data['features']);
        $amenities = json_encode($data['amenities']);
        $stmt->bindParam(':features', $features);
        $stmt->bindParam(':amenities', $amenities);
        $stmt->bindParam(':available', $data['available'], PDO::PARAM_BOOL);
        
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        
        return $stmt->execute();
    }

    public function hasActiveBookings($roomId) {
        $query = "SELECT COUNT(*) as count FROM bookings 
                  WHERE room_id = :room_id 
                  AND status IN ('confirmed', 'pending') 
                  AND check_out >= CURDATE()";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':room_id', $roomId);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] > 0;
    }
}
?>