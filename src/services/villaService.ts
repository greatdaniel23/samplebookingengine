/**
 * Villa Service
 * Handles API calls for villa information
 */

import { VillaInfo } from '@/hooks/useVillaInfo';
import { API_BASE_URL } from '@/config/paths';

export const villaService = {
  /**
   * Get villa information
   */
  async getVillaInfo(): Promise<{ success: boolean; data: VillaInfo; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/villa`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch villa info: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Update villa information (for admin use)
   */
  async updateVillaInfo(villaData: Partial<VillaInfo>): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/villa`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(villaData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update villa info: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get contact information specifically
   */
  async getContactInfo(): Promise<{ phone: string; email: string; address: string }> {
    try {
      const response = await this.getVillaInfo();
      if (response.success && response.data) {
        return {
          phone: response.data.phone || '+1 (555) 123-4567',
          email: response.data.email || 'info@villa.com',
          address: response.data.address || '123 Villa Street'
        };
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
    
    // Fallback contact info
    return {
      phone: '+1 (555) 123-4567',
      email: 'info@villa.com',
      address: '123 Villa Street'
    };
  }
};