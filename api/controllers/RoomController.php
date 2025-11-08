<?php
/**
 * Room Controller - API endpoints for room operations
 */

require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../models/Room.php';

class RoomController {
    private $room;

    public function __construct() {
        $this->room = new Room();
    }

    public function getAll() {
        $rooms = $this->room->getAll();
        successResponse($rooms, 'Rooms retrieved successfully');
    }

    public function getById($id) {
        $room = $this->room->getById($id);
        
        if ($room) {
            successResponse($room, 'Room retrieved successfully');
        } else {
            errorResponse('Room not found', 404);
        }
    }

    public function create($data) {
        try {
            // Validate required fields
            $required = ['id', 'name', 'type', 'price', 'capacity'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    errorResponse("Field '$field' is required", 400);
                    return;
                }
            }

            // Prepare room data
            $roomData = [
                'id' => $data['id'],
                'name' => $data['name'],
                'type' => $data['type'],
                'price' => floatval($data['price']),
                'capacity' => intval($data['capacity']),
                'description' => $data['description'] ?? '',
                'size' => $data['size'] ?? '',
                'beds' => $data['beds'] ?? '',
                'features' => isset($data['features']) ? (is_array($data['features']) ? $data['features'] : []) : [],
                'amenities' => isset($data['amenities']) ? (is_array($data['amenities']) ? $data['amenities'] : []) : [],
                'available' => isset($data['available']) ? (bool)$data['available'] : true
            ];

            $result = $this->room->create($roomData);
            
            if ($result) {
                successResponse($roomData, 'Room created successfully', 201);
            } else {
                errorResponse('Failed to create room', 500);
            }
        } catch (Exception $e) {
            errorResponse('Error creating room: ' . $e->getMessage(), 500);
        }
    }

    public function update($id, $data) {
        try {
            // Check if room exists
            $existingRoom = $this->room->getById($id);
            if (!$existingRoom) {
                errorResponse('Room not found', 404);
                return;
            }

            // Prepare updated room data
            $roomData = [
                'id' => $id,
                'name' => $data['name'] ?? $existingRoom['name'],
                'type' => $data['type'] ?? $existingRoom['type'],
                'price' => isset($data['price']) ? floatval($data['price']) : $existingRoom['price'],
                'capacity' => isset($data['capacity']) ? intval($data['capacity']) : $existingRoom['capacity'],
                'description' => $data['description'] ?? $existingRoom['description'],
                'size' => $data['size'] ?? $existingRoom['size'],
                'beds' => $data['beds'] ?? $existingRoom['beds'],
                'features' => isset($data['features']) ? (is_array($data['features']) ? $data['features'] : json_decode($existingRoom['features'], true)) : json_decode($existingRoom['features'], true),
                'amenities' => isset($data['amenities']) ? (is_array($data['amenities']) ? $data['amenities'] : json_decode($existingRoom['amenities'], true)) : json_decode($existingRoom['amenities'], true),
                'available' => isset($data['available']) ? (bool)$data['available'] : (bool)$existingRoom['available']
            ];

            $result = $this->room->update($id, $roomData);
            
            if ($result) {
                successResponse($roomData, 'Room updated successfully');
            } else {
                errorResponse('Failed to update room', 500);
            }
        } catch (Exception $e) {
            errorResponse('Error updating room: ' . $e->getMessage(), 500);
        }
    }

    public function delete($id) {
        try {
            // Check if room exists
            $existingRoom = $this->room->getById($id);
            if (!$existingRoom) {
                errorResponse('Room not found', 404);
                return;
            }

            // Check if room has active bookings
            if ($this->room->hasActiveBookings($id)) {
                errorResponse('Cannot delete room with active bookings', 400);
                return;
            }

            $result = $this->room->delete($id);
            
            if ($result) {
                successResponse(null, 'Room deleted successfully');
            } else {
                errorResponse('Failed to delete room', 500);
            }
        } catch (Exception $e) {
            errorResponse('Error deleting room: ' . $e->getMessage(), 500);
        }
    }
}
?>