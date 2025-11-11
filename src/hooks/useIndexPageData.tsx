import { useMemo } from 'react';
import { useRooms } from "@/hooks/useRooms";
import { usePackages } from "@/hooks/usePackages";
import { useVillaInfo } from "@/hooks/useVillaInfo";
import type { Villa, Package, Room } from "@/types";
import { villaData } from "@/data/dummy";

/**
 * Custom hook to manage all data fetching and state aggregation for the Index page
 * Separates data concerns from UI concerns
 */
export const useIndexPageData = () => {
  // Individual hook calls
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const { packages, loading: packagesLoading, error: packagesError } = usePackages();
  const { villaInfo, loading: villaLoading, error: villaError, refetch } = useVillaInfo();

  // Normalize villa data to ensure compatibility between VillaInfo and Villa types
  const normalizeVillaData = (data: any): Villa => {
    if (!data) return villaData;
    
    // Convert amenities from string array to object array
    const normalizeAmenities = (amenities: any) => {
      if (!Array.isArray(amenities)) return villaData.amenities;
      
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
      id: data.id || villaData.id,
      name: data.name || villaData.name,
      location: data.address || data.location || villaData.location, // Enhanced DB uses 'address'
      description: data.description || villaData.description,
      rating: data.rating || villaData.rating,
      reviews: data.reviews || villaData.reviews,
      images: data.images || villaData.images,
      amenities: normalizeAmenities(data.amenities),
      rooms: data.rooms || villaData.rooms,
    };
  };

  // Safe data with null/undefined protection
  const safeRooms = useMemo((): Room[] => {
    if (!rooms) {
      console.warn('Rooms is null/undefined, returning empty array');
      return [];
    }
    if (!Array.isArray(rooms)) {
      console.warn('Rooms is not an array:', typeof rooms, rooms);
      return [];
    }
    return rooms;
  }, [rooms]);

  const safePackages = useMemo((): Package[] => {
    if (!packages) {
      console.warn('Packages is null/undefined, returning empty array');
      return [];
    }
    if (!Array.isArray(packages)) {
      console.warn('Packages is not an array:', typeof packages, packages);
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
    currentVillaData,
    
    // States
    isLoading,
    error,
    
    // Actions
    refetch,
  };
};