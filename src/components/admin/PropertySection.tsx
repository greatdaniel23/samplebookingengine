import React, { useState, useEffect } from 'react';
import { useVillaInfo } from '@/hooks/useVillaInfo';
import R2ImagePicker from './R2ImagePicker';
import { getImageUrl } from '@/config/r2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Save, X, Plus, Trash2, Image, Home, Star } from 'lucide-react';

const PropertySection: React.FC = () => {
  const { villaInfo, loading, updateVillaInfo } = useVillaInfo();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(villaInfo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (villaInfo) {
      // Ensure images array exists and has at least one empty slot for picker
      const updatedVillaInfo = {
        ...villaInfo,
        images: villaInfo.images && villaInfo.images.length > 0 ? villaInfo.images : ['']
      };
      setFormData(updatedVillaInfo);
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
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!formData) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No villa information available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Property Management</h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Property
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Villa Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.location}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  {isEditing ? (
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.rating} / 5</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reviews">Reviews</Label>
                  {isEditing ? (
                    <Input
                      id="reviews"
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={(e) => handleInputChange('reviews', parseInt(e.target.value))}
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.reviews} reviews</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Images</CardTitle>
              {isEditing && (
                <Button
                  onClick={addImage}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Image
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  {isEditing ? (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <R2ImagePicker
                          currentImage={image}
                          onSelect={(imageKey) => handleImageChange(index, imageKey)}
                          prefix="villa/"
                        />
                      </div>
                      <Button
                        onClick={() => removeImage(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {image ? (
                        <>
                          <img
                            src={getImageUrl(image)}
                            alt={`Villa image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Error</text></svg>';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 font-medium truncate">Image {index + 1}</p>
                            <p className="text-xs text-gray-400 truncate">{image}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No image selected</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {formData.images.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images added</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Amenities */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Amenities</CardTitle>
              {isEditing && (
                <Button
                  onClick={addAmenity}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Amenity
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="text"
                        value={amenity.name}
                        onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                        placeholder="Amenity name"
                        className="flex-1"
                      />
                      <Select
                        value={amenity.icon}
                        onValueChange={(value) => handleAmenityChange(index, 'icon', value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wifi">Wifi</SelectItem>
                          <SelectItem value="Bath">Bath</SelectItem>
                          <SelectItem value="Flame">Flame</SelectItem>
                          <SelectItem value="CookingPot">CookingPot</SelectItem>
                          <SelectItem value="Car">Car</SelectItem>
                          <SelectItem value="AirVent">AirVent</SelectItem>
                          <SelectItem value="Star">Star</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Coffee">Coffee</SelectItem>
                          <SelectItem value="Tv">Tv</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => removeAmenity(index)}
                        variant="secondary"
                        size="icon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md w-full">
                      <span className="text-gray-600 font-medium">{amenity.icon}</span>
                      <span className="text-gray-900">{amenity.name}</span>
                    </div>
                  )}
                </div>
              ))}
              {formData.amenities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No amenities added</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertySection;