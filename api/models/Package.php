<?php
/**
 * Package Model
 * Handles package operations and pricing calculations
 */

require_once __DIR__ . '/../config/database.php';

class Package {
    private $conn;
    private $table = 'packages';
    private $packageRoomsTable = 'package_rooms';
    private $packageBookingsTable = 'package_bookings';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Get all active packages
     */
    public function getAll($filters = []) {
        $whereConditions = ['p.is_active = 1'];
        $params = [];

        // Add date filter
        if (!empty($filters['check_in']) && !empty($filters['check_out'])) {
            $whereConditions[] = 'p.valid_from <= :check_in AND p.valid_until >= :check_out';
            $params[':check_in'] = $filters['check_in'];
            $params[':check_out'] = $filters['check_out'];
        }

        // Add package type filter
        if (!empty($filters['type'])) {
            $whereConditions[] = 'p.package_type = :type';
            $params[':type'] = $filters['type'];
        }

        // Add guest count filter
        if (!empty($filters['guests'])) {
            $whereConditions[] = 'p.max_guests >= :guests';
            $params[':guests'] = $filters['guests'];
        }

        $whereClause = implode(' AND ', $whereConditions);

        $query = "
            SELECT 
                p.*,
                GROUP_CONCAT(
                    CONCAT(r.name, ':', pr.price_override, ':', pr.room_priority)
                    ORDER BY pr.room_priority
                ) as available_rooms
            FROM " . $this->table . " p
            LEFT JOIN " . $this->packageRoomsTable . " pr ON p.id = pr.package_id
            LEFT JOIN rooms r ON pr.room_id = r.id AND r.available = 1
            WHERE " . $whereClause . "
            GROUP BY p.id
            ORDER BY p.base_price DESC
        ";

        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Process packages to add calculated fields
        foreach ($packages as &$package) {
            $package = $this->processPackageData($package);
        }

        return $packages;
    }

    /**
     * Get package by ID
     */
    public function getById($id) {
        $query = "
            SELECT 
                p.*,
                GROUP_CONCAT(
                    CONCAT(r.id, ':', r.name, ':', pr.price_override, ':', pr.room_priority)
                    ORDER BY pr.room_priority
                ) as available_rooms
            FROM " . $this->table . " p
            LEFT JOIN " . $this->packageRoomsTable . " pr ON p.id = pr.package_id
            LEFT JOIN rooms r ON pr.room_id = r.id AND r.available = 1
            WHERE p.id = :id AND p.is_active = 1
            GROUP BY p.id
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $package = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($package) {
            $package = $this->processPackageData($package);
        }

        return $package;
    }

    /**
     * Get packages available for a specific room
     */
    public function getByRoomId($roomId, $checkIn = null, $checkOut = null) {
        $query = "
            SELECT 
                p.*,
                pr.price_override,
                pr.room_priority
            FROM " . $this->table . " p
            INNER JOIN " . $this->packageRoomsTable . " pr ON p.id = pr.package_id
            WHERE pr.room_id = :room_id 
            AND p.is_active = 1
        ";

        $params = [':room_id' => $roomId];

        if ($checkIn && $checkOut) {
            $query .= " AND p.valid_from <= :check_in AND p.valid_until >= :check_out";
            $params[':check_in'] = $checkIn;
            $params[':check_out'] = $checkOut;
        }

        $query .= " ORDER BY pr.room_priority, p.base_price DESC";

        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($packages as &$package) {
            $package = $this->processPackageData($package);
        }

        return $packages;
    }

    /**
     * Calculate package pricing
     */
    public function calculatePackagePrice($packageId, $roomId, $nights, $guests = 2) {
        // Get package details
        $package = $this->getById($packageId);
        if (!$package) {
            return false;
        }

        // Get room price override or base room price
        $query = "
            SELECT 
                pr.price_override,
                r.price as base_room_price
            FROM " . $this->packageRoomsTable . " pr
            INNER JOIN rooms r ON pr.room_id = r.id
            WHERE pr.package_id = :package_id AND pr.room_id = :room_id
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':package_id', $packageId);
        $stmt->bindParam(':room_id', $roomId);
        $stmt->execute();

