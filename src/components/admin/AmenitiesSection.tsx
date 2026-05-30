import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList, Home, Package, Eye, Check,
  Wifi, Car, Heart, Map, Coffee, Bath, Snowflake, Wind, Bed, Lock, Sparkles, Shirt,
  Utensils, ChefHat, Wine, Flame, Tv, Baby, Users, GlassWater,
  Waves, TreePine, Sun, Bell, Clock, Music, Battery, Plane, Bike, UserCheck,
  Zap, Activity, Leaf, Shield, Star, Plus, Edit3, Trash2, Archive, Phone
} from 'lucide-react';
import { paths } from '@/config/paths';
import { apiClient } from '@/utils/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AmenitiesSection: React.FC = () => {
  // Icon mapper function to convert string names to Lucide React components
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'wifi': Wifi, 'car': Car, 'heart': Heart, 'map': Map, 'coffee': Coffee,
      'bath': Bath, 'snowflake': Snowflake, 'wind': Wind, 'bed': Bed, 'lock': Lock,
      'sparkles': Sparkles, 'shirt': Shirt, 'utensils': Utensils, 'chef-hat': ChefHat,
      'wine': Wine, 'flame': Flame, 'tv': Tv, 'baby': Baby, 'accessibility': Users,
      'cocktail': GlassWater, 'waves': Waves, 'trees': TreePine, 'sun': Sun, 'bell': Bell,
      'clock': Clock, 'music': Music, 'battery-charging': Battery, 'plane': Plane,
      'bike': Bike, 'user-check': UserCheck, 'tree': TreePine, 'zap': Zap, 'activity': Activity,
      'leaf': Leaf, 'shield-check': Shield, 'star': Star, 'home': Home,
      'refrigerator': Package, 'chef': ChefHat, 'balcony': Home, 'grill': Flame,
      'garden': TreePine, 'swimming': Waves, 'broom': Sparkles, 'parking': Car,
      'spa': Heart, 'yoga': Activity, 'dumbbell': Zap, 'beach': Sun
    };
    return iconMap[iconName] || Star;
  };

  const [activeAmenitiesTab, setActiveAmenitiesTab] = useState('catalog');
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    categories: 0,
    featured: 0,
    inUse: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<any>(null);
  const [deleteAmenityTarget, setDeleteAmenityTarget] = useState<any>(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    category: '',
    description: '',
    icon: 'star',
    is_featured: false,
    is_active: true
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    description: '',
    icon: 'star',
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchUsageStats = async (amenitiesList: any[]) => {
    try {
      // Count amenities used in rooms and packages
      const roomUsagePromise = fetch(paths.buildApiUrl('room-amenities'))
        .then(res => res.json())
        .catch(() => ({ success: false, relationships: [] }));

      const packageUsagePromise = fetch(paths.buildApiUrl('package-amenities'))
        .then(res => res.json())
        .catch(() => ({ success: false, amenities: [] }));

      const [roomUsage, packageUsage] = await Promise.all([roomUsagePromise, packageUsagePromise]);

      const usedAmenityIds = new Set();

      if (roomUsage.success && roomUsage.relationships) {
        roomUsage.relationships.forEach((rel: any) => usedAmenityIds.add(rel.amenity_id));
      }

      if (packageUsage.success && packageUsage.amenities) {
        packageUsage.amenities.forEach((amenity: any) => usedAmenityIds.add(amenity.amenity_id));
      }

      return { inUse: usedAmenityIds.size };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return { inUse: 0 };
    }
  };

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use simplified amenities endpoint (backend now defaults to 'amenities' when no explicit endpoint provided)
      const apiUrl = paths.buildApiUrl('amenities');


      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error('Amenities API error:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle both response formats: {success, data} and {success, amenities}
      const amenitiesList = data.data || data.amenities || [];
      
      if (data.success && amenitiesList.length >= 0) {
        setAmenities(amenitiesList);

        // Calculate statistics
        const uniqueCategories = [...new Set(amenitiesList.map((a: any) => a.category))].filter(Boolean) as string[];
        const featuredCount = amenitiesList.filter((a: any) => a.is_featured === 1).length;

        // Fetch usage statistics
        fetchUsageStats(amenitiesList).then(usageStats => {
          setStats({
            total: amenitiesList.length,
            categories: uniqueCategories.length,
            featured: featuredCount,
            inUse: usageStats.inUse
          });
        });

        setCategories(['all', ...uniqueCategories]);
      } else {
        throw new Error(data.error || 'Failed to fetch amenities');
      }
    } catch (err) {
      console.error('Error fetching amenities:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.post<any>('/api/amenities', createFormData);
      if (result.success) {
        toast.success('Amenity created');
        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          category: '',
          description: '',
          icon: 'star',
          is_featured: false,
          is_active: true
        });
        fetchAmenities();
      } else {
        throw new Error(result.error || 'Failed to create amenity');
      }
    } catch (error) {
      console.error('Error creating amenity:', error);
      toast.error(error instanceof Error ? error.message : 'Could not create amenity');
    }
  };

  const handleEditAmenity = (amenity: any) => {
    setEditingAmenity(amenity);
    setEditFormData({
      name: amenity.name,
      category: amenity.category || '',
      description: amenity.description || '',
      icon: amenity.icon || 'star',
      is_featured: amenity.is_featured === 1 || amenity.is_featured === "1",
      is_active: amenity.is_active === 1 || amenity.is_active === "1"
    });
    setShowEditModal(true);
  };

  const handleUpdateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmenity) return;

    try {
      const result = await apiClient.put<any>(`/api/amenities/${editingAmenity.id}`, editFormData);
      if (result.success) {
        toast.success('Amenity updated');
        setShowEditModal(false);
        setEditingAmenity(null);
        fetchAmenities();
      } else {
        throw new Error(result.error || 'Failed to update amenity');
      }
    } catch (error) {
      console.error('Error updating amenity:', error);
      toast.error(error instanceof Error ? error.message : 'Could not update amenity');
    }
  };

  const handleDeleteAmenity = async (amenityId: string) => {

    try {
      const result = await apiClient.delete<any>(`/api/amenities/${amenityId}`);
      if (result.success) {
        toast.success('Amenity removed');
        fetchAmenities();
      } else {
        throw new Error(result.error || 'Failed to delete amenity');
      }
    } catch (error) {
      console.error('Error deleting amenity:', error);
      toast.error(error instanceof Error ? error.message : 'Could not remove amenity');
    } finally {
      setDeleteAmenityTarget(null);
    }
  };

  const filteredAmenities = amenities.filter(amenity => {
    const matchesSearch = amenity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      amenity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || amenity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderAmenitiesStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-samudra-ink/20 text-samudra-ink">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-gray-600">Total Amenities</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-samudra-teal/20 text-samudra-teal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
            <p className="text-gray-600">Categories</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-samudra-gold/20 text-samudra-gold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{stats.featured}</p>
            <p className="text-gray-600">Featured</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-samudra-ink-mute/20 text-samudra-ink-mute">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-2xl font-bold text-gray-900">{stats.inUse}</p>
            <p className="text-gray-600">In Use</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAmenitiesCatalog = () => (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Amenities</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Amenities Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAmenities.map((amenity) => (
                <tr key={amenity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {React.createElement(getIconComponent(amenity.icon), { className: "w-6 h-6 mr-3 text-samudra-gold" })}
                      <div className="text-sm font-medium text-gray-900">{amenity.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                      {amenity.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {amenity.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${amenity.is_active === 1 ? 'bg-samudra-teal/20 text-samudra-teal' : 'bg-samudra-ink-mute/20 text-samudra-ink-mute'
                      }`}>
                      {amenity.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {amenity.is_featured === 1 ? (
                      <svg className="w-5 h-5 text-samudra-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363 1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditAmenity(amenity)}
                      className="text-samudra-teal hover:text-samudra-teal mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteAmenityTarget(amenity)}
                      className="text-[#7a3d31] hover:text-[#5a2d21]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAmenities.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <p className="text-gray-500">No amenities found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRoomAssignment = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Room-Amenity Assignment</h3>
      <p className="text-gray-600">Room assignment interface coming soon...</p>
    </div>
  );

  const renderPackagePerks = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Package Perk Assignment</h3>
      <p className="text-gray-600">Package perk assignment interface coming soon...</p>
    </div>
  );

  const renderSalesToolPreview = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Tool Preview</h3>
      <p className="text-gray-600">Sales tool preview interface coming soon...</p>
    </div>
  );


  return (
    <div className="space-y-6">
      {/* Amenities Concept Header */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Sparkles className="w-6 h-6 text-gray-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Amenities & Features Catalog</h3>
            <p className="text-gray-600 text-sm">
              <strong>Amenities enhance rooms and packages</strong> by adding value and features that attract guests.
              They can be highlighted in packages or assigned to rooms to showcase property benefits.
            </p>
            <div className="mt-2 text-xs text-gray-600">
              <strong>Business Logic:</strong> Room amenities = Built-in features → Package amenities = Added value → Customer sees complete experience
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Amenities Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage property features that enhance rooms and packages</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Amenity
        </Button>
      </div>

      {/* Statistics */}
      {renderAmenitiesStats()}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'catalog', label: 'Amenities Catalog', Icon: ClipboardList },
              { id: 'rooms', label: 'Room Assignment', Icon: Home },
              { id: 'packages', label: 'Package Perks', Icon: Package },
              { id: 'preview', label: 'Sales Tool Preview', Icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveAmenitiesTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeAmenitiesTab === tab.id
                  ? 'border-samudra-gold text-samudra-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-samudra-gold"></div>
            </div>
          )}

          {error && (
            <div className="bg-samudra-paper-soft border border-samudra-ink-mute rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-samudra-ink-mute" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-samudra-ink">Error loading amenities</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {activeAmenitiesTab === 'catalog' && renderAmenitiesCatalog()}
              {activeAmenitiesTab === 'rooms' && renderRoomAssignment()}
              {activeAmenitiesTab === 'packages' && renderPackagePerks()}
              {activeAmenitiesTab === 'preview' && renderSalesToolPreview()}
            </>
          )}
        </div>
      </div>

      {/* Create Amenity Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md bg-samudra-paper border border-samudra-paper-deep p-8" style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">New Amenity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAmenity} className="space-y-4">
            <div>
              <label className="eyebrow block mb-2">Amenity Name *</label>
              <input
                type="text"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
                style={{ fontFamily: 'var(--font-label)' }}
                required
              />
            </div>

            <div>
              <label className="eyebrow block mb-2">Category *</label>
              <input
                type="text"
                value={createFormData.category}
                onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
                style={{ fontFamily: 'var(--font-label)' }}
                placeholder="e.g., Technology, Comfort, Entertainment"
                required
              />
            </div>

            <div>
              <label className="eyebrow block mb-2">Description</label>
              <textarea
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                className="w-full bg-samudra-paper border border-samudra-paper-deep px-3 py-2 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors resize-none"
                style={{ fontFamily: 'var(--font-label)' }}
                rows={3}
              />
            </div>

            <div>
              <label className="eyebrow block mb-2">Icon</label>
              <input
                type="text"
                value={createFormData.icon}
                onChange={(e) => setCreateFormData({ ...createFormData, icon: e.target.value })}
                className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
                style={{ fontFamily: 'var(--font-label)' }}
                placeholder="e.g., wifi, coffee, star"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createFormData.is_featured}
                  onChange={(e) => setCreateFormData({ ...createFormData, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-samudra-teal"
                />
                <span className="eyebrow">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createFormData.is_active}
                  onChange={(e) => setCreateFormData({ ...createFormData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-samudra-teal"
                />
                <span className="eyebrow">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-samudra-paper-deep">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="h-11 border border-samudra-paper-deep text-samudra-ink-mute eyebrow px-6 hover:border-samudra-ink hover:text-samudra-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 bg-samudra-ink text-samudra-paper eyebrow px-7 hover:bg-samudra-teal transition-colors"
              >
                Create Amenity
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Amenity Dialog */}
      <Dialog open={showEditModal && !!editingAmenity} onOpenChange={(open) => { if (!open) { setShowEditModal(false); setEditingAmenity(null); } }}>
        <DialogContent className="max-w-md bg-samudra-paper border border-samudra-paper-deep p-8" style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)' }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[28px] font-light text-samudra-ink">Edit Amenity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAmenity} className="space-y-4">
            <div>
              <label className="eyebrow block mb-2">Amenity Name *</label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
                style={{ fontFamily: 'var(--font-label)' }}
                required
              />
            </div>

            <div>
              <label className="eyebrow block mb-2">Category *</label>
              <input
                type="text"
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
                style={{ fontFamily: 'var(--font-label)' }}
                placeholder="e.g., Technology, Comfort, Entertainment"
                required
              />
            </div>

            <div>
              <label className="eyebrow block mb-2">Description</label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full bg-samudra-paper border border-samudra-paper-deep px-3 py-2 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors resize-none"
                style={{ fontFamily: 'var(--font-label)' }}
                rows={3}
              />
            </div>

            <div>
              <label className="eyebrow block mb-2">Icon</label>
              <input
                type="text"
                value={editFormData.icon}
                onChange={(e) => setEditFormData({ ...editFormData, icon: e.target.value })}
                className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors"
                style={{ fontFamily: 'var(--font-label)' }}
                placeholder="e.g., wifi, coffee, star"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFormData.is_featured}
                  onChange={(e) => setEditFormData({ ...editFormData, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-samudra-teal"
                />
                <span className="eyebrow">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-samudra-teal"
                />
                <span className="eyebrow">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-samudra-paper-deep">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingAmenity(null); }}
                className="h-11 border border-samudra-paper-deep text-samudra-ink-mute eyebrow px-6 hover:border-samudra-ink hover:text-samudra-ink transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 bg-samudra-ink text-samudra-paper eyebrow px-7 hover:bg-samudra-teal transition-colors"
              >
                Update Amenity
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Amenity Confirm */}
      <AlertDialog open={!!deleteAmenityTarget} onOpenChange={(open) => { if (!open) setDeleteAmenityTarget(null); }}>
        <AlertDialogContent className="bg-samudra-paper border border-samudra-paper-deep">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[22px] font-normal text-samudra-ink">Remove amenity?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-samudra-ink-mute" style={{ fontFamily: 'var(--font-label)' }}>
              This amenity will be removed from all suites and packages currently using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="h-11 border border-samudra-ink text-samudra-ink bg-samudra-paper text-[11px] tracking-[0.3em] uppercase px-6" style={{ fontFamily: 'var(--font-label)' }}>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAmenityTarget && handleDeleteAmenity(deleteAmenityTarget.id)}
              className="h-11 bg-[#7a3d31] text-samudra-paper text-[11px] tracking-[0.3em] uppercase px-6" style={{ fontFamily: 'var(--font-label)' }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default AmenitiesSection;
