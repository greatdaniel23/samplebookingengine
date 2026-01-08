<?php
// Import Airbnb iCal events into external_blocks table
// Usage: api/ical_import_airbnb.php?source=<airbnb_ical_url>
// NOTE: Table external_blocks must exist (see database/external_blocks.sql)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once 'config/database.php';

$source = isset($_GET['source']) ? trim($_GET['source']) : '';
$packageId = isset($_GET['package_id']) ? intval($_GET['package_id']) : null;
$roomId = isset($_GET['room_id']) ? trim($_GET['room_id']) : null;

if ($source === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing source parameter']);
    exit;
}

// Validate that either package_id or room_id is provided for mapping
if ($packageId === null && $roomId === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Either package_id or room_id parameter is required for mapping']);
    exit;
}

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
        CURLOPT_TIMEOUT => 20,
        CURLOPT_USERAGENT => 'VillaBookingEngine/1.0 (+https://booking.rumahdaisycantik.com)'
    ]);
    $data = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($err) { throw new Exception('cURL error: ' . $err); }
    if ($code >= 400 || !$data) { throw new Exception('Bad HTTP status: ' . $code); }
    return $data;
}

function parseIcs($icsRaw) {
    $lines = preg_split('/\r\n|\n|\r/', $icsRaw);
    $events = [];
    $current = null;
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === 'BEGIN:VEVENT') {
            $current = [];
        } elseif ($line === 'END:VEVENT') {
            if ($current) {
                if (isset($current['DTSTART'])) { $current['start_date'] = substr($current['DTSTART'], 0, 8); }
                if (isset($current['DTEND'])) { $current['end_date'] = substr($current['DTEND'], 0, 8); }
                $events[] = $current;
            }
            $current = null;
        } elseif ($current !== null) {
            if (strpos($line, ' ') === 0 && !empty($current['_last_key'])) {
                $current[$current['_last_key']] .= substr($line, 1);
                continue;
            }
            $parts = explode(':', $line, 2);
            if (count($parts) === 2) {
                $keyBase = strtoupper(explode(';', $parts[0])[0]);
                $current[$keyBase] = $parts[1];
                $current['_last_key'] = $keyBase;
            }
        }
    }
    return $events;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    $ics = fetchIcs($source);
    $events = parseIcs($ics);

    $inserted = 0; $updated = 0; $skipped = 0;
    $now = date('Y-m-d H:i:s');

    $stmtSelect = $pdo->prepare('SELECT id FROM external_blocks WHERE source = :source AND uid = :uid AND package_id = :package_id AND room_id = :room_id');
    $stmtInsert = $pdo->prepare('INSERT INTO external_blocks (source, package_id, room_id, uid, summary, description, start_date, end_date, raw_event, last_seen) VALUES (:source, :package_id, :room_id, :uid, :summary, :description, :start_date, :end_date, :raw_event, :last_seen)');
    $stmtUpdate = $pdo->prepare('UPDATE external_blocks SET summary = :summary, description = :description, start_date = :start_date, end_date = :end_date, raw_event = :raw_event, last_seen = :last_seen, updated_at = CURRENT_TIMESTAMP WHERE source = :source AND uid = :uid AND package_id = :package_id AND room_id = :room_id');

    foreach ($events as $ev) {
        $uid = $ev['UID'] ?? sha1(($ev['DTSTART'] ?? '') . ($ev['DTEND'] ?? '') . $source);
        $summary = $ev['SUMMARY'] ?? 'Blocked';
        $description = $ev['DESCRIPTION'] ?? '';
        $startDate = isset($ev['start_date']) ? date('Y-m-d', strtotime($ev['start_date'])) : null;
        $endDate = isset($ev['end_date']) ? date('Y-m-d', strtotime($ev['end_date'])) : null;
        if (!$startDate || !$endDate) { $skipped++; continue; }

        $stmtSelect->execute([
            'source' => 'airbnb', 
            'uid' => $uid, 
            'package_id' => $packageId, 
            'room_id' => $roomId
        ]);
        if ($stmtSelect->fetch()) {
            $stmtUpdate->execute([
                'summary' => $summary,
                'description' => $description,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'raw_event' => json_encode($ev),
                'last_seen' => $now,
                'source' => 'airbnb',
                'uid' => $uid,
                'package_id' => $packageId,
                'room_id' => $roomId
            ]);
            $updated++;
        } else {
            $stmtInsert->execute([
                'source' => 'airbnb',
                'package_id' => $packageId,
                'room_id' => $roomId,
                'uid' => $uid,
                'summary' => $summary,
                'description' => $description,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'raw_event' => json_encode($ev),
                'last_seen' => $now
            ]);
            $inserted++;
        }
    }

    echo json_encode([
        'success' => true,
        'source' => $source,
        'package_id' => $packageId,
        'room_id' => $roomId,
        'mapping_type' => $packageId ? 'package' : 'room',
        'events_processed' => count($events),
        'inserted' => $inserted,
        'updated' => $updated,
        'skipped' => $skipped
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
