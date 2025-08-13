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