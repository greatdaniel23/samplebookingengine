import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Building, Info, X, AlertTriangle, Check, ImagePlus, Sparkles, Pencil, Trash2, Gift } from 'lucide-react';
import { paths } from '@/config/paths';
import { ImageManager } from '@/components/ImageManager';
import { PackageCalendarManager } from './PackageCalendarManager';
import { PackageRoomsManager } from './PackageRoomsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const PackagesSection: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [calendarManagerOpen, setCalendarManagerOpen] = useState(false);
  const [selectedPackageForCalendar, setSelectedPackageForCalendar] = useState<{ id: number, name: string } | null>(null);
  const [roomsManagerOpen, setRoomsManagerOpen] = useState(false);
  const [selectedPackageForRooms, setSelectedPackageForRooms] = useState<{ id: number, name: string } | null>(null);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedPackageForAmenities, setSelectedPackageForAmenities] = useState<{ id: number, name: string } | null>(null);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [packageAmenities, setPackageAmenities] = useState<any[]>([]);

  // Inclusions management
  const [inclusions, setInclusions] = useState<any[]>([]);
  const [selectedPackageForInclusions, setSelectedPackageForInclusions] = useState<{ id: number, name: string } | null>(null);
  const [showInclusionsModal, setShowInclusionsModal] = useState(false);
  const [packageInclusions, setPackageInclusions] = useState<any[]>([]);

  // Marketing categories
  const [marketingCategories, setMarketingCategories] = useState<any[]>([]);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    description: '',
    type: 'Romance',
    price: 0,
    duration_days: 1,
    max_guests: 2,
    available: true,
    base_room_id: '',
    inclusions: [] as string[],
    exclusions: [] as string[],
    images: [] as string[],
    valid_from: '',
    valid_until: '',
    terms_conditions: ''
  });
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    type: 'Romance',
    base_room_id: '',
    base_price: 0,
    min_nights: 1,
    max_nights: 30,
    max_guests: 2,
    discount_percentage: 0,
    is_active: true,
    inclusions: [] as string[],
    exclusions: [] as string[],
    featured: false
  });

  useEffect(() => {
    fetchPackages();
    fetchRooms();
    fetchAmenities();
    fetchInclusions();
    fetchMarketingCategories();
  }, []);

  const fetchMarketingCategories = async () => {
    try {
      const response = await fetch(paths.buildApiUrl('marketing-categories.php'));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setMarketingCategories(data.data || []);
      } else {
        // Fallback to default categories
        setMarketingCategories([
          { id: 1, name: 'Romance', slug: 'romance' },
          { id: 2, name: 'Family', slug: 'family' },
          { id: 3, name: 'Adventure', slug: 'adventure' },
          { id: 4, name: 'Business', slug: 'business' },
          { id: 5, name: 'Wellness', slug: 'wellness' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching marketing categories:', error);
      // Fallback to default categories
      setMarketingCategories([
        { id: 1, name: 'Romance', slug: 'romance' },
        { id: 2, name: 'Family', slug: 'family' },
        { id: 3, name: 'Adventure', slug: 'adventure' },
        { id: 4, name: 'Business', slug: 'business' },
        { id: 5, name: 'Wellness', slug: 'wellness' }
      ]);
    }
  };

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      // Clean up any blob URLs when component unmounts
      packageFormData.images.forEach(image => {
        if (image && image.startsWith('blob:')) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [packageFormData.images]);

  const fetchRooms = async () => {
    try {
      const apiUrl = paths.buildApiUrl('rooms.php');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const roomsArray = data.success ? data.data : (Array.isArray(data) ? data : []);
      setRooms(roomsArray);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const fetchAmenities = async () => {
    try {
      const apiUrl = paths.buildApiUrl('amenities.php');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success && data.amenities) {
        setAmenities(data.amenities || []);
      } else {
        setAmenities([]);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
      setAmenities([]);
    }
  };

  const fetchInclusions = async () => {
    try {
      const apiUrl = paths.buildApiUrl('inclusions.php');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success && data.inclusions) {
        setInclusions(data.inclusions || []);
      } else {
        setInclusions([]);
      }
    } catch (error) {
      console.error('Error fetching inclusions:', error);
      setInclusions([]);
    }
  };

  const fetchPackageAmenities = async (packageId: number) => {
    try {
      // Use the package-amenities.php endpoint with package_id parameter
      const apiUrl = `https://api.rumahdaisycantik.com/package-amenities.php?package_id=${packageId}`;
      console.log('Fetching package amenities from:', apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log('Package amenities response:', data);

      if (data.success) {
        setPackageAmenities(data.amenities || []);
      } else {
        console.error('Package amenities API error:', data.error);
        setPackageAmenities([]);
      }
    } catch (error) {
      console.error('Error fetching package amenities:', error);
      setPackageAmenities([]);
    }
  };

  const addAmenityToPackage = async (packageId: number, amenityId: number, isHighlighted: boolean = false) => {
    try {
      // Use package-amenities.php with action=add
      const apiUrl = `https://api.rumahdaisycantik.com/package-amenities.php?action=add&package_id=${packageId}&amenity_id=${amenityId}&is_highlighted=${isHighlighted ? 1 : 0}`;
      console.log('Adding amenity to package:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.success) {
        fetchPackageAmenities(packageId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding amenity to package:', error);
      return false;
    }
  };

  const removeAmenityFromPackage = async (packageId: number, amenityId: number) => {
    try {
      // Use package-amenities.php with action=remove
      const apiUrl = `https://api.rumahdaisycantik.com/package-amenities.php?action=remove&package_id=${packageId}&amenity_id=${amenityId}`;
      console.log('Removing amenity from package:', apiUrl);
      const response = await fetch(apiUrl, { method: 'GET' });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        fetchPackageAmenities(packageId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing amenity from package:', error);
      return false;
    }
  };

  const fetchPackageInclusions = async (packageId: number) => {
    try {
      const apiUrl = `https://api.rumahdaisycantik.com/package-inclusions.php?action=list&package_id=${packageId}`;
      console.log('Fetching package inclusions from:', apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log('Package inclusions response:', data);

      if (data.success) {
        setPackageInclusions(data.inclusions || []);
      } else {
        console.error('Package inclusions API error:', data.error);
        setPackageInclusions([]);
      }
    } catch (error) {
      console.error('Error fetching package inclusions:', error);
      setPackageInclusions([]);
    }
  };

  const addInclusionToPackage = async (packageId: number, inclusionId: number) => {
    try {
      const apiUrl = `https://api.rumahdaisycantik.com/package-inclusions.php?action=add&package_id=${packageId}&inclusion_id=${inclusionId}`;
      console.log('Adding inclusion to package:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.success) {
        fetchPackageInclusions(packageId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding inclusion to package:', error);
      return false;
    }
  };

  const removeInclusionFromPackage = async (packageId: number, inclusionId: number) => {
    try {
      const apiUrl = `https://api.rumahdaisycantik.com/package-inclusions.php?action=remove&package_id=${packageId}&inclusion_id=${inclusionId}`;
      console.log('Removing inclusion from package:', apiUrl);
      const response = await fetch(apiUrl, { method: 'GET' });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        fetchPackageInclusions(packageId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing inclusion from package:', error);
      return false;
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const apiUrl = paths.buildApiUrl('packages.php');
      console.log('Fetching packages from:', apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();
      console.log('Packages API response:', data);

      const packagesArray = data.success ? data.data : (Array.isArray(data) ? data : []);

      // Log amenities for each package
      packagesArray.forEach((pkg, index) => {
        console.log(`Package ${index + 1} (${pkg.name}): amenities =`, pkg.amenities?.length || 0, pkg.amenities);
      });

      setPackages(packagesArray);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(paths.buildApiUrl('packages.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFormData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Sales tool created successfully!');
        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          description: '',
          type: 'Romance',
          base_room_id: '',
          base_price: 0,
          min_nights: 1,
          max_nights: 30,
          max_guests: 2,
          discount_percentage: 0,
          is_active: true,
          inclusions: [] as string[],
          exclusions: [] as string[],
          featured: false
        });
        fetchPackages();
      } else {
        throw new Error(result.error || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Error creating sales tool: ' + error);
    }
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    try {
      // Prepare update data with proper field mapping to match database schema
      const updateData = {
        id: editingPackage.id,
        name: packageFormData.name,
        description: packageFormData.description,
        // Map frontend fields to database schema
        package_type: packageFormData.type,           // type -> package_type
        base_price: packageFormData.price,            // price -> base_price  
        min_nights: packageFormData.duration_days,    // duration_days -> min_nights
        max_guests: packageFormData.max_guests,
        is_active: packageFormData.available ? 1 : 0, // available -> is_active
        base_room_id: packageFormData.base_room_id || null, // Room connection
        // Handle JSON fields properly - send valid JSON arrays or null
        includes: Array.isArray(packageFormData.inclusions) && packageFormData.inclusions.length > 0
          ? JSON.stringify(packageFormData.inclusions)
          : null,
        exclusions: Array.isArray(packageFormData.exclusions) && packageFormData.exclusions.length > 0
          ? JSON.stringify(packageFormData.exclusions)
          : null,
        images: Array.isArray(packageFormData.images) && packageFormData.images.length > 0
          ? JSON.stringify(packageFormData.images)
          : null,
        valid_from: packageFormData.valid_from || null,
        valid_until: packageFormData.valid_until || null,
        terms_conditions: packageFormData.terms_conditions,
        // Add default values for missing fields
        discount_percentage: 0,
        max_nights: 30
      };



      const response = await fetch(paths.buildApiUrl('packages.php'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();


      if (result.success) {
        alert('Sales tool updated successfully!');
        setEditingPackage(null);
        setPackageFormData({
          name: '',
          description: '',
          type: 'Romance',
          price: 0,
          duration_days: 1,
          max_guests: 2,
          available: true,
          base_room_id: '',
          inclusions: [] as string[],
          exclusions: [] as string[],
          images: [] as string[],
          valid_from: '',
          valid_until: '',
          terms_conditions: ''
        });
        // Refresh the packages list
        await fetchPackages();
      } else {
        throw new Error(result.error || result.message || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Error updating sales tool: ' + error);
    }
  };

  const deletePackage = async (packageId: number) => {
    if (!confirm('Are you sure you want to delete this sales tool?')) return;

    try {
      const response = await fetch(paths.buildApiUrl('packages.php'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: packageId })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Sales tool deleted successfully!');
        fetchPackages();
      } else {
        throw new Error(result.error || 'Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Error deleting sales tool: ' + error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-5 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sales Tools Concept Header */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Gift className="w-6 h-6 text-purple-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold mb-2">🎁 Marketing Sales Tools</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Packages are marketing tools</strong> that combine room accommodation with services to create attractive bundled offers.
                Each package is based on an actual room (the real inventory). Package availability depends on room availability.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                💡 <strong>Business Logic:</strong> Room + Services = Sales Tool → Customer chooses bundle → Books room with services
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Sales Tools Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Marketing tools that bundle room + services for customer attraction</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Sales Tool
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Tools Created Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first sales tool to bundle rooms with services and start managing amenities.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 max-w-lg mx-auto">
            <h4 className="font-semibold text-gray-800 mb-3">🎯 Quick Start Guide:</h4>
            <ol className="text-sm text-gray-600 text-left space-y-2">
              <li><strong>1.</strong> Click "Add Sales Tool" above</li>
              <li><strong>2.</strong> Choose a base room and set pricing</li>
              <li><strong>3.</strong> Save your package</li>
              <li><strong>4.</strong> Use "Amenities" button to add features</li>
              <li><strong>5.</strong> Test the "Add" buttons for amenities!</li>
            </ol>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Sales Tool
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg, index) => {
            const baseRoom = rooms.find(room => room.id === pkg.base_room_id) || null;
            const isActive = pkg.available === 1 || pkg.available === '1' || pkg.is_active === 1 || pkg.is_active === '1' || pkg.active;

            return (
              <Card key={pkg.id || index}>
                <CardContent className="pt-6">
                  {/* Sales Tool Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">🎁 Sales Tool</Badge>
                        <Badge variant={isActive ? 'default' : 'destructive'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{pkg.name || 'Unnamed Sales Tool'}</h3>
                    </div>
                  </div>

                  {/* Base Room Information */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Base Room (Real Inventory)</span>
                    </div>
                    {baseRoom ? (
                      <div className="text-sm text-gray-600">
                        <p><strong>{baseRoom.name}</strong> - ${baseRoom.price}/night</p>
                        <p className="text-xs text-gray-500">Capacity: {baseRoom.capacity} guests | Type: {baseRoom.type}</p>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        ⚠️ No base room assigned - Package availability cannot be determined
                      </div>
                    )}
                  </div>

                  {/* Sales Tool Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span><strong>Bundle Price:</strong></span>
                      <span className="text-gray-800 font-semibold">${pkg.price || pkg.base_price || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span><strong>Marketing Category:</strong></span>
                      <span>{pkg.type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span><strong>Max Guests:</strong></span>
                      <span>{pkg.max_guests || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span><strong>Package Duration:</strong></span>
                      <span>{pkg.duration_days || pkg.min_nights || 'N/A'} {pkg.duration_days ? 'days' : 'nights'}</span>
                    </div>
                  </div>

                  {/* Business Logic Explanation */}
                  <div className="mt-4 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-gray-700">
                        <p className="font-medium">Marketing Tool:</p>
                        <p>This package is available only when the base room has inventory. Room availability controls package availability.</p>
                      </div>
                    </div>
                  </div>

                  {pkg.description && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-3">{pkg.description}</p>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPackage(pkg);
                        setPackageFormData({
                          name: pkg.name || '',
                          description: pkg.description || '',
                          type: pkg.type || 'Romance',
                          price: parseFloat(pkg.price || pkg.base_price || 0),
                          duration_days: parseInt(pkg.duration_days || pkg.min_nights || 1),
                          max_guests: parseInt(pkg.max_guests || 2),
                          available: pkg.available === 1 || pkg.available === '1' || pkg.is_active === 1 || pkg.is_active === '1' || pkg.active || false,
                          base_room_id: pkg.base_room_id || '',
                          inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions :
                            (pkg.inclusions ? JSON.parse(pkg.inclusions) : []),
                          exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions :
                            (pkg.exclusions ? JSON.parse(pkg.exclusions) : []),
                          images: Array.isArray(pkg.images) ? pkg.images :
                            (pkg.images ? JSON.parse(pkg.images) : []),
                          valid_from: pkg.valid_from || '',
                          valid_until: pkg.valid_until || '',
                          terms_conditions: pkg.terms_conditions || ''
                        });
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPackageForCalendar({ id: pkg.id, name: pkg.name });
                        setCalendarManagerOpen(true);
                      }}
                      title="Manage Calendar Integration"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Calendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPackageForAmenities({ id: pkg.id, name: pkg.name });
                        fetchPackageAmenities(pkg.id);
                        setShowAmenitiesModal(true);
                      }}
                      title="Manage Package Amenities"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Amenities
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPackageForInclusions({ id: pkg.id, name: pkg.name });
                        fetchPackageInclusions(pkg.id);
                        setShowInclusionsModal(true);
                      }}
                      title="Manage Package Inclusions"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Inclusions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPackageForRooms({ id: pkg.id, name: pkg.name });
                        setRoomsManagerOpen(true);
                      }}
                      title="Manage Package Rooms"
                    >
                      <Building className="h-4 w-4 mr-1" />
                      Rooms
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePackage(pkg.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Create New Sales Tool</h3>
                <p className="text-sm text-gray-600 mt-1">Bundle a room with services to create an attractive marketing package</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Tool Name</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Romantic Getaway, Family Adventure"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Room (Real Inventory) <span className="text-red-500">*</span>
                </label>
                <select
                  value={createFormData.base_room_id}
                  onChange={(e) => setCreateFormData({ ...createFormData, base_room_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select the room this sales tool is based on</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - ${room.price}/night (Capacity: {room.capacity})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Package availability will depend on this room's availability
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Category</label>
                  <select
                    value={createFormData.type}
                    onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {marketingCategories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                    {marketingCategories.length === 0 && (
                      <option value="Romance">Romance (default)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price</label>
                  <input
                    type="number"
                    value={createFormData.base_price}
                    onChange={(e) => setCreateFormData({ ...createFormData, base_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="Total package price"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Room + services combined price</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Pitch & Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the experience and value proposition. What makes this package attractive?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Focus on the combined value: room comfort + included services
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create Sales Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Package Modal - Enhanced with Business Logic */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Edit Sales Tool</h3>
                <p className="text-sm text-gray-600 mt-1">Update this marketing package that combines room + services</p>
              </div>
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setPackageFormData({
                    name: '',
                    description: '',
                    type: 'Romance',
                    price: 0,
                    duration_days: 1,
                    max_guests: 2,
                    available: true,
                    base_room_id: '',
                    inclusions: [] as string[],
                    exclusions: [] as string[],
                    images: [] as string[],
                    valid_from: '',
                    valid_until: '',
                    terms_conditions: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Business Logic Reminder */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Sales Tool Business Logic</h4>
                  <p className="text-xs text-blue-800">
                    This package is a <strong>marketing tool</strong> that bundles room accommodation with services.
                    Package availability depends on the base room's inventory. Update the sales presentation to attract customers.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdatePackage} className="space-y-6">
              {/* Current Base Room Info */}
              {(() => {
                const baseRoom = rooms.find(room => room.id === editingPackage.base_room_id) || null;
                return (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Current Base Room (Real Inventory)</span>
                    </div>
                    {baseRoom ? (
                      <div className="text-sm text-gray-600">
                        <p><strong>{baseRoom.name}</strong> - ${baseRoom.price}/night</p>
                        <p className="text-xs text-gray-500">
                          Capacity: {baseRoom.capacity} guests | Type: {baseRoom.type} |
                          <span className={baseRoom.available ? 'text-green-600' : 'text-red-600'}>
                            {baseRoom.available ? ' Available' : ' Disabled'}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        ⚠️ No base room assigned - Package availability cannot be determined
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Base Room Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change Base Room (Real Inventory) <span className="text-red-500">*</span>
                </label>
                <select
                  value={packageFormData.base_room_id}
                  onChange={(e) => setPackageFormData({ ...packageFormData, base_room_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select the room this sales tool is based on</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - ${room.price}/night (Capacity: {room.capacity}) {!room.available ? ' - DISABLED' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 <strong>Critical:</strong> Package availability will depend on this room's inventory. Choose the room that represents the actual accommodation being sold.
                </p>
              </div>

              {/* Package Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sales Tool Name</label>
                    <input
                      type="text"
                      value={packageFormData.name}
                      onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Romantic Getaway, Family Adventure"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Customer-facing package name</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Category</label>
                    <select
                      value={packageFormData.type}
                      onChange={(e) => setPackageFormData({ ...packageFormData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {marketingCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                      {marketingCategories.length === 0 && (
                        <option value="Romance">Romance (default)</option>
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Marketing category for filtering and presentation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Price</label>
                    <input
                      type="number"
                      value={packageFormData.price}
                      onChange={(e) => setPackageFormData({ ...packageFormData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="Total package price"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💰 <strong>Total value:</strong> Room base price + service add-ons + savings/discount
                    </p>
                  </div>
                </div>

                {/* Right Column - Package Configuration */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="number"
                        value={packageFormData.duration_days}
                        onChange={(e) => setPackageFormData({ ...packageFormData, duration_days: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        placeholder="Days"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Package length (days/nights)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                      <input
                        type="number"
                        value={packageFormData.max_guests}
                        onChange={(e) => setPackageFormData({ ...packageFormData, max_guests: parseInt(e.target.value) || 2 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        placeholder="Guests"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum occupancy</p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={packageFormData.available}
                        onChange={(e) => setPackageFormData({ ...packageFormData, available: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Sales Tool Active</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      ⚡ When enabled, customers can see and book this package (if base room has inventory)
                    </p>
                  </div>

                  {/* Business Logic Reminder */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium">Package Availability Logic:</p>
                        <p>Even if this sales tool is "Active", it will only be bookable when the base room has available inventory.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Date Range */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                  Package Availability Dates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                    <input
                      type="date"
                      value={packageFormData.valid_from}
                      onChange={(e) => setPackageFormData({ ...packageFormData, valid_from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">When this package becomes available for booking</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Until</label>
                    <input
                      type="date"
                      value={packageFormData.valid_until}
                      onChange={(e) => setPackageFormData({ ...packageFormData, valid_until: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">When this package is no longer available for booking</p>
                  </div>
                </div>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800">
                    <strong>💡 Tip:</strong> Leave dates empty for unlimited availability.
                    Set specific dates for seasonal packages, promotions, or limited-time offers.
                  </p>
                </div>
              </div>

              {/* Sales Pitch Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Pitch & Description</label>
                <textarea
                  value={packageFormData.description}
                  onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe the complete experience this package offers. Focus on the combined value of room comfort + included services + unique perks."
                />
                <p className="text-xs text-gray-500 mt-1">
                  🎯 <strong>Sales Strategy:</strong> Highlight the complete experience - what room features they get + what additional services are included + why this bundle is valuable
                </p>
              </div>

              {/* Package Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Images</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">
                      📸 Upload images to showcase this package. Images help customers visualize the experience.
                    </p>
                  </div>

                  {/* Current Images */}
                  {packageFormData.images.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h5>
                      <div className="grid grid-cols-3 gap-2">
                        {packageFormData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Package image ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                              onError={(e) => {
                                // Handle broken images
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5ID16IDggMTQuMjEgOCAxMlMxLjc5IDggMTIgOFMxNiA5Ljc5IDE2IDEyUzE0LjIxIDE2IDEyIDE2Wk0xMiA2QzguNjkgNiA2IDguNjkgNiAxMkM2IDE1LjMxIDguNjkgMTggMTIgMThDMTUuMzEgMTggMTggMTUuMzEgMTggMTJDMTggOC42OSAxNS4zMSA2IDEyIDZaTTEwIDEyQzEwIDEwLjkgMTAuOSAxMCAxMiAxMEMxMy4xIDEwIDE0IDEwLjkgMTQgMTJDMTQgMTMuMSAxMy4xIDE0IDEyIDE0QzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM2QjcyODAiLz4KPHN2Zz4K';
                                target.title = 'Failed to load image';
                              }}
                              onLoad={() => {
                                // Revoke any blob URLs after successful load to prevent memory leaks
                                if (image.startsWith('blob:')) {
                                  // Note: We don't revoke here as the image is still being used
                                  // Cleanup will happen when the image is removed or component unmounts
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                // Clean up blob URL if it exists
                                const imageToRemove = packageFormData.images[index];
                                if (imageToRemove && imageToRemove.startsWith('blob:')) {
                                  URL.revokeObjectURL(imageToRemove);
                                }

                                const newImages = packageFormData.images.filter((_, i) => i !== index);
                                setPackageFormData({ ...packageFormData, images: newImages });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="package-images"
                      multiple
                      accept="image/*"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files) {
                          // Validate files before processing
                          const validFiles = Array.from(files).filter(file => {
                            // Check file type
                            if (!file.type.startsWith('image/')) {
                              alert(`File "${file.name}" is not an image. Only image files are allowed.`);
                              return false;
                            }
                            // Check file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              alert(`File "${file.name}" is too large. Maximum file size is 10MB.`);
                              return false;
                            }
                            return true;
                          });

                          if (validFiles.length === 0) {
                            e.target.value = ''; // Reset input
                            return;
                          }

                          // Convert valid files to data URLs for safe preview
                          const filePromises = validFiles.map(file => {
                            return new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = (e) => resolve(e.target?.result as string);
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                          });

                          try {
                            const dataUrls = await Promise.all(filePromises);
                            setPackageFormData({
                              ...packageFormData,
                              images: [...packageFormData.images, ...dataUrls]
                            });
                            // Reset the input after successful processing
                            e.target.value = '';
                          } catch (error) {
                            console.error('Error reading files:', error);
                            alert('Error reading selected files. Please try again.');
                            e.target.value = ''; // Reset input on error
                          }
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="package-images" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload images</span>
                        <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Value Proposition Preview */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-2">📊 Sales Tool Preview</h4>
                <div className="text-xs text-green-800 space-y-1">
                  <p><strong>Package:</strong> {packageFormData.name || 'Untitled Package'}</p>
                  <p><strong>Category:</strong> {packageFormData.type}</p>
                  <p><strong>Bundle Price:</strong> ${packageFormData.price}/package ({packageFormData.duration_days} {packageFormData.duration_days === 1 ? 'day' : 'days'})</p>
                  <p><strong>Status:</strong> {packageFormData.available ? 'Active (subject to room inventory)' : 'Inactive'}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPackage(null);
                    setPackageFormData({
                      name: '',
                      description: '',
                      type: 'Romance',
                      price: 0,
                      duration_days: 1,
                      max_guests: 2,
                      available: true,
                      base_room_id: '',
                      inclusions: [] as string[],
                      exclusions: [] as string[],
                      images: [] as string[],
                      valid_from: '',
                      valid_until: '',
                      terms_conditions: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Update Sales Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Calendar Manager */}
      {selectedPackageForCalendar && (
        <PackageCalendarManager
          packageId={selectedPackageForCalendar.id}
          packageName={selectedPackageForCalendar.name}
          isOpen={calendarManagerOpen}
          onClose={() => {
            setCalendarManagerOpen(false);
            setSelectedPackageForCalendar(null);
          }}
        />
      )}

      {/* Package Rooms Manager */}
      {selectedPackageForRooms && (
        <PackageRoomsManager
          packageId={selectedPackageForRooms.id}
          packageName={selectedPackageForRooms.name}
          isOpen={roomsManagerOpen}
          onClose={() => {
            setRoomsManagerOpen(false);
            setSelectedPackageForRooms(null);
          }}
        />
      )}

      {/* Package Amenities Manager */}
      {showAmenitiesModal && selectedPackageForAmenities && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-hotel-gold-light bg-hotel-cream">
              <div>
                <h3 className="text-lg font-semibold text-hotel-navy">Manage Package Amenities</h3>
                <p className="text-sm text-hotel-bronze mt-1">
                  Configure amenities for "{selectedPackageForAmenities.name}"
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAmenitiesModal(false);
                  setSelectedPackageForAmenities(null);
                  setPackageAmenities([]);
                }}
                className="text-hotel-bronze hover:text-hotel-navy"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Amenities */}
                <div>
                  <h4 className="text-md font-semibold text-hotel-navy mb-4 flex items-center">
                    <Plus className="h-5 w-5 mr-2 text-hotel-gold" />
                    Available Amenities
                  </h4>

                  {amenities.length === 0 ? (
                    <div className="text-center py-8 text-hotel-bronze">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No amenities available</p>
                      <p className="text-sm text-gray-400 mt-1">Create amenities in the Amenities Management section first</p>
                      <div className="mt-4 p-4 bg-hotel-cream rounded-lg text-left">
                        <p className="text-xs text-hotel-bronze font-medium mb-2">Quick Setup:</p>
                        <p className="text-xs text-hotel-bronze">1. Go to \"Amenities\" tab in admin panel</p>
                        <p className="text-xs text-hotel-bronze">2. Create amenities like \"Swimming Pool\", \"Free WiFi\", etc.</p>
                        <p className="text-xs text-hotel-bronze">3. Or run the sample amenities SQL in: /sample-data/sample-amenities.sql</p>
                      </div>
                      <button
                        onClick={() => {
                          console.log('Retrying amenities fetch...');
                          fetchAmenities();
                        }}
                        className="mt-3 bg-hotel-gold text-white px-4 py-2 rounded text-sm hover:bg-hotel-gold-dark"
                      >
                        Retry Loading
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <div className="text-xs text-hotel-bronze mb-2">Found {amenities.length} amenities</div>
                      {amenities.map((amenity) => {
                        const isAssigned = packageAmenities.some(pa => pa.id === amenity.id);
                        return (
                          <div key={amenity.id} className={`p-3 border rounded-lg transition-colors ${isAssigned
                            ? 'bg-hotel-cream border-hotel-gold text-hotel-bronze'
                            : 'bg-white border-gray-200 hover:border-hotel-gold-light'
                            }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{amenity.name}</span>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {amenity.category}
                                  </span>
                                  {!!amenity.is_featured && (
                                    <span className="text-xs bg-hotel-gold text-white px-2 py-1 rounded">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                {amenity.description && (
                                  <p className="text-xs text-gray-500 mt-1">{amenity.description}</p>
                                )}
                              </div>

                              {!isAssigned ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Add button clicked for amenity:', amenity.id, 'to package:', selectedPackageForAmenities.id);
                                    addAmenityToPackage(selectedPackageForAmenities.id, amenity.id);
                                  }}
                                  className="bg-hotel-gold text-white px-3 py-1 rounded text-sm hover:bg-hotel-gold-dark cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:ring-opacity-50"
                                >
                                  Add
                                </button>
                              ) : (
                                <span className="text-xs text-hotel-sage font-medium">Added</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Assigned Amenities */}
                <div>
                  <h4 className="text-md font-semibold text-hotel-navy mb-4 flex items-center">
                    <Check className="h-5 w-5 mr-2 text-hotel-sage" />
                    Package Amenities ({packageAmenities.length})
                  </h4>

                  {packageAmenities.length === 0 ? (
                    <div className="text-center py-12 text-hotel-bronze">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No amenities assigned to this package</p>
                      <p className="text-sm text-gray-400 mt-1">Add amenities from the left panel</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {packageAmenities.map((amenity) => (
                        <div key={amenity.id} className="p-3 bg-hotel-cream border border-hotel-gold-light rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-hotel-navy">{amenity.name}</span>
                                <span className="text-xs bg-hotel-gold/20 text-hotel-gold px-2 py-1 rounded">
                                  {amenity.category}
                                </span>
                                {!!amenity.is_highlighted && (
                                  <span className="text-xs bg-hotel-sage text-white px-2 py-1 rounded">
                                    Highlighted
                                  </span>
                                )}
                              </div>
                              {amenity.description && (
                                <p className="text-xs text-hotel-bronze mt-1">{amenity.description}</p>
                              )}
                              {amenity.custom_note && (
                                <p className="text-xs text-hotel-gold mt-1 italic">
                                  Note: {amenity.custom_note}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Toggle highlight for amenity:', amenity.id);
                                  addAmenityToPackage(selectedPackageForAmenities.id, amenity.id, !amenity.is_highlighted);
                                }}
                                className={`px-2 py-1 rounded text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${!!amenity.is_highlighted
                                  ? 'bg-hotel-sage text-white focus:ring-hotel-sage'
                                  : 'bg-gray-200 text-gray-600 hover:bg-hotel-sage hover:text-white focus:ring-hotel-sage'
                                  }`}
                                title="Toggle highlight"
                              >
                                ⭐
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Remove amenity:', amenity.id, 'from package:', selectedPackageForAmenities.id);
                                  removeAmenityFromPackage(selectedPackageForAmenities.id, amenity.id);
                                }}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Inclusions Modal */}
      {showInclusionsModal && selectedPackageForInclusions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-hotel-navy">
                Manage Inclusions - {selectedPackageForInclusions.name}
              </h3>
              <button
                onClick={() => {
                  setShowInclusionsModal(false);
                  setSelectedPackageForInclusions(null);
                  setPackageInclusions([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Available Inclusions */}
                <div>
                  <h4 className="text-lg font-semibold text-hotel-navy mb-4">Available Inclusions</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {inclusions.map((inclusion) => {
                      const isAssigned = packageInclusions.some(pa => pa.inclusion_id === inclusion.id);
                      return (
                        <div
                          key={inclusion.id}
                          className={`p-3 border rounded-lg ${isAssigned ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200 hover:border-hotel-sage'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-hotel-navy">{inclusion.name}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{inclusion.category}</span>
                              </div>
                              {inclusion.description && (
                                <p className="text-xs text-gray-600 mt-1">{inclusion.description}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              disabled={isAssigned}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Add inclusion:', inclusion.id, 'to package:', selectedPackageForInclusions.id);
                                addInclusionToPackage(selectedPackageForInclusions.id, inclusion.id);
                              }}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isAssigned
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-hotel-sage text-white hover:bg-hotel-sage-dark focus:ring-hotel-sage'
                                }`}
                            >
                              {isAssigned ? 'Added' : 'Add'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Inclusions */}
                <div>
                  <h4 className="text-lg font-semibold text-hotel-navy mb-4">
                    Package Inclusions ({packageInclusions.length})
                  </h4>
                  {packageInclusions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Check className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No inclusions assigned to this package yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {packageInclusions.map((inclusion) => (
                        <div key={inclusion.inclusion_id} className="bg-hotel-sage/10 border border-hotel-sage/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-hotel-navy">{inclusion.name}</span>
                                <span className="text-xs bg-hotel-sage/20 text-hotel-sage px-2 py-1 rounded">{inclusion.category}</span>
                              </div>
                              {inclusion.description && (
                                <p className="text-xs text-gray-600 mt-1">{inclusion.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Remove inclusion:', inclusion.inclusion_id, 'from package:', selectedPackageForInclusions.id);
                                  removeInclusionFromPackage(selectedPackageForInclusions.id, inclusion.inclusion_id);
                                }}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesSection;
