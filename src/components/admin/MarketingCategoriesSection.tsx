import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Tag } from 'lucide-react';
import { paths } from '@/config/paths';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MarketingCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

const MarketingCategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<MarketingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MarketingCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Use Cloudflare Worker API
      const response = await fetch(paths.buildApiUrl('marketing-categories'));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        console.error('Failed to fetch marketing categories:', data.error);
        // Fallback to default categories if API fails
        setCategories([
          { id: 1, name: 'Romance', slug: 'romance', description: 'Romantic packages for couples', is_active: true, sort_order: 1 },
          { id: 2, name: 'Family', slug: 'family', description: 'Family-friendly packages', is_active: true, sort_order: 2 },
          { id: 3, name: 'Adventure', slug: 'adventure', description: 'Adventure activities', is_active: true, sort_order: 3 },
          { id: 4, name: 'Wellness', slug: 'wellness', description: 'Spa and wellness', is_active: true, sort_order: 4 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching marketing categories:', error);
      // Fallback to default categories
      setCategories([
        { id: 1, name: 'Romance', slug: 'romance', description: 'Romantic packages for couples', is_active: true, sort_order: 1 },
        { id: 2, name: 'Family', slug: 'family', description: 'Family-friendly packages', is_active: true, sort_order: 2 },
        { id: 3, name: 'Adventure', slug: 'adventure', description: 'Adventure activities', is_active: true, sort_order: 3 },
        { id: 4, name: 'Wellness', slug: 'wellness', description: 'Spa and wellness', is_active: true, sort_order: 4 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use Cloudflare Worker API
      const url = paths.buildApiUrl('marketing-categories');
      const method = editingCategory ? 'PUT' : 'POST';
      const payload = editingCategory
        ? { ...formData, id: editingCategory.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert(`Marketing category ${editingCategory ? 'updated' : 'created'} successfully!`);
        setShowCreateModal(false);
        setEditingCategory(null);
        resetForm();
        fetchCategories();
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Error ${editingCategory ? 'updating' : 'creating'} category: ${error}`);
    }
  };

  const handleDelete = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(paths.buildApiUrl('marketing-categories'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) {
        alert('Marketing category deleted successfully!');
        fetchCategories();
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(`Error deleting category: ${error}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sort_order: 0
    });
  };

  const openEditModal = (category: MarketingCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      sort_order: category.sort_order
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Marketing Categories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Marketing Categories</h2>
          <p className="text-sm text-gray-600 mt-1">Manage package categories for better organization and filtering</p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setShowCreateModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Info Box */}
      <Alert>
        <Tag className="w-4 h-4" />
        <AlertDescription>
          Categories help organize your packages and make it easier for customers to find what they're looking for.
          They're used in package filtering and display across your booking system.
        </AlertDescription>
      </Alert>

      {/* Simple Categories List */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
            <p className="text-gray-500 mb-4">Create your first marketing category.</p>
            <Button
              onClick={() => {
                setEditingCategory(null);
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-500">#{category.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {category.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(category.id, category.name)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false);
          setEditingCategory(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Romance, Adventure, Wellness"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>

            <div>
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCategory(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingCategoriesSection;