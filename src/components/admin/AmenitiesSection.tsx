import React, { useState, useEffect } from 'react';
import {
  ClipboardList, Home, Package, Eye, Check,
  Wifi, Car, Heart, Map, Coffee, Bath, Snowflake, Wind, Bed, Lock, Sparkles, Shirt,
  Utensils, ChefHat, Wine, Flame, Tv, Baby, Users, GlassWater,
  Waves, TreePine, Sun, Bell, Clock, Music, Battery, Plane, Bike, UserCheck,
  Zap, Activity, Leaf, Shield, Star, Plus, Edit3, Trash2, Archive, Phone,
  Camera, Flower, PartyPopper, Gift, Mountain, Apple, Bus, Headphones, X
} from 'lucide-react';
import { paths } from '@/config/paths';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Inclusions state
  const [inclusions, setInclusions] = useState<any[]>([]);
  const [inclusionsLoading, setInclusionsLoading] = useState(false);
  const [selectedInclusionCategory, setSelectedInclusionCategory] = useState('all');
  const [showCreateInclusionModal, setShowCreateInclusionModal] = useState(false);
  const [editingInclusion, setEditingInclusion] = useState<any>(null);
  const [inclusionFormData, setInclusionFormData] = useState({
    name: '',
    category: 'meals',
    description: '',
    icon: 'check',
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

      if (data.success && data.amenities) {
        setAmenities(data.amenities);

        // Calculate statistics
        const uniqueCategories = [...new Set(data.amenities.map((a: any) => a.category))].filter(Boolean) as string[];
        const featuredCount = data.amenities.filter((a: any) => a.is_featured === 1).length;

        // Fetch usage statistics
        fetchUsageStats(data.amenities).then(usageStats => {
          setStats({
            total: data.amenities.length,
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
      const apiUrl = paths.buildApiUrl('amenities');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFormData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Amenity created successfully!');
        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          category: '',
          description: '',
          icon: 'star',
          is_featured: false,
          is_active: true
        });
        fetchAmenities(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to create amenity');
      }
    } catch (error) {
      console.error('Error creating amenity:', error);
      alert('Error creating amenity: ' + error);
    }
  };

  const handleEditAmenity = (amenity: any) => {
    setEditingAmenity(amenity);
    setEditFormData({
      name: amenity.name,
      category: amenity.category,
      description: amenity.description,
      icon: amenity.icon,
      is_featured: amenity.is_featured === "1",
      is_active: amenity.is_active === "1"
    });
    setShowEditModal(true);
  };

  const handleUpdateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmenity) return;

    try {
      const apiUrl = paths.buildApiUrl('amenities');
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingAmenity.id,
          ...editFormData
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Amenity updated successfully!');
        setShowEditModal(false);
        setEditingAmenity(null);
        fetchAmenities(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to update amenity');
      }
    } catch (error) {
      console.error('Error updating amenity:', error);
      alert('Error updating amenity: ' + error);
    }
  };

  const handleDeleteAmenity = async (amenityId: string) => {
    if (!confirm('Are you sure you want to delete this amenity?')) return;

    try {
      const apiUrl = paths.buildApiUrl(`amenities/${amenityId}`);
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Amenity deleted successfully!');
        fetchAmenities(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to delete amenity');
      }
    } catch (error) {
      console.error('Error deleting amenity:', error);
      alert('Error deleting amenity: ' + error);
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
          <div className="p-3 rounded-full bg-hotel-navy/20 text-hotel-navy">
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
          <div className="p-3 rounded-full bg-hotel-sage/20 text-hotel-sage">
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
          <div className="p-3 rounded-full bg-hotel-gold/20 text-hotel-gold">
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
          <div className="p-3 rounded-full bg-hotel-bronze/20 text-hotel-bronze">
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
                      {React.createElement(getIconComponent(amenity.icon), { className: "w-6 h-6 mr-3 text-hotel-gold" })}
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${amenity.is_active === 1 ? 'bg-hotel-sage/20 text-hotel-sage' : 'bg-hotel-bronze/20 text-hotel-bronze'
                      }`}>
                      {amenity.is_active === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {amenity.is_featured === 1 ? (
                      <svg className="w-5 h-5 text-hotel-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363 1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditAmenity(amenity)}
                      className="text-hotel-sage hover:text-hotel-sage-dark mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAmenity(amenity.id)}
                      className="text-hotel-bronze hover:text-hotel-bronze/80"
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

  // Inclusions Functions
  const fetchInclusions = async () => {
    try {
      setInclusionsLoading(true);
      const response = await fetch(paths.buildApiUrl('inclusions'));
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInclusions(data.inclusions || []);
        }
      }
    } catch (error) {
      console.error('Error fetching inclusions:', error);
    } finally {
      setInclusionsLoading(false);
    }
  };

  const handleInclusionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingInclusion
        ? paths.buildApiUrl(`inclusions/${editingInclusion.id}`)
        : paths.buildApiUrl('inclusions');

      const method = editingInclusion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inclusionFormData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(editingInclusion ? 'Inclusion updated successfully!' : 'Inclusion created successfully!');
          resetInclusionForm();
          fetchInclusions();
        } else {
          alert('Error: ' + data.error);
        }
      }
    } catch (error) {
      console.error('Error saving inclusion:', error);
      alert('Error saving inclusion');
    }
  };

  const handleEditInclusion = (inclusion: any) => {
    setEditingInclusion(inclusion);
    setInclusionFormData({
      name: inclusion.name,
      category: inclusion.category,
      description: inclusion.description,
      icon: inclusion.icon,
      is_featured: Boolean(inclusion.is_featured),
      is_active: Boolean(inclusion.is_active)
    });
    setShowCreateInclusionModal(true);
  };

  const handleDeleteInclusion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inclusion?')) return;

    try {
      const response = await fetch(paths.buildApiUrl(`inclusions/${id}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Inclusion deleted successfully!');
          fetchInclusions();
        }
      }
    } catch (error) {
      console.error('Error deleting inclusion:', error);
      alert('Error deleting inclusion');
    }
  };

  const resetInclusionForm = () => {
    setInclusionFormData({
      name: '',
      category: 'meals',
      description: '',
      icon: 'check',
      is_featured: false,
      is_active: true
    });
    setEditingInclusion(null);
    setShowCreateInclusionModal(false);
  };

  const getInclusionIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'check': Check, 'check-circle': Check, 'coffee': Coffee, 'utensils': Utensils,
      'heart': Heart, 'cup-soda': Coffee, 'apple': Apple, 'wine': Wine,
      'car': Car, 'plane': Plane, 'bus': Bus, 'bike': Bike,
      'sparkles': Sparkles, 'map': Map, 'chef-hat': ChefHat, 'sun': Sun,
      'music': Music, 'home': Home, 'mountain': Mountain,
      'headphones': Headphones, 'shirt': Shirt, 'clock': Clock, 'phone': Phone,
      'archive': Archive, 'waves': Waves, 'activity': Activity, 'leaf': Leaf,
      'dumbbell': Zap, 'zap': Zap, 'gift': Gift, 'party-popper': PartyPopper,
      'camera': Camera, 'flower': Flower, 'star': Star
    };
    return iconMap[iconName?.toLowerCase()] || Check;
  };

  const renderInclusionsManagement = () => {
    const inclusionCategories = [
      { value: 'all', label: 'All Categories' },
      { value: 'meals', label: '🍽️ Meals' },
      { value: 'transport', label: '🚗 Transport' },
      { value: 'activities', label: '🎯 Activities' },
      { value: 'services', label: '🛎️ Services' },
      { value: 'wellness', label: '🧘 Wellness' },
      { value: 'special', label: '🎁 Special' }
    ];

    const filteredInclusions = selectedInclusionCategory === 'all'
      ? inclusions
      : inclusions.filter(inc => inc.category === selectedInclusionCategory);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">What's Included Management</h3>
            <p className="text-gray-600">Manage package inclusions and benefits</p>
          </div>
          <button
            onClick={() => {
              fetchInclusions();
              setShowCreateInclusionModal(true);
            }}
            className="bg-hotel-gold hover:bg-hotel-gold-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Inclusion
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedInclusionCategory}
              onChange={(e) => setSelectedInclusionCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {inclusionCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <button
              onClick={fetchInclusions}
              className="bg-hotel-sage hover:bg-hotel-sage-dark text-white px-3 py-1.5 rounded-md text-sm font-medium"
            >
              Load Inclusions
            </button>
          </div>
        </div>

        {/* Inclusions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inclusionsLoading ? (
            <div className="col-span-full text-center py-8">Loading inclusions...</div>
          ) : filteredInclusions.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {inclusions.length === 0 ? 'Click "Load Inclusions" to fetch inclusions data' : 'No inclusions found for selected category'}
            </div>
          ) : (
            filteredInclusions.map((inclusion) => {
              const IconComponent = getInclusionIcon(inclusion.icon);
              return (
                <div key={inclusion.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-hotel-gold" />
                      <div>
                        <h3 className="font-medium text-gray-900">{inclusion.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                          {inclusion.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {inclusion.is_featured ? (
                        <Star className="h-4 w-4 text-yellow-500" title="Featured" />
                      ) : null}
                      <div className={`w-2 h-2 rounded-full ${inclusion.is_active ? 'bg-green-500' : 'bg-red-500'}`}
                        title={inclusion.is_active ? 'Active' : 'Inactive'} />
                    </div>
                  </div>

                  {inclusion.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{inclusion.description}</p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditInclusion(inclusion)}
                      className="bg-hotel-sage text-white p-1.5 rounded hover:bg-hotel-sage-dark"
                      title="Edit"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteInclusion(inclusion.id)}
                      className="bg-hotel-bronze text-white p-1.5 rounded hover:bg-hotel-bronze-dark"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Amenities Concept Header */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Sparkles className="w-6 h-6 text-gray-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">✨ Amenities & Features Catalog</h3>
            <p className="text-gray-600 text-sm">
              <strong>Amenities enhance rooms and packages</strong> by adding value and features that attract guests.
              They can be highlighted in packages or assigned to rooms to showcase property benefits.
            </p>
            <div className="mt-2 text-xs text-gray-600">
              💡 <strong>Business Logic:</strong> Room amenities = Built-in features → Package amenities = Added value → Customer sees complete experience
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
              { id: 'inclusions', label: 'What\'s Included', Icon: Check },
              { id: 'rooms', label: 'Room Assignment', Icon: Home },
              { id: 'packages', label: 'Package Perks', Icon: Package },
              { id: 'preview', label: 'Sales Tool Preview', Icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveAmenitiesTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeAmenitiesTab === tab.id
                  ? 'border-hotel-gold text-hotel-gold'
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-gold"></div>
            </div>
          )}

          {error && (
            <div className="bg-hotel-cream border border-hotel-bronze rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-hotel-bronze" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-hotel-navy">Error loading amenities</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {activeAmenitiesTab === 'catalog' && renderAmenitiesCatalog()}
              {activeAmenitiesTab === 'inclusions' && renderInclusionsManagement()}
              {activeAmenitiesTab === 'rooms' && renderRoomAssignment()}
              {activeAmenitiesTab === 'packages' && renderPackagePerks()}
              {activeAmenitiesTab === 'preview' && renderSalesToolPreview()}
            </>
          )}
        </div>
      </div>

      {/* Create Amenity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Amenity</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAmenity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenity Name</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={createFormData.category}
                  onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  placeholder="e.g., Technology, Comfort, Entertainment"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={createFormData.icon}
                  onChange={(e) => setCreateFormData({ ...createFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  placeholder="e.g., 🌟, 🏊‍♂️, 📶"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createFormData.is_featured}
                    onChange={(e) => setCreateFormData({ ...createFormData, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured amenity</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createFormData.is_active}
                    onChange={(e) => setCreateFormData({ ...createFormData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active amenity</span>
                </label>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-hotel-gold rounded-md hover:bg-hotel-gold-dark"
                >
                  Create Amenity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Amenity Modal */}
      {showEditModal && editingAmenity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Amenity</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAmenity(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateAmenity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenity Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  placeholder="e.g., Technology, Comfort, Entertainment"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={editFormData.icon}
                  onChange={(e) => setEditFormData({ ...editFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  placeholder="e.g., 🌟, 🏊‍♂️, 📶"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.is_featured}
                    onChange={(e) => setEditFormData({ ...editFormData, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured amenity</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active amenity</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAmenity(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-hotel-gold rounded-md hover:bg-hotel-gold-dark"
                >
                  Update Amenity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Inclusion Modal */}
      {showCreateInclusionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingInclusion ? 'Edit Inclusion' : 'Create New Inclusion'}
              </h3>
              <button
                onClick={resetInclusionForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleInclusionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={inclusionFormData.name}
                  onChange={(e) => setInclusionFormData({ ...inclusionFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={inclusionFormData.category}
                    onChange={(e) => setInclusionFormData({ ...inclusionFormData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  >
                    <option value="meals">Meals</option>
                    <option value="transport">Transport</option>
                    <option value="activities">Activities</option>
                    <option value="services">Services</option>
                    <option value="wellness">Wellness</option>
                    <option value="special">Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={inclusionFormData.icon}
                    onChange={(e) => setInclusionFormData({ ...inclusionFormData, icon: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  >
                    {['check', 'coffee', 'utensils', 'heart', 'car', 'plane', 'bus', 'bike',
                      'sparkles', 'map', 'chef-hat', 'sun', 'music', 'home', 'mountain',
                      'headphones', 'shirt', 'phone', 'archive', 'waves', 'activity',
                      'leaf', 'zap', 'gift', 'camera', 'flower'].map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={inclusionFormData.description}
                  onChange={(e) => setInclusionFormData({ ...inclusionFormData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inclusionFormData.is_featured}
                    onChange={(e) => setInclusionFormData({ ...inclusionFormData, is_featured: e.target.checked })}
                    className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured inclusion</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inclusionFormData.is_active}
                    onChange={(e) => setInclusionFormData({ ...inclusionFormData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-hotel-gold focus:ring-hotel-gold mr-2"
                  />
                  <span className="text-sm text-gray-700">Active inclusion</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetInclusionForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-hotel-gold rounded-md hover:bg-hotel-gold-dark"
                >
                  {editingInclusion ? 'Update Inclusion' : 'Create Inclusion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmenitiesSection;
