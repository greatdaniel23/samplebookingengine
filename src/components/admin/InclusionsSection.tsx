import React, { useState, useEffect } from 'react';
import { paths } from '@/config/paths';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  Star,
  RefreshCw
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
  const [error, setError] = useState<string | null>(null);
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
    { value: 'dining', label: '🍷 Dining' },
    { value: 'spa', label: '💆 Spa' },
    { value: 'wellness', label: '🧘 Wellness' },
    { value: 'activity', label: '🎯 Activities' },
    { value: 'transport', label: '🚗 Transport' },
    { value: 'amenity', label: '🏠 Amenity' },
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
      setError(null);
      const apiUrl = paths.buildApiUrl('inclusions');
      console.log('Fetching inclusions from:', apiUrl);
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      if (response.ok) {
        const responseData = await response.json();
        console.log('Raw response:', JSON.stringify(responseData).slice(0, 200));
        if (responseData.success) {
          // API returns: { success: true, data: { inclusions: [...] } }
          // So we need responseData.data.inclusions
          const inclusionsList = responseData.data?.inclusions || [];
          console.log('Inclusions count:', inclusionsList.length);
          // Map package_type to category for frontend compatibility
          const mapped = inclusionsList.map((inc: any) => ({
            ...inc,
            category: inc.category || inc.package_type
          }));
          setInclusions(mapped);
          if (mapped.length === 0) {
            setError('API returned empty inclusions list');
          }
        } else {
          setError('API returned success: false');
        }
      } else {
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(`Fetch error: ${err.message}`);
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
      
      // Map category to package_type for API
      const payload = {
        name: formData.name,
        description: formData.description,
        package_type: formData.category,
        is_active: formData.is_active
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
          <p className="text-gray-600">Manage inclusions for packages (v2 - {inclusions.length} loaded)</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Inclusion
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">Category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchInclusions} variant="secondary" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inclusions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-gray-500 text-sm">API URL: {paths.buildApiUrl('inclusions')}</p>
            <Button onClick={fetchInclusions} className="mt-4">Retry</Button>
          </div>
        ) : filteredInclusions.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No inclusions found for selected category (Total: {inclusions.length})
          </div>
        ) : (
          filteredInclusions.map((inclusion) => {
            const IconComponent = getInclusionIcon(inclusion.icon);
            return (
              <Card key={inclusion.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{inclusion.name}</h3>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {inclusion.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!!inclusion.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500" title="Featured" />
                      )}
                      <div className={`w-2 h-2 rounded-full ${inclusion.is_active ? 'bg-green-500' : 'bg-red-500'}`} 
                           title={inclusion.is_active ? 'Active' : 'Inactive'} />
                    </div>
                  </div>
                  
                  {inclusion.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{inclusion.description}</p>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleEdit(inclusion)}
                      variant="default"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(inclusion.id)}
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingInclusion ? 'Edit Inclusion' : 'Create New Inclusion'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label.replace(/^\p{Extended_Pictographic}\s*/u, '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({...formData, icon: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(icon => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: !!checked})}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingInclusion ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InclusionsSection;