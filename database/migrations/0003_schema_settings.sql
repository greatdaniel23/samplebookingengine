-- Migration 0003: schema_settings table
-- Authorization: Daniel 2026-05-19
-- Purpose: Per-property schema admin surface — Library > Schema in admin UI.
--          Each row is a route key ('_global', '/', '/stay', etc.) holding a
--          JSON blob of schema.org field overrides.  Middleware reads these
--          instead of the hardcoded PROPERTY_CONSTANTS (which remains as
--          last-resort fallback).
--
-- Idempotent: safe to re-run (CREATE TABLE IF NOT EXISTS + INSERT OR REPLACE).

CREATE TABLE IF NOT EXISTS schema_settings (
  route       TEXT    PRIMARY KEY,                    -- '_global' | '/' | '/stay' | etc.
  fields_json TEXT    NOT NULL DEFAULT '{}',          -- JSON blob of schema field overrides
  updated_at  INTEGER DEFAULT (unixepoch())
);

-- ── Seed rows (INSERT OR REPLACE → idempotent) ────────────────────────────────

-- _global: site-wide fields (used on every page as base layer)
INSERT OR REPLACE INTO schema_settings (route, fields_json) VALUES (
  '_global',
  json('{
    "brandName":        "Samudra",
    "legalName":        "Samudra Villa Uluwatu",
    "origin":           "https://villa.alphadigitalagency.id",
    "geoLatitude":      -8.829,
    "geoLongitude":     115.0879,
    "priceRange":       "$$$$",
    "addressStreet":    "Uluwatu, Pecatu",
    "addressLocality":  "Kuta Selatan",
    "addressRegion":    "Bali",
    "addressPostal":    "80361",
    "addressCountry":   "ID",
    "checkinTime":      "14:00",
    "checkoutTime":     "12:00",
    "phone":            "",
    "email":            "",
    "socialFacebook":   "",
    "socialInstagram":  "",
    "socialTwitter":    "",
    "primaryImage":     "",
    "languagesSpoken":  "en,id",
    "paymentAccepted":  "Cash,Credit Card,Bank Transfer",
    "restaurantName":           "Samudra Dining",
    "restaurantCuisine":        "Indonesian, Asian Fusion",
    "restaurantPriceRange":     "$$$$",
    "restaurantBreakfastOpen":  "07:00",
    "restaurantBreakfastClose": "10:30",
    "restaurantDinnerOpen":     "18:00",
    "restaurantDinnerClose":    "22:00",
    "spaName":          "Samudra Spa & Wellness",
    "spaOpen":          "10:00",
    "spaClose":         "20:00"
  }')
);

-- Per-route rows: empty overrides initially — middleware falls back to D1 entity
-- data (rooms, packages, homepage_settings) if route override fields are absent.

INSERT OR REPLACE INTO schema_settings (route, fields_json) VALUES ('/',             '{}');
INSERT OR REPLACE INTO schema_settings (route, fields_json) VALUES ('/stay',         '{}');
INSERT OR REPLACE INTO schema_settings (route, fields_json) VALUES ('/dine',         '{}');
INSERT OR REPLACE INTO schema_settings (route, fields_json) VALUES ('/spa',          '{}');
INSERT OR REPLACE INTO schema_settings (route, fields_json) VALUES ('/experiences',  '{}');
INSERT OR REPLACE INTO schema_settings (route, fields_json) VALUES ('/journal',      '{}');
INSERT OR REPLACE INTO schema_settings (route, fields_json) VALUES ('/reservations', '{}');
