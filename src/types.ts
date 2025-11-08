export interface Room {
  id: string;
  name: string;
  price: string; // API returns price as string
  image_url: string; // API uses image_url, not image
  description: string;
  size: string;
  beds: string;
  occupancy: number;
  features: string; // API returns features as JSON string
  // Additional fields from API
  available?: number;
  type?: string | null;
  capacity?: number;
  amenities?: string | null;
  images?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Amenity {
  name: string;
  icon: string;
}

export interface Villa {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  images: string[];
  amenities: Amenity[];
  rooms: Room[];
}

// Dynamic Booking & User Types
export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Booking {
  id: number; // internal numeric id
  reference: string; // human-readable BK-XXXX
  roomId: string;
  from: string; // ISO date
  to: string; // ISO date
  guests: number;
  user: GuestInfo;
  total: number;
  createdAt: string; // ISO timestamp
}

export interface BookingContextValue {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  getBookingsForRoom: (roomId: string) => Booking[];
  clearAllBookings: () => void;
}

// Package Types
export interface PackageRoomOption {
  name: string;
  price_override: number | null;
  priority: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  package_type: 'romantic' | 'business' | 'family' | 'luxury' | 'weekend' | 'holiday' | 'spa' | 'adventure';
  base_price: string; // API returns as string
  discount_percentage: string; // API returns as string
  min_nights: number;
  max_nights: number;
  valid_from: string; // Date string
  valid_until: string; // Date string
  is_active: number; // API returns as number (0/1)
  max_guests: number;
  includes: string[]; // Array of included services
  terms: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  room_options: PackageRoomOption[];
  discount_display: string; // e.g., "25.00% OFF"
  validity_period: string; // e.g., "Nov 1, 2025 - Dec 31, 2026"
}

export interface PackagePricing {
  room_price_per_night: number;
  room_total: number;
  package_fee: number;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  final_price: number;
  savings: number;
  nights: number;
}

export interface PackageBooking extends Booking {
  package_id?: string;
  package_name?: string;
  package_pricing?: PackagePricing;
  original_price?: number;
  package_discount?: number;
}