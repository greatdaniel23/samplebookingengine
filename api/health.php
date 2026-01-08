<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control');
header('Cache-Control: no-cache, no-store, must-revalidate');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$checks = [
  'php_version' => PHP_VERSION,
  'time' => date('c'),
];

try {
  require_once __DIR__ . '/config/database.php';
  $database = new Database();
  $db = $database->getConnection();
  $checks['db_connection'] = true;

  // Table presence
  $tablesStmt = $db->query('SHOW TABLES');
  $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
  $want = ['villa_info','rooms','bookings','packages'];
  $checks['tables'] = [];
  foreach ($want as $t) {
    $checks['tables'][$t] = in_array($t, $tables);
  }

  // Basic row check villa_info
  if (in_array('villa_info', $tables)) {
    $rowStmt = $db->query('SELECT id,name,updated_at FROM villa_info WHERE id=1 LIMIT 1');
    $row = $rowStmt->fetch(PDO::FETCH_ASSOC) ?: null;
    $checks['villa_info_row'] = $row ?: null;
  }

} catch (Exception $e) {
  $checks['db_connection'] = false;
  $checks['db_error'] = $e->getMessage();
}

echo json_encode([
  'success' => true,
  'health' => $checks
], JSON_PRETTY_PRINT);
