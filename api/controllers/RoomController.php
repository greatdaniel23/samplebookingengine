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
        enableCORS();
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
}
?>