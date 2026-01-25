import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Removed Card components for Marriott-style design
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types';
import { PackageCard } from '@/components/PackageCard';
import { packageService } from '@/services/packageService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PhotoGallery } from '@/components/PhotoGallery';
import Header from '@/components/Header';
import { useIndexPageData } from '@/hooks/useIndexPageData';
import {
  Filter,
  Search,
  Calendar,
  Users,
  Loader2,
  Package as PackageIcon
} from 'lucide-react';

export const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);

  // Theme configuration
  const packageTheme = {
    colors: {
      primary: '#E6A500', // hotel-gold
      secondary: '#2F3A4F', // hotel-navy
      accent: '#8B9A7A', // hotel-sage
      background: '#F5F2E8', // hotel-cream
      text: '#7A5C3F' // hotel-bronze
    }
  };

  // Get villa data for hero section
  const { currentVillaData } = useIndexPageData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters with URL parameters
  const [filters, setFilters] = useState({
    type: '',
    checkIn: searchParams.get('checkin') || '',
    checkOut: searchParams.get('checkout') || '',
    guests: parseInt(searchParams.get('adults') || '2'),
    search: ''
  });

  const [packageTypes, setPackageTypes] = useState<Array<{ package_type: string; count: number }>>([]);

  // Load packages and package types
  useEffect(() => {
    // Track packages page view
    import('@/utils/ga4Analytics').then(({ trackPackagesPage }) => {
      trackPackagesPage({
        filter_type: filters.type || 'all',
        check_in: filters.checkIn || undefined,
        check_out: filters.checkOut || undefined,
      });
    });

    loadPackages();
    loadPackageTypes();
  }, []);

  // Initialize filters from URL parameters
  useEffect(() => {
    const checkin = searchParams.get('checkin');
    const checkout = searchParams.get('checkout');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');

    if (checkin || checkout || adults || children) {
      setFilters(prev => ({
        ...prev,
        checkIn: checkin || '',
        checkOut: checkout || '',
        guests: parseInt(adults || '2') + parseInt(children || '0')
      }));
    }
  }, [searchParams]);

  // Apply client-side filters when packages or filters change
  useEffect(() => {
    applyFilters();
  }, [packages, filters.search, filters.guests, filters.checkIn, filters.checkOut, filters.type]);

  // Track view_item_list when filtered packages update
  useEffect(() => {
    if (filteredPackages.length > 0) {
      import('@/utils/ga4Analytics').then(({ trackViewItemList }) => {
        trackViewItemList({
          item_list_name: 'Packages List',
          items: filteredPackages.map((pkg) => ({
            item_id: pkg.id,
            item_name: pkg.name,
            price: Number(pkg.price || pkg.base_price || 0),
            item_category: pkg.type || 'Package'
          }))
        });
      });
    }
  }, [filteredPackages]);

  const loadPackages = async () => {
    try {
      setLoading(true);

      // Build API filters - let server handle date-based availability filtering
      const apiFilters: any = {};

      if (filters.checkIn) apiFilters.check_in = filters.checkIn;
      if (filters.checkOut) apiFilters.check_out = filters.checkOut;
      if (filters.type) apiFilters.type = filters.type;

      const response = await packageService.getPackages(apiFilters);
      if (response.success) {
        setPackages(response.data);
      } else {
        setError('Failed to load packages');
      }
    } catch (err) {
      setError('Error loading packages: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadPackageTypes = async () => {
    try {
      const response = await packageService.getPackageTypes();
      if (response.success) {
        setPackageTypes(response.data);
      }
    } catch (err) {
      console.error('Error loading package types:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Get today's date for validity check
    const today = new Date().toISOString().split('T')[0];

    // CRITICAL: Filter by is_active AND date validity
    filtered = filtered.filter(pkg => {
      const isActive = pkg.is_active === 1 || pkg.is_active === true ||
        pkg.available === 1 || pkg.available === true;

      // Check date validity
      let isDateValid = true;
      if (pkg.valid_from && today < pkg.valid_from) isDateValid = false;
      if (pkg.valid_until && today > pkg.valid_until) isDateValid = false;

      return isActive && isDateValid;
    });

    // Filter by type (skip if empty)
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(pkg =>
        pkg.package_type === filters.type || pkg.type === filters.type
      );
    }

    // Filter by search term (client-side)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(pkg => {
        // Parse inclusions if string
        let inclusions = pkg.inclusions || pkg.includes || [];
        if (typeof inclusions === 'string') {
          try { inclusions = JSON.parse(inclusions); } catch { inclusions = []; }
        }

        return pkg.name.toLowerCase().includes(search) ||
          pkg.description.toLowerCase().includes(search) ||
          (Array.isArray(inclusions) && inclusions.some((item: string) => item.toLowerCase().includes(search)));
      });
    }

    // Filter by guest count (client-side)
    filtered = filtered.filter(pkg => pkg.max_guests >= filters.guests);

    setFilteredPackages(filtered);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      checkIn: '',
      checkOut: '',
      guests: 2,
      search: ''
    });
  };

  const handlePackageSelect = (packageId: string) => {
    navigate(`/packages/${packageId}`);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6" style={{ color: packageTheme.colors.primary }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading packages...</h3>
                <p className="text-gray-600">Please wait while we fetch the latest packages for you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Something went wrong</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={loadPackages}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Professional Hotel Header - Shared Component */}
      {currentVillaData && <Header />}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {currentVillaData && (
          <section className="mb-8">
            {/* Enhanced Photo Gallery Hero */}
            <div className="mb-8">
              <PhotoGallery images={currentVillaData.images} />
            </div>
          </section>
        )}

        {/* Packages Header */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-semibold mb-3 text-gray-900">Hotel Packages</h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Discover our special packages designed to make your stay unforgettable
                </p>
              </div>
              <Button
                variant="outline"
                onClick={loadPackages}
                disabled={loading}
                className="ml-4 border-gray-300 hover:border-blue-600 hover:text-blue-600"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" style={{ color: packageTheme.colors.primary }} />
              Filter Packages
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search packages..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Package Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Package Type</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types ({packages.length})</SelectItem>
                    {packageTypes.map((type) => (
                      <SelectItem key={type.package_type} value={type.package_type}>
                        {packageService.getPackageTypeDisplayName(type.package_type)} ({type.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in Date */}
              <div className="space-y-2">
                <Label htmlFor="check-in" className="text-sm font-medium text-gray-700">Check-in</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="check-in"
                    type="date"
                    value={filters.checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Check-out Date */}
              <div className="space-y-2">
                <Label htmlFor="check-out" className="text-sm font-medium text-gray-700">Check-out</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="check-out"
                    type="date"
                    value={filters.checkOut}
                    min={filters.checkIn || new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <Label htmlFor="guests" className="text-sm font-medium text-gray-700">Guests</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={filters.guests}
                    onChange={(e) => handleFilterChange('guests', parseInt(e.target.value) || 1)}
                    className="pl-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-medium">
                  Showing {filteredPackages.length} of {packages.length} packages
                </span>
                {(filters.type || filters.search || filters.checkIn || filters.checkOut || filters.guests !== 2) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-gray-300 hover:border-red-500 hover:text-red-600"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Package Type Badges */}
        {packageTypes.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Package Categories</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleFilterChange('type', '')}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.type === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <PackageIcon className="h-4 w-4 mr-2" />
                  All Packages ({packages.length})
                </button>
                {packageTypes.map((type) => (
                  <button
                    key={type.package_type}
                    onClick={() => handleFilterChange('type', type.package_type)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.type === type.package_type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {packageService.getPackageTypeDisplayName(type.package_type)} ({type.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Date Filter Indicator */}
        {filters.checkIn && filters.checkOut && (
          <div className="mb-8">
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    ✅ Showing only available packages from {new Date(filters.checkIn).toLocaleDateString()} to {new Date(filters.checkOut).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    ({Math.ceil((new Date(filters.checkOut).getTime() - new Date(filters.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights) - Rooms confirmed available for these dates
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onSelect={handlePackageSelect}
                showRoomOptions={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <PackageIcon className="h-16 w-16 mx-auto mb-6 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No packages found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your filters to see more packages that match your preferences
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-white transition-colors"
              style={{
                backgroundColor: packageTheme.colors.primary,
                borderColor: packageTheme.colors.primary
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = packageTheme.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = packageTheme.colors.primary;
                e.currentTarget.style.color = 'white';
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;