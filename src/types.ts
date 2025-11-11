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
  type?: string; // Enhanced database uses 'type' field
  package_type?: 'romantic' | 'business' | 'family' | 'luxury' | 'weekend' | 'holiday' | 'spa' | 'adventure';
  price: string; // Enhanced database uses 'price' instead of 'base_price'
  base_price?: string; // Legacy field - API returns as string
  discount_percentage?: string; // API returns as string
  duration_days?: number; // Enhanced database field
  min_nights?: number;
  max_nights?: number;
  valid_from: string; // Date string
  valid_until: string; // Date string
  available?: number; // Enhanced database uses 'available' instead of 'is_active'
  is_active?: number; // Legacy field - API returns as number (0/1)
  max_guests: number;
  inclusions?: string[]; // Enhanced database field - Array of included services
  includes?: string[]; // Legacy field for backward compatibility
  exclusions?: string[]; // Enhanced database field - Array of excluded services
  terms_conditions?: string; // Enhanced database field
  terms?: string; // Legacy field
  images?: string[]; // Enhanced database field - Array of image URLs
  image_url?: string; // Legacy field
  booking_advance_days?: number; // Enhanced database field
  cancellation_policy?: string; // Enhanced database field
  seo_title?: string; // Enhanced database field
  seo_description?: string; // Enhanced database field
  sort_order?: number; // Enhanced database field
  created_at: string;
  updated_at: string;
  room_options?: PackageRoomOption[]; // Can be undefined
  discount_display?: string; // e.g., "25.00% OFF" - optional
  validity_period?: string; // e.g., "Nov 1, 2025 - Dec 31, 2026" - optional
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