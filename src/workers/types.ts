export interface Env {
  DB: D1Database;
  IMAGES: R2Bucket;
  SESSIONS: KVNamespace;
  CACHE: KVNamespace;
  JWT_SECRET?: string;
  ACCOUNT_ID?: string;
  ENVIRONMENT?: string;
  RESEND_API_KEY?: string;
  ADMIN_EMAIL?: string;
  VILLA_NAME?: string;
  FROM_EMAIL?: string;
  // DOKU Payment Gateway
  DOKU_CLIENT_ID?: string;
  DOKU_SECRET_KEY?: string;
  DOKU_ENVIRONMENT?: string; // 'sandbox' or 'production'
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user' | 'guest';
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  room_id: string;
  package_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  check_in: string;
  check_out: string;
  guests: number;
  adults: number;
  children: number;
  total_price: number;
  paid_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_featured: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  userId: number;
  username: string;
  exp: number;
  iat: number;
}
