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
        console.log('🔍 usePackages: Raw data from API:', data);
        console.log('🔍 usePackages: Package availability check:', data.map(p => ({ id: p.id, name: p.name, available: p.available })));
        
        // CRITICAL: Filter out inactive packages for customers
        const activePackages = data.filter(pkg => {
          const isActive = pkg.available === 1 || pkg.available === true;
          console.log(`🔍 Package ${pkg.id} (${pkg.name}): available=${pkg.available}, isActive=${isActive}`);
          return isActive;
        });
        console.log('✅ usePackages: Active packages after filtering:', activePackages.map(p => ({ id: p.id, name: p.name, available: p.available })));
        console.log(`📊 usePackages: Filtered ${data.length} packages down to ${activePackages.length} active packages`);
        
        if (activePackages.length === 0) {
          console.warn('⚠️ WARNING: No active packages found! All packages are inactive.');
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