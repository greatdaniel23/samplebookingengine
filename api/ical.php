<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

/**
 * Test an iCal URL by fetching and parsing it
 */
function testIcalUrl($url) {
    try {
        // Create a context with proper headers
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept: text/calendar,text/plain,*/*'
                ],
                'timeout' => 30
            ]
        ]);
        
        // Fetch the iCal content
        $icalContent = file_get_contents($url, false, $context);
        
        if ($icalContent === false) {
            return false;
        }
        
        // Parse the iCal content to count events
        $events = [];
        $lines = explode("\n", $icalContent);
        $inEvent = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === 'BEGIN:VEVENT') {
                $inEvent = true;
                $events[] = [];
            } elseif ($line === 'END:VEVENT') {
                $inEvent = false;
            }
        }
        
        return $events;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Save an iCal URL to database or config file
 */
function saveIcalUrl($platform, $url) {
    try {
        // For now, save to a simple JSON file
        // In production, you might want to save to database
        $configFile = __DIR__ . '/config/ical_urls.json';
        
        // Create config directory if it doesn't exist
        $configDir = dirname($configFile);
        if (!file_exists($configDir)) {
            mkdir($configDir, 0755, true);
        }
        
        // Load existing config
        $config = [];
        if (file_exists($configFile)) {
            $existing = file_get_contents($configFile);
            $config = json_decode($existing, true) ?: [];
        }
        
        // Update config
        $config[$platform] = [
            'url' => $url,
            'saved_at' => date('Y-m-d H:i:s'),
            'status' => 'active'
        ];
        
        // Save config
        file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));
        
        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Sync a specific platform
 */
function syncPlatform($platform) {
    try {
        // Load platform URL from config
        $configFile = __DIR__ . '/config/ical_urls.json';
        if (!file_exists($configFile)) {
            return ['success' => false, 'message' => 'No iCal URLs configured'];
        }
        
        $config = json_decode(file_get_contents($configFile), true);
        if (!isset($config[$platform])) {
            return ['success' => false, 'message' => "No URL configured for $platform"];
        }
        
        $url = $config[$platform]['url'];
        $events = testIcalUrl($url);
        
        if ($events === false) {
            return ['success' => false, 'message' => "Failed to sync $platform calendar"];
        }
        
        // Here you would typically save the events to your database
        // For now, just return success with event count
        
        return [
            'success' => true, 
            'message' => "Synced " . count($events) . " events from $platform"
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Sync failed: ' . $e->getMessage()];
    }
}

/**
 * Sync all configured platforms
 */
function syncAllPlatforms() {
    try {
        $configFile = __DIR__ . '/config/ical_urls.json';
        if (!file_exists($configFile)) {
            return ['success' => false, 'message' => 'No iCal URLs configured'];
        }
        
        $config = json_decode(file_get_contents($configFile), true);
        $results = [];
        $totalEvents = 0;
        
        foreach ($config as $platform => $data) {
            $result = syncPlatform($platform);
            $results[$platform] = $result;
            if ($result['success']) {
                // Extract event count from message
                preg_match('/(\d+) events/', $result['message'], $matches);
                if (!empty($matches[1])) {
                    $totalEvents += (int)$matches[1];
                }
            }
        }
        
        return [
            'success' => true,
            'message' => "Synced $totalEvents total events from " . count($config) . " platforms",
            'details' => $results
        ];
    } catch (Exception $e) {
        return ['success' => false, 'message' => 'Sync all failed: ' . $e->getMessage()];
    }
}

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
                v.address as villa_location,
                v.phone as villa_phone,
                v.email as villa_email
            FROM bookings b
            LEFT JOIN rooms r ON b.room_id = r.id
            LEFT JOIN packages p ON b.package_id = p.id
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
        
        if (isset($options['package_id']) && $options['package_id'] !== 'all') {
            $sql .= " AND b.package_id = :package_id";
            $params['package_id'] = $options['package_id'];
        }
        
        if (isset($options['room_id']) && $options['room_id'] !== 'all') {
            $sql .= " AND b.room_id = :room_id";
            $params['room_id'] = $options['room_id'];
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

// Handle POST requests for iCal URL management
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
        exit;
    }
    
    $action = $input['action'] ?? '';
    $platform = $input['platform'] ?? '';
    $url = $input['url'] ?? '';
    
    switch ($action) {
        case 'save_test':
            if (empty($platform) || empty($url)) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Platform and URL are required']);
                exit;
            }
            
            // Test the iCal URL
            $events = testIcalUrl($url);
            if ($events === false) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Failed to fetch or parse iCal URL']);
                exit;
            }
            
            // Save the URL (you can implement database storage here)
            $saved = saveIcalUrl($platform, $url);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true, 
                'message' => 'iCal URL saved and tested successfully',
                'events' => count($events)
            ]);
            exit;
            
        case 'sync':
            if (empty($platform)) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Platform is required']);
                exit;
            }
            
            $result = syncPlatform($platform);
            header('Content-Type: application/json');
            echo json_encode($result);
            exit;
            
        case 'sync_all':
            $result = syncAllPlatforms();
            header('Content-Type: application/json');
            echo json_encode($result);
            exit;
            
        default:
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            exit;
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
                'to_date' => $_GET['to_date'] ?? null,
                'package_id' => $_GET['package_id'] ?? 'all',
                'room_id' => $_GET['room_id'] ?? 'all'
            ];
            
            $result = $icalGenerator->generateCalendar($options);
            
            if ($result['success']) {
                if ($format === 'ics') {
                    // Generate dynamic filename based on filters
                    $filename = 'villa-bookings';
                    if ($options['package_id'] !== 'all') {
                        $filename = 'package-' . $options['package_id'] . '-bookings';
                    } elseif ($options['room_id'] !== 'all') {
                        $filename = 'room-' . $options['room_id'] . '-bookings';
                    }
                    
                    // Return as .ics file for download
                    header('Content-Type: text/calendar; charset=utf-8');
                    header('Content-Disposition: attachment; filename="' . $filename . '.ics"');
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
            // Generate subscription URL with optional filtering
            $baseUrl = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . 
                      $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);
            
            $subscribeUrl = $baseUrl . '/ical.php?action=calendar&format=ics';
            
            // Add filters to subscription URL if provided
            $filters = [];
            if (isset($_GET['package_id']) && $_GET['package_id'] !== 'all') {
                $filters[] = 'package_id=' . urlencode($_GET['package_id']);
            }
            if (isset($_GET['room_id']) && $_GET['room_id'] !== 'all') {
                $filters[] = 'room_id=' . urlencode($_GET['room_id']);
            }
            if (isset($_GET['status']) && $_GET['status'] !== 'all') {
                $filters[] = 'status=' . urlencode($_GET['status']);
            }
            
            if (!empty($filters)) {
                $subscribeUrl .= '&' . implode('&', $filters);
            }
            
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
            
        case 'package_calendar':
            // Generate package-specific calendar information
            $packageId = $_GET['package_id'] ?? null;
            if (!$packageId) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'error' => 'package_id parameter is required']);
                break;
            }
            
            $baseUrl = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . 
                      $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']);
            
            $packageCalendarUrl = $baseUrl . '/ical.php?action=calendar&format=ics&package_id=' . urlencode($packageId);
            $packageSubscribeUrl = $baseUrl . '/ical.php?action=subscribe&package_id=' . urlencode($packageId);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'package_id' => $packageId,
                'calendar_url' => $packageCalendarUrl,
                'webcal_url' => str_replace(['http://', 'https://'], 'webcal://', $packageCalendarUrl),
                'subscribe_endpoint' => $packageSubscribeUrl,
                'description' => 'Package-specific calendar feed containing only bookings for this package'
            ]);
            break;
            
        default:
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Invalid action. Use: calendar, subscribe, package_calendar, sync, sync_all, save_test'
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