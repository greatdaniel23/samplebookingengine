import { Env } from '../types';

export class Database {
  constructor(private db: D1Database) { }

  async query(sql: string, params?: any[]) {
    try {
      if (params) {
        return await this.db.prepare(sql).bind(...params).all();
      }
      return await this.db.prepare(sql).all();
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database error: ${error}`);
    }
  }

  async queryOne(sql: string, params?: any[]) {
    try {
      if (params) {
        return await this.db.prepare(sql).bind(...params).first();
      }
      return await this.db.prepare(sql).first();
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database error: ${error}`);
    }
  }

  async execute(sql: string, params?: any[]) {
    try {
      if (params) {
        return await this.db.prepare(sql).bind(...params).run();
      }
      return await this.db.prepare(sql).run();
    } catch (error) {
      console.error('Database execution error:', error);
      throw new Error(`Database error: ${error}`);
    }
  }

  // Booking queries
  async getBookings(limit = 50, offset = 0) {
    return this.query(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }

  async getBookingById(id: number) {
    return this.queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
  }

  async getBookingByReference(ref: string) {
    return this.queryOne('SELECT * FROM bookings WHERE booking_reference = ?', [ref]);
  }

  async createBooking(data: any) {
    return this.execute(
      `INSERT INTO bookings (
        booking_reference, room_id, package_id, first_name, last_name, email, phone,
        check_in, check_out, guests, adults, children, total_price, currency,
        special_requests, source, status, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', datetime('now'), datetime('now'))`,
      [
        data.booking_reference,
        data.room_id,
        data.package_id || null,
        data.first_name,
        data.last_name,
        data.email,
        data.phone || null,
        data.check_in,
        data.check_out,
        data.guests,
        data.adults || data.guests,
        data.children || 0,
        data.total_price,
        data.currency || 'IDR',
        data.special_requests || null,
        data.source || 'direct',
      ]
    );
  }

  async updateBookingStatus(id: number, status: string, paymentStatus?: string) {
    let query = 'UPDATE bookings SET status = ?, updated_at = datetime(\'now\')';
    const params: any[] = [status];

    if (paymentStatus) {
      query += ', payment_status = ?';
      params.push(paymentStatus);
    }

    query += ' WHERE id = ?';
    params.push(id);

    return this.execute(query, params);
  }

  async searchBookingsByDates(checkInBefore: string, checkOutAfter: string) {
    return this.query(
      `SELECT * FROM bookings 
       WHERE check_in <= ? AND check_out >= ? 
       ORDER BY check_in ASC`,
      [checkOutAfter, checkInBefore]
    );
  }

  // Amenity queries
  async getAmenities(active = true) {
    if (active) {
      return this.query(
        'SELECT * FROM amenities WHERE is_active = 1 ORDER BY display_order ASC'
      );
    }
    return this.query('SELECT * FROM amenities ORDER BY display_order ASC');
  }

  async getAmenitiesByCategory(category: string) {
    return this.query(
      'SELECT * FROM amenities WHERE category = ? AND is_active = 1 ORDER BY display_order ASC',
      [category]
    );
  }

  async getFeaturedAmenities() {
    return this.query(
      'SELECT * FROM amenities WHERE is_featured = 1 AND is_active = 1 ORDER BY display_order ASC'
    );
  }

  async getAmenityById(id: number) {
    return this.queryOne('SELECT * FROM amenities WHERE id = ?', [id]);
  }

  // User/Admin queries
  async getUserByUsername(username: string) {
    return this.queryOne(
      'SELECT * FROM users WHERE username = ? AND active = 1',
      [username]
    );
  }

  async getUserById(id: number) {
    return this.queryOne(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [id]
    );
  }

  // Analytics queries
  async logApiCall(endpoint: string, method: string, ipAddress?: string, responseStatus?: number) {
    return this.execute(
      `INSERT INTO api_logs (endpoint, method, ip_address, response_status, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [endpoint, method, ipAddress || null, responseStatus || null]
    );
  }

  async recordAnalytics(date: string, roomId: string, bookingsCount: number, revenue: number, guests: number) {
    return this.execute(
      `INSERT OR REPLACE INTO daily_analytics (date, room_id, bookings_count, revenue, guests_count, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [date, roomId, bookingsCount, revenue, guests]
    );
  }

  // Settings queries
  async getSetting(key: string) {
    return this.queryOne(
      'SELECT * FROM settings WHERE setting_key = ?',
      [key]
    );
  }

  async getSettings(category?: string) {
    if (category) {
      return this.query(
        'SELECT * FROM settings WHERE category = ?',
        [category]
      );
    }
    return this.query('SELECT * FROM settings');
  }
}

export function createDatabase(env: Env): Database {
  return new Database(env.DB);
}
