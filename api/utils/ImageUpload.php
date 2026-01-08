<?php
/**
 * Image Upload Utility
 * Handles image uploads for rooms, amenities, and gallery
 */

class ImageUpload {
    private $uploadDir;
    private $allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
    private $maxFileSize = 5 * 1024 * 1024; // 5MB

    public function __construct($baseDir = '../public/images/') {
        $this->uploadDir = $baseDir;
    }

    /**
     * Upload room images
     */
    public function uploadRoomImages($roomId, $files) {
        $roomDir = $this->uploadDir . 'rooms/' . $roomId . '/';
        
        // Create room directory if it doesn't exist
        if (!file_exists($roomDir)) {
            mkdir($roomDir, 0755, true);
        }
        
        $uploadedFiles = [];
        
        foreach ($files as $type => $file) {
            if ($file['error'] === UPLOAD_ERR_OK) {
                $result = $this->processUpload($file, $roomDir, $type);
                if ($result['success']) {
                    $uploadedFiles[$type] = $result['filename'];
                }
            }
        }
        
        return $uploadedFiles;
    }

    /**
     * Upload amenity icon
     */
    public function uploadAmenityIcon($amenityName, $file) {
        $amenityDir = $this->uploadDir . 'amenities/';
        
        if (!file_exists($amenityDir)) {
            mkdir($amenityDir, 0755, true);
        }
        
        $filename = strtolower(str_replace([' ', '-'], ['', ''], $amenityName)) . '.svg';
        
        return $this->processUpload($file, $amenityDir, $filename);
    }

    /**
     * Process individual file upload
     */
    private function processUpload($file, $targetDir, $filename) {
        // Validate file
        $validation = $this->validateFile($file);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }
        
        // Generate filename if not provided
        if (is_numeric($filename) || in_array($filename, ['main', 'thumbnail', 'gallery-1', 'gallery-2', 'gallery-3', 'gallery-4'])) {
            $extension = $this->getFileExtension($file['name']);
            $filename = $filename . '.' . $extension;
        }
        
        $targetPath = $targetDir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            // Optimize image
            $this->optimizeImage($targetPath);
            
            return [
                'success' => true,
                'filename' => $filename,
                'path' => $targetPath
            ];
        }
        
        return ['success' => false, 'error' => 'Failed to move uploaded file'];
    }

    /**
     * Validate uploaded file
     */
    private function validateFile($file) {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'error' => 'Upload error: ' . $file['error']];
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return ['valid' => false, 'error' => 'File too large. Maximum size: 5MB'];
        }
        
        // Check file type
        $extension = $this->getFileExtension($file['name']);
        if (!in_array($extension, $this->allowedTypes)) {
            return ['valid' => false, 'error' => 'Invalid file type. Allowed: ' . implode(', ', $this->allowedTypes)];
        }
        
        // Verify it's actually an image
        $imageInfo = getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            return ['valid' => false, 'error' => 'File is not a valid image'];
        }
        
        return ['valid' => true];
    }

    /**
     * Get file extension
     */
    private function getFileExtension($filename) {
        return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    }

    /**
     * Basic image optimization
     */
    private function optimizeImage($imagePath) {
        $extension = $this->getFileExtension($imagePath);
        
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $image = imagecreatefromjpeg($imagePath);
                if ($image) {
                    imagejpeg($image, $imagePath, 85); // 85% quality
                    imagedestroy($image);
                }
                break;
                
            case 'png':
                $image = imagecreatefrompng($imagePath);
                if ($image) {
                    imagepng($image, $imagePath, 8); // Compression level 8
                    imagedestroy($image);
                }
                break;
        }
    }

    /**
     * Generate thumbnail
     */
    public function generateThumbnail($sourcePath, $thumbnailPath, $width = 300, $height = 200) {
        $extension = $this->getFileExtension($sourcePath);
        
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $source = imagecreatefromjpeg($sourcePath);
                break;
            case 'png':
                $source = imagecreatefrompng($sourcePath);
                break;
            default:
                return false;
        }
        
        if (!$source) return false;
        
        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        
        // Calculate dimensions maintaining aspect ratio
        $ratio = min($width / $sourceWidth, $height / $sourceHeight);
        $newWidth = $sourceWidth * $ratio;
        $newHeight = $sourceHeight * $ratio;
        
        $thumbnail = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $newWidth, $newHeight, $sourceWidth, $sourceHeight);
        
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                imagejpeg($thumbnail, $thumbnailPath, 85);
                break;
            case 'png':
                imagepng($thumbnail, $thumbnailPath, 8);
                break;
        }
        
        imagedestroy($source);
        imagedestroy($thumbnail);
        
        return true;
    }
}
?>