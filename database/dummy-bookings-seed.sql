-- Dummy bookings for samudra-booking-db
-- 15 entries: 6 past (completed/cancelled), 4 current/near-future, 5 future
-- room_id values: 1=Ocean Suite, 2=Pool Suite, 3=Garden Pavilion, 4=Cliff Villa, 5=The Cliff House
-- All guest names and emails are fictional demo data

-- PAST BOOKINGS (2026-02 to 2026-04, status completed or cancelled)

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0201', '1', 'James', 'Hartley', 'james.hartley@email.com', '+44 7700 900142', '2026-02-08', '2026-02-12', 2, 2, 0, 7360.00, 7360.00, 'USD', 'Anniversary setup requested — flower petals and champagne on arrival', 'checked_out', 'paid', 'credit_card', 'direct', '2026-01-15 10:22:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0202', '2', 'Sophie', 'Beaumont', 'sophie.beaumont@email.fr', '+33 6 12 34 56 78', '2026-02-14', '2026-02-17', 2, 2, 0, 7920.00, 7920.00, 'USD', 'Valentine stay — early check-in requested', 'checked_out', 'paid', 'bank_transfer', 'direct', '2026-01-28 14:45:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0203', '4', 'Budi', 'Santoso', 'budi.santoso@email.id', '+62 812 3456 7890', '2026-02-20', '2026-02-25', 4, 2, 2, 26000.00, 26000.00, 'USD', 'Family of 4, 2 children. Child beds needed. Prefer high floor if possible.', 'checked_out', 'paid', 'credit_card', 'direct', '2026-02-01 09:10:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0204', '3', 'Elena', 'Vasquez', 'elena.vasquez@email.mx', '+52 55 1234 5678', '2026-03-05', '2026-03-09', 2, 2, 0, 8480.00, 8480.00, 'USD', 'Solo traveler extending from conference. Quiet workspace needed.', 'checked_out', 'paid', 'credit_card', 'direct', '2026-02-15 16:30:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0205', '5', 'Marcus', 'Tan', 'marcus.tan@horizon-group.co', '+65 9123 4567', '2026-03-18', '2026-03-22', 6, 6, 0, 59200.00, 59200.00, 'USD', 'Executive retreat — AV projector setup required in main pavilion. Dietary: 2 vegetarian.', 'checked_out', 'paid', 'bank_transfer', 'direct', '2026-02-20 11:00:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0206', '1', 'Yuki', 'Tanaka', 'yuki.tanaka@email.jp', '+81 90 1234 5678', '2026-04-10', '2026-04-12', 2, 2, 0, 3680.00, 0.00, 'USD', 'Cancelled by guest — flight change.', 'cancelled', 'refunded', 'credit_card', 'direct', '2026-03-22 08:15:00');

-- CURRENT / NEAR-FUTURE BOOKINGS (next 30 days from 2026-05-17)

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0207', '2', 'Aditya', 'Prabowo', 'aditya.prabowo@email.id', '+62 878 5678 9012', '2026-05-18', '2026-05-22', 2, 2, 0, 10560.00, 10560.00, 'USD', 'Arriving SQ947 at 13:45. Transfer arranged.', 'confirmed', 'paid', 'credit_card', 'direct', '2026-05-01 10:30:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0208', '3', 'Clara', 'Hoffmann', 'clara.hoffmann@email.de', '+49 171 234 5678', '2026-05-22', '2026-05-26', 2, 2, 0, 8480.00, 4240.00, 'USD', 'Writer retreat. Prefer minimal housekeeping interruptions before noon.', 'confirmed', 'pending', 'bank_transfer', 'direct', '2026-05-07 14:20:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0209', '4', 'Liang', 'Wei', 'liang.wei@email.sg', '+65 8765 4321', '2026-05-28', '2026-06-02', 4, 2, 2, 26000.00, 13000.00, 'USD', 'Family of 4. Children ages 7 and 10. Pool flotation aids requested.', 'confirmed', 'pending', 'credit_card', 'direct', '2026-05-10 09:45:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0210', '1', 'Priya', 'Mehta', 'priya.mehta@email.in', '+91 98765 43210', '2026-06-03', '2026-06-06', 2, 2, 0, 5520.00, 5520.00, 'USD', 'Honeymoon booking. First visit to Bali.', 'confirmed', 'paid', 'credit_card', 'direct', '2026-05-14 17:00:00');

-- FUTURE BOOKINGS (1 to 6 months out)

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0211', '4', 'Catherine', 'Lim', 'catherine.lim@email.sg', '+65 9012 3456', '2026-08-12', '2026-08-16', 2, 2, 0, 20800.00, 10400.00, 'USD', 'Returning guest. Cliff Terrace dinner reservation and morning cooking class preferred.', 'confirmed', 'pending', 'bank_transfer', 'direct', '2026-05-16 10:15:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0212', '2', 'Thomas', 'Whitfield', 'thomas.whitfield@email.au', '+61 412 345 678', '2026-07-04', '2026-07-08', 2, 2, 0, 10560.00, 10560.00, 'USD', null, 'confirmed', 'paid', 'credit_card', 'direct', '2026-05-02 08:30:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0213', '1', 'Nurul', 'Aisyah', 'nurul.aisyah@email.my', '+60 17 234 5678', '2026-07-20', '2026-07-23', 2, 2, 0, 5520.00, 2760.00, 'USD', 'Halal breakfast required.', 'confirmed', 'pending', 'credit_card', 'direct', '2026-05-09 12:00:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0214', '5', 'Roberto', 'Ferretti', 'roberto.ferretti@email.it', '+39 333 123 4567', '2026-09-08', '2026-09-13', 3, 3, 0, 74000.00, 37000.00, 'USD', 'Private celebration. Full buyout. Sommelier pairing dinner on last night.', 'confirmed', 'pending', 'bank_transfer', 'direct', '2026-05-11 15:45:00');

INSERT INTO bookings (booking_reference, room_id, first_name, last_name, email, phone, check_in, check_out, guests, adults, children, total_price, paid_amount, currency, special_requests, status, payment_status, payment_method, source, created_at)
VALUES ('SMD-2026-0215', '3', 'Sakura', 'Nakamura', 'sakura.nakamura@email.jp', '+81 80 9876 5432', '2026-10-01', '2026-10-05', 2, 2, 0, 8480.00, 8480.00, 'USD', 'Vegetarian meals preferred. Early check-in at 10:00 if available.', 'confirmed', 'paid', 'credit_card', 'direct', '2026-05-13 09:20:00');
