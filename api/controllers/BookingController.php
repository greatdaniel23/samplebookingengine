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

    public function update($id) {
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                errorResponse('Invalid JSON input', 400);
                return;
            }

            // Check if booking exists
            $existingBooking = $this->booking->getById($id);
            if (!$existingBooking) {
                errorResponse('Booking not found', 404);
                return;
            }

            // Prepare updated booking data
            $bookingData = [
                'room_id' => $input['room_id'] ?? $existingBooking['room_id'],
                'first_name' => sanitizeInput($input['first_name'] ?? $existingBooking['first_name']),
                'last_name' => sanitizeInput($input['last_name'] ?? $existingBooking['last_name']),
                'email' => sanitizeInput($input['email'] ?? $existingBooking['email']),
                'phone' => sanitizeInput($input['phone'] ?? $existingBooking['phone']),
                'check_in' => $input['check_in'] ?? $existingBooking['check_in'],
                'check_out' => $input['check_out'] ?? $existingBooking['check_out'],
                'guests' => isset($input['guests']) ? intval($input['guests']) : $existingBooking['guests'],
                'total_price' => isset($input['total_price']) ? floatval($input['total_price']) : $existingBooking['total_price'],
                'status' => $input['status'] ?? $existingBooking['status'],
                'special_requests' => $input['special_requests'] ?? $existingBooking['special_requests']
            ];

            // Check availability if dates changed
            if ($bookingData['room_id'] !== $existingBooking['room_id'] ||
                $bookingData['check_in'] !== $existingBooking['check_in'] ||
                $bookingData['check_out'] !== $existingBooking['check_out']) {
                
                if (!$this->booking->checkAvailabilityExcept($bookingData['room_id'], $bookingData['check_in'], $bookingData['check_out'], $id)) {
                    errorResponse('Room is not available for the selected dates', 409);
                    return;
                }
            }

            $result = $this->booking->update($id, $bookingData);
            
            if ($result) {
                successResponse($bookingData, 'Booking updated successfully');
            } else {
                errorResponse('Failed to update booking', 500);
            }
        } catch (Exception $e) {
            errorResponse('Error updating booking: ' . $e->getMessage(), 500);
        }
    }

    public function delete($id) {
        try {
            // Check if booking exists
            $existingBooking = $this->booking->getById($id);
            if (!$existingBooking) {
                errorResponse('Booking not found', 404);
                return;
            }

            $result = $this->booking->delete($id);
            
            if ($result) {
                successResponse(null, 'Booking deleted successfully');
            } else {
                errorResponse('Failed to delete booking', 500);
            }
        } catch (Exception $e) {
            errorResponse('Error deleting booking: ' . $e->getMessage(), 500);
        }
    }

    public function updateStatus($id) {
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || !isset($input['status'])) {
                errorResponse('Status is required', 400);
                return;
            }

            // Check if booking exists
            $existingBooking = $this->booking->getById($id);
            if (!$existingBooking) {
                errorResponse('Booking not found', 404);
                return;
            }

            $result = $this->booking->updateStatus($id, $input['status']);
            
            if ($result) {
                successResponse(['status' => $input['status']], 'Booking status updated successfully');
            } else {
                errorResponse('Failed to update booking status', 500);
            }
        } catch (Exception $e) {
            errorResponse('Error updating booking status: ' . $e->getMessage(), 500);
        }
    }
}
?>