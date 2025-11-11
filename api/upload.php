<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit();
}

require_once 'config/database.php';

$db = null;
try {
    $database = new Database();
    $db = $database->getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// --- Configuration ---
// Use absolute paths for reliability
$docRoot = $_SERVER['DOCUMENT_ROOT'];
$uploadDirName = 'images/uploads';
$uploadPath = $docRoot . '/' . $uploadDirName;
$uploadUrlBase = '/' . $uploadDirName;

// --- Validation ---
if (empty($_POST['room_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Room ID is missing.']);
    exit();
}

if (empty($_FILES['images'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No image files were uploaded.']);
    exit();
}

$roomId = $_POST['room_id'];
$files = $_FILES['images'];

// --- Directory Handling ---
if (!is_dir($uploadPath)) {
    if (!mkdir($uploadPath, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory.']);
        exit();
    }
}

// --- File Processing ---
$uploadedImageUrls = [];
$errors = [];

// Normalize the $_FILES array if multiple files are uploaded
$file_keys = array_keys($files['name']);
foreach ($file_keys as $key) {
    $fileName = $files['name'][$key];
    $fileTmpName = $files['tmp_name'][$key];
    $fileSize = $files['size'][$key];
    $fileError = $files['error'][$key];

    if ($fileError !== UPLOAD_ERR_OK) {
        $errors[] = "Failed to upload '$fileName'. Error code: $fileError";
        continue;
    }

    // Security checks
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($fileExt, $allowed)) {
        $errors[] = "File type not allowed for '$fileName'.";
        continue;
    }

    if ($fileSize > 5 * 1024 * 1024) { // 5MB limit
        $errors[] = "File size exceeds 5MB for '$fileName'.";
        continue;
    }

    // Generate a unique filename
    $newFileName = uniqid('room_' . $roomId . '_', true) . '.' . $fileExt;
    $destination = $uploadPath . '/' . $newFileName;
    $url = $uploadUrlBase . '/' . $newFileName;

    if (move_uploaded_file($fileTmpName, $destination)) {
        $uploadedImageUrls[] = $url;
    } else {
        $errors[] = "Failed to move uploaded file '$fileName'.";
    }
}

if (empty($uploadedImageUrls)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No files were successfully uploaded.', 'errors' => $errors]);
    exit();
}

// --- Database Update ---
try {
    $db->beginTransaction();

    // 1. Fetch the current images
    $stmt = $db->prepare("SELECT images FROM rooms WHERE id = ?");
    $stmt->execute([$roomId]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$room) {
        throw new Exception('Room not found.');
    }

    $currentImages = json_decode($room['images'] ?? '[]', true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $currentImages = []; // Reset if JSON is invalid
    }

    // 2. Add new images
    $updatedImages = array_merge($currentImages, $uploadedImageUrls);

    // 3. Update the database
    $updateStmt = $db->prepare("UPDATE rooms SET images = ? WHERE id = ?");
    $updateStmt->execute([json_encode($updatedImages), $roomId]);

    $db->commit();

    // --- Final Response ---
    echo json_encode([
        'success' => true,
        'message' => count($uploadedImageUrls) . ' image(s) uploaded successfully.',
        'newImageUrls' => $uploadedImageUrls,
        'updatedImageList' => $updatedImages,
        'errors' => $errors // Include non-fatal errors
    ]);

} catch (Exception $e) {
    if ($db && $db->inTransaction()) {
        $db->rollBack();
    }
    // Clean up uploaded files on DB error
    foreach ($uploadedImageUrls as $url) {
        $filePath = $docRoot . $url;
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>