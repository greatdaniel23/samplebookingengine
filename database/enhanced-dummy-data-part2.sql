-- ===================================================================
-- ENHANCED DUMMY DATA PART 2
-- New Tables: Calendar, System Config, Platform Integrations, Analytics
-- ===================================================================

USE booking_engine;

-- ===================================================================
-- CALENDAR SETTINGS DATA
-- ===================================================================

INSERT IGNORE INTO calendar_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('sync_frequency_default', '15', 'integer', 'Default calendar sync frequency in minutes', 'calendar', TRUE),
('timezone_default', 'Asia/Makassar', 'string', 'Default timezone for calendar events', 'calendar', TRUE),
('ical_calendar_name', 'Villa Daisy Cantik Bookings', 'string', 'Default calendar name for iCal exports', 'calendar', TRUE),
('enable_webcal_protocol', 'true', 'boolean', 'Enable WebCal protocol for calendar subscriptions', 'calendar', TRUE),
('calendar_sync_enabled', 'true', 'boolean', 'Master switch for calendar synchronization', 'calendar', FALSE),
('export_guest_details', 'true', 'boolean', 'Include guest details in calendar exports', 'calendar', FALSE),
('event_duration_buffer', '30', 'integer', 'Buffer time in minutes for calendar events', 'calendar', TRUE),
('calendar_color_scheme', '{"confirmed": "#22c55e", "pending": "#f59e0b", "cancelled": "#ef4444", "checked_in": "#3b82f6", "checked_out": "#6b7280"}', 'json', 'Color scheme for different booking statuses', 'calendar', TRUE),
('max_export_days', '365', 'integer', 'Maximum days to export in calendar feeds', 'calendar', TRUE),
('calendar_update_interval', '3600', 'integer', 'Calendar cache update interval in seconds', 'calendar', FALSE),
('enable_platform_sync', 'true', 'boolean', 'Enable synchronization with external platforms', 'calendar', FALSE),
('default_event_visibility', 'private', 'string', 'Default visibility for calendar events', 'calendar', TRUE);

-- ===================================================================
-- CALENDAR SUBSCRIPTIONS DATA
-- ===================================================================

INSERT IGNORE INTO calendar_subscriptions (subscription_token, subscriber_email, subscriber_name, subscription_type, filter_status, filter_room_id, last_accessed, access_count, user_agent, ip_address, active) VALUES

