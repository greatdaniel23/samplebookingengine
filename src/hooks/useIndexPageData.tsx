import { useMemo } from 'react';
import { useRooms } from "@/hooks/useRooms";
import { usePackages } from "@/hooks/usePackages";
import { useVillaInfo } from "@/hooks/useVillaInfo";
import type { Villa, Package, Room } from "@/types";

/**
 * Custom hook to manage all data fetching and state aggregation for the Index page
 * Separates data concerns from UI concerns
 */
export const useIndexPageData = () => {
  // Individual hook calls
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const { packages, loading: packagesLoading, error: packagesError } = usePackages();
  const { villaInfo, loading: villaLoading, error: villaError } = useVillaInfo();

  // Normalize villa data to ensure compatibility between VillaInfo and Villa types
  const normalizeVillaData = (data: any): Villa | null => {
    if (!data) {
      
      
      return null;
    }
    
    // Convert amenities from string array to object array
    const normalizeAmenities = (amenities: any) => {
      if (!Array.isArray(amenities)) return [];
      
      // If already objects with name and icon, return as is
      if (amenities.length > 0 && typeof amenities[0] === 'object' && amenities[0].name) {
        return amenities;
      }
      
      // Convert string array to object array with default icons
      const iconMap: { [key: string]: string } = {
        'Swimming Pool': 'Bath',
        'Spa Services': 'Bath', 
        'Restaurant': 'CookingPot',
        'Free WiFi': 'Wifi',
        'Airport Shuttle': 'Car',
        'Bicycle Rental': 'Car',
        'Yoga Studio': 'AirVent',
        'Library': 'Flame',
        'Garden': 'AirVent',
        'Parking': 'Car',
        '24/7 Reception': 'Flame',
        'Room Service': 'CookingPot',
        'Laundry Service': 'Bath',
        'Tour Desk': 'Flame',
        'Currency Exchange': 'Flame'
      };
      
      return amenities.map((amenity: string) => ({
        name: amenity,
        icon: iconMap[amenity] || 'AirVent' // Default icon
      }));
    };
    
    return {
      id: data.id || 1,
      name: data.name || 'Villa Name Not Available',
      location: data.address || data.location || 'Location Not Available',
      description: data.description || 'Description not available from API',
      rating: data.rating || 0,
      reviews: data.reviews || 0,
      images: data.images || [],
      amenities: normalizeAmenities(data.amenities),
      rooms: data.rooms || [],
    };
  };

  // Safe data with null/undefined protection
  const safeRooms = useMemo((): Room[] => {
    if (!rooms) {
      
      return [];
    }
    if (!Array.isArray(rooms)) {
      
      return [];
    }
    return rooms;
  }, [rooms]);

  const safePackages = useMemo((): Package[] => {
    if (!packages) {
      
      return [];
    }
    if (!Array.isArray(packages)) {
      
      return [];
    }
    return packages;
  }, [packages]);

  // Aggregated states
  const error = villaError || roomsError || packagesError;
  const isLoading = villaLoading || roomsLoading || packagesLoading;

  // Processed villa data
  const currentVillaData = normalizeVillaData(villaInfo);

  return {
    // Data
    safeRooms,
    safePackages,
    currentVillaData, // Can be null if API fails
    
    // States
    isLoading,
    error,
  };
};
