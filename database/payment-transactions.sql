-- Payment Transactions Table
-- Stores DOKU payment transaction records for audit and reconciliation

CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'doku',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_url TEXT,
    request_data TEXT COMMENT 'Original payment request data (JSON)',
    callback_data TEXT COMMENT 'DOKU callback payload (JSON)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add payment_status column to bookings table if it doesn't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending' 
COMMENT 'Payment status: pending, paid, failed';

-- Add index for payment_status
ALTER TABLE bookings ADD INDEX IF NOT EXISTS idx_payment_status (payment_status);