('cal_sub_admin_main_12345', 'admin@villadaisycantik.com', 'System Administrator', 'ical', 'all', NULL, NOW() - INTERVAL 2 HOUR, 45, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100', TRUE),
('cal_sub_manager_67890', 'manager@villadaisycantik.com', 'Villa Manager - Kadek Sari', 'google', 'confirmed', NULL, NOW() - INTERVAL 1 DAY, 23, 'Google Calendar Sync Bot', '216.58.194.174', TRUE),
('cal_sub_frontdesk_11111', 'frontdesk@villadaisycantik.com', 'Front Desk - Wayan Bagus', 'outlook', 'all', NULL, NOW() - INTERVAL 3 HOUR, 67, 'Microsoft Outlook/16.0', '40.126.23.45', TRUE),
('cal_sub_airbnb_sync_22222', 'calendar-sync@airbnb.com', 'Airbnb Calendar Sync', 'airbnb', 'confirmed', NULL, NOW() - INTERVAL 15 MINUTE, 1440, 'Airbnb Calendar Bot/2.0', '199.232.76.2', TRUE),
('cal_sub_booking_com_33333', 'xml-sync@booking.com', 'Booking.com Integration', 'ical', 'confirmed', NULL, NOW() - INTERVAL 30 MINUTE, 720, 'Booking.com XML Sync/1.5', '185.40.4.194', TRUE),
('cal_sub_vrbo_44444', 'calendar@vrbo.com', 'VRBO Calendar Sync', 'vrbo', 'confirmed', NULL, NOW() - INTERVAL 2 HOUR, 360, 'VRBO Calendar Sync/1.2', '192.229.182.23', TRUE),
('cal_sub_google_personal_55555', 'villa.owner@gmail.com', 'Villa Owner Personal', 'google', 'all', NULL, NOW() - INTERVAL 4 HOUR, 89, 'Google Calendar Web', '108.177.14.102', TRUE),
('cal_sub_apple_mobile_66666', 'mobile@villadaisycantik.com', 'Mobile Manager Access', 'apple', 'confirmed', 'master-suite', NOW() - INTERVAL 6 HOUR, 156, 'Apple Calendar/iOS 17.0', '17.253.144.10', TRUE),
('cal_sub_housekeeping_77777', 'housekeeping@villadaisycantik.com', 'Housekeeping - Made Dewi', 'ical', 'confirmed', NULL, NOW() - INTERVAL 12 HOUR, 234, 'Calendar App/Android 13', '8.8.8.8', TRUE),
('cal_sub_finance_reports_88888', 'finance@villadaisycantik.com', 'Finance - Nyoman Agus', 'ical', 'all', NULL, NOW() - INTERVAL 1 DAY, 78, 'Excel Calendar Import/2022', '192.168.1.102', TRUE);

-- ===================================================================
-- SYSTEM CONFIGURATION DATA
-- ===================================================================

INSERT IGNORE INTO system_config (config_key, config_value, config_type, description, category, is_sensitive, environment) VALUES

-- General System Settings
('app_name', 'Villa Daisy Cantik Booking Engine', 'string', 'Application name', 'general', FALSE, 'all'),
('app_version', '2.0.0', 'string', 'Current application version', 'general', FALSE, 'all'),
('app_environment', 'development', 'string', 'Current environment', 'general', FALSE, 'development'),
('app_environment', 'production', 'string', 'Current environment', 'general', FALSE, 'production'),
('debug_mode', 'true', 'boolean', 'Enable debug mode', 'system', FALSE, 'development'),
('debug_mode', 'false', 'boolean', 'Disable debug mode', 'system', FALSE, 'production'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', 'system', FALSE, 'all'),
('timezone', 'Asia/Makassar', 'string', 'System timezone', 'general', FALSE, 'all'),
('default_language', 'en', 'string', 'Default system language', 'general', FALSE, 'all'),
('supported_languages', '["en", "id", "de", "fr", "es", "it", "ja", "ko", "zh"]', 'json', 'Supported languages', 'general', FALSE, 'all'),

-- Booking System Settings
('max_booking_advance_days', '365', 'integer', 'Maximum days in advance for bookings', 'booking', FALSE, 'all'),
('min_booking_advance_hours', '24', 'integer', 'Minimum hours in advance for bookings', 'booking', FALSE, 'all'),
('default_currency', 'USD', 'string', 'Default currency for prices', 'payment', FALSE, 'all'),
('supported_currencies', '["USD", "EUR", "IDR", "GBP", "AUD", "JPY", "CAD", "SGD"]', 'json', 'List of supported currencies', 'payment', FALSE, 'all'),
('currency_exchange_api', 'https://api.exchangerate-api.com/v4/latest/USD', 'string', 'Currency exchange API endpoint', 'payment', FALSE, 'all'),
('booking_confirmation_auto', 'true', 'boolean', 'Auto-confirm bookings', 'booking', FALSE, 'all'),
('overbooking_protection', 'true', 'boolean', 'Enable overbooking protection', 'booking', FALSE, 'all'),
('max_guests_per_booking', '10', 'integer', 'Maximum guests per booking', 'booking', FALSE, 'all'),

-- Payment Settings
('payment_methods_enabled', '["credit_card", "paypal", "stripe", "bank_transfer", "cash"]', 'json', 'Enabled payment methods', 'payment', FALSE, 'all'),
('stripe_publishable_key', 'pk_test_51H...', 'encrypted', 'Stripe publishable key', 'payment', TRUE, 'all'),
('stripe_secret_key', 'sk_test_51H...', 'encrypted', 'Stripe secret key', 'payment', TRUE, 'all'),
('paypal_client_id', 'AeA5...', 'encrypted', 'PayPal client ID', 'payment', TRUE, 'all'),
('payment_gateway_fees', '{"stripe": 2.9, "paypal": 3.4, "bank_transfer": 0}', 'json', 'Payment gateway fees percentage', 'payment', FALSE, 'all'),

-- Email & Notification Settings
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', 'notifications', FALSE, 'all'),
('smtp_host', 'smtp.gmail.com', 'string', 'SMTP server host', 'email', TRUE, 'all'),
('smtp_port', '587', 'integer', 'SMTP server port', 'email', FALSE, 'all'),
('smtp_username', 'noreply@villadaisycantik.com', 'string', 'SMTP username', 'email', TRUE, 'all'),
('smtp_password', 'encrypted_password_123', 'encrypted', 'SMTP password', 'email', TRUE, 'all'),
('from_email', 'noreply@villadaisycantik.com', 'string', 'Default from email address', 'email', FALSE, 'all'),
('from_name', 'Villa Daisy Cantik', 'string', 'Default from name', 'email', FALSE, 'all'),
('notification_templates', '{"confirmation": "booking_confirmed", "reminder": "booking_reminder", "cancellation": "booking_cancelled"}', 'json', 'Email template mappings', 'notifications', FALSE, 'all'),

-- API & Security Settings
('api_rate_limit_requests', '1000', 'integer', 'API rate limit requests per hour', 'api', FALSE, 'all'),
('api_rate_limit_burst', '100', 'integer', 'API burst rate limit', 'api', FALSE, 'all'),
('session_timeout_minutes', '30', 'integer', 'Admin session timeout in minutes', 'security', FALSE, 'all'),
('password_min_length', '8', 'integer', 'Minimum password length', 'security', FALSE, 'all'),
('login_max_attempts', '5', 'integer', 'Maximum login attempts before lockout', 'security', FALSE, 'all'),
('lockout_duration_minutes', '15', 'integer', 'Account lockout duration in minutes', 'security', FALSE, 'all'),
('jwt_secret', 'super_secret_key_change_in_production', 'encrypted', 'JWT secret key', 'security', TRUE, 'all'),
('encryption_key', 'aes_encryption_key_32_characters', 'encrypted', 'Data encryption key', 'security', TRUE, 'all'),

-- Backup & Maintenance
('backup_retention_days', '30', 'integer', 'Database backup retention period', 'backup', FALSE, 'all'),
('backup_frequency_hours', '24', 'integer', 'Backup frequency in hours', 'backup', FALSE, 'all'),
('log_retention_days', '90', 'integer', 'Log file retention period', 'logging', FALSE, 'all'),
('log_level', 'info', 'string', 'Application log level', 'logging', FALSE, 'development'),
('log_level', 'error', 'string', 'Application log level', 'logging', FALSE, 'production'),

-- Analytics & Reporting
('analytics_enabled', 'true', 'boolean', 'Enable analytics tracking', 'analytics', FALSE, 'all'),
('google_analytics_id', 'GA-XXXXXXXXX-X', 'string', 'Google Analytics tracking ID', 'analytics', FALSE, 'all'),
('facebook_pixel_id', '1234567890123456', 'string', 'Facebook Pixel ID', 'analytics', FALSE, 'all'),
('analytics_data_retention_days', '365', 'integer', 'Analytics data retention period', 'analytics', FALSE, 'all');

-- ===================================================================
-- PLATFORM INTEGRATIONS DATA
-- ===================================================================

INSERT IGNORE INTO platform_integrations (platform_name, platform_type, integration_key, api_endpoint, sync_frequency, last_sync_at, sync_status, sync_direction, config_data, mapping_rules, sync_stats, active) VALUES

('Airbnb', 'ota', 'airbnb_villa_daisy_cantik_001', 'https://api.airbnb.com/v2/', 'hourly', NOW() - INTERVAL 1 HOUR, 'active', 'bidirectional',
'{"property_id": "45678912", "host_id": "87654321", "calendar_sync": true, "pricing_sync": false, "availability_sync": true, "auto_accept": false}',
'{"room_mapping": {"master-suite": "room_1", "deluxe-suite": "room_2", "family-room": "room_3", "standard-room": "room_4", "economy-room": "room_5"}, "status_mapping": {"confirmed": "reserved", "cancelled": "available", "checked_in": "reserved"}}',
'{"last_sync_bookings": 15, "sync_success_rate": 98.5, "total_syncs": 2456, "errors_last_24h": 1}', TRUE),

('Booking.com', 'ota', 'booking_com_villa_daisy_001', 'https://distribution-xml.booking.com/2.6/', 'daily', NOW() - INTERVAL 6 HOUR, 'active', 'export',
'{"hotel_id": "1234567", "username": "villa_daisy_cantik", "password": "encrypted_booking_password", "channel_manager": true}',
'{"status_mapping": {"confirmed": "OK", "cancelled": "CANCELLED", "checked_in": "OK"}, "rate_mapping": {"USD": "USD", "EUR": "EUR"}}',
'{"bookings_exported": 8, "availability_updates": 145, "rate_updates": 32, "sync_success_rate": 99.2}', TRUE),

('Google Calendar', 'calendar', 'google_calendar_main_sync', 'https://www.googleapis.com/calendar/v3/', 'realtime', NOW() - INTERVAL 15 MINUTE, 'active', 'export',
'{"calendar_id": "primary", "client_id": "google_oauth_client_id", "client_secret": "encrypted_google_secret", "refresh_token": "encrypted_refresh_token", "access_token": "encrypted_access_token"}',
'{"event_mapping": {"title": "{{guest_name}} - {{room_name}}", "description": "Booking: {{booking_reference}}\\nGuests: {{guests}}\\nEmail: {{email}}", "location": "Villa Daisy Cantik, Ubud, Bali"}}',
'{"events_synced": 234, "sync_frequency_actual": "every_5_minutes", "last_error": null, "api_quota_used": 45}', TRUE),

('VRBO', 'ota', 'vrbo_villa_daisy_cantik_002', 'https://ws.homeaway.com/public/', 'daily', NOW() - INTERVAL 18 HOUR, 'paused', 'export',
'{"property_id": "9876543", "account_id": "1357911", "api_version": "2.0", "listing_id": "ha9876543"}',
'{"availability_mapping": {"available": "Y", "booked": "N", "blocked": "N"}, "price_mapping": {"base_rate": "nightly_rate"}}',
'{"last_sync_status": "paused_by_admin", "bookings_received": 3, "total_inquiries": 12, "conversion_rate": 25}', FALSE),

('Microsoft Outlook', 'calendar', 'outlook_calendar_integration', 'https://graph.microsoft.com/v1.0/', 'hourly', NOW() - INTERVAL 2 HOUR, 'active', 'export',
'{"tenant_id": "microsoft_tenant_id", "client_id": "outlook_client_id", "client_secret": "encrypted_outlook_secret", "user_id": "manager@villadaisycantik.com"}',
'{"calendar_name": "Villa Bookings", "event_privacy": "private", "reminder_minutes": 60, "all_day_events": true}',
'{"events_created": 89, "events_updated": 23, "sync_errors": 0, "last_successful_sync": "2025-11-11 10:30:00"}', TRUE),

('Stripe', 'payment', 'stripe_payment_integration', 'https://api.stripe.com/v1/', 'realtime', NOW() - INTERVAL 5 MINUTE, 'active', 'bidirectional',
'{"publishable_key": "pk_live_...", "secret_key": "encrypted_stripe_secret", "webhook_secret": "encrypted_webhook_secret", "account_id": "acct_stripe_account"}',
'{"currency_mapping": {"USD": "usd", "EUR": "eur", "GBP": "gbp"}, "payment_methods": ["card", "bank_transfer", "wallet"]}',
'{"transactions_processed": 1245, "total_volume_usd": 145670.50, "success_rate": 99.8, "refunds_processed": 12}', TRUE),

('PayPal', 'payment', 'paypal_payment_gateway', 'https://api.paypal.com/v2/', 'realtime', NOW() - INTERVAL 10 MINUTE, 'active', 'bidirectional',
'{"client_id": "paypal_client_id", "client_secret": "encrypted_paypal_secret", "environment": "live", "webhook_id": "webhook_id_123"}',
'{"currency_support": ["USD", "EUR", "GBP", "CAD", "AUD"], "payment_types": ["instant", "delayed"]}',
'{"payments_received": 234, "total_amount": 67890.25, "fees_paid": 2345.67, "disputes": 0}', TRUE),

('WhatsApp Business', 'communication', 'whatsapp_business_api', 'https://graph.facebook.com/v18.0/', 'manual', NOW() - INTERVAL 2 DAY, 'active', 'export',
'{"phone_number_id": "whatsapp_phone_id", "access_token": "encrypted_whatsapp_token", "business_id": "whatsapp_business_id"}',
'{"message_templates": {"booking_confirmation": "booking_confirmed_template", "reminder": "booking_reminder_template"}, "language": "en_US"}',
'{"messages_sent": 456, "delivery_rate": 97.8, "read_rate": 89.2, "response_rate": 45.6}', TRUE);

-- ===================================================================
-- PLATFORM SYNC HISTORY DATA
-- ===================================================================

INSERT IGNORE INTO platform_sync_history (integration_id, sync_type, direction, entity_type, entity_count, success_count, error_count, status, started_at, completed_at, sync_summary) VALUES

-- Airbnb sync history
(1, 'incremental', 'export', 'availability', 30, 30, 0, 'completed', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 55 MINUTE, '{"rooms_updated": 5, "dates_synced": 30, "blocked_dates": 8}'),
(1, 'incremental', 'import', 'booking', 2, 2, 0, 'completed', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 110 MINUTE, '{"new_bookings": 2, "booking_updates": 0, "cancellations": 0}'),
(1, 'full', 'export', 'property', 1, 1, 0, 'completed', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 23 HOUR, '{"property_details_updated": true, "photos_synced": 0, "amenities_updated": true}'),

-- Booking.com sync history
(2, 'daily', 'export', 'availability', 150, 148, 2, 'completed', NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 345 MINUTE, '{"availability_updates": 148, "rate_updates": 75, "errors": ["room_4_rate_missing", "invalid_date_format"]}'),
(2, 'incremental', 'import', 'booking', 1, 1, 0, 'completed', NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 475 MINUTE, '{"new_reservations": 1, "modifications": 0, "no_shows": 0}'),

-- Google Calendar sync history
(3, 'incremental', 'export', 'booking', 5, 5, 0, 'completed', NOW() - INTERVAL 15 MINUTE, NOW() - INTERVAL 10 MINUTE, '{"events_created": 2, "events_updated": 3, "events_deleted": 0}'),
(3, 'incremental', 'export', 'booking', 3, 3, 0, 'completed', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 55 MINUTE, '{"events_created": 1, "events_updated": 2, "calendar_conflicts_resolved": 0}'),

-- Payment platform sync history
(6, 'incremental', 'import', 'booking', 8, 8, 0, 'completed', NOW() - INTERVAL 5 MINUTE, NOW() - INTERVAL 2 MINUTE, '{"payments_processed": 8, "failed_payments": 0, "refunds": 1, "total_amount": 2345.67}'),
(7, 'incremental', 'import', 'booking', 3, 3, 0, 'completed', NOW() - INTERVAL 10 MINUTE, NOW() - INTERVAL 7 MINUTE, '{"payments_received": 3, "amount_usd": 1234.50, "fees": 123.45}');

-- ===================================================================
-- BOOKING NOTIFICATIONS DATA
-- ===================================================================

INSERT IGNORE INTO booking_notifications (booking_id, notification_type, recipient_email, recipient_name, subject, template_name, template_data, status, scheduled_at, sent_at, opened_at) VALUES

-- Confirmation notifications
(1, 'confirmation', 'emma.thompson@protonmail.com', 'Emma Thompson', 'Booking Confirmation - Villa Daisy Cantik (BK-000001)', 'booking_confirmation', '{"booking_reference": "BK-000001", "guest_name": "Emma Thompson", "room_name": "Deluxe Suite", "check_in": "2025-11-20", "check_out": "2025-11-23"}', 'sent', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 4 DAY),

(2, 'confirmation', 'h.mueller@gmail.com', 'Hans Mueller', 'Booking Confirmation - Villa Daisy Cantik (BK-000002)', 'booking_confirmation', '{"booking_reference": "BK-000002", "guest_name": "Hans Mueller", "room_name": "Master Suite", "check_in": "2025-11-22", "check_out": "2025-11-26"}', 'sent', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY),

-- Reminder notifications
(1, 'reminder', 'emma.thompson@protonmail.com', 'Emma Thompson', 'Check-in Reminder - Your Stay at Villa Daisy Cantik Tomorrow', 'booking_reminder', '{"booking_reference": "BK-000001", "guest_name": "Emma Thompson", "check_in_date": "2025-11-20", "check_in_time": "15:00"}', 'sent', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 18 HOUR),

(3, 'reminder', 'sarah.kim@outlook.com', 'Sarah Kim', 'Check-in Reminder - Your Family Stay at Villa Daisy Cantik', 'booking_reminder', '{"booking_reference": "BK-000003", "guest_name": "Sarah Kim", "check_in_date": "2025-11-25", "special_notes": "Family room prepared with child amenities"}', 'sent', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR, NULL),

-- Payment notifications
(7, 'payment', 'j.wilson@gmail.com', 'James Wilson', 'Payment Reminder - Villa Daisy Cantik Booking (BK-000007)', 'payment_reminder', '{"booking_reference": "BK-000007", "guest_name": "James Wilson", "amount_due": 2279.00, "due_date": "2025-12-01"}', 'sent', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY),

(15, 'payment', 'david.johnson@gmail.com', 'David Johnson', 'Payment Required - Villa Daisy Cantik Booking (BK-000015)', 'payment_required', '{"booking_reference": "BK-000015", "guest_name": "David Johnson", "total_amount": 255.00}', 'pending', NOW() + INTERVAL 2 HOUR, NULL, NULL),

-- Check-in notifications (for arrived guests)
(1, 'check_in', 'emma.thompson@protonmail.com', 'Emma Thompson', 'Welcome to Villa Daisy Cantik! Check-in Information', 'check_in_welcome', '{"booking_reference": "BK-000001", "room_number": "Suite 201", "wifi_password": "VillaDaisy2025", "breakfast_time": "07:00-10:00"}', 'sent', NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 7 HOUR),

-- Custom notifications
(8, 'custom', 'arossi@libero.it', 'Alessandro Rossi', 'Special Anniversary Arrangements Confirmed', 'custom_message', '{"guest_name": "Alessandro Rossi", "special_message": "We have arranged champagne, flowers, and a romantic dinner for your 10th anniversary celebration. The restaurant reservation is confirmed for 7:00 PM."}', 'sent', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 20 HOUR),

-- Pending notifications
(20, 'confirmation', 'g.ferrari@alice.it', 'Giovanni Ferrari', 'Booking Confirmation Pending Payment - Villa Daisy Cantik', 'confirmation_pending_payment', '{"booking_reference": "BK-000020", "guest_name": "Giovanni Ferrari", "payment_due_date": "2026-02-10"}', 'pending', NOW() + INTERVAL 1 DAY, NULL, NULL),

(27, 'confirmation', 'isabella.santos@gmail.com', 'Isabella Santos', 'Booking Confirmation - Villa Daisy Cantik (BK-000027)', 'booking_confirmation', '{"booking_reference": "BK-000027", "guest_name": "Isabella Santos", "room_name": "Deluxe Suite"}', 'pending', NOW() + INTERVAL 2 DAY, NULL, NULL);

-- ===================================================================
-- SAMPLE API ACCESS LOGS DATA
-- ===================================================================

INSERT IGNORE INTO api_access_logs (endpoint, method, ip_address, user_agent, response_status, response_time_ms, response_size_bytes, admin_user_id, created_at) VALUES

-- Recent API calls
('/api/rooms.php', 'GET', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 200, 45, 2340, 1, NOW() - INTERVAL 5 MINUTE),
('/api/bookings.php', 'GET', '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 200, 89, 15670, 2, NOW() - INTERVAL 10 MINUTE),
('/api/ical.php', 'GET', '216.58.194.174', 'Google Calendar Sync Bot', 200, 123, 8901, NULL, NOW() - INTERVAL 15 MINUTE),
('/api/villa.php', 'GET', '82.45.123.67', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 200, 67, 3456, NULL, NOW() - INTERVAL 20 MINUTE),
('/api/packages.php', 'GET', '199.232.76.2', 'Airbnb Calendar Bot/2.0', 200, 34, 1890, NULL, NOW() - INTERVAL 25 MINUTE),

-- Admin API calls
('/api/admin/auth.php', 'POST', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 200, 234, 567, 1, NOW() - INTERVAL 2 HOUR),
('/api/admin/dashboard.php', 'GET', '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 200, 156, 4567, 2, NOW() - INTERVAL 2 HOUR),
('/api/bookings.php', 'POST', '192.168.1.100', 'Admin Dashboard/2.0', 201, 345, 234, 1, NOW() - INTERVAL 3 HOUR),

-- External platform API calls
('/api/ical.php', 'GET', '185.40.4.194', 'Booking.com XML Sync/1.5', 200, 78, 6789, NULL, NOW() - INTERVAL 1 HOUR),
('/api/ical.php', 'GET', '192.229.182.23', 'VRBO Calendar Sync/1.2', 200, 56, 4321, NULL, NOW() - INTERVAL 2 HOUR),

-- Error logs
('/api/bookings.php', 'POST', '203.206.123.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 400, 23, 345, NULL, NOW() - INTERVAL 4 HOUR),
('/api/admin/auth.php', 'POST', '192.168.1.150', 'Mozilla/5.0 (X11; Linux x86_64)', 401, 12, 123, NULL, NOW() - INTERVAL 6 HOUR);

SELECT '=== ENHANCED DUMMY DATA COMPLETED ===' as status;
SELECT '=== ALL NEW TABLES POPULATED ===' as status;

-- Final verification
SELECT 'Calendar Settings:' as table_name, COUNT(*) as records FROM calendar_settings
UNION ALL
SELECT 'Calendar Subscriptions:', COUNT(*) FROM calendar_subscriptions
UNION ALL
SELECT 'System Config:', COUNT(*) FROM system_config
UNION ALL
SELECT 'Platform Integrations:', COUNT(*) FROM platform_integrations
UNION ALL
SELECT 'Sync History:', COUNT(*) FROM platform_sync_history
UNION ALL
SELECT 'Booking Notifications:', COUNT(*) FROM booking_notifications
UNION ALL
SELECT 'API Access Logs:', COUNT(*) FROM api_access_logs;