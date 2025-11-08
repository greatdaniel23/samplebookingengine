<?php
// Initialize villa database with default data
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // First, let's see if we have data
    $checkQuery = "SELECT COUNT(*) as count FROM villa_info WHERE id = 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute();
    $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] == 0) {
        // Insert default data
        $insertQuery = "INSERT INTO villa_info (
            id, name, location, description, rating, reviews, images, amenities,
            phone, email, website, address, city, state, zip_code, country,
            check_in_time, check_out_time, max_guests, bedrooms, bathrooms,
            price_per_night, currency, cancellation_policy, house_rules, social_media
        ) VALUES (
            1, 
            'Rumah Daisy Cantik',
            'Bali, Indonesia',
            'Step inside and feel the homey atmosphere instantly welcome you. Our interior is tastefully styled, combining modern comforts with instagrammable aesthetics.',
            4.9,
            128,
            ?,
            ?,
            '+62 361 123 4567',
            'info@rumahdaisycantik.com',
            'www.rumahdaisycantik.com',
            'Jl. Raya Ubud No. 123',
            'Ubud',
            'Bali',
            '80571',
            'Indonesia',
            '15:00',
            '11:00',
            8,
            4,
            3,
            750000.00,
            'IDR',
            'Free cancellation up to 48 hours before check-in. 50% refund for cancellations within 48 hours.',
            'No smoking • No pets • No parties or events • Check-in after 3:00 PM • Quiet hours 10:00 PM - 8:00 AM',
            ?
        )";
        
        $images = json_encode([
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1613977257363-3116958f136b?q=80&w=2670&auto=format&fit=crop"
        ]);
        
        $amenities = json_encode([
            ["name" => "High-speed Wifi", "icon" => "📶"],
            ["name" => "Private Pool", "icon" => "🏊‍♀️"],
            ["name" => "Garden View", "icon" => "🌿"],
            ["name" => "Fully Equipped Kitchen", "icon" => "🍳"],
            ["name" => "Free Parking", "icon" => "🚗"],
            ["name" => "Air Conditioning", "icon" => "❄️"]
        ]);
        
        $socialMedia = json_encode([
            "facebook" => "https://facebook.com/rumahdaisycantik",
            "instagram" => "https://instagram.com/rumahdaisycantik",
            "twitter" => "https://twitter.com/rumahdaisy"
        ]);
        
        $stmt = $db->prepare($insertQuery);
        $stmt->execute([$images, $amenities, $socialMedia]);
        
        echo json_encode(["success" => true, "message" => "Default villa data inserted successfully"]);
    } else {
        // Update existing data to have proper address information
        $updateQuery = "UPDATE villa_info SET 
            location = 'Ubud, Bali, Indonesia',
            phone = '+62 361 123 4567',
            email = 'info@rumahdaisycantik.com',
            website = 'www.rumahdaisycantik.com',
            address = 'Jl. Raya Ubud No. 123',
            city = 'Ubud',
            state = 'Bali',
            zip_code = '80571',
            country = 'Indonesia',
            currency = 'IDR',
            price_per_night = 750000.00,
            social_media = ?
            WHERE id = 1";
            
        $socialMedia = json_encode([
            "facebook" => "https://facebook.com/rumahdaisycantik",
            "instagram" => "https://instagram.com/rumahdaisycantik", 
            "twitter" => "https://twitter.com/rumahdaisy"
        ]);
        
        $stmt = $db->prepare($updateQuery);
        $stmt->execute([$socialMedia]);
        
        echo json_encode(["success" => true, "message" => "Villa data updated with address information"]);
    }
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>