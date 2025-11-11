<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGet($db);
            break;
        case 'POST':
            handlePost($db);
            break;
        case 'PUT':
            handlePut($db);
            break;
        case 'DELETE':
            handleDelete($db);
            break;
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}

function handleGet($db) {
    try {
        if (isset($_GET['id'])) {
            // Get specific booking
            $stmt = $db->prepare("
                SELECT b.*, r.name as room_name, r.type as room_type 
                FROM bookings b 
                LEFT JOIN rooms r ON b.room_id = r.id 
                WHERE b.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($booking) {
                echo json_encode(['success' => true, 'data' => $booking]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Booking not found']);
            }
        } else {
            // Get all bookings with room information
            $stmt = $db->query("
                SELECT b.*, r.name as room_name, r.type as room_type, r.price as room_price
                FROM bookings b 
                LEFT JOIN rooms r ON b.room_id = r.id 
                ORDER BY b.created_at DESC
            ");
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $bookings]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handlePost($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $requiredFields = ['room_id', 'first_name', 'email', 'check_in', 'check_out', 'guests', 'total_price'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field]) || $input[$field] === '') {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
                return;
            }
        }
        
        // Validate room_id exists in rooms table
        $validRoomIds = ['deluxe-suite', 'economy-room', 'family-room', 'master-suite', 'standard-room'];
        if (!in_array($input['room_id'], $validRoomIds)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => "Invalid room_id: {$input['room_id']}. Must be one of: " . implode(', ', $validRoomIds)]);
            return;
        }
        
        // Validate total_price is positive
        $totalPrice = floatval($input['total_price']);
        if ($totalPrice <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'total_price must be a positive number']);
            return;
        }
        
        // Validate package_id if provided
        if (isset($input['package_id']) && $input['package_id'] !== null) {
            $packageId = intval($input['package_id']);
            if ($packageId < 1 || $packageId > 5) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => "Invalid package_id: {$packageId}. Must be between 1 and 5"]);
                return;
            }
        }
        
        // Generate unique booking reference
        $bookingReference = 'BK-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        // Check if reference already exists and regenerate if needed
        $checkStmt = $db->prepare("SELECT COUNT(*) FROM bookings WHERE booking_reference = ?");
        $checkStmt->execute([$bookingReference]);
        while ($checkStmt->fetchColumn() > 0) {
            $bookingReference = 'BK-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $checkStmt->execute([$bookingReference]);
        }

        $stmt = $db->prepare("
            INSERT INTO bookings (booking_reference, room_id, package_id, first_name, last_name, email, phone, 
                                check_in, check_out, guests, adults, children, total_price, 
                                special_requests, status, payment_status, source) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $adults = $input['adults'] ?? $input['guests'] ?? 1;
        $children = $input['children'] ?? 0;
        $totalGuests = $adults + $children;
        
        $stmt->execute([
            $bookingReference,
            $input['room_id'],
            $input['package_id'] ?? null,
            $input['first_name'],
            $input['last_name'] ?? '',
            $input['email'],
            $input['phone'] ?? '',
            $input['check_in'],
            $input['check_out'],
            $totalGuests,
            $adults,
            $children,
            $input['total_price'] ?? 0,
            $input['special_requests'] ?? '',
            $input['status'] ?? 'confirmed',
            $input['payment_status'] ?? 'pending',
            $input['source'] ?? 'direct'
        ]);
        
        $bookingId = $db->lastInsertId();
        echo json_encode([
            'success' => true, 
            'data' => [
                'id' => $bookingId,
                'booking_reference' => $bookingReference,
                'reference' => $bookingReference
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handlePut($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Booking ID is required']);
            return;
        }
        
        $stmt = $db->prepare("
            UPDATE bookings SET 
                room_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, 
                check_in = ?, check_out = ?, guests = ?, adults = ?, children = ?, 
                total_price = ?, special_requests = ?, status = ?, payment_status = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        $adults = $input['adults'] ?? $input['guests'] ?? 1;
        $children = $input['children'] ?? 0;
        $totalGuests = $adults + $children;
        
        $stmt->execute([
            $input['room_id'],
            $input['first_name'],
            $input['last_name'] ?? '',
            $input['email'],
            $input['phone'] ?? '',
            $input['check_in'],
            $input['check_out'],
            $totalGuests,
            $adults,
            $children,
            $input['total_price'] ?? 0,
            $input['special_requests'] ?? '',
            $input['status'] ?? 'confirmed',
            $input['payment_status'] ?? 'pending',
            $input['id']
        ]);
        
        echo json_encode(['success' => true, 'data' => ['updated' => true]]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handleDelete($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Booking ID is required']);
            return;
        }
        
        $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
        $stmt->execute([$input['id']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'data' => ['deleted' => true]]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Booking not found']);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>