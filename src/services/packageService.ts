/**
 * Package Service
 * Handles API calls for package-related operations
 */

import { Package, PackagePricing } from '@/types';
import { API_BASE_URL } from '@/config/paths';

export const packageService = {
  /**
   * Get all packages with optional filters including date-based availability
   */
  async getPackages(filters?: {
    check_in?: string;
    check_out?: string;
    type?: string;
    guests?: number;
  }): Promise<{ success: boolean; data: Package[]; message: string; count: number }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${API_BASE_URL}/packages.php${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch packages: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get package by ID
   */
  async getPackageById(id: string, includeRooms: boolean = true): Promise<{ success: boolean; data: Package; message: string }> {
    try {
      const params = new URLSearchParams({
        id: id,
        ...(includeRooms && { include_rooms: 'true' })
      });
      
      const response = await fetch(`${API_BASE_URL}/packages.php?${params.toString()}`);
      
      if (!response.ok) {
        // If including rooms fails with 500, try without rooms
        if (includeRooms && response.status === 500) {
          console.warn(`Room information unavailable for package ${id}, fetching basic package data`);
          return this.getPackageById(id, false);
        }
        
        // If it's a 404 or other error, throw appropriately
        if (response.status === 404) {
          throw new Error(`Package with ID ${id} not found`);
        }
        
        throw new Error(`Failed to fetch package ${id}: HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Check if the API returned an error in the response body
      if (!result.success) {
        // If rooms are included and there's an error, try without rooms
        if (includeRooms && result.error && result.error.includes('max_occupancy')) {
          console.warn(`Room data error for package ${id}, fetching basic package data:`, result.error);
          return this.getPackageById(id, false);
        }
        throw new Error(result.error || `Package ${id} request failed`);
      }

      return result;
    } catch (error) {
      // Fallback: if room information fails, try basic package fetch
      if (includeRooms && error.message && (
        error.message.includes('max_occupancy') || 
        error.message.includes('500') ||
        error.message.includes('column')
      )) {
        console.warn(`Fallback: fetching package ${id} without room data due to:`, error.message);
        return this.getPackageById(id, false);
      }
      throw error;
    }
  },

  /**
   * Get packages available for a specific room
   */
  async getPackagesByRoom(
    roomId: string,
    checkIn?: string,
    checkOut?: string
  ): Promise<{ success: boolean; data: Package[]; message: string; room_id: string; count: number }> {
    const params = new URLSearchParams({ room_id: roomId });
    
    if (checkIn) params.append('check_in', checkIn);
    if (checkOut) params.append('check_out', checkOut);

    const response = await fetch(`${API_BASE_URL}/packages?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch room packages: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Calculate package pricing
   */
  async calculatePackagePrice(
    packageId: string,
    roomId: string,
    nights: number,
    guests: number = 2
  ): Promise<{ success: boolean; data: PackagePricing; message: string }> {
    const params = new URLSearchParams({
      action: 'calculate',
      package_id: packageId,
      room_id: roomId,
      nights: nights.toString(),
      guests: guests.toString()
    });

    const response = await fetch(`${API_BASE_URL}/packages?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to calculate package price: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get available package types
   */
  async getPackageTypes(): Promise<{ success: boolean; data: Array<{ package_type: string; count: number }>; message: string }> {
    const response = await fetch(`${API_BASE_URL}/packages.php?action=types`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch package types: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Filter packages by type
   */
  async getPackagesByType(type: string): Promise<{ success: boolean; data: Package[]; message: string; count: number }> {
    return this.getPackages({ type });
  },

  /**
   * Get packages valid for specific dates
   */
  async getPackagesForDates(
    checkIn: string,
    checkOut: string,
    guests?: number
  ): Promise<{ success: boolean; data: Package[]; message: string; count: number }> {
    return this.getPackages({ check_in: checkIn, check_out: checkOut, guests });
  },

  /**
   * Format package price for display
   */
  formatPackagePrice(pricing: PackagePricing): string {
    return `$${pricing.final_price.toFixed(2)}`;
  },

  /**
   * Format discount for display
   */
  formatDiscount(pricing: PackagePricing): string {
    return `Save $${pricing.savings.toFixed(2)} (${pricing.discount_percentage}% off)`;
  },

  /**
   * Check if package is valid for given dates
   */
  isPackageValidForDates(pkg: Package, checkIn: string, checkOut: string): boolean {
    const validFrom = new Date(pkg.valid_from);
    const validUntil = new Date(pkg.valid_until);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    return checkInDate >= validFrom && checkOutDate <= validUntil;
  },

  /**
   * Get package type display name
   */
  getPackageTypeDisplayName(type: string): string {
    if (!type) return 'Package';
    
    const normalizedType = type.toLowerCase();
    
    const typeNames = {
      // API format mappings
      romance: 'Romantic Getaway',
      romantic: 'Romantic Getaway',
      adventure: 'Adventure Package',
      wellness: 'Wellness & Spa',
      culture: 'Cultural Experience',
      cultural: 'Cultural Experience',
      family: 'Family Package',
      business: 'Business Package',
      luxury: 'Luxury Experience',
      weekend: 'Weekend Getaway',
      holiday: 'Holiday Special',
      spa: 'Spa & Wellness'
    };

    return typeNames[normalizedType as keyof typeof typeNames] || type;
  },

  /**
   * Get package type color for UI
   */
  getPackageTypeColor(type: string): string {
    if (!type) return 'bg-hotel-cream text-hotel-bronze';
    
    const normalizedType = type.toLowerCase();
    
    const typeColors = {
      // API format mappings using hotel theme colors
      romance: 'bg-hotel-cream text-hotel-gold',
      romantic: 'bg-hotel-cream text-hotel-gold',
      adventure: 'bg-hotel-cream text-hotel-bronze',
      wellness: 'bg-hotel-cream text-hotel-sage',
      culture: 'bg-hotel-cream text-hotel-navy',
      cultural: 'bg-hotel-cream text-hotel-navy',
      family: 'bg-hotel-cream text-hotel-sage',
      business: 'bg-hotel-cream text-hotel-navy',
      luxury: 'bg-hotel-cream text-hotel-gold',
      weekend: 'bg-hotel-cream text-hotel-bronze',
      holiday: 'bg-hotel-cream text-hotel-gold',
      spa: 'bg-hotel-cream text-hotel-sage'
    };

    return typeColors[normalizedType as keyof typeof typeColors] || 'bg-hotel-cream text-hotel-bronze';
  }
};

export default packageService;