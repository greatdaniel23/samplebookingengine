import { Env } from '../types';

export async function handleGoogleHotelFeed(url: URL, method: string, env: Env): Promise<Response> {
  if (method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 1. Fetch Data
    const [packagesResult, roomsResult, packageRoomsResult, bookingsResult] = await Promise.all([
      env.DB.prepare('SELECT * FROM packages WHERE is_active = 1').all(),
      env.DB.prepare('SELECT * FROM rooms WHERE is_active = 1').all(),
      env.DB.prepare('SELECT * FROM package_rooms WHERE is_active = 1').all(),
      env.DB.prepare(`
        SELECT room_id, check_in, check_out
        FROM bookings
        WHERE status IN ('confirmed', 'pending', 'checked_in')
        AND check_out > DATE('now')
        AND check_in < DATE('now', '+30 days')
      `).all()
    ]);

    const packages = packagesResult.results as any[];
    const rooms = roomsResult.results as any[];
    const packageRooms = packageRoomsResult.results as any[];
    const bookings = bookingsResult.results as any[];

    // 2. Build Maps
    const roomsMap = new Map(rooms.map(r => [r.id, r]));
    const bookingsMap = new Map<string, Set<string>>(); // date -> Set<room_id>

    // Populate bookings map
    bookings.forEach(booking => {
      const start = new Date(booking.check_in);
      const end = new Date(booking.check_out);
      const roomId = String(booking.room_id);

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!bookingsMap.has(dateStr)) {
          bookingsMap.set(dateStr, new Set());
        }
        bookingsMap.get(dateStr)!.add(roomId);
      }
    });

    // 3. Generate XML
    const timestamp = new Date().toISOString();
    const transactionId = Date.now().toString();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Transaction timestamp="${timestamp}" id="${transactionId}">
`;

    // 4. Iterate Days (Next 30 days)
    const today = new Date();
    const daysToGenerate = 30;

    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // For each package
      for (const pkg of packages) {
        // Check package validity
        if (pkg.valid_from && dateStr < pkg.valid_from) continue;
        if (pkg.valid_until && dateStr > pkg.valid_until) continue;

        // Find applicable rooms
        // A package can be linked to multiple rooms via package_rooms
        // Or fallback to base_room_id if no package_rooms entries?
        // Logic: if package_rooms has entries for this package, use them. Else use base_room_id.

        let applicableRooms: any[] = packageRooms.filter(pr => pr.package_id === pkg.id);

        if (applicableRooms.length === 0 && pkg.base_room_id) {
            // Create a virtual relationship for the base room
            applicableRooms = [{
                room_id: pkg.base_room_id,
                price_adjustment: 0,
                adjustment_type: 'fixed'
            }];
        }

        for (const pr of applicableRooms) {
          const roomId = pr.room_id;
          const room = roomsMap.get(roomId);
          if (!room) continue;

          // Check availability
          const bookedRooms = bookingsMap.get(dateStr);
          if (bookedRooms && bookedRooms.has(String(roomId))) {
            continue; // Room is booked
          }

          // Calculate Price
          const basePrice = Number(pkg.base_price || 0);
          let finalPrice = basePrice;
          const adjustment = Number(pr.price_adjustment || 0);

          if (pr.adjustment_type === 'percentage') {
             finalPrice = basePrice * (1 + adjustment / 100);
          } else {
             finalPrice = basePrice + adjustment;
          }

          // Apply Discount
          if (pkg.discount_percentage) {
              finalPrice = finalPrice * (1 - Number(pkg.discount_percentage) / 100);
          }

          const nights = pkg.min_nights || 1;

          xml += `  <Result>
    <Property>1</Property>
    <RoomID>${roomId}</RoomID>
    <RatePlanID>${pkg.id}</RatePlanID>
    <Checkin>${dateStr}</Checkin>
    <Nights>${nights}</Nights>
    <Baserate currency="IDR">${finalPrice.toFixed(2)}</Baserate>
    <Tax currency="IDR">0.00</Tax>
    <OtherFees currency="IDR">0.00</OtherFees>
  </Result>
`;
        }
      }
    }

    xml += `</Transaction>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error: any) {
    console.error('Feed generation error:', error);
    return new Response(`Error generating feed: ${error.message}`, { status: 500 });
  }
}
