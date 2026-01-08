<?php
/**
 * Generate Sample Images for Testing
 * Creates test images in various formats and sizes
 */

header('Content-Type: application/json');

try {
    $imagesPath = dirname(__DIR__) . '/images/';
    
    // Create images directory if it doesn't exist
    if (!is_dir($imagesPath)) {
        mkdir($imagesPath, 0755, true);
    }
    
    $samples = [];
    
    // Sample 1: Large JPEG (simulating photo)
    $img1 = imagecreatetruecolor(2000, 1500);
    $colors = [
        imagecolorallocate($img1, 255, 100, 100), // Red
        imagecolorallocate($img1, 100, 255, 100), // Green  
        imagecolorallocate($img1, 100, 100, 255), // Blue
        imagecolorallocate($img1, 255, 255, 100), // Yellow
    ];
    
    // Create colorful pattern
    for ($i = 0; $i < 20; $i++) {
        $color = $colors[array_rand($colors)];
        $x1 = rand(0, 2000);
        $y1 = rand(0, 1500);
        $x2 = rand($x1, min($x1 + 200, 2000));
        $y2 = rand($y1, min($y1 + 200, 1500));
        imagefilledrectangle($img1, $x1, $y1, $x2, $y2, $color);
    }
    
    // Add text
    $white = imagecolorallocate($img1, 255, 255, 255);
    imagestring($img1, 5, 50, 50, 'LARGE TEST IMAGE - 2000x1500', $white);
    imagestring($img1, 3, 50, 100, 'Perfect for testing compression and resizing', $white);
    
    $filename1 = $imagesPath . 'sample-large.jpg';
    imagejpeg($img1, $filename1, 95);
    $samples[] = [
        'filename' => 'sample-large.jpg',
        'size' => '2000x1500',
        'format' => 'JPEG',
        'filesize' => number_format(filesize($filename1) / 1024, 1) . ' KB'
    ];
    imagedestroy($img1);
    
    // Sample 2: Medium PNG with transparency
    $img2 = imagecreatetruecolor(1200, 800);
    imagesavealpha($img2, true);
    $transparent = imagecolorallocatealpha($img2, 0, 0, 0, 127);
    imagefill($img2, 0, 0, $transparent);
    
    $red = imagecolorallocate($img2, 255, 0, 0);
    $blue = imagecolorallocate($img2, 0, 0, 255);
    
    // Create circles with transparency
    for ($i = 0; $i < 10; $i++) {
        $x = rand(100, 1100);
        $y = rand(100, 700);
        $size = rand(50, 150);
        $color = ($i % 2) ? $red : $blue;
        imagefilledellipse($img2, $x, $y, $size, $size, $color);
    }
    
    imagestring($img2, 4, 50, 50, 'MEDIUM PNG - 1200x800', $red);
    
    $filename2 = $imagesPath . 'sample-medium.png';
    imagepng($img2, $filename2);
    $samples[] = [
        'filename' => 'sample-medium.png',
        'size' => '1200x800',
        'format' => 'PNG',
        'filesize' => number_format(filesize($filename2) / 1024, 1) . ' KB'
    ];
    imagedestroy($img2);
    
    // Sample 3: Small square image
    $img3 = imagecreatetruecolor(600, 600);
    $gradient = [];
    for ($i = 0; $i < 256; $i++) {
        $gradient[] = imagecolorallocate($img3, $i, 128, 255 - $i);
    }
    
    for ($y = 0; $y < 600; $y++) {
        for ($x = 0; $x < 600; $x++) {
            $colorIndex = min(255, floor(sqrt($x * $x + $y * $y) / 3));
            imagesetpixel($img3, $x, $y, $gradient[$colorIndex]);
        }
    }
    
    $black = imagecolorallocate($img3, 0, 0, 0);
    imagestring($img3, 4, 200, 290, 'SQUARE 600x600', $black);
    
    $filename3 = $imagesPath . 'sample-square.jpg';
    imagejpeg($img3, $filename3, 85);
    $samples[] = [
        'filename' => 'sample-square.jpg',
        'size' => '600x600',
        'format' => 'JPEG',
        'filesize' => number_format(filesize($filename3) / 1024, 1) . ' KB'
    ];
    imagedestroy($img3);
    
    // Sample 4: Wide banner
    $img4 = imagecreatetruecolor(1600, 400);
    $bg = imagecolorallocate($img4, 45, 45, 45);
    imagefill($img4, 0, 0, $bg);
    
    $colors = [
        imagecolorallocate($img4, 255, 87, 87),
        imagecolorallocate($img4, 87, 255, 87),
        imagecolorallocate($img4, 87, 87, 255),
        imagecolorallocate($img4, 255, 255, 87),
        imagecolorallocate($img4, 255, 87, 255),
        imagecolorallocate($img4, 87, 255, 255),
    ];
    
    // Create stripes
    for ($i = 0; $i < 8; $i++) {
        $color = $colors[$i % count($colors)];
        $x1 = $i * 200;
        $x2 = ($i + 1) * 200;
        imagefilledrectangle($img4, $x1, 0, $x2, 400, $color);
    }
    
    $white = imagecolorallocate($img4, 255, 255, 255);
    imagestring($img4, 5, 600, 180, 'WIDE BANNER - 1600x400', $white);
    
    $filename4 = $imagesPath . 'sample-banner.jpg';
    imagejpeg($img4, $filename4, 90);
    $samples[] = [
        'filename' => 'sample-banner.jpg',
        'size' => '1600x400',
        'format' => 'JPEG',
        'filesize' => number_format(filesize($filename4) / 1024, 1) . ' KB'
    ];
    imagedestroy($img4);
    
    // Sample 5: Tiny image for testing upscaling
    $img5 = imagecreatetruecolor(100, 100);
    $rainbow = [];
    for ($i = 0; $i < 100; $i++) {
        $hue = ($i / 100) * 360;
        $rgb = hslToRgb($hue, 1, 0.5);
        $rainbow[] = imagecolorallocate($img5, $rgb[0], $rgb[1], $rgb[2]);
    }
    
    for ($x = 0; $x < 100; $x++) {
        imageline($img5, $x, 0, $x, 100, $rainbow[$x]);
    }
    
    $filename5 = $imagesPath . 'sample-tiny.jpg';
    imagejpeg($img5, $filename5, 75);
    $samples[] = [
        'filename' => 'sample-tiny.jpg',
        'size' => '100x100',
        'format' => 'JPEG',
        'filesize' => number_format(filesize($filename5) / 1024, 1) . ' KB'
    ];
    imagedestroy($img5);
    
    echo json_encode([
        'success' => true,
        'message' => 'Sample images generated successfully',
        'samples' => $samples,
        'total_count' => count($samples),
        'images_path' => '/images/',
        'instructions' => [
            'Use these filenames in the API tester',
            'Try different resize dimensions',
            'Test various quality settings',
            'Compare original vs WebP output'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to generate samples: ' . $e->getMessage()
    ]);
}

function hslToRgb($h, $s, $l) {
    $h /= 360;
    
    if ($s == 0) {
        $r = $g = $b = $l;
    } else {
        $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
        $p = 2 * $l - $q;
        
        $r = hueToRgb($p, $q, $h + 1/3);
        $g = hueToRgb($p, $q, $h);
        $b = hueToRgb($p, $q, $h - 1/3);
    }
    
    return [round($r * 255), round($g * 255), round($b * 255)];
}

function hueToRgb($p, $q, $t) {
    if ($t < 0) $t += 1;
    if ($t > 1) $t -= 1;
    if ($t < 1/6) return $p + ($q - $p) * 6 * $t;
    if ($t < 1/2) return $q;
    if ($t < 2/3) return $p + ($q - $p) * (2/3 - $t) * 6;
    return $p;
}
?>