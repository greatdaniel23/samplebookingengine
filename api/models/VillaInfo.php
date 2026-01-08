<?php
class VillaInfo {
    private $conn;
    private $table = 'villa_info';

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get villa information
    public function get() {
        $query = "SELECT * FROM " . $this->table . " WHERE id = 1 LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            // Parse JSON fields
            $row['images'] = json_decode($row['images'], true);
            $row['amenities'] = json_decode($row['amenities'], true);
            return $row;
        }
        
        // Return default data if not found
        return $this->getDefaultData();
    }

    // Update villa information
    public function update($data) {
        $query = "UPDATE " . $this->table . " SET 
                    name = :name,
                    location = :location,
                    description = :description,
                    rating = :rating,
                    reviews = :reviews,
                    images = :images,
                    amenities = :amenities,
                    updated_at = NOW()
                  WHERE id = 1";

        $stmt = $this->conn->prepare($query);

        // Clean and bind data
        $name = htmlspecialchars(strip_tags($data['name']));
        $location = htmlspecialchars(strip_tags($data['location']));
        $description = htmlspecialchars(strip_tags($data['description']));
        $rating = floatval($data['rating']);
        $reviews = intval($data['reviews']);
        $images = json_encode($data['images']);
        $amenities = json_encode($data['amenities']);

        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':location', $location);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':rating', $rating);
        $stmt->bindParam(':reviews', $reviews);
        $stmt->bindParam(':images', $images);
        $stmt->bindParam(':amenities', $amenities);

        return $stmt->execute();
    }

    // Create initial record if not exists
    public function createDefault() {
        $defaultData = $this->getDefaultData();
        
        $query = "INSERT INTO " . $this->table . " 
                  (id, name, location, description, rating, reviews, images, amenities, created_at, updated_at) 
                  VALUES 
                  (1, :name, :location, :description, :rating, :reviews, :images, :amenities, NOW(), NOW())
                  ON DUPLICATE KEY UPDATE id = id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':name', $defaultData['name']);
        $stmt->bindParam(':location', $defaultData['location']);
        $stmt->bindParam(':description', $defaultData['description']);
        $stmt->bindParam(':rating', $defaultData['rating']);
        $stmt->bindParam(':reviews', $defaultData['reviews']);
        $images = json_encode($defaultData['images']);
        $amenities = json_encode($defaultData['amenities']);
        $stmt->bindParam(':images', $images);
        $stmt->bindParam(':amenities', $amenities);

        return $stmt->execute();
    }

    private function getDefaultData() {
        return [
            'id' => 1,
            'name' => 'Serene Mountain Retreat',
            'location' => 'Aspen, Colorado',
            'description' => 'Escape to this stunning mountain retreat where modern luxury meets rustic charm. Nestled in the heart of the Rockies, this villa offers breathtaking views, unparalleled comfort, and direct access to world-class ski slopes and hiking trails. Perfect for family vacations, romantic getaways, or corporate retreats.',
            'rating' => 4.9,
            'reviews' => 128,
            'images' => [
                'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1613977257363-3116958f136b?q=80&w=2670&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1593696140826-c58b02198d4a?q=80&w=2670&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop'
            ],
            'amenities' => [
                ['name' => 'High-speed Wifi', 'icon' => 'Wifi'],
                ['name' => 'Private Hot Tub', 'icon' => 'Bath'],
                ['name' => 'Indoor Fireplace', 'icon' => 'Flame'],
                ['name' => 'Fully Equipped Kitchen', 'icon' => 'CookingPot'],
                ['name' => 'Free Parking on Premises', 'icon' => 'Car'],
                ['name' => 'Central Air & Heating', 'icon' => 'AirVent']
            ]
        ];
    }
}
?>