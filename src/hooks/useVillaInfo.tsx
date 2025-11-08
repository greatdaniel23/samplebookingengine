import { useState, useEffect } from 'react';

export interface VillaInfo {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  images: string[];
  amenities: {
    name: string;
    icon: string;
  }[];
}

export const useVillaInfo = () => {
  const [villaInfo, setVillaInfo] = useState<VillaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVillaInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/villa.php');
      
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
        setError(data.error || 'Failed to fetch villa information');
      }
    } catch (err) {
      setError('Failed to fetch villa information');
      console.error('Villa info fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateVillaInfo = async (data: Partial<VillaInfo>) => {
    try {
      const response = await fetch('/api/villa.php', {
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