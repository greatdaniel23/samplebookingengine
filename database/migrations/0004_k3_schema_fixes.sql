-- K3 Migration: Schema fixes (2026-05-19)
-- MASON K3 sprint — package_amenities.is_highlighted column

-- Add is_highlighted to package_amenities (used by FE to display "featured" amenities)
-- Uses column existence check pattern: safe on re-run if column already added
ALTER TABLE package_amenities ADD COLUMN is_highlighted INTEGER DEFAULT 0;
