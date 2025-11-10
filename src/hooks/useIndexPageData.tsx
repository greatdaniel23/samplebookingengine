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
    
    return {
      id: data.id || villaData.id,
      name: data.name || villaData.name,
      location: data.location || villaData.location,
      description: data.description || villaData.description,
      rating: data.rating || villaData.rating,
      reviews: data.reviews || villaData.reviews,
      images: data.images || villaData.images,
      amenities: data.amenities || villaData.amenities,
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