export interface Room {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  size: string;
  beds: string;
  occupancy: number;
  features: string[];
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