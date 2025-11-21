import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import { 
  Home, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Edit3, 
  Save, 
  X,
  Plus,
  Trash2,
  Users,
  Bed,
  Bath,
  DollarSign,
  Clock,
  Camera,
  Shield,
  FileText,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';

interface HomepageContentData {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  
  // Villa Info
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;
  
  // Contact Information  
  phone: string;
  email: string;
  website: string;
  
  // Address Details
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  
  // Villa Specifications
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;
  
  // Timing
  checkIn: string;
  checkOut: string;
  
  // Policies
  cancellationPolicy: string;
  houseRules: string;
  termsConditions: string;
  
  // Social Media
  facebook: string;
  instagram: string;
  twitter: string;
  
  // Images
  images: string[];
  
  // Amenities
  amenities: Array<{
    name: string;
    icon: string;
  }>;
}

const HomepageContentManager: React.FC = () => {
  const { homepageContent, loading, error, updateHomepageContent } = useHomepageContent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<HomepageContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // Show error message if homepage.php is not available
  if (error && error.includes('404')) {
    return (
      <div className="p-6">
        <div className="bg-hotel-gold/10 border border-hotel-gold-light rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-hotel-navy mb-2">⚠️ Advanced Homepage Management Not Available</h3>
          <p className="text-yellow-700 mb-3">
            The advanced homepage content management requires the <code>homepage.php</code> API to be deployed to production.
          </p>
          <p className="text-yellow-700 mb-3">
            <strong>Current Solution:</strong> Use the <strong>"Villa & Homepage Content"</strong> tab instead - it manages the same data that appears on your homepage and footer.
          </p>
          <Button 
            onClick={() => window.location.hash = '#property'} 
            className="bg-hotel-gold hover:bg-hotel-gold-dark"
          >
            Go to Villa & Homepage Content →
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (homepageContent) {
      // Transform homepageContent to HomepageContentData format
      setFormData({
        // Hero Section
        heroTitle: homepageContent.hero_title || homepageContent.name || 'Serene Mountain Retreat',
        heroSubtitle: homepageContent.hero_subtitle || 'Luxury Villa Experience',
        heroDescription: homepageContent.hero_description || homepageContent.description || 'Experience unparalleled luxury and comfort',
        
        // Villa Info
        name: homepageContent.name || '',
        location: homepageContent.location || '',
        description: homepageContent.description || '',
        rating: homepageContent.rating || 4.8,
        reviews: homepageContent.reviews || 127,
        
        // Contact Information
        phone: homepageContent.phone || '',
        email: homepageContent.email || '',
        website: homepageContent.website || '',
        
        // Address Details
        address: homepageContent.address || '',
        city: homepageContent.city || '',
        state: homepageContent.state || '',
        country: homepageContent.country || '',
        zipcode: homepageContent.zipcode || '',
        
        // Villa Specifications
        maxGuests: homepageContent.maxGuests || 8,
        bedrooms: homepageContent.bedrooms || 4,
        bathrooms: homepageContent.bathrooms || 3,
        basePrice: homepageContent.basePrice || 350,
        
        // Timing
        checkIn: homepageContent.checkIn || '3:00 PM',
        checkOut: homepageContent.checkOut || '11:00 AM',
        
        // Policies
        cancellationPolicy: homepageContent.cancellationPolicy || '',
        houseRules: homepageContent.houseRules || '',
        termsConditions: homepageContent.termsConditions || '',
        
        // Social Media
        facebook: homepageContent.facebook || '',
        instagram: homepageContent.instagram || '',
        twitter: homepageContent.twitter || '',
        
        // Images
        images: homepageContent.images || [],
        
        // Amenities
        amenities: homepageContent.amenities || []
      });
    }
  }, [homepageContent]);

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
    setFormData(prev => prev ? {
      ...prev,
      images: [...prev.images, '']
    } : null);
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
      // Transform HomepageContentData to homepage content format
      const homepageUpdateData = {
        ...formData,
        // Make sure we maintain compatibility with homepage content structure
      };
      
      const result = await updateHomepageContent(homepageUpdateData);
      if (result.success) {
        setIsEditing(false);
        alert('Homepage content updated successfully!');
      } else {
        alert('Error updating homepage content: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating homepage content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (homepageContent) {
      setFormData({
        heroTitle: homepageContent.hero_title || homepageContent.name || 'Serene Mountain Retreat',
        heroSubtitle: homepageContent.hero_subtitle || 'Luxury Villa Experience',
        heroDescription: homepageContent.hero_description || homepageContent.description || 'Experience unparalleled luxury and comfort',
        name: homepageContent.name || '',
        location: homepageContent.location || '',
        description: homepageContent.description || '',
        rating: homepageContent.rating || 4.8,
        reviews: homepageContent.reviews || 127,
        phone: homepageContent.phone || '',
        email: homepageContent.email || '',
        website: homepageContent.website || '',
        address: homepageContent.address || '',
        city: homepageContent.city || '',
        state: homepageContent.state || '',
        country: homepageContent.country || '',
        zipcode: homepageContent.zipcode || '',
        maxGuests: homepageContent.maxGuests || 8,
        bedrooms: homepageContent.bedrooms || 4,
        bathrooms: homepageContent.bathrooms || 3,
        basePrice: homepageContent.basePrice || 350,
        checkIn: homepageContent.checkIn || '3:00 PM',
        checkOut: homepageContent.checkOut || '11:00 AM',
        cancellationPolicy: homepageContent.cancellationPolicy || '',
        houseRules: homepageContent.houseRules || '',
        termsConditions: homepageContent.termsConditions || '',
        facebook: homepageContent.facebook || '',
        instagram: homepageContent.instagram || '',
        twitter: homepageContent.twitter || '',
        images: homepageContent.images || [],
        amenities: homepageContent.amenities || []
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p>No homepage content data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Homepage Content Manager</h2>
          <p className="text-gray-600 mt-1">Manage all content that appears on the main homepage</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Content
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Hero Section Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.heroTitle}
                    onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Main hero title"
                  />
                ) : (
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.heroTitle}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.heroSubtitle}
                    onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Hero subtitle"
                  />
                ) : (
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.heroSubtitle}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData.heroDescription}
                    onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Hero section description text"
                  />
                ) : (
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.heroDescription}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Basic Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.name}</div>
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
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.location}</div>
                  )}
                </div>

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
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center">
                      <Star className="w-4 h-4 text-hotel-gold mr-1" />
                      {formData.rating}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviews Count</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={(e) => handleInputChange('reviews', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.reviews} reviews</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Description</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed property description for guests"
                  />
                ) : (
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.description}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.email}</div>
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
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.website}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.address}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.city}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.state}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.country}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.zipcode}
                        onChange={(e) => handleInputChange('zipcode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.zipcode}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Social Media Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://facebook.com/..."
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.facebook || 'Not set'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://instagram.com/..."
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.instagram || 'Not set'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/..."
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.twitter || 'Not set'}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Property Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={formData.maxGuests}
                        onChange={(e) => handleInputChange('maxGuests', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center">
                        <Users className="w-4 h-4 text-hotel-navy mr-2" />
                        {formData.maxGuests}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={formData.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center">
                        <Bed className="w-4 h-4 text-hotel-bronze mr-2" />
                        {formData.bedrooms}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={formData.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center">
                        <Bath className="w-4 h-4 text-cyan-500 mr-2" />
                        {formData.bathrooms}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={formData.basePrice}
                        onChange={(e) => handleInputChange('basePrice', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md flex items-center">
                        <DollarSign className="w-4 h-4 text-hotel-sage mr-2" />
                        ${formData.basePrice}/night
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      value={formData.checkIn}
                      onChange={(e) => handleInputChange('checkIn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 3:00 PM"
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.checkIn}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.checkOut}
                      onChange={(e) => handleInputChange('checkOut', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 11:00 AM"
                    />
                  ) : (
                    <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{formData.checkOut}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
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
                    rows={4}
                    value={formData.cancellationPolicy}
                    onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your cancellation policy..."
                  />
                ) : (
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[100px]">
                    {formData.cancellationPolicy || 'No cancellation policy set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">House Rules</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.houseRules}
                    onChange={(e) => handleInputChange('houseRules', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List your house rules..."
                  />
                ) : (
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[100px]">
                    {formData.houseRules || 'No house rules set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={formData.termsConditions}
                    onChange={(e) => handleInputChange('termsConditions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Terms and conditions..."
                  />
                ) : (
                  <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[100px]">
                    {formData.termsConditions || 'No terms and conditions set'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Property Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image {index + 1} {index === 0 && <Badge variant="secondary">Main</Badge>}
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    ) : (
                      <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {image || 'No image URL set'}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {isEditing && (
                <Button
                  variant="outline"
                  onClick={addImage}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Property Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amenity Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={amenity.name}
                          onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Swimming Pool"
                        />
                      ) : (
                        <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {amenity.name || 'Unnamed amenity'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={amenity.icon}
                          onChange={(e) => handleAmenityChange(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Pool, Wifi, Car"
                        />
                      ) : (
                        <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {amenity.icon || 'No icon'}
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAmenity(index)}
                      className="text-hotel-bronze hover:text-hotel-bronze/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {isEditing && (
                <Button
                  variant="outline"
                  onClick={addAmenity}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Amenity
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isEditing && (
        <div className="bg-hotel-cream border border-hotel-gold-light rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-hotel-gold" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-hotel-navy">
                Editing Homepage Content
              </h3>
              <div className="mt-2 text-sm text-hotel-bronze">
                <p>
                  You are currently editing the homepage content. Changes will be reflected on the main website
                  once you save. Use the tabs above to edit different sections of the homepage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageContentManager;