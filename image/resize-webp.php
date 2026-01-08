<?php
/**
 * Image Resizer and WebP Converter
 * Reduces image dimensions and converts to WebP format
 * Usage: /image/resize-webp.php?src=image.jpg&width=800&height=600&quality=80
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class ImageProcessor {
    private $imagesPath;
    private $maxWidth = 1920;
    private $maxHeight = 1080;
    private $defaultQuality = 80;
    
    public function __construct() {
        $this->imagesPath = dirname(__DIR__) . '/images/';
    }
    
    public function processImage($params) {
        try {
            // Validate input parameters
            $validation = $this->validateParams($params);
            if (!$validation['valid']) {
                return $this->errorResponse($validation['error']);
            }
            
            $sourcePath = $this->imagesPath . $params['src'];
            
            // Check if source file exists
            if (!file_exists($sourcePath)) {
                return $this->errorResponse('Source image not found: ' . $params['src']);
            }
            
            // Get image info
            $imageInfo = getimagesize($sourcePath);
            if (!$imageInfo) {
                return $this->errorResponse('Invalid image file');
            }
            
            $originalWidth = $imageInfo[0];
            $originalHeight = $imageInfo[1];
            $mimeType = $imageInfo['mime'];
            
            // Calculate new dimensions
            $dimensions = $this->calculateDimensions(
                $originalWidth, 
                $originalHeight, 
                $params['width'] ?? null, 
                $params['height'] ?? null
            );
            
            // Create source image resource
            $sourceImage = $this->createImageResource($sourcePath, $mimeType);
            if (!$sourceImage) {
                return $this->errorResponse('Failed to create image resource');
            }
            
            // Create resized image
            $resizedImage = $this->resizeImage(
                $sourceImage, 
                $originalWidth, 
                $originalHeight, 
                $dimensions['width'], 
                $dimensions['height']
            );
            
            if (!$resizedImage) {
                return $this->errorResponse('Failed to resize image');
            }
            
            // Generate output filename
            $outputPath = $this->generateOutputPath($params['src'], $dimensions);
            
            // Convert to WebP and save
            $quality = $params['quality'] ?? $this->defaultQuality;
            $success = imagewebp($resizedImage, $outputPath, $quality);
            
            // Clean up memory
            imagedestroy($sourceImage);
            imagedestroy($resizedImage);
            
            if (!$success) {
                return $this->errorResponse('Failed to save WebP image');
            }
            
            // Return success response
            return $this->successResponse($outputPath, $dimensions, $quality, [
                'original_size' => filesize($sourcePath),
                'new_size' => filesize($outputPath),
                'original_dimensions' => ['width' => $originalWidth, 'height' => $originalHeight],
                'compression_ratio' => round((1 - filesize($outputPath) / filesize($sourcePath)) * 100, 2)
            ]);
            
        } catch (Exception $e) {
            return $this->errorResponse('Processing error: ' . $e->getMessage());
        }
    }
    
    private function validateParams($params) {
        if (!isset($params['src']) || empty($params['src'])) {
            return ['valid' => false, 'error' => 'Source image parameter required'];
        }
        
        // Sanitize filename
        $params['src'] = basename($params['src']);
        
        // Validate dimensions - allow empty values
        if (isset($params['width']) && !empty($params['width'])) {
            $params['width'] = intval($params['width']);
            if ($params['width'] <= 0 || $params['width'] > $this->maxWidth) {
                return ['valid' => false, 'error' => 'Invalid width parameter (must be 1-' . $this->maxWidth . ')'];
            }
        } else {
            $params['width'] = null;
        }
        
        if (isset($params['height']) && !empty($params['height'])) {
            $params['height'] = intval($params['height']);
            if ($params['height'] <= 0 || $params['height'] > $this->maxHeight) {
                return ['valid' => false, 'error' => 'Invalid height parameter (must be 1-' . $this->maxHeight . ')'];
            }
        } else {
            $params['height'] = null;
        }
        
        // Validate quality
        if (isset($params['quality']) && !empty($params['quality'])) {
            $params['quality'] = intval($params['quality']);
            if ($params['quality'] < 1 || $params['quality'] > 100) {
                return ['valid' => false, 'error' => 'Quality must be between 1-100'];
            }
        } else {
            $params['quality'] = $this->defaultQuality;
        }
        
        return ['valid' => true, 'params' => $params];
    }
    
    private function calculateDimensions($originalWidth, $originalHeight, $targetWidth = null, $targetHeight = null) {
        // If no dimensions specified, reduce by 50%
        if (!$targetWidth && !$targetHeight) {
            return [
                'width' => round($originalWidth * 0.5),
                'height' => round($originalHeight * 0.5)
            ];
        }
        
        // If only width specified, maintain aspect ratio
        if ($targetWidth && !$targetHeight) {
            $ratio = $targetWidth / $originalWidth;
            return [
                'width' => $targetWidth,
                'height' => round($originalHeight * $ratio)
            ];
        }
        
        // If only height specified, maintain aspect ratio
        if (!$targetWidth && $targetHeight) {
            $ratio = $targetHeight / $originalHeight;
            return [
                'width' => round($originalWidth * $ratio),
                'height' => $targetHeight
            ];
        }
        
        // Both dimensions specified - use as-is (may distort)
        return [
            'width' => $targetWidth,
            'height' => $targetHeight
        ];
    }
    
    private function createImageResource($sourcePath, $mimeType) {
        switch ($mimeType) {
            case 'image/jpeg':
                return imagecreatefromjpeg($sourcePath);
            case 'image/png':
                return imagecreatefrompng($sourcePath);
            case 'image/gif':
                return imagecreatefromgif($sourcePath);
            case 'image/webp':
                return imagecreatefromwebp($sourcePath);
            default:
                return false;
        }
    }
    
    private function resizeImage($sourceImage, $originalWidth, $originalHeight, $newWidth, $newHeight) {
        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG and GIF
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
        $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
        imagefill($resizedImage, 0, 0, $transparent);
        
        // Resize with high quality
        $success = imagecopyresampled(
            $resizedImage, $sourceImage,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $originalWidth, $originalHeight
        );
        
        return $success ? $resizedImage : false;
    }
    
    private function generateOutputPath($originalFilename, $dimensions) {
        $pathInfo = pathinfo($originalFilename);
        $baseName = $pathInfo['filename'];
        $timestamp = date('Y-m-d_H-i-s');
        
        return $this->imagesPath . $baseName . '_' . $dimensions['width'] . 'x' . $dimensions['height'] . '_' . $timestamp . '.webp';
    }
    
    private function successResponse($outputPath, $dimensions, $quality, $stats) {
        $relativePath = 'images/' . basename($outputPath);
        
        return [
            'success' => true,
            'message' => 'Image processed successfully',
            'data' => [
                'output_path' => $relativePath,
                'full_path' => $outputPath,
                'dimensions' => $dimensions,
                'quality' => $quality,
                'format' => 'webp',
                'stats' => $stats,
                'url' => $this->getImageUrl($relativePath)
            ]
        ];
    }
    
    private function errorResponse($message) {
        http_response_code(400);
        return [
            'success' => false,
            'error' => $message
        ];
    }
    
    private function getImageUrl($relativePath) {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $basePath = dirname($_SERVER['SCRIPT_NAME']);
        
        return $protocol . $host . $basePath . '/../' . $relativePath;
    }
    
    public function batchProcess($directory = null, $batchParams = []) {
        $targetDir = $directory ? $this->imagesPath . $directory : $this->imagesPath;
        
        if (!is_dir($targetDir)) {
            return $this->errorResponse('Directory not found');
        }
        
        $results = [];
        $extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        $files = array_filter(scandir($targetDir), function($file) use ($extensions, $targetDir) {
            if ($file === '.' || $file === '..') return false;
            $fullPath = $targetDir . $file;
            if (!is_file($fullPath)) return false;
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            return in_array($ext, $extensions);
        });
        
        // Get batch processing parameters with proper validation
        $batchWidth = !empty($batchParams['width']) ? intval($batchParams['width']) : 800;
        $batchHeight = !empty($batchParams['height']) ? intval($batchParams['height']) : null;
        $batchQuality = !empty($batchParams['quality']) ? intval($batchParams['quality']) : 75;
        
        // Validate batch parameters
        if ($batchWidth <= 0 || $batchWidth > $this->maxWidth) {
            $batchWidth = 800;
        }
        if ($batchHeight !== null && ($batchHeight <= 0 || $batchHeight > $this->maxHeight)) {
            $batchHeight = null;
        }
        if ($batchQuality < 1 || $batchQuality > 100) {
            $batchQuality = 75;
        }
        
        foreach ($files as $file) {
            // Skip files that are already processed (contain dimensions in filename)
            if (preg_match('/_\d+x\d+_/', $file)) {
                continue;
            }
            
            $result = $this->processImage([
                'src' => $file,
                'width' => $batchWidth,
                'height' => $batchHeight,
                'quality' => $batchQuality
            ]);
            
            $results[] = [
                'file' => $file,
                'result' => $result
            ];
        }
        
        return [
            'success' => true,
            'batch_results' => $results,
            'total_processed' => count($results),
            'settings_used' => [
                'width' => $batchWidth,
                'height' => $batchHeight,
                'quality' => $batchQuality
            ],
            'skipped_processed' => count(array_filter(scandir($targetDir), function($file) {
                return preg_match('/_\d+x\d+_/', $file);
            }))
        ];
    }
}

// Main execution
try {
    $processor = new ImageProcessor();
    
    // Check if batch processing requested
    if (isset($_GET['batch']) && $_GET['batch'] === 'true') {
        $directory = $_GET['directory'] ?? null;
        $batchParams = [
            'width' => isset($_GET['width']) ? $_GET['width'] : null,
            'height' => isset($_GET['height']) ? $_GET['height'] : null,
            'quality' => isset($_GET['quality']) ? $_GET['quality'] : null
        ];
        $result = $processor->batchProcess($directory, $batchParams);
    } else {
        // Single image processing
        // Add debug info for troubleshooting
        if (empty($_GET['src'])) {
            $result = [
                'success' => false,
                'error' => 'No source image specified. Required parameter: src',
                'received_params' => array_keys($_GET),
                'usage' => 'resize-webp.php?src=image.jpg&width=800&quality=80'
            ];
        } else {
            $result = $processor->processImage($_GET);
        }
    }
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>