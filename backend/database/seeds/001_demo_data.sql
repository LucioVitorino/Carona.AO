INSERT INTO users (name, email, password, role, phone, status)
VALUES
  ('Admin CaronaAO', 'admin@caronaao.local', '$2y$10$r2wt70IZfoHX6km6ei6JXe2I.sq267pX3Z0omJ/DstfcL.tIkRt/m', 'admin', '+244900000001', 'active'),
  ('Motorista Demo', 'driver@caronaao.local', '$2y$10$r2wt70IZfoHX6km6ei6JXe2I.sq267pX3Z0omJ/DstfcL.tIkRt/m', 'driver', '+244900000002', 'active'),
  ('Passageiro Demo', 'passenger@caronaao.local', '$2y$10$r2wt70IZfoHX6km6ei6JXe2I.sq267pX3Z0omJ/DstfcL.tIkRt/m', 'passenger', '+244900000003', 'active');

-- Demo data is intended for development only. Re-running this seed file may duplicate rows if the database already contains data.

INSERT INTO vehicles (driver_id, brand, model, plate, color, seats, status)
VALUES
  (2, 'Toyota', 'Hiace', 'LD-00-AA-00', 'Branco', 14, 'active');

INSERT INTO rides (driver_id, vehicle_id, origin_address, origin_lat, origin_lng, destination_address, destination_lat, destination_lng, departure_time, price, available_seats, notes, status)
VALUES
  (2, 1, 'Talatona, Luanda', -8.9145000, 13.1867000, 'Maianga, Luanda', -8.8150000, 13.2360000, '2026-05-24 07:30:00', 500.00, 3, 'Carona de demonstração', 'scheduled');

INSERT INTO reservations (ride_id, passenger_id, seats, status)
VALUES
  (1, 3, 1, 'confirmed');

INSERT INTO locations (user_id, ride_id, latitude, longitude, accuracy, heading, speed, is_active)
VALUES
  (2, 1, -8.9145000, 13.1867000, 10.00, 0.00, 0.00, 1);
