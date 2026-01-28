-- Seed Admin User (Password: admin123)
INSERT INTO users (username, password_hash, email, role, active, created_at, updated_at)
VALUES (
  'admin',
  'e30cdf332ddfddd9e893a706ae4384e8:c2d1a0264b9f065de335124f347d4eb291d8aa434799c2816096d94ceb791c12',
  'admin@example.com',
  'admin',
  1,
  datetime('now'),
  datetime('now')
)
ON CONFLICT(username) DO UPDATE SET
  password_hash = excluded.password_hash,
  updated_at = datetime('now');
