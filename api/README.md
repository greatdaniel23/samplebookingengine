# API Endpoints

## Base URL
```
http://localhost:8080/api/
```

## Endpoints

### Rooms
- `GET /rooms` - Get all available rooms
- `GET /rooms/{id}` - Get specific room by ID

### Bookings
- `GET /bookings` - Get all bookings
- `GET /bookings/{id}` - Get specific booking by ID
- `POST /bookings` - Create new booking
- `GET /bookings?action=availability&room_id={id}&check_in={date}&check_out={date}` - Check availability

### Test
- `GET /test` - Test API connectivity

## Example Usage

### Create Booking
```javascript
const bookingData = {
  roomId: 'villa-deluxe',
  from: '2025-11-10',
  to: '2025-11-12',
  guests: 2,
  user: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  total: 299.99
};

fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(bookingData)
});
```