import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/paths';

export interface VillaInfo {
  id: number;
  name: string;
  location: string;
  description: string;
  logo_url?: string;
  rating: number;
  reviews: number;
  images: string[];
  amenities: {
    name: string;
    icon: string;
  }[];
  // Contact Information
  phone: string;
  email: string;
  website: string;
  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  // Additional Information
  checkInTime: string;
  checkOutTime: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  currency: string;
  // Policies
  cancellationPolicy: string;
  houseRules: string;
  // Social Media
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export const useVillaInfo = () => {
  const [villaInfo, setVillaInfo] = useState<VillaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVillaInfo = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/villa`, {
        cache: 'no-cache'
      });
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      
      
      
      
      if (data.success) {
        
        setVillaInfo(data.data);
        setError(null);
        
      } else {
        console.error('❌ Villa API returned error:', data.error);
        setError(data.error || 'Failed to fetch villa information');
      }
    } catch (err) {
      const errorMessage = `Failed to fetch villa information: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error('🚨 Villa info fetch error:', err);
      console.error('🔗 API URL was:', `${API_BASE_URL}/villa`);
    } finally {
      setLoading(false);
    }
  };

  const updateVillaInfo = async (data: Partial<VillaInfo>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/villa`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const result = await response.json();
      
      if (result.success) {
        await fetchVillaInfo(); // Refresh data
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Villa info update error:', err);
      return { success: false, error: 'Failed to update villa information' };
    }
  };

  useEffect(() => {
    fetchVillaInfo();
  }, []);

  return {
    villaInfo,
    loading,
    error,
    refetch: fetchVillaInfo,
    updateVillaInfo,
  };
};
