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