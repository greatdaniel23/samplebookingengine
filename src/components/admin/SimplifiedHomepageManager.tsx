import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import {
  Edit3,
  Save,
  X,
  Home,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Users,
  Bed,
  Bath,
  DollarSign
} from 'lucide-react';

// Simple interface matching actual database fields
interface VillaData {
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  checkInTime: string;
  checkOutTime: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;
  currency: string;
  cancellationPolicy: string;
  houseRules: string;
}

const SimplifiedHomepageManager: React.FC = () => {
  const { homepageContent, loading, error, updateHomepageContent, refetch } = useHomepageContent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<VillaData | null>(null);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (homepageContent) {
      console.log('📝 Updating formData from homepageContent:', homepageContent.name);
      setFormData({
        name: homepageContent.name || '',
        description: homepageContent.description || '',
        phone: homepageContent.phone || '',
        email: homepageContent.email || '',
        website: homepageContent.website || '',
        address: homepageContent.address || '',
        city: homepageContent.city || '',
        state: homepageContent.state || '',
        country: homepageContent.country || '',
        zipCode: homepageContent.zipcode || '',
        checkInTime: homepageContent.checkIn || '',
        checkOutTime: homepageContent.checkOut || '',
        maxGuests: homepageContent.maxGuests || 0,
        bedrooms: homepageContent.bedrooms || 0,
        bathrooms: homepageContent.bathrooms || 0,
        basePrice: homepageContent.basePrice || 0,
        currency: 'IDR',
        cancellationPolicy: homepageContent.cancellationPolicy || '',
        houseRules: homepageContent.houseRules || ''
      });
    }
  }, [homepageContent]);

  const handleInputChange = (field: keyof VillaData, value: string | number) => {
    if (formData) {
      setFormData(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const result = await updateHomepageContent({
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipCode,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        maxGuests: formData.maxGuests,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        cancellationPolicy: formData.cancellationPolicy,
        houseRules: formData.houseRules
      });

      if (result.success) {
        console.log('✅ Update API returned success, now refetching...');
        // Force refetch to ensure UI shows updated data
        await refetch();
        console.log('✅ Refetch complete, homepageContent should be updated');
        setIsEditing(false);
        // Show success feedback to user
        alert('✅ Villa information saved successfully!');
      } else {
        console.error('❌ Update failed:', result.error);
        alert(`❌ Update failed: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Update error:', err);
      alert(`Update error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (homepageContent) {
      setFormData({
        name: homepageContent.name || '',
        description: homepageContent.description || '',
        phone: homepageContent.phone || '',
        email: homepageContent.email || '',
        website: homepageContent.website || '',
        address: homepageContent.address || '',
        city: homepageContent.city || '',
        state: homepageContent.state || '',
        country: homepageContent.country || '',
        zipCode: homepageContent.zipcode || '',
        checkInTime: homepageContent.checkIn || '',
        checkOutTime: homepageContent.checkOut || '',
        maxGuests: homepageContent.maxGuests || 0,
        bedrooms: homepageContent.bedrooms || 0,
        bathrooms: homepageContent.bathrooms || 0,
        basePrice: homepageContent.basePrice || 0,
        currency: 'IDR',
        cancellationPolicy: homepageContent.cancellationPolicy || '',
        houseRules: homepageContent.houseRules || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading villa data...</div>
        </div>
      </div>
    );
  }

  if (error && !homepageContent) {
    const handleRetry = async () => {
      setRetrying(true);
      await refetch();
      setRetrying(false);
    };

    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {retrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Villa Information</h2>
          <p className="text-gray-600">Manage your property details directly from the database</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4" />
              Edit Villa Info
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.name || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.country || 'Not set'}</div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.description || 'No description'}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.phone || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.email || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.website || 'Not set'}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.address || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.city || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.state || 'Not set'}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing Only - Property Specs removed (don't exist in production database) */}
      <div className="grid grid-cols-1 gap-6">
        {/* Property Specifications Card - REMOVED because maxGuests, bedrooms, bathrooms, basePrice don't exist in production villa_info table */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Check-in/out Times
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.checkInTime}
                  onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3:00 PM"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.checkInTime || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.checkOutTime}
                  onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 11:00 AM"
                />
              ) : (
                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.checkOutTime || 'Not set'}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Property Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy</label>
            {isEditing ? (
              <textarea
                value={formData.cancellationPolicy}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Free cancellation up to 48 hours before check-in..."
              />
            ) : (
              <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[80px]">
                {formData.cancellationPolicy || 'No cancellation policy set'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">House Rules</label>
            {isEditing ? (
              <textarea
                value={formData.houseRules}
                onChange={(e) => handleInputChange('houseRules', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., No smoking • No pets • Quiet hours 10 PM - 8 AM..."
              />
            ) : (
              <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[80px]">
                {formData.houseRules || 'No house rules set'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedHomepageManager;