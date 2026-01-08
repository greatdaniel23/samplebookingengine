<?php
/**
 * Temporary Image Upload Handler
 * Handles file uploads for image processing
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method allowed');
    }
    
    if (!isset($_FILES['image'])) {
        throw new Exception('No image file uploaded');
    }
    
    $uploadedFile = $_FILES['image'];
    
    // Validate upload
    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Upload error: ' . $uploadedFile['error']);
    }
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = mime_content_type($uploadedFile['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
    }
    
    // Validate file size (max 10MB)
    $maxSize = 10 * 1024 * 1024; // 10MB
    if ($uploadedFile['size'] > $maxSize) {
        throw new Exception('File too large. Maximum size is 10MB.');
    }
    
    // Generate safe filename
    $extension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION);
    $safeFilename = uniqid('upload_') . '_' . time() . '.' . strtolower($extension);
    
    // Upload path
    $uploadPath = dirname(__DIR__) . '/images/' . $safeFilename;
    
    // Create images directory if it doesn't exist
    $imagesDir = dirname($uploadPath);
    if (!is_dir($imagesDir)) {
        mkdir($imagesDir, 0755, true);
    }
    
    // Move uploaded file
    if (!move_uploaded_file($uploadedFile['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to save uploaded file');
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'filename' => $safeFilename,
        'original_name' => $uploadedFile['name'],
        'size' => $uploadedFile['size'],
        'type' => $fileType,
        'path' => 'images/' . $safeFilename
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>