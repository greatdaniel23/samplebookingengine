/**
 * Image configuration for the booking engine
 * Centralized image path management
 */

export const imagePaths = {
  // Room images
  rooms: {
    base: '/images/rooms',
    deluxeSuite: '/images/rooms/deluxe-suite',
    standardRoom: '/images/rooms/standard-room', 
    familyRoom: '/images/rooms/family-room',
    masterSuite: '/images/rooms/master-suite',
    economyRoom: '/images/rooms/economy-room'
  },
  
  // Amenity icons
  amenities: {
    base: '/images/amenities',
    wifi: '/images/amenities/wifi.svg',
    tv: '/images/amenities/tv.svg',
    balcony: '/images/amenities/balcony.svg',
    aircon: '/images/amenities/air-conditioning.svg',
    minibar: '/images/amenities/minibar.svg',
    breakfast: '/images/amenities/breakfast.svg',
    parking: '/images/amenities/parking.svg',
    gym: '/images/amenities/gym.svg',
    pool: '/images/amenities/pool.svg',
    spa: '/images/amenities/spa.svg'
  },
  
  // Gallery images
  gallery: {
    base: '/images/gallery',
    hotel: '/images/gallery/hotel',
    facilities: '/images/gallery/facilities',
    dining: '/images/gallery/dining'
  },
  
  // UI elements
  ui: {
    base: '/images/ui',
    logo: '/images/ui/logo.png',
    logoSmall: '/images/ui/logo-small.png',
    placeholder: '/images/ui/placeholder.jpg',
    noImage: '/images/ui/no-image.svg'
  }
};

/**
 * Get room image URLs for a specific room
 */
export const getRoomImages = (roomId: string) => {
  const roomPath = `${imagePaths.rooms.base}/${roomId}`;
  return {
    main: `${roomPath}/main.jpg`,
    gallery: [
      `${roomPath}/gallery-1.jpg`,
      `${roomPath}/gallery-2.jpg`, 
      `${roomPath}/gallery-3.jpg`,
      `${roomPath}/gallery-4.jpg`
    ],
    thumbnail: `${roomPath}/thumbnail.jpg`
  };
};

/**
 * Get amenity icon URL
 */
export const getAmenityIcon = (amenityName: string): string => {
  const amenityKey = amenityName.toLowerCase().replace(/\s+/g, '').replace('-', '');
  return imagePaths.amenities[amenityKey as keyof typeof imagePaths.amenities] || imagePaths.ui.noImage;
};

/**
 * Image optimization helper
 */
export const getOptimizedImage = (path: string, size?: 'small' | 'medium' | 'large') => {
  if (!size) return path;
  
  const ext = path.split('.').pop();
  const basePath = path.replace(`.${ext}`, '');
  
  return `${basePath}-${size}.${ext}`;
};

export default imagePaths;