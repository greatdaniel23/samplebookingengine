import { useState, useEffect } from 'react';
import { packageService } from '@/services/packageService';
import type { Package } from '@/types';

interface UsePackagesReturn {
  packages: Package[];
  loading: boolean;
  error: string | null;
}

export const usePackages = (): UsePackagesReturn => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await packageService.getPackages();
        const data = response.data;
        
        
        
        // CRITICAL: Filter out inactive packages for customers
        const activePackages = data.filter(pkg => {
          const isActive = pkg.available === 1 || pkg.available === true;
          
          return isActive;
        });
        
        
        
        if (activePackages.length === 0) {
          
        }
        
        setPackages(activePackages);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, loading, error };
};
