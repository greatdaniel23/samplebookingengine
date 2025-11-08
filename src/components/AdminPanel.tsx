import React, { useState, useEffect } from 'react';
import { useVillaInfo } from '@/hooks/useVillaInfo';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { villaInfo, loading, updateVillaInfo } = useVillaInfo();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(villaInfo);
  const [saving, setSaving] = useState(false);

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
    setFormData(prev => prev ? { ...prev, images: newImages } : null);
  };

  const addImage = () => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, images: [...prev.images, ''] } : null);
  };

  const removeImage = (index: number) => {
    if (!formData) return;
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => prev ? { ...prev, images: newImages } : null);
  };

  const handleAmenityChange = (index: number, field: 'name' | 'icon', value: string) => {
    if (!formData) return;
    const newAmenities = [...formData.amenities];
    newAmenities[index] = { ...newAmenities[index], [field]: value };
    setFormData(prev => prev ? { ...prev, amenities: newAmenities } : null);
  };

  const addAmenity = () => {
    if (!formData) return;
    setFormData(prev => prev ? {
      ...prev,
      amenities: [...prev.amenities, { name: '', icon: 'Star' }]
    } : null);
  };

  const removeAmenity = (index: number) => {
    if (!formData) return;
    const newAmenities = formData.amenities.filter((_, i) => i !== index);
    setFormData(prev => prev ? { ...prev, amenities: newAmenities } : null);
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setSaving(true);
    try {
      const result = await updateVillaInfo(formData);
      if (result.success) {
        setIsEditing(false);
        alert('Villa information updated successfully!');
      } else {
        alert('Error updating villa information: ' + result.error);
      }
    } catch (error) {
      alert('Error updating villa information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Loading villa information...</div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">No villa information available</div>
          <button 
            onClick={onClose}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin - Villa Information</h2>
            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Close
              </button>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Villa Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.location}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={formData.rating}
                          onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.rating} / 5</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reviews</label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={formData.reviews}
                          onChange={(e) => handleInputChange('reviews', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{formData.reviews} reviews</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    {isEditing ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                  {isEditing && (
                    <button
                      onClick={addImage}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Add Image
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder="Image URL"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="bg-red-600 text-white px-2 py-2 rounded text-sm hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <img 
                            src={image} 
                            alt={`Villa image ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded"
                          />
                          <p className="text-sm text-gray-600 truncate flex-1">{image}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
                  {isEditing && (
                    <button
                      onClick={addAmenity}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Add Amenity
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={amenity.name}
                            onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                            placeholder="Amenity name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={amenity.icon}
                            onChange={(e) => handleAmenityChange(index, 'icon', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Wifi">Wifi</option>
                            <option value="Bath">Bath</option>
                            <option value="Flame">Flame</option>
                            <option value="CookingPot">CookingPot</option>
                            <option value="Car">Car</option>
                            <option value="AirVent">AirVent</option>
                            <option value="Star">Star</option>
                            <option value="Home">Home</option>
                            <option value="Coffee">Coffee</option>
                            <option value="Tv">Tv</option>
                          </select>
                          <button
                            onClick={() => removeAmenity(index)}
                            className="bg-red-600 text-white px-2 py-2 rounded text-sm hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-2 bg-white rounded">
                          <span className="text-gray-600">{amenity.icon}</span>
                          <span className="text-gray-900">{amenity.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};