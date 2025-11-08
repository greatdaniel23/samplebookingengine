import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useVillaInfo } from '@/hooks/useVillaInfo';
import { AdminGuard } from '@/components/AdminGuard';

const Admin = () => {
  const { villaInfo, loading, updateVillaInfo } = useVillaInfo();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(villaInfo);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  useEffect(() => {
    if (villaInfo) {
      setFormData(villaInfo);
    }
  }, [villaInfo]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleImageChange = (index: number, value: string) => {
    if (!formData) return;
    const newImages = [...formData.images];
    newImages[index] = value;
    handleInputChange('images', newImages);
  };

  const addImage = () => {
    if (!formData) return;
    const newImages = [...formData.images, ''];
    handleInputChange('images', newImages);
  };

  const removeImage = (index: number) => {
    if (!formData) return;
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  const addAmenity = () => {
    if (!formData) return;
    const newAmenities = [...formData.amenities, { icon: '✨', name: 'New Amenity' }];
    handleInputChange('amenities', newAmenities);
  };

  const handleAmenityChange = (index: number, field: 'icon' | 'name', value: string) => {
    if (!formData) return;
    const newAmenities = [...formData.amenities];
    newAmenities[index] = { ...newAmenities[index], [field]: value };
    handleInputChange('amenities', newAmenities);
  };

  const removeAmenity = (index: number) => {
    if (!formData) return;
    const newAmenities = formData.amenities.filter((_, i) => i !== index);
    handleInputChange('amenities', newAmenities);
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setSaving(true);
    try {
      await updateVillaInfo(formData);
      setIsEditing(false);
      alert('Villa information updated successfully!');
    } catch (error) {
      console.error('Error updating villa info:', error);
      alert('Error updating villa information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(villaInfo);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hotel-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading villa information...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading villa information.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-hotel-gold text-white rounded hover:bg-hotel-bronze transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link 
                  to="/" 
                  className="flex items-center text-hotel-gold hover:text-hotel-bronze transition-colors mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Villa Management</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Welcome, {sessionStorage.getItem('adminUser') || 'Admin'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Villa Information</h2>
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-hotel-gold text-white rounded-md hover:bg-hotel-bronze transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-hotel-gold text-white rounded-md hover:bg-hotel-bronze transition-colors"
                    >
                      Edit Information
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Villa Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{formData.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Photo Gallery</h3>
                <div className="space-y-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder="Enter image URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-4">
                            <img src={image} alt={`Villa ${index + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                            <span className="text-gray-700 break-all">{image}</span>
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeImage(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <button
                      onClick={addImage}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-hotel-gold hover:text-hotel-gold transition-colors"
                    >
                      + Add New Image
                    </button>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} className="relative">
                      {isEditing ? (
                        <>
                          <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
                            <input
                              type="text"
                              value={amenity.icon}
                              onChange={(e) => handleAmenityChange(index, 'icon', e.target.value)}
                              className="w-12 text-center text-lg border border-gray-200 rounded px-2 py-1"
                            />
                            <input
                              type="text"
                              value={amenity.name}
                              onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                              className="flex-1 border border-gray-200 rounded px-3 py-1"
                            />
                          </div>
                          <button
                            onClick={() => removeAmenity(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <span className="text-gray-600 font-mono text-lg">{amenity.icon}</span>
                          <span className="text-gray-900">{amenity.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <button
                      onClick={addAmenity}
                      className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-hotel-gold hover:text-hotel-gold transition-colors"
                    >
                      + Add Amenity
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default Admin;