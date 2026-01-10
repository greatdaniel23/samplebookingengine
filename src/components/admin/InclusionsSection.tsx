import React, { useState, useEffect } from 'react';
import { paths } from '@/config/paths';
import { 
  Check, 
  Plus, 
  Edit3, 
  Trash2, 
  Coffee,
  Utensils,
  Plane,
  Map,
  Headphones,
  Waves,
  ChefHat,
  Sun,
  Music,
  Home,
  Mountain,
  Apple,
  Wine,
  Bus,
  Bike,
  Activity,
  Leaf,
  Dumbbell,
  Zap,
  Shirt,
  Archive,
  Phone,
  Camera,
  Flower,
  PartyPopper,
  Gift,
  Car,
  Heart,
  Sparkles,
  Star
} from 'lucide-react';

interface Inclusion {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: string;
  display_order: number;
  is_featured: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

const InclusionsSection: React.FC = () => {
  const [inclusions, setInclusions] = useState<Inclusion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInclusion, setEditingInclusion] = useState<Inclusion | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'meals',
    description: '',
    icon: 'check',
    is_featured: false,
    is_active: true
  });

  // Icon mapper
  const getInclusionIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'check': Check, 'check-circle': Check, 'coffee': Coffee, 'utensils': Utensils,
      'heart': Heart, 'cup-soda': Coffee, 'apple': Apple, 'wine': Wine,
      'car': Car, 'plane': Plane, 'bus': Bus, 'bike': Bike,
      'sparkles': Sparkles, 'map': Map, 'chef-hat': ChefHat, 'sun': Sun,
      'music': Music, 'home': Home, 'mountain': Mountain,
      'headphones': Headphones, 'shirt': Shirt, 'clock': Check, 'phone': Phone,
      'archive': Archive, 'waves': Waves, 'activity': Activity, 'leaf': Leaf,
      'dumbbell': Dumbbell, 'zap': Zap, 'gift': Gift, 'party-popper': PartyPopper,
      'camera': Camera, 'flower': Flower, 'star': Star
    };
    return iconMap[iconName?.toLowerCase()] || Check;
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'meals', label: '🍽️ Meals' },
    { value: 'transport', label: '🚗 Transport' },
    { value: 'activities', label: '🎯 Activities' },
    { value: 'services', label: '🛎️ Services' },
    { value: 'wellness', label: '🧘 Wellness' },
    { value: 'special', label: '🎁 Special' }
  ];

  const iconOptions = [
    'check', 'coffee', 'utensils', 'heart', 'car', 'plane', 'bus', 'bike',
    'sparkles', 'map', 'chef-hat', 'sun', 'music', 'home', 'mountain',
    'headphones', 'shirt', 'phone', 'archive', 'waves', 'activity',
    'leaf', 'dumbbell', 'zap', 'gift', 'camera', 'flower'
  ];

  useEffect(() => {
    fetchInclusions();
  }, []);

  const fetchInclusions = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingInclusion 
        ? paths.buildApiUrl(`inclusions/${editingInclusion.id}`)
        : paths.buildApiUrl('inclusions');
      
      const method = editingInclusion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(editingInclusion ? 'Inclusion updated successfully!' : 'Inclusion created successfully!');
          resetForm();
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

  const handleEdit = (inclusion: Inclusion) => {
    setEditingInclusion(inclusion);
    setFormData({
      name: inclusion.name,
      category: inclusion.category,
      description: inclusion.description,
      icon: inclusion.icon,
      is_featured: Boolean(inclusion.is_featured),
      is_active: Boolean(inclusion.is_active)
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
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

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'meals',
      description: '',
      icon: 'check',
      is_featured: false,
      is_active: true
    });
    setEditingInclusion(null);
    setShowCreateModal(false);
  };

  const filteredInclusions = selectedCategory === 'all' 
    ? inclusions 
    : inclusions.filter(inc => inc.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">What's Included Management</h2>
          <p className="text-gray-600">Manage inclusions for packages</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button
            onClick={fetchInclusions}
            className="bg-gray-600 text-white px-3 py-1.5 rounded-md hover:bg-gray-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Inclusions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading inclusions...</div>
        ) : filteredInclusions.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No inclusions found for selected category
          </div>
        ) : (
          filteredInclusions.map((inclusion) => {
            const IconComponent = getInclusionIcon(inclusion.icon);
            return (
              <div key={inclusion.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{inclusion.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                        {inclusion.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!!inclusion.is_featured ? (
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
                    onClick={() => handleEdit(inclusion)}
                    className="bg-blue-500 text-white p-1.5 rounded hover:bg-blue-600"
                    title="Edit"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(inclusion.id)}
                    className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingInclusion ? 'Edit Inclusion' : 'Create New Inclusion'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label.replace(/^\p{Extended_Pictographic}\s*/u, '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="mr-2"
                  />
                  Featured
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingInclusion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InclusionsSection;