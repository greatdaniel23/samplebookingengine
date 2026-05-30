-- Migration 0005 — add payment failure context columns to bookings
-- Date: 2026-05-25
-- Author: NEXUS (via MASON execution)
-- Purpose: enable GA4 purchase_failed event payload (error_code + error_message)
-- when user returns from DOKU after a non-SUCCESS transaction status.
--
-- Companion fix in src/workers/routes/payment.ts to handle FAILED / EXPIRED /
-- DECLINED / CANCELLED DOKU callbacks and write these columns.
--
-- SAFE TO RE-RUN: ALTER TABLE ... ADD COLUMN is idempotent in D1 only when
-- wrapped — D1 will throw "duplicate column name" on re-run. Recommended to
-- run once per database. If you need idempotency, check sqlite_master first.

ALTER TABLE bookings ADD COLUMN payment_error_code TEXT;
ALTER TABLE bookings ADD COLUMN payment_error_message TEXT;

-- No data backfill needed: existing rows leave the new columns NULL,
-- which is the desired "no error" state.
