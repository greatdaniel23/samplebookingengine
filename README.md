# Booking Engine Frontend

This is the React + Vite frontend for a simple room booking engine. It is designed to work with a PHP API served via XAMPP (Apache + MySQL) on Windows.

## 1. Prerequisites

| Tool | Purpose |
|------|---------|
| XAMPP (Apache + MySQL) | Serves PHP API + database |
| Node.js / pnpm | Runs the frontend dev server |
| PowerShell (Win) | Terminal environment |

## 2. Folder Layout (Frontend)

```
frontend-booking-engine/
	src/
	public/
	package.json
	vite.config.ts
```

PHP backend (example) lives parallel or inside an `api/` folder served by Apache:

```
htdocs/
	fontend-bookingengine-100/
		frontend-booking-engine/ (this project)
		api/ (your PHP endpoints: index.php, bookings.php, etc.)
```

## 3. Environment Variables

Create a `.env` (or `.env.local`) in the project root to override defaults:

```
VITE_API_BASE=http://localhost/fontend-bookingengine-100/frontend-booking-engine/api
VITE_PUBLIC_BASE=/fontend-bookingengine-100/frontend-booking-engine/
VITE_ADMIN_BASE=/admin
```

Restart the dev server after changes.

## 4. Starting XAMPP Services

1. Open XAMPP Control Panel.
2. Start Apache and MySQL.
3. Verify Apache: visit `http://localhost/`.
4. Verify MySQL: click Admin (phpMyAdmin) or visit `http://localhost/phpmyadmin/`.

## 5. Create Database & Tables

In phpMyAdmin run the SQL below (adjust names as needed):

```sql
CREATE DATABASE IF NOT EXISTS booking_engine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_engine;

CREATE TABLE IF NOT EXISTS rooms (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	price DECIMAL(10,2) NOT NULL,
	occupancy INT NOT NULL DEFAULT 1,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
	id INT AUTO_INCREMENT PRIMARY KEY,
	room_id INT NOT NULL,
	first_name VARCHAR(80) NOT NULL,
	last_name VARCHAR(80) NOT NULL,
	email VARCHAR(120) NOT NULL,
	phone VARCHAR(30) NOT NULL,
	special_requests TEXT NULL,
	check_in DATE NOT NULL,
	check_out DATE NOT NULL,
	guests INT NOT NULL DEFAULT 1,
	total_price DECIMAL(10,2) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
	INDEX (email), INDEX (check_in), INDEX (check_out)
);
```

## 6. Minimal PHP API (Example)

`api/index.php` (router skeleton):
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
// Expected: fontend-bookingengine-100/frontend-booking-engine/api/...
$segments = explode('/', $uri);
$last = end($segments);

require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/endpoints/bookings.php';

switch ($last) {
	case 'bookings':
		handleBookings();
		break;
	default:
		http_response_code(404);
		echo json_encode(['error' => 'Not found']);
}
```

`api/lib/db.php`:
```php
<?php
function db() {
	static $pdo = null;
	if ($pdo) return $pdo;
	$pdo = new PDO('mysql:host=localhost;dbname=booking_engine;charset=utf8mb4','root','',[
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
	]);
	return $pdo;
}
```

`api/endpoints/bookings.php`:
```php
<?php
function handleBookings() {
	$method = $_SERVER['REQUEST_METHOD'];
	if ($method === 'GET') {
		$stmt = db()->query('SELECT * FROM bookings ORDER BY id DESC');
		echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
		return;
	}
	if ($method === 'POST') {
		$body = json_decode(file_get_contents('php://input'), true);
		$sql = 'INSERT INTO bookings (room_id, first_name, last_name, email, phone, special_requests, check_in, check_out, guests, total_price)
						VALUES (?,?,?,?,?,?,?,?,?,?)';
		$stmt = db()->prepare($sql);
		$stmt->execute([
			$body['room_id'], $body['first_name'], $body['last_name'], $body['email'], $body['phone'],
			$body['special_requests'] ?? null, $body['check_in'], $body['check_out'], $body['guests'], $body['total_price']
		]);
		echo json_encode(['id' => db()->lastInsertId()]);
		return;
	}
	http_response_code(405);
	echo json_encode(['error' => 'Method not allowed']);
}
```

## 7. Frontend Configuration

- Central path config: `src/config/paths.ts` provides `paths.api.bookings` etc.
- Replace any hard-coded fetch URLs with imports from that file.

Example React fetch:
```ts
import { paths } from '@/config/paths';
async function loadBookings() {
	const res = await fetch(paths.api.bookings);
	return res.json();
}
```

## 8. Running Frontend

```powershell
pnpm install
pnpm dev
```

If port 5173 is busy, Vite will pick the next free one—watch terminal output. Ensure API_BASE matches the served Apache path.

## 9. Testing API Connectivity (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/bookings" -Method GET | Select-Object StatusCode
curl http://localhost/fontend-bookingengine-100/frontend-booking-engine/api/bookings
```

## 10. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on /api/bookings | Wrong base path | Confirm folder path + API_BASE env variable |
| CORS blocked | Missing headers | Add CORS headers in `index.php` (shown above) |
| Empty results | No data | Insert sample rows in `rooms` & create bookings |
| Wrong total price | Mismatch calculation | Ensure frontend price formula matches backend stored value |

## 11. Sample Insert Data

```sql
INSERT INTO rooms (name, price, occupancy) VALUES
('Deluxe Suite', 150.00, 4),
('Standard Room', 80.00, 2),
('Family Room', 120.00, 5);
```

## 12. Next Steps

- Add authentication for admin panel.
- Add endpoint `/rooms` and integrate room listing.
- Add validation & error responses standard (JSON shape).
- Implement pagination for bookings.

---
This README section was generated to help you run locally with XAMPP. Adjust anything as your backend evolves.
