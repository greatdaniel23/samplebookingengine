-- Migration: Create Payment Transactions Table
-- For DOKU Payment Gateway Integration
-- Run this SQL in Cloudflare D1 Dashboard

CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  payment_method TEXT DEFAULT 'doku',
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT CHECK(status IN ('pending', 'paid', 'failed', 'expired', 'refunded')) DEFAULT 'pending',
  transaction_id TEXT,
  payment_url TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  request_data TEXT,
  callback_data TEXT,
  paid_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_booking_ref ON payment_transactions(booking_reference);
CREATE INDEX IF NOT EXISTS idx_payment_invoice ON payment_transactions(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_transactions(status);
