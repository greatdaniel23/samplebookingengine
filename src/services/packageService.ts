/**
 * Package Service
 * Handles API calls for package-related operations
 */

import { Package, PackagePricing } from '@/types';

const API_BASE_URL = '/api';

export const packageService = {
  /**
   * Get all packages with optional filters
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

    const url = `${API_BASE_URL}/packages${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch packages: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get package by ID
   */
  async getPackageById(id: string): Promise<{ success: boolean; data: Package; message: string }> {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch package: ${response.status}`);
    }

    return response.json();
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
    const response = await fetch(`${API_BASE_URL}/packages?action=types`);
    
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
    const typeNames = {
      romantic: 'Romantic',
      business: 'Business',
      family: 'Family',
      luxury: 'Luxury',
      weekend: 'Weekend',
      holiday: 'Holiday',
      spa: 'Spa & Wellness',
      adventure: 'Adventure'
    };

    return typeNames[type as keyof typeof typeNames] || type;
  },

  /**
   * Get package type color for UI
   */
  getPackageTypeColor(type: string): string {
    const typeColors = {
      romantic: 'bg-rose-100 text-rose-800',
      business: 'bg-blue-100 text-blue-800',
      family: 'bg-green-100 text-green-800',
      luxury: 'bg-purple-100 text-purple-800',
      weekend: 'bg-orange-100 text-orange-800',
      holiday: 'bg-red-100 text-red-800',
      spa: 'bg-teal-100 text-teal-800',
      adventure: 'bg-yellow-100 text-yellow-800'
    };

    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  }
};

export default packageService;