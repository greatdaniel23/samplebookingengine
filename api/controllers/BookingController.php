<?php
/**
 * Booking Controller - API endpoints for booking operations
 */

require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../models/Booking.php';

class BookingController {
    private $booking;

    public function __construct() {
        $this->booking = new Booking();
        enableCORS();
    }

    public function create() {
        // Get POST data
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required = ['roomId', 'from', 'to', 'guests', 'user', 'total'];
        validateRequired($input, $required);

        // Validate user data
        if (!isset($input['user']['firstName']) || !isset($input['user']['lastName']) || !isset($input['user']['email'])) {
            errorResponse('Missing required user information');
        }

        // Check availability
        if (!$this->booking->checkAvailability($input['roomId'], $input['from'], $input['to'])) {
            errorResponse('Room is not available for the selected dates', 409);
        }

        // Prepare booking data
        $bookingData = [
            'room_id' => sanitizeInput($input['roomId']),
            'first_name' => sanitizeInput($input['user']['firstName']),
            'last_name' => sanitizeInput($input['user']['lastName']),
            'email' => sanitizeInput($input['user']['email']),
            'phone' => sanitizeInput($input['user']['phone'] ?? ''),
            'check_in' => $input['from'],
            'check_out' => $input['to'],
            'guests' => intval($input['guests']),
            'total_amount' => floatval($input['total']),
            'status' => 'confirmed'
        ];

        // Create booking
        $result = $this->booking->create($bookingData);

        if ($result['success']) {
            successResponse($result, 'Booking created successfully');
        } else {
            errorResponse($result['error'], 500);
        }
    }

    public function getAll() {
        $bookings = $this->booking->getAll();
        successResponse($bookings, 'Bookings retrieved successfully');
    }

    public function getById($id) {
        $booking = $this->booking->getById($id);
        
        if ($booking) {
            successResponse($booking, 'Booking retrieved successfully');
        } else {
            errorResponse('Booking not found', 404);
        }
    }

    public function checkAvailability() {
        $room_id = $_GET['room_id'] ?? '';
        $check_in = $_GET['check_in'] ?? '';
        $check_out = $_GET['check_out'] ?? '';

        if (empty($room_id) || empty($check_in) || empty($check_out)) {
            errorResponse('Missing required parameters: room_id, check_in, check_out');
        }

        $available = $this->booking->checkAvailability($room_id, $check_in, $check_out);
        
        successResponse([
            'available' => $available,
            'room_id' => $room_id,
            'check_in' => $check_in,
            'check_out' => $check_out
        ], 'Availability checked successfully');
    }
}
?>