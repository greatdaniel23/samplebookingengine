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
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // CRITICAL: Filter out inactive packages and packages outside valid date range
        // API returns is_active field, not available
        const activePackages = data.filter(pkg => {
          // Check if package is active
          const isActive = pkg.is_active === 1 || pkg.is_active === true || 
                          pkg.available === 1 || pkg.available === true;
          
          // Check if today is within the valid date range
          const validFrom = pkg.valid_from;
          const validUntil = pkg.valid_until;
          
          // If no date restrictions, package is valid
          let isDateValid = true;
          if (validFrom && today < validFrom) {
            isDateValid = false; // Package not yet available
          }
          if (validUntil && today > validUntil) {
            isDateValid = false; // Package has expired
          }
          
          return isActive && isDateValid;
        });
        
        if (activePackages.length === 0) {
          console.warn('No active packages found for today:', today);
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
