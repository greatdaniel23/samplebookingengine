<?php
// List external calendar blocks (prototype)
require_once __DIR__ . '/config/database.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $db = new Database();
    $pdo = $db->getConnection();

    $source = isset($_GET['source']) ? $_GET['source'] : null; // optional filter
    $packageId = isset($_GET['package_id']) ? intval($_GET['package_id']) : null;
    $roomId = isset($_GET['room_id']) ? $_GET['room_id'] : null;
    $from = isset($_GET['from']) ? $_GET['from'] : null;
    $to = isset($_GET['to']) ? $_GET['to'] : null;

    $sql = "SELECT id, source, package_id, room_id, uid, start_date, end_date, summary, description, last_seen FROM external_blocks WHERE 1=1";
    $params = [];
    if ($source) {
        $sql .= " AND source = ?"; $params[] = $source;
    }
    if ($packageId) {
        $sql .= " AND package_id = ?"; $params[] = $packageId;
    }
    if ($roomId) {
        $sql .= " AND room_id = ?"; $params[] = $roomId;
    }
    if ($from) {
        $sql .= " AND end_date > ?"; $params[] = $from; // overlap style filter
    }
    if ($to) {
        $sql .= " AND start_date < ?"; $params[] = $to;
    }
    $sql .= " ORDER BY start_date ASC LIMIT 500"; // safety limit

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'count' => count($rows),
        'data' => $rows
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load external blocks: ' . $e->getMessage()
    ]);
}