        $roomData = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$roomData) {
            return false;
        }

        // Use override price if available, otherwise base room price
        $roomPrice = $roomData['price_override'] ?? $roomData['base_room_price'];
        
        // Calculate total
        $roomTotal = $roomPrice * $nights;
        $packageFee = $package['base_price'];
        $subtotal = $roomTotal + $packageFee;
        
        // Apply discount
        $discount = $subtotal * ($package['discount_percentage'] / 100);
        $finalPrice = $subtotal - $discount;

        return [
            'room_price_per_night' => $roomPrice,
            'room_total' => $roomTotal,
            'package_fee' => $packageFee,
            'subtotal' => $subtotal,
            'discount_percentage' => $package['discount_percentage'],
            'discount_amount' => $discount,
            'final_price' => $finalPrice,
            'savings' => $discount,
            'nights' => $nights
        ];
    }

    /**
     * Create package booking
     */
    public function createPackageBooking($bookingId, $packageId, $pricingData) {
        $query = "
            INSERT INTO " . $this->packageBookingsTable . " 
            (booking_id, package_id, original_price, package_discount, final_price, package_extras)
            VALUES (:booking_id, :package_id, :original_price, :package_discount, :final_price, :extras)
        ";

        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([
            ':booking_id' => $bookingId,
            ':package_id' => $packageId,
            ':original_price' => $pricingData['subtotal'],
            ':package_discount' => $pricingData['discount_amount'],
            ':final_price' => $pricingData['final_price'],
            ':extras' => json_encode($pricingData['extras'] ?? [])
        ]);
    }

    /**
     * Process package data to add calculated fields
     */
    private function processPackageData($package) {
        // Parse includes JSON
        if (!empty($package['includes'])) {
            $package['includes'] = json_decode($package['includes'], true);
        } else {
            $package['includes'] = [];
        }

        // Process available rooms
        if (!empty($package['available_rooms'])) {
            $rooms = explode(',', $package['available_rooms']);
            $package['room_options'] = [];
            
            foreach ($rooms as $room) {
                $parts = explode(':', $room);
                if (count($parts) >= 3) {
                    $package['room_options'][] = [
                        'name' => $parts[0],
                        'price_override' => $parts[1] !== 'NULL' ? floatval($parts[1]) : null,
                        'priority' => intval($parts[2])
                    ];
                }
            }
        } else {
            $package['room_options'] = [];
        }

        // Add image URL
        if (empty($package['image_url'])) {
            $package['image_url'] = '/images/packages/' . $package['id'] . '.jpg';
        }

        // Calculate discount amount for display
        $package['discount_display'] = $package['discount_percentage'] . '% OFF';

        // Format validity dates
        $package['validity_period'] = date('M j, Y', strtotime($package['valid_from'])) . 
                                    ' - ' . 
                                    date('M j, Y', strtotime($package['valid_until']));

        return $package;
    }

    /**
     * Check if package is valid for given dates
     */
    public function isValidForDates($packageId, $checkIn, $checkOut) {
        $query = "
            SELECT 1 FROM " . $this->table . "
            WHERE id = :package_id 
            AND is_active = 1
            AND valid_from <= :check_in 
            AND valid_until >= :check_out
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':package_id', $packageId);
        $stmt->bindParam(':check_in', $checkIn);
        $stmt->bindParam(':check_out', $checkOut);
        $stmt->execute();

        return $stmt->fetch() !== false;
    }

    /**
     * Get package types for filtering
     */
    public function getPackageTypes() {
        $query = "
            SELECT DISTINCT package_type, COUNT(*) as count
            FROM " . $this->table . "
            WHERE is_active = 1
            GROUP BY package_type
            ORDER BY package_type
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create new package
     */
    public function create($data) {
        $query = "
            INSERT INTO " . $this->table . "
            (id, name, description, package_type, base_price, discount_percentage, 
             min_nights, max_nights, valid_from, valid_until, is_active, max_guests, includes, terms)
            VALUES (:id, :name, :description, :package_type, :base_price, :discount_percentage,
                    :min_nights, :max_nights, :valid_from, :valid_until, :is_active, :max_guests, :includes, :terms)
        ";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':id' => $data['id'],
            ':name' => $data['name'],
            ':description' => $data['description'] ?? '',
            ':package_type' => $data['package_type'],
            ':base_price' => floatval($data['base_price']),
            ':discount_percentage' => floatval($data['discount_percentage'] ?? 0),
            ':min_nights' => intval($data['min_nights'] ?? 1),
            ':max_nights' => intval($data['max_nights'] ?? 7),
            ':valid_from' => $data['valid_from'],
            ':valid_until' => $data['valid_until'],
            ':is_active' => isset($data['is_active']) ? (bool)$data['is_active'] : true,
            ':max_guests' => intval($data['max_guests'] ?? 2),
            ':includes' => json_encode($data['includes'] ?? []),
            ':terms' => $data['terms'] ?? ''
        ]);
    }

    /**
     * Update existing package
     */
    public function update($id, $data) {
        $query = "
            UPDATE " . $this->table . "
            SET name = :name, description = :description, package_type = :package_type,
                base_price = :base_price, discount_percentage = :discount_percentage,
                min_nights = :min_nights, max_nights = :max_nights,
                valid_from = :valid_from, valid_until = :valid_until,
                is_active = :is_active, max_guests = :max_guests,
                includes = :includes, terms = :terms,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':description' => $data['description'] ?? '',
            ':package_type' => $data['package_type'],
            ':base_price' => floatval($data['base_price']),
            ':discount_percentage' => floatval($data['discount_percentage'] ?? 0),
            ':min_nights' => intval($data['min_nights'] ?? 1),
            ':max_nights' => intval($data['max_nights'] ?? 7),
            ':valid_from' => $data['valid_from'],
            ':valid_until' => $data['valid_until'],
            ':is_active' => isset($data['is_active']) ? (bool)$data['is_active'] : true,
            ':max_guests' => intval($data['max_guests'] ?? 2),
            ':includes' => json_encode($data['includes'] ?? []),
            ':terms' => $data['terms'] ?? ''
        ]);
    }

    /**
     * Delete package
     */
    public function delete($id) {
        // First delete related package_rooms entries
        $deleteRoomsQuery = "DELETE FROM " . $this->packageRoomsTable . " WHERE package_id = :id";
        $stmt = $this->conn->prepare($deleteRoomsQuery);
        $stmt->execute([':id' => $id]);

        // Then delete the package
        $deletePackageQuery = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($deletePackageQuery);
        
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Get all packages for admin (including inactive)
     */
    public function getAllForAdmin($filters = []) {
        $whereConditions = [];
        $params = [];

        // Add package type filter
        if (!empty($filters['type'])) {
            $whereConditions[] = 'p.package_type = :type';
            $params[':type'] = $filters['type'];
        }

        $whereClause = empty($whereConditions) ? '' : 'WHERE ' . implode(' AND ', $whereConditions);

        $query = "
            SELECT 
                p.*,
                COUNT(pr.room_id) as room_count
            FROM " . $this->table . " p
            LEFT JOIN " . $this->packageRoomsTable . " pr ON p.id = pr.package_id
            $whereClause
            GROUP BY p.id
            ORDER BY p.created_at DESC
        ";

        $stmt = $this->conn->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($packages as &$package) {
            $package = $this->processPackageData($package);
        }

        return $packages;
    }
}
?>