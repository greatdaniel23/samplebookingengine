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
// Production hosting path for rumahdaisycantik.com
if ($_SERVER['HTTP_HOST'] === 'rumahdaisycantik.com' || $_SERVER['HTTP_HOST'] === 'api.rumahdaisycantik.com') {
    // Production server path - target: /public_html/images/upload/
    $publicHtmlPath = str_replace('/api', '', $_SERVER['DOCUMENT_ROOT']);
    $uploadPath = $publicHtmlPath . '/images/upload';
    $uploadUrlBase = 'https://rumahdaisycantik.com/images/upload';
} else {
    // Local development path
    $projectDir = dirname(__DIR__);
    $uploadPath = $projectDir . '/public/images/uploads';
    $uploadUrlBase = '/images/uploads';
}

// Debug logging
$isProduction = $_SERVER['HTTP_HOST'] === 'rumahdaisycantik.com' || $_SERVER['HTTP_HOST'] === 'api.rumahdaisycantik.com';
error_log("Upload attempt - Environment: " . ($isProduction ? 'PRODUCTION' : 'DEVELOPMENT'));
error_log("Host: " . ($_SERVER['HTTP_HOST'] ?? 'unknown'));
error_log("Upload Path: $uploadPath");
error_log("Upload URL Base: $uploadUrlBase");
error_log("POST data: " . print_r($_POST, true));
error_log("FILES data: " . print_r($_FILES, true));

// --- Validation ---
if (empty($_POST['room_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Room ID is missing.']);
    exit();
}

if (empty($_FILES['images'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No image files were uploaded.', 'debug' => ['post' => $_POST, 'files' => $_FILES]]);
    exit();
}

$roomId = $_POST['room_id'];
$files = $_FILES['images'];

// --- Directory Handling ---
if (!is_dir($uploadPath)) {
    error_log("Creating upload directory: $uploadPath");
    
    // For production, ensure parent directories exist
    $parentDir = dirname($uploadPath);
    if (!is_dir($parentDir)) {
        error_log("Parent directory does not exist: $parentDir");
        // Try to create parent directories
        if (!mkdir($parentDir, 0755, true)) {
            $error = error_get_last();
            error_log("Failed to create parent directories: " . print_r($error, true));
        }
    }
    
    if (!mkdir($uploadPath, 0755, true)) {
        $error = error_get_last();
        error_log("Failed to create directory: " . print_r($error, true));
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Failed to create upload directory.', 
            'debug' => [
                'path' => $uploadPath,
                'parent_path' => dirname($uploadPath),
                'exists' => is_dir($uploadPath),
                'parent_exists' => is_dir(dirname($uploadPath)),
                'parent_writable' => is_writable(dirname($uploadPath)),
                'server_host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
                'error' => $error
            ]
        ]);
        exit();
    }
}

// Check if directory is writable
if (!is_writable($uploadPath)) {
    error_log("Upload directory not writable: $uploadPath");
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Upload directory is not writable.',
        'debug' => [
            'path' => $uploadPath,
            'writable' => is_writable($uploadPath),
            'permissions' => file_exists($uploadPath) ? substr(sprintf('%o', fileperms($uploadPath)), -4) : 'not_exists',
            'owner' => file_exists($uploadPath) ? fileowner($uploadPath) : 'not_exists',
            'group' => file_exists($uploadPath) ? filegroup($uploadPath) : 'not_exists'
        ]
    ]);
    exit();
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
    
    error_log("Generated URL for database: $url");

    if (move_uploaded_file($fileTmpName, $destination)) {
        $uploadedImageUrls[] = $url;
        error_log("Successfully uploaded: $fileName to $destination");
    } else {
        $error = error_get_last();
        error_log("Failed to move file $fileName: " . print_r($error, true));
        $errors[] = "Failed to move uploaded file '$fileName'. Check permissions and disk space.";
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
    $result = $updateStmt->execute([json_encode($updatedImages), $roomId]);
    
    if (!$result) {
        throw new Exception('Failed to update database with new images.');
    }

    error_log("Database updated successfully for room $roomId with " . count($updatedImages) . " total images");

    $db->commit();

    // --- Final Response ---
    echo json_encode([
        'success' => true,
        'message' => count($uploadedImageUrls) . ' image(s) uploaded successfully.',
        'newImageUrls' => $uploadedImageUrls,
        'updatedImageList' => $updatedImages,
        'errors' => $errors, // Include non-fatal errors
        'debug' => [
            'roomId' => $roomId,
            'totalImages' => count($updatedImages),
            'newImages' => count($uploadedImageUrls)
        ]
    ]);

} catch (Exception $e) {
    error_log("Database error during image upload: " . $e->getMessage());
    
    if ($db && $db->inTransaction()) {
        $db->rollBack();
    }
    
    // Clean up uploaded files on DB error
    foreach ($uploadedImageUrls as $url) {
        $filePath = $uploadPath . '/' . basename($url);
        if (file_exists($filePath)) {
            unlink($filePath);
            error_log("Cleaned up file: $filePath");
        }
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage(),
        'debug' => [
            'roomId' => $roomId,
            'uploadedFiles' => count($uploadedImageUrls),
            'cleanedUp' => true
        ]
    ]);
}
?>