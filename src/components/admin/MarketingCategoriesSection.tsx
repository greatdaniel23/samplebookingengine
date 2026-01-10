import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Tag } from 'lucide-react';

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
      const response = await fetch('https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/marketing-categories');
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
      const url = 'https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/marketing-categories';
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
      const response = await fetch('https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/marketing-categories', {
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
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
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
        <button 
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Tag className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">Marketing Categories</h3>
            <p className="text-sm text-blue-800">
              Categories help organize your packages and make it easier for customers to find what they're looking for. 
              They're used in package filtering and display across your booking system.
            </p>
          </div>
        </div>
      </div>

      {/* Simple Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
          <p className="text-gray-500 mb-4">Create your first marketing category.</p>
          <button 
            onClick={() => {
              setEditingCategory(null);
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">#{category.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCategory(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Romance, Adventure, Wellness"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingCategoriesSection;