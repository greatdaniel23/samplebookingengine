<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

class iCalGenerator {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Generate iCal calendar for all bookings
     */
    public function generateCalendar($options = []) {
        try {
            // Get bookings from database
            $bookings = $this->getBookings($options);
            
            // Generate iCal content
            $ical = $this->buildiCal($bookings);
            
            return [
                'success' => true,
                'ical' => $ical,
                'count' => count($bookings)
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Get bookings from database with optional filters
     */
    private function getBookings($options = []) {
        $sql = "
            SELECT 
                b.*,
                r.name as room_name,
                r.type as room_type,
                p.name as package_name,
                v.name as villa_name,
                v.location as villa_location,
                v.phone as villa_phone,
                v.email as villa_email
            FROM bookings b
            LEFT JOIN rooms r ON b.room_id = r.id
            LEFT JOIN packages p ON b.room_id = p.id
            LEFT JOIN villa_info v ON v.id = 1
            WHERE 1=1
        ";
        
        $params = [];
        
        // Add filters
        if (isset($options['status']) && $options['status'] !== 'all') {
            $sql .= " AND b.status = :status";
            $params['status'] = $options['status'];
        }
        
        if (isset($options['from_date'])) {
            $sql .= " AND b.check_in >= :from_date";
            $params['from_date'] = $options['from_date'];
        }
        
        if (isset($options['to_date'])) {
            $sql .= " AND b.check_out <= :to_date";
            $params['to_date'] = $options['to_date'];
        }
        
        $sql .= " ORDER BY b.check_in ASC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Build iCal format from bookings data
     */
    private function buildiCal($bookings) {
        $ical = [];
        
        // iCal Header
        $ical[] = 'BEGIN:VCALENDAR';
        $ical[] = 'VERSION:2.0';
        $ical[] = 'PRODID:-//Villa Booking System//Booking Calendar//EN';
        $ical[] = 'CALSCALE:GREGORIAN';
        $ical[] = 'METHOD:PUBLISH';
        $ical[] = 'X-WR-CALNAME:Villa Bookings';
        $ical[] = 'X-WR-CALDESC:Villa booking reservations and availability';
        $ical[] = 'X-WR-TIMEZONE:UTC';
        
        // Add timezone information
        $ical[] = 'BEGIN:VTIMEZONE';
        $ical[] = 'TZID:UTC';
        $ical[] = 'BEGIN:STANDARD';
        $ical[] = 'DTSTART:19700101T000000Z';
        $ical[] = 'TZOFFSETFROM:+0000';
        $ical[] = 'TZOFFSETTO:+0000';
        $ical[] = 'TZNAME:UTC';
        $ical[] = 'END:STANDARD';
        $ical[] = 'END:VTIMEZONE';
        
        // Add events for each booking
        foreach ($bookings as $booking) {
            $ical = array_merge($ical, $this->createEvent($booking));
        }
        
        // iCal Footer
        $ical[] = 'END:VCALENDAR';
        
        return implode("\r\n", $ical);
    }
    
    /**
     * Create iCal event from booking data
     */
    private function createEvent($booking) {
        $event = [];
        
        // Generate unique UID for the event
        $uid = 'booking-' . $booking['id'] . '@villa-booking-system.com';
        
        // Format dates for iCal (YYYYMMDD format)
        $checkIn = $this->formatDateForICal($booking['check_in']);
        $checkOut = $this->formatDateForICal($booking['check_out']);
        $created = $this->formatDateTimeForICal($booking['created_at'] ?? date('Y-m-d H:i:s'));
        
        // Determine event title and description
        $roomName = $booking['room_name'] ?: $booking['package_name'] ?: 'Villa Booking';
        $title = "BLOCKED - {$roomName}";
        
        $description = $this->buildEventDescription($booking);
        $summary = $this->escapeString($title);
        
        // Build event
        $event[] = 'BEGIN:VEVENT';
        $event[] = "UID:{$uid}";
        $event[] = "DTSTART;VALUE=DATE:{$checkIn}";
        $event[] = "DTEND;VALUE=DATE:{$checkOut}";
        $event[] = "DTSTAMP:{$created}";
        $event[] = "CREATED:{$created}";
        $event[] = "LAST-MODIFIED:{$created}";
        $event[] = "SUMMARY:{$summary}";
        $event[] = "DESCRIPTION:{$description}";
        $event[] = "STATUS:" . $this->mapBookingStatus($booking['status']);
        $event[] = "TRANSP:OPAQUE"; // Show as busy
        $event[] = "CATEGORIES:BOOKING,ACCOMMODATION";
        
        // Add location if available
        if (!empty($booking['villa_location'])) {
            $event[] = "LOCATION:" . $this->escapeString($booking['villa_location']);
        }
        
        // Add organizer (villa contact)
        if (!empty($booking['villa_email'])) {
            $event[] = "ORGANIZER:mailto:" . $booking['villa_email'];
        }
        
        $event[] = 'END:VEVENT';
        
        return $event;
    }
    
    /**
     * Build event description with booking details
     */
    private function buildEventDescription($booking) {
        $description = [];
        
        $description[] = "Booking Reference: " . (isset($booking['reference']) ? $booking['reference'] : 'BK-' . $booking['id']);
        $description[] = "Guest: " . $booking['first_name'] . ' ' . $booking['last_name'];
        $description[] = "Email: " . $booking['email'];
        
        if (!empty($booking['phone'])) {
            $description[] = "Phone: " . $booking['phone'];
        }
        
        $description[] = "Guests: " . $booking['guests'];
        $description[] = "Total: $" . number_format($booking['total_price'], 2);
        $description[] = "Status: " . ucfirst($booking['status']);
        
        if (!empty($booking['special_requests'])) {
            $description[] = "Special Requests: " . $booking['special_requests'];
        }
        
        $description[] = "";
        $description[] = "Check-in: " . date('M d, Y', strtotime($booking['check_in']));
        $description[] = "Check-out: " . date('M d, Y', strtotime($booking['check_out']));
        
        return $this->escapeString(implode("\\n", $description));
    }
    
    /**
     * Format date for iCal (YYYYMMDD)
     */
    private function formatDateForICal($date) {
        return date('Ymd', strtotime($date));
    }
    
    /**
     * Format datetime for iCal (YYYYMMDDTHHMMSSZ)
     */
    private function formatDateTimeForICal($datetime) {
        return gmdate('Ymd\THis\Z', strtotime($datetime));
    }
    
    /**
     * Map booking status to iCal status
     */
    private function mapBookingStatus($status) {
        switch ($status) {
            case 'confirmed':
                return 'CONFIRMED';
            case 'pending':
                return 'TENTATIVE';
            case 'cancelled':
                return 'CANCELLED';
            default:
                return 'CONFIRMED';
        }
    }
    
    /**
     * Escape special characters for iCal
     */
    private function escapeString($string) {
        $string = str_replace('\\', '\\\\', $string);
        $string = str_replace(',', '\\,', $string);
        $string = str_replace(';', '\\;', $string);
        $string = str_replace("\n", '\\n', $string);
        $string = str_replace("\r", '', $string);
        return $string;
    }
}

// Main execution
try {
    $database = new Database();
    $pdo = $database->getConnection();
    $icalGenerator = new iCalGenerator($pdo);
    
    // Get request parameters
    $action = $_GET['action'] ?? 'calendar';
    $format = $_GET['format'] ?? 'ics';
    
    switch ($action) {
        case 'calendar':
            // Generate full calendar
            $options = [
                'status' => $_GET['status'] ?? 'all',
                'from_date' => $_GET['from_date'] ?? null,
                'to_date' => $_GET['to_date'] ?? null
            ];
            
            $result = $icalGenerator->generateCalendar($options);
            
            if ($result['success']) {
                if ($format === 'ics') {
                    // Return as .ics file for download
                    header('Content-Type: text/calendar; charset=utf-8');
                    header('Content-Disposition: attachment; filename="villa-bookings.ics"');
                    echo $result['ical'];
                } else {
                    // Return as JSON
                    header('Content-Type: application/json');
                    echo json_encode($result);
                }
            } else {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode($result);
            }
            break;
            
        case 'subscribe':
            // Generate subscription URL
            $baseUrl = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . 
                      $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);
            
            $subscribeUrl = $baseUrl . '/ical.php?action=calendar&format=ics';
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'subscribe_url' => $subscribeUrl,
                'webcal_url' => str_replace(['http://', 'https://'], 'webcal://', $subscribeUrl),
                'instructions' => [
                    'google_calendar' => 'Add by URL in Google Calendar',
                    'outlook' => 'Subscribe to calendar in Outlook',
                    'apple_calendar' => 'Subscribe in Apple Calendar app',
                    'airbnb' => 'Use as external calendar URL in Airbnb'
                ]
            ]);
            break;
            
        default:
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Invalid action. Use: calendar, subscribe'
            ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'iCal generation failed: ' . $e->getMessage()
    ]);
}
?>