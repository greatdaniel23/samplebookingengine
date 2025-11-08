import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types';
import { PackageCard } from '@/components/PackageCard';
import { packageService } from '@/services/packageService';
import { useNavigate } from 'react-router-dom';
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
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    search: ''
  });

  const [packageTypes, setPackageTypes] = useState<Array<{ package_type: string; count: number }>>([]);

  // Load packages and package types
  useEffect(() => {
    loadPackages();
    loadPackageTypes();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [packages, filters]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getPackages();
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

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(pkg => pkg.package_type === filters.type);
    }

    // Filter by search term
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(pkg => 
        pkg.name.toLowerCase().includes(search) ||
        pkg.description.toLowerCase().includes(search) ||
        pkg.includes.some(item => item.toLowerCase().includes(search))
      );
    }

    // Filter by dates (if provided)
    if (filters.checkIn && filters.checkOut) {
      filtered = filtered.filter(pkg => 
        packageService.isPackageValidForDates(pkg, filters.checkIn, filters.checkOut)
      );
    }

    // Filter by guest count
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading packages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadPackages}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-hotel-cream min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-hotel-navy">Hotel Packages</h1>
          <p className="text-hotel-bronze">
            Discover our special packages designed to make your stay unforgettable
          </p>
        </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search packages..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Package Type */}
            <div className="space-y-2">
              <Label>Package Type</Label>
              <Select 
                value={filters.type} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types ({packages.length})</SelectItem>
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
              <Label htmlFor="check-in">Check-in</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="check-in"
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="check-out">Check-out</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="check-out"
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="10"
                  value={filters.guests}
                  onChange={(e) => handleFilterChange('guests', parseInt(e.target.value) || 1)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredPackages.length} of {packages.length} packages
              </span>
              {(filters.type || filters.search || filters.checkIn || filters.checkOut || filters.guests !== 2) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Type Badges */}
      {packageTypes.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={filters.type === '' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleFilterChange('type', '')}
            >
              <PackageIcon className="h-3 w-3 mr-1" />
              All Packages ({packages.length})
            </Badge>
            {packageTypes.map((type) => (
              <Badge
                key={type.package_type}
                variant={filters.type === type.package_type ? 'default' : 'outline'}
                className={`cursor-pointer ${packageService.getPackageTypeColor(type.package_type)}`}
                onClick={() => handleFilterChange('type', type.package_type)}
              >
                {packageService.getPackageTypeDisplayName(type.package_type)} ({type.count})
              </Badge>
            ))}
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
        <Card className="p-8 text-center">
          <PackageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No packages found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters to see more packages
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
    </div>
  );
};

export default PackagesPage;