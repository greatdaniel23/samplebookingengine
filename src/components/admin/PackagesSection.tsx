import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar, Plus, Building, Info, X, AlertTriangle, Check, ImagePlus, Sparkles, Pencil, Trash2, Gift } from 'lucide-react';
import { paths } from '@/config/paths';
import { apiClient } from '@/utils/apiClient';
import { ImageManager } from '@/components/ImageManager';
import { PackageCalendarManager } from './PackageCalendarManager';
import { PackageRoomsManager } from './PackageRoomsManager';
import R2ImagePicker from './R2ImagePicker';
import { getImageUrl } from '@/config/r2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

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
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [deletePackageTarget, setDeletePackageTarget] = useState<{ id: number, name: string } | null>(null);

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
      const response = await fetch(paths.buildApiUrl('marketing-categories'));
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
      const apiUrl = paths.buildApiUrl('rooms');
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
      const apiUrl = paths.buildApiUrl('amenities');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      // API returns data in 'data' field, not 'amenities'
      if (data.success && (data.data || data.amenities)) {
        setAmenities(data.data || data.amenities || []);
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
      const apiUrl = paths.buildApiUrl('inclusions');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      // API returns data in 'data.inclusions' format
      if (data.success) {
        const inclusionsList = data.data?.inclusions || data.inclusions || [];
        setInclusions(inclusionsList);
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
      // Use Cloudflare Worker API
      const apiUrl = paths.buildApiUrl(`packages/${packageId}/amenities`);
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
      const data = await apiClient.post<any>(
        `/api/packages/${packageId}/amenities`,
        { amenity_id: amenityId, is_highlighted: isHighlighted }
      );
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
      const data = await apiClient.delete<any>(`/api/packages/${packageId}/amenities/${amenityId}`);
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
      const apiUrl = paths.buildApiUrl(`packages/${packageId}/inclusions`);
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
      const data = await apiClient.post<any>(
        `/api/packages/${packageId}/inclusions`,
        { inclusion_id: inclusionId }
      );
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
      const data = await apiClient.delete<any>(`/api/packages/${packageId}/inclusions/${inclusionId}`);
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
      const apiUrl = paths.buildApiUrl('packages');
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
      const result = await apiClient.post<any>('/api/packages', createFormData);
      if (result.success) {
        toast.success('Package created');
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
      toast.error(error instanceof Error ? error.message : 'Could not create package');
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



      const result = await apiClient.put<any>('/api/packages', updateData);

      if (result.success) {
        toast.success('Package updated');
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
      toast.error(error instanceof Error ? error.message : 'Could not update package');
    }
  };

  const deletePackage = async (packageId: number) => {
    try {
      const result = await apiClient.deleteWithBody<any>('/api/packages', { id: packageId });
      if (result.success) {
        toast.success('Package removed');
        fetchPackages();
      } else {
        throw new Error(result.error || 'Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error(error instanceof Error ? error.message : 'Could not remove package');
    } finally {
      setDeletePackageTarget(null);
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

  // Samudra input styles — mirrors BookingsSection
  const samudraInput = "h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors";
  const samudraSelect = "h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors";
  const samudraTextarea = "w-full bg-samudra-paper border border-samudra-paper-deep px-3 py-2 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors resize-none";

  return (
    <div className="space-y-6">
      {/* Samudra section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">experiences</p>
          <h2 className="font-display text-[40px] font-light text-samudra-ink">Packages</h2>
          <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="h-11 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase px-7 font-medium transition-colors"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="bg-samudra-paper border border-samudra-paper-deep p-12 text-center">
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-3">no packages yet</p>
          <p className="text-[13px] text-samudra-ink-mute mb-6 max-w-sm mx-auto">Create your first package to bundle rooms with experiences and start managing offerings.</p>
          <Button onClick={() => setShowCreateModal(true)}
            variant="outline"
            className="h-11 border-samudra-ink text-samudra-ink hover:bg-samudra-paper-soft text-[11px] tracking-[0.3em] uppercase px-7"
            style={{ fontFamily: 'var(--font-label)' }}>
            + Add Package
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg, index) => {
            const baseRoom = rooms.find(room => room.id === pkg.base_room_id) || null;
            const isActive = pkg.available === 1 || pkg.available === '1' || pkg.is_active === 1 || pkg.is_active === '1' || pkg.active;

            return (
              <div key={pkg.id || index} className="bg-samudra-paper border border-samudra-paper-deep card-accent-teal flex flex-col">
                <div className="p-5 flex-1">
                  {/* Package header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="eyebrow text-samudra-ink-mute mb-1">Package</p>
                      <h3 className="font-display text-[20px] font-light text-samudra-ink leading-tight">{pkg.name || 'Unnamed Package'}</h3>
                    </div>
                    <span className={`ml-3 flex-shrink-0 eyebrow text-[10px] px-2 py-1 border ${isActive
                      ? 'border-samudra-teal text-samudra-teal'
                      : 'border-samudra-ink-mute text-samudra-ink-mute'
                    }`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Base Room */}
                  <div className="mt-3 p-3 border border-samudra-paper-deep bg-samudra-paper-soft">
                    <p className="eyebrow text-samudra-ink-mute mb-1">Base Suite</p>
                    {baseRoom ? (
                      <p className="text-[13px] text-samudra-ink">{baseRoom.name} — Rp {Number(baseRoom.price || 0).toLocaleString('id-ID')}/night</p>
                    ) : (
                      <p className="text-[13px] text-[#7a3d31]">No base room assigned</p>
                    )}
                  </div>

                  {/* Package details */}
                  <div className="space-y-2 mt-4">
                    {[
                      { label: 'Price',    value: `Rp ${Number(pkg.price || pkg.base_price || 0).toLocaleString('id-ID')}` },
                      { label: 'Category', value: pkg.type || 'N/A' },
                      { label: 'Guests',   value: pkg.max_guests ? `${pkg.max_guests} max` : 'N/A' },
                      { label: 'Duration', value: pkg.duration_days ? `${pkg.duration_days} days` : pkg.min_nights ? `${pkg.min_nights} nights` : 'N/A' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-baseline">
                        <span className="eyebrow text-samudra-ink-mute">{label}</span>
                        <span className="text-[13px] text-samudra-ink is-numeric">{value}</span>
                      </div>
                    ))}
                  </div>

                  {pkg.description && (
                    <p className="mt-4 text-[13px] text-samudra-ink-mute line-clamp-2">{pkg.description}</p>
                  )}
                </div>

                {/* Card footer — primary Edit + link-style secondary actions */}
                <div className="border-t border-samudra-paper-deep p-4">
                  <Button
                    className="w-full h-10 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase mb-3 transition-colors"
                    style={{ fontFamily: 'var(--font-label)' }}
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
                        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : (pkg.inclusions ? JSON.parse(pkg.inclusions) : []),
                        exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions : (pkg.exclusions ? JSON.parse(pkg.exclusions) : []),
                        images: Array.isArray(pkg.images) ? pkg.images : (pkg.images ? JSON.parse(pkg.images) : []),
                        valid_from: pkg.valid_from || '',
                        valid_until: pkg.valid_until || '',
                        terms_conditions: pkg.terms_conditions || ''
                      });
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit Package
                  </Button>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0">
                      {[
                        { icon: Calendar, label: 'Calendar', action: () => { setSelectedPackageForCalendar({ id: pkg.id, name: pkg.name }); setCalendarManagerOpen(true); } },
                        { icon: Sparkles, label: 'Amenities', action: () => { setSelectedPackageForAmenities({ id: pkg.id, name: pkg.name }); fetchPackageAmenities(pkg.id); setShowAmenitiesModal(true); } },
                        { icon: Check,    label: 'Inclusions', action: () => { setSelectedPackageForInclusions({ id: pkg.id, name: pkg.name }); fetchPackageInclusions(pkg.id); setShowInclusionsModal(true); } },
                        { icon: Building, label: 'Rooms', action: () => { setSelectedPackageForRooms({ id: pkg.id, name: pkg.name }); setRoomsManagerOpen(true); } },
                      ].map(({ icon: Icon, label, action }, i, arr) => (
                        <React.Fragment key={label}>
                          <button onClick={action} className="eyebrow text-[10px] text-samudra-ink-mute hover:text-samudra-ink transition-colors py-1 px-1.5"
                            style={{ fontFamily: 'var(--font-label)' }} title={label}>
                            {label}
                          </button>
                          {i < arr.length - 1 && <span className="text-samudra-ink-mute/40 text-[10px]">·</span>}
                        </React.Fragment>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" aria-label={`Delete ${pkg.name}`}
                      className="h-8 w-8 p-0 text-[#7a3d31] hover:bg-[#7a3d31]/10"
                      onClick={() => setDeletePackageTarget({ id: pkg.id, name: pkg.name })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Package Dialog — Radix Dialog pattern */}
      <Dialog open={showCreateModal} onOpenChange={(open) => { if (!open) setShowCreateModal(false); }}>
        <DialogContent className="max-w-2xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">New Package</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="eyebrow block mb-2">Package Name *</label>
                <input type="text" required placeholder="e.g., Romantic Getaway, Family Adventure"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
              <div>
                <label className="eyebrow block mb-2">Base Suite *</label>
                <select required value={createFormData.base_room_id}
                  onChange={(e) => setCreateFormData({ ...createFormData, base_room_id: e.target.value })}
                  className={samudraSelect} style={{ fontFamily: 'var(--font-label)' }}>
                  <option value="">Select base suite</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} — Rp {Number(room.price || 0).toLocaleString('id-ID')}/night (cap. {room.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow block mb-2">Category</label>
                  <select value={createFormData.type}
                    onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                    className={samudraSelect} style={{ fontFamily: 'var(--font-label)' }}>
                    {marketingCategories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    {marketingCategories.length === 0 && <option value="Romance">Romance</option>}
                  </select>
                </div>
                <div>
                  <label className="eyebrow block mb-2">Bundle Price *</label>
                  <input type="number" min="0" step="0.01" required placeholder="Total price"
                    value={createFormData.base_price}
                    onChange={(e) => setCreateFormData({ ...createFormData, base_price: parseFloat(e.target.value) || 0 })}
                    className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
                </div>
              </div>
              <div>
                <label className="eyebrow block mb-2">Description</label>
                <textarea rows={3} placeholder="Describe the experience and value"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className={samudraTextarea} style={{ fontFamily: 'var(--font-label)' }} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-samudra-paper-deep">
                <Button type="button" variant="outline"
                  className="h-11 border-samudra-ink text-samudra-ink bg-samudra-paper hover:bg-samudra-paper-soft text-[11px] tracking-[0.3em] uppercase px-6"
                  style={{ fontFamily: 'var(--font-label)' }}
                  onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit"
                  className="h-11 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal text-[11px] tracking-[0.3em] uppercase px-6"
                  style={{ fontFamily: 'var(--font-label)' }}>Create Package</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Package Dialog — Radix Dialog pattern */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => { if (!open) { setEditingPackage(null); } }}>
        <DialogContent className="max-w-4xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">Edit Package</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <form onSubmit={handleUpdatePackage} className="space-y-5">
              {/* Current Base Suite info */}
              {editingPackage && (() => {
                const baseRoom = rooms.find(room => room.id === editingPackage.base_room_id) || null;
                return (
                  <div className="p-3 border border-samudra-paper-deep bg-samudra-paper-soft">
                    <p className="eyebrow text-samudra-ink-mute mb-1">Current Base Suite</p>
                    {baseRoom ? (
                      <p className="text-[13px] text-samudra-ink">{baseRoom.name} — Rp {Number(baseRoom.price || 0).toLocaleString('id-ID')}/night · cap. {baseRoom.capacity}</p>
                    ) : (
                      <p className="text-[13px] text-[#7a3d31]">No base room assigned</p>
                    )}
                  </div>
                );
              })()}

              {/* Base Room Selection */}
              <div>
                <label className="eyebrow block mb-2">Base Suite *</label>
                <select required value={packageFormData.base_room_id}
                  onChange={(e) => setPackageFormData({ ...packageFormData, base_room_id: e.target.value })}
                  className={samudraSelect} style={{ fontFamily: 'var(--font-label)' }}>
                  <option value="">Select base suite</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} — Rp {Number(room.price || 0).toLocaleString('id-ID')}/night (cap. {room.capacity}) {!room.available ? ' [inactive]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Package Details — 2-col grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow block mb-2">Package Name *</label>
                  <input
                    type="text"
                    value={packageFormData.name}
                    onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                    className={samudraInput}
                    style={{ fontFamily: 'var(--font-label)' }}
                    placeholder="e.g., Romantic Getaway"
                    required
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-2">Category</label>
                  <select
                    value={packageFormData.type}
                    onChange={(e) => setPackageFormData({ ...packageFormData, type: e.target.value })}
                    className={samudraSelect}
                    style={{ fontFamily: 'var(--font-label)' }}
                  >
                    {marketingCategories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                      {marketingCategories.length === 0 && (
                        <option value="Romance">Romance</option>
                      )}
                  </select>
                </div>

                <div>
                  <label className="eyebrow block mb-2">Bundle Price (IDR) *</label>
                  <input
                    type="number"
                    value={packageFormData.price}
                    onChange={(e) => setPackageFormData({ ...packageFormData, price: parseFloat(e.target.value) || 0 })}
                    className={samudraInput}
                    style={{ fontFamily: 'var(--font-label)' }}
                    min="0"
                    step="0.01"
                    placeholder="Total package price"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="eyebrow block mb-2">Duration (days) *</label>
                    <input
                      type="number"
                      value={packageFormData.duration_days}
                      onChange={(e) => setPackageFormData({ ...packageFormData, duration_days: parseInt(e.target.value) || 1 })}
                      className={samudraInput}
                      style={{ fontFamily: 'var(--font-label)' }}
                      min="1"
                      placeholder="Days"
                      required
                    />
                  </div>
                  <div>
                    <label className="eyebrow block mb-2">Max Guests *</label>
                    <input
                      type="number"
                      value={packageFormData.max_guests}
                      onChange={(e) => setPackageFormData({ ...packageFormData, max_guests: parseInt(e.target.value) || 2 })}
                      className={samudraInput}
                      style={{ fontFamily: 'var(--font-label)' }}
                      min="1"
                      placeholder="Guests"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="edit-pkg-available"
                  checked={packageFormData.available}
                  onChange={(e) => setPackageFormData({ ...packageFormData, available: e.target.checked })}
                  className="w-4 h-4 accent-samudra-teal"
                />
                <label htmlFor="edit-pkg-available" className="eyebrow cursor-pointer">
                  Package Active
                </label>
              </div>

              {/* Availability Window */}
              <div>
                <p className="eyebrow mb-3">Availability Window</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="eyebrow block mb-2">Available From</label>
                    <input
                      type="date"
                      value={packageFormData.valid_from}
                      onChange={(e) => setPackageFormData({ ...packageFormData, valid_from: e.target.value })}
                      className={samudraInput}
                      style={{ fontFamily: 'var(--font-label)' }}
                    />
                  </div>
                  <div>
                    <label className="eyebrow block mb-2">Available Until</label>
                    <input
                      type="date"
                      value={packageFormData.valid_until}
                      onChange={(e) => setPackageFormData({ ...packageFormData, valid_until: e.target.value })}
                      className={samudraInput}
                      style={{ fontFamily: 'var(--font-label)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="eyebrow block mb-2">Description</label>
                <textarea
                  value={packageFormData.description}
                  onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
                  className={samudraTextarea}
                  style={{ fontFamily: 'var(--font-label)' }}
                  rows={4}
                  placeholder="Describe the complete experience this package offers."
                />
              </div>

              {/* Package Images */}
              <div>
                <label className="eyebrow block mb-3">Package Images</label>
                {packageFormData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {packageFormData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Package image ${index + 1}`}
                          className="w-full h-20 object-cover border border-samudra-paper-deep"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDE2IDggMTQuMjEgOCAxMlMxLjc5IDggMTIgOFMxNiA5Ljc5IDE2IDEyUzE0LjIxIDE2IDEyIDE2Wk0xMiA2QzguNjkgNiA2IDguNjkgNiAxMkM2IDE1LjMxIDguNjkgMTggMTIgMThDMTUuMzEgMTggMTggMTUuMzEgMTggMTJDMTggOC42OSAxNS4zMSA2IDEyIDZaTTEwIDEyQzEwIDEwLjkgMTAuOSAxMCAxMiAxMEMxMy4xIDEwIDE0IDEwLjkgMTQgMTJDMTQgMTMuMSAxMy4xIDE0IDEyIDE0QzEwLjkgMTQgMTAgMTMuMSAxMCAxMloiIGZpbGw9IiM2QjcyODAiLz4KPHN2Zz4K';
                            target.title = 'Failed to load image';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const imageToRemove = packageFormData.images[index];
                            if (imageToRemove && imageToRemove.startsWith('blob:')) {
                              URL.revokeObjectURL(imageToRemove);
                            }
                            const newImages = packageFormData.images.filter((_, i) => i !== index);
                            setPackageFormData({ ...packageFormData, images: newImages });
                          }}
                          className="absolute top-1 right-1 bg-samudra-ink text-samudra-paper w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowImagePicker(true)}
                  className="h-11 border border-samudra-ink text-samudra-ink eyebrow px-6 hover:bg-samudra-paper-deep transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Select from Storage
                </button>
              </div>

              {/* R2 Image Picker Dialog */}
              <Dialog open={showImagePicker} onOpenChange={setShowImagePicker}>
                <DialogContent className="max-w-4xl bg-samudra-paper border border-samudra-paper-deep p-8" style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
                  <DialogHeader className="mb-6">
                    <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">Select Package Image</DialogTitle>
                  </DialogHeader>
                  <R2ImagePicker
                    onSelect={(imageId) => {
                      const imageUrl = getImageUrl(imageId);
                      setPackageFormData({
                        ...packageFormData,
                        images: [...packageFormData.images, imageUrl]
                      });
                      setShowImagePicker(false);
                    }}
                    prefix=""
                  />
                </DialogContent>
              </Dialog>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-samudra-paper-deep">
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
                  className="h-11 border border-samudra-paper-deep text-samudra-ink-mute eyebrow px-6 hover:border-samudra-ink hover:text-samudra-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 bg-samudra-ink text-samudra-paper eyebrow px-7 hover:bg-samudra-teal transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Update Package
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Package Calendar Manager */}
      {
        selectedPackageForCalendar && (
          <PackageCalendarManager
            packageId={selectedPackageForCalendar.id}
            packageName={selectedPackageForCalendar.name}
            isOpen={calendarManagerOpen}
            onClose={() => {
              setCalendarManagerOpen(false);
              setSelectedPackageForCalendar(null);
            }}
          />
        )
      }

      {/* Package Rooms Manager */}
      {
        selectedPackageForRooms && (
          <PackageRoomsManager
            packageId={selectedPackageForRooms.id}
            packageName={selectedPackageForRooms.name}
            isOpen={roomsManagerOpen}
            onClose={() => {
              setRoomsManagerOpen(false);
              setSelectedPackageForRooms(null);
            }}
          />
        )
      }

      {/* Package Amenities Manager — Radix Dialog */}
      <Dialog open={showAmenitiesModal && !!selectedPackageForAmenities} onOpenChange={(open) => {
        if (!open) { setShowAmenitiesModal(false); setSelectedPackageForAmenities(null); setPackageAmenities([]); }
      }}>
        <DialogContent className="max-w-4xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">
              Package Amenities
            </DialogTitle>
            {selectedPackageForAmenities && (
              <p className="eyebrow text-samudra-ink-mute mt-1">
                {selectedPackageForAmenities.name}
              </p>
            )}
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto pr-1">
            {selectedPackageForAmenities && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Amenities */}
                <div>
                  <p className="eyebrow text-samudra-ink-mute mb-4">Available Amenities</p>

                  {amenities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="font-script text-samudra-gold text-[18px] leading-none mb-2">no amenities yet</p>
                      <p className="eyebrow text-samudra-ink-mute mb-4">Create amenities in the Amenities section first.</p>
                      <button
                        onClick={() => fetchAmenities()}
                        className="h-9 px-4 border border-samudra-ink text-samudra-ink hover:bg-samudra-paper-soft eyebrow text-[10px] tracking-[0.3em] transition-colors"
                        style={{ fontFamily: 'var(--font-label)' }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <p className="eyebrow text-samudra-ink-mute text-[10px] mb-2">{amenities.length} amenities found</p>
                      {amenities.map((amenity) => {
                        const isAssigned = packageAmenities.some(pa => pa.id === amenity.id);
                        return (
                          <div key={amenity.id} className={`p-3 border transition-colors ${isAssigned
                            ? 'bg-samudra-paper-soft border-samudra-paper-deep'
                            : 'bg-samudra-paper border-samudra-paper-deep hover:border-samudra-teal'
                          }`}>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-display text-[14px] text-samudra-ink">{amenity.name}</span>
                                  <span className="eyebrow text-[9px] px-1.5 py-0.5 border border-samudra-paper-deep text-samudra-ink-mute">
                                    {amenity.category}
                                  </span>
                                  {!!amenity.is_featured && (
                                    <span className="eyebrow text-[9px] px-1.5 py-0.5 border border-samudra-gold text-samudra-gold">Featured</span>
                                  )}
                                </div>
                                {amenity.description && (
                                  <p className="eyebrow text-samudra-ink-mute text-[10px] mt-1">{amenity.description}</p>
                                )}
                              </div>
                              {!isAssigned ? (
                                <button type="button"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addAmenityToPackage(selectedPackageForAmenities.id, amenity.id); }}
                                  className="h-8 px-3 border border-samudra-teal text-samudra-teal hover:bg-samudra-teal hover:text-samudra-paper eyebrow text-[10px] tracking-[0.2em] transition-colors flex-shrink-0"
                                  style={{ fontFamily: 'var(--font-label)' }}
                                >
                                  Add
                                </button>
                              ) : (
                                <span className="eyebrow text-[10px] text-samudra-teal flex-shrink-0">Added</span>
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
                  <p className="eyebrow text-samudra-ink-mute mb-4">Assigned ({packageAmenities.length})</p>

                  {packageAmenities.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="font-script text-samudra-gold text-[18px] leading-none mb-1">none assigned yet</p>
                      <p className="eyebrow text-samudra-ink-mute text-[10px]">Add from the left panel</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {packageAmenities.map((amenity) => (
                        <div key={amenity.id} className="p-3 bg-samudra-paper-soft border border-samudra-paper-deep">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display text-[14px] text-samudra-ink">{amenity.name}</span>
                                <span className="eyebrow text-[9px] px-1.5 py-0.5 border border-samudra-gold text-samudra-gold">
                                  {amenity.category}
                                </span>
                                {!!amenity.is_highlighted && (
                                  <span className="eyebrow text-[9px] px-1.5 py-0.5 border border-samudra-teal text-samudra-teal">Highlighted</span>
                                )}
                              </div>
                              {amenity.description && (
                                <p className="eyebrow text-samudra-ink-mute text-[10px] mt-1">{amenity.description}</p>
                              )}
                              {amenity.custom_note && (
                                <p className="font-script text-samudra-gold text-[13px] mt-1">Note: {amenity.custom_note}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addAmenityToPackage(selectedPackageForAmenities.id, amenity.id, !amenity.is_highlighted); }}
                                className={`h-7 px-2 eyebrow text-[9px] tracking-[0.15em] transition-colors ${!!amenity.is_highlighted
                                  ? 'bg-samudra-teal text-samudra-paper'
                                  : 'border border-samudra-paper-deep text-samudra-ink-mute hover:border-samudra-teal hover:text-samudra-teal'
                                }`}
                                style={{ fontFamily: 'var(--font-label)' }}
                                title="Toggle highlight"
                              >
                                {!!amenity.is_highlighted ? 'Highlighted' : 'Highlight'}
                              </button>
                              <button type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeAmenityFromPackage(selectedPackageForAmenities.id, amenity.id); }}
                                className="h-7 px-2 border border-[#7a3d31] text-[#7a3d31] hover:bg-[#7a3d31] hover:text-samudra-paper eyebrow text-[9px] transition-colors"
                                style={{ fontFamily: 'var(--font-label)' }}
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
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Package Inclusions Modal — Radix Dialog */}
      <Dialog open={showInclusionsModal && !!selectedPackageForInclusions} onOpenChange={(open) => {
        if (!open) { setShowInclusionsModal(false); setSelectedPackageForInclusions(null); setPackageInclusions([]); }
      }}>
        <DialogContent className="max-w-4xl bg-samudra-paper border border-samudra-paper-deep p-8"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">
              Package Inclusions
            </DialogTitle>
            {selectedPackageForInclusions && (
              <p className="eyebrow text-samudra-ink-mute mt-1">
                {selectedPackageForInclusions.name}
              </p>
            )}
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto pr-1">
            {selectedPackageForInclusions && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Inclusions */}
                <div>
                  <p className="eyebrow text-samudra-ink-mute mb-4">Available Inclusions</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {inclusions.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="font-script text-samudra-gold text-[18px] leading-none mb-1">no inclusions yet</p>
                        <p className="eyebrow text-samudra-ink-mute text-[10px]">Create inclusions in the Amenities section.</p>
                      </div>
                    ) : inclusions.map((inclusion) => {
                      const isAssigned = packageInclusions.some(pa => pa.inclusion_id === inclusion.id);
                      return (
                        <div key={inclusion.id}
                          className={`p-3 border transition-colors ${isAssigned
                            ? 'bg-samudra-paper-soft border-samudra-paper-deep'
                            : 'bg-samudra-paper border-samudra-paper-deep hover:border-samudra-teal'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display text-[14px] text-samudra-ink">{inclusion.name}</span>
                                <span className="eyebrow text-[9px] px-1.5 py-0.5 border border-samudra-paper-deep text-samudra-ink-mute">
                                  {inclusion.category}
                                </span>
                              </div>
                              {inclusion.description && (
                                <p className="eyebrow text-samudra-ink-mute text-[10px] mt-1">{inclusion.description}</p>
                              )}
                            </div>
                            <button type="button"
                              disabled={isAssigned}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addInclusionToPackage(selectedPackageForInclusions.id, inclusion.id);
                              }}
                              className={`h-8 px-3 eyebrow text-[10px] tracking-[0.2em] transition-colors flex-shrink-0 ${isAssigned
                                ? 'border border-samudra-paper-deep text-samudra-ink-mute cursor-not-allowed'
                                : 'border border-samudra-teal text-samudra-teal hover:bg-samudra-teal hover:text-samudra-paper'
                              }`}
                              style={{ fontFamily: 'var(--font-label)' }}
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
                  <p className="eyebrow text-samudra-ink-mute mb-4">Assigned ({packageInclusions.length})</p>
                  {packageInclusions.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="font-script text-samudra-gold text-[18px] leading-none mb-1">none assigned yet</p>
                      <p className="eyebrow text-samudra-ink-mute text-[10px]">Add from the left panel</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {packageInclusions.map((inclusion) => (
                        <div key={inclusion.inclusion_id} className="p-3 bg-samudra-paper-soft border border-samudra-teal/30">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display text-[14px] text-samudra-ink">{inclusion.name}</span>
                                <span className="eyebrow text-[9px] px-1.5 py-0.5 border border-samudra-teal text-samudra-teal">
                                  {inclusion.category}
                                </span>
                              </div>
                              {inclusion.description && (
                                <p className="eyebrow text-samudra-ink-mute text-[10px] mt-1">{inclusion.description}</p>
                              )}
                            </div>
                            <button type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeInclusionFromPackage(selectedPackageForInclusions.id, inclusion.inclusion_id);
                              }}
                              className="h-8 px-3 border border-[#7a3d31] text-[#7a3d31] hover:bg-[#7a3d31] hover:text-samudra-paper eyebrow text-[9px] tracking-[0.15em] transition-colors flex-shrink-0"
                              style={{ fontFamily: 'var(--font-label)' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Package Confirmation */}
      <AlertDialog open={!!deletePackageTarget} onOpenChange={(open) => { if (!open) setDeletePackageTarget(null); }}>
        <AlertDialogContent className="bg-samudra-paper border border-samudra-paper-deep">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[22px] font-normal text-samudra-ink">Remove package?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-samudra-ink-mute" style={{ fontFamily: 'var(--font-label)' }}>
              "{deletePackageTarget?.name}" will be permanently deleted and removed from all bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="h-11 border border-samudra-ink text-samudra-ink bg-samudra-paper text-[11px] tracking-[0.3em] uppercase px-6" style={{ fontFamily: 'var(--font-label)' }}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePackageTarget && deletePackage(deletePackageTarget.id)}
              className="h-11 bg-[#7a3d31] text-samudra-paper text-[11px] tracking-[0.3em] uppercase px-6"
              style={{ fontFamily: 'var(--font-label)' }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default PackagesSection;
