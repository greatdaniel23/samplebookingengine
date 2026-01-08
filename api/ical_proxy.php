<?php
// Simple proxy & parser for Airbnb iCal feed
// Security: restrict to approved host patterns and require source param.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$source = isset($_GET['source']) ? trim($_GET['source']) : '';
if ($source === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing source parameter']);
    exit;
}

// Allow only Airbnb iCal links (basic validation)
$allowedPattern = '/^https:\/\/www\.airbnb\.com\/calendar\/ical\/[A-Za-z0-9_.-]+\.ics\?s=[A-Za-z0-9]+$/';
if (!preg_match($allowedPattern, $source)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Source URL not allowed']);
    exit;
}

function fetchIcs($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_USERAGENT => 'VillaBookingEngine/1.0 (+https://booking.rumahdaisycantik.com)'
    ]);
    $data = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($err) {
        throw new Exception('cURL error: ' . $err);
    }
    if ($code >= 400 || !$data) {
        throw new Exception('Bad HTTP status: ' . $code);
    }
    return $data;
}

function parseIcsEvents($icsRaw) {
    $lines = preg_split('/\r\n|\n|\r/', $icsRaw);
    $events = [];
    $current = null;
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === 'BEGIN:VEVENT') {
            $current = [];
        } elseif ($line === 'END:VEVENT') {
            if ($current) {
                // Normalize date fields
                if (isset($current['DTSTART'])) {
                    $current['start_date'] = substr($current['DTSTART'], 0, 8); // YYYYMMDD
                }
                if (isset($current['DTEND'])) {
                    $current['end_date'] = substr($current['DTEND'], 0, 8); // YYYYMMDD
                }
                $events[] = $current;
            }
            $current = null;
        } elseif ($current !== null) {
            // Handle folded lines: if starts with space, append to previous key
            if (strpos($line, ' ') === 0 && !empty($current['_last_key'])) {
                $current[$current['_last_key']] .= substr($line, 1);
                continue;
            }
            $parts = explode(':', $line, 2);
            if (count($parts) === 2) {
                $keyPart = $parts[0];
                $value = $parts[1];
                // Remove parameters after ; (e.g., DTSTART;VALUE=DATE)
                $keyBase = strtoupper(explode(';', $keyPart)[0]);
                $current[$keyBase] = $value;
                $current['_last_key'] = $keyBase;
            }
        }
    }
    // Map simplified events
    $mapped = array_map(function($e) {
        return [
            'uid' => $e['UID'] ?? null,
            'summary' => $e['SUMMARY'] ?? null,
            'description' => $e['DESCRIPTION'] ?? null,
            'start' => isset($e['start_date']) ? date('Y-m-d', strtotime($e['start_date'])) : null,
            'end' => isset($e['end_date']) ? date('Y-m-d', strtotime($e['end_date'])) : null,
            'raw' => $e
        ];
    }, $events);
    return $mapped;
}

try {
    $ics = fetchIcs($source);
    $events = parseIcsEvents($ics);
    echo json_encode([
        'success' => true,
        'source' => $source,
        'event_count' => count($events),
        'events' => $events
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
