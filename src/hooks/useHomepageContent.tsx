import { useState, useEffect } from 'react';
import { paths } from '@/config/paths';

export interface HomepageContent {
  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  
  // Basic Info (compatible with existing villa info structure)
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
  
  // Property Specifications
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;
  
  // Timing Information - support both formats
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  
  // Property Policies
  cancellationPolicy: string;
  houseRules: string;
  termsConditions: string;
  
  // Social Media Links
  facebook: string;
  instagram: string;
  twitter: string;
  
  // Media Content
  images: string[];
  amenities: Array<{
    name: string;
    icon: string;
  }>;
}

interface UseHomepageContentResult {
  homepageContent: HomepageContent | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateHomepageContent: (data: Partial<HomepageContent>) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
}

export const useHomepageContent = (): UseHomepageContentResult => {
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageContent = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Use working villa API instead of broken homepage
      // Add cache-busting parameter to ensure fresh data
      const apiUrl = paths.buildApiUrl('villa') + `?t=${Date.now()}`;
      
      console.log('🔄 Fetching villa data from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      
      if (result.success && result.data) {
        // Transform villa API response to match frontend interface
        // villa.php returns data from villa_info table with snake_case fields
        const transformedData: HomepageContent = {
          // Hero section - derive from villa data
          hero_title: result.data.name || 'Rumah Daisy Cantik',
          hero_subtitle: 'Luxury Villa Experience in Bali',
          hero_description: result.data.description || 'Experience unparalleled luxury and comfort',
          
          // Map villa_info table fields correctly
          name: result.data.name || 'Rumah Daisy Cantik',
          location: result.data.location || `${result.data.city || ''}, ${result.data.state || ''}, ${result.data.country || ''}`.replace(/(^, |, $|, , )/g, '') || 'Bali, Indonesia',
          description: result.data.description || '',
          rating: parseFloat(result.data.rating) || 4.9,
          reviews: parseInt(result.data.reviews) || 0,
          
          // Contact information (villa_info fields)
          phone: result.data.phone || '',
          email: result.data.email || '',
          website: result.data.website || '',
          
          // Address details (villa_info fields)
          address: result.data.address || '',
          city: result.data.city || '',
          state: result.data.state || '',
          country: result.data.country || '',
          zipcode: result.data.zipCode || result.data.postal_code || '', // API maps postal_code to zipCode
          
          // Property specifications (from villa_info, with defaults)
          maxGuests: parseInt(result.data.max_guests) || 8,
          bedrooms: parseInt(result.data.bedrooms) || 4,
          bathrooms: parseInt(result.data.bathrooms) || 3,
          basePrice: parseFloat(result.data.price_per_night) || 0,
          
          // Timing (villa_info fields - API maps to camelCase)
          checkIn: result.data.checkInTime || result.data.check_in_time || '15:00',
          checkOut: result.data.checkOutTime || result.data.check_out_time || '11:00',
          
          // Policies (villa_info fields - API maps to camelCase)
          cancellationPolicy: result.data.cancellationPolicy || result.data.cancellation_policy || '',
          houseRules: result.data.houseRules || result.data.house_rules || '',
          termsConditions: '', // Not in villa_info table
          
          // Social media (from villa_info.social_media JSON)
          facebook: result.data.socialMedia?.facebook || '',
          instagram: result.data.socialMedia?.instagram || '',
          twitter: result.data.socialMedia?.twitter || '',
          
          // Media content (villa_info fields)
          images: Array.isArray(result.data.images) ? result.data.images : [],
          amenities: Array.isArray(result.data.amenities) ? result.data.amenities : []
        };
        
        
        setHomepageContent(transformedData);
        
      } else {
        throw new Error(result.message || 'Failed to fetch homepage content');
      }
    } catch (err) {
      console.error('🚨 Homepage content fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch homepage content';
      setError(errorMessage);
      
      // DON'T set fallback data - let the error show so user knows there's an issue
      // The previous hardcoded fallback was overwriting real database values
      // setHomepageContent(null) will show error state in UI
      setHomepageContent(null);
    } finally {
      setLoading(false);
    }
  };

  const updateHomepageContent = async (data: Partial<HomepageContent>) => {
    try {
      const apiUrl = paths.buildApiUrl('villa');
      
      
      
      // SAFE UPDATE - Send all villa_info table fields that exist in production
      const apiData: any = {};
      
      // Core basic info - these should always work
      if (data.name !== undefined) apiData.name = data.name;
      if (data.description !== undefined) apiData.description = data.description;
      
      // Contact info - basic fields
      if (data.phone !== undefined) apiData.phone = data.phone;
      if (data.email !== undefined) apiData.email = data.email;
      if (data.website !== undefined) apiData.website = data.website;
      
      // Address fields - these exist in villa_info table
      if (data.address !== undefined) apiData.address = data.address;
      if (data.city !== undefined) apiData.city = data.city;
      if (data.state !== undefined) apiData.state = data.state;
      if (data.country !== undefined) apiData.country = data.country;
      if (data.zipcode !== undefined) apiData.postal_code = data.zipcode; // Map zipcode to postal_code for database
      
      // Policies - should work since these are text fields
      if (data.cancellationPolicy !== undefined) apiData.cancellationPolicy = data.cancellationPolicy;
      if (data.houseRules !== undefined) apiData.houseRules = data.houseRules;
      
      // Property specifications - these exist in villa_info table
      if (data.maxGuests !== undefined) apiData.max_guests = data.maxGuests;
      if (data.bedrooms !== undefined) apiData.total_rooms = data.bedrooms; 
      if (data.bathrooms !== undefined) apiData.total_bathrooms = data.bathrooms;
      
      // Rating and reviews
      if (data.rating !== undefined) apiData.rating = data.rating;
      if (data.reviews !== undefined) apiData.reviews = data.reviews;
      
      // Timing - support both checkIn/checkInTime formats
      if (data.checkIn !== undefined) apiData.check_in_time = data.checkIn;
      if (data.checkOut !== undefined) apiData.check_out_time = data.checkOut;
      if (data.checkInTime !== undefined) apiData.check_in_time = data.checkInTime;
      if (data.checkOutTime !== undefined) apiData.check_out_time = data.checkOutTime;
      
      // Ensure we always have required fields if nothing else is provided
      if (Object.keys(apiData).length === 0) {
        apiData.name = 'Rumah Daisy Cantik';
        apiData.description = '';
      }
      
      
      
      console.log('🔄 Sending update to API:', apiData);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        // Get error details from response
        let errorText = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          console.error('🚨 API Error Response:', errorBody);
          errorText += ` - ${errorBody}`;
        } catch (e) {
          console.error('🚨 Could not read error response');
        }
        throw new Error(errorText);
      }
      
      const result = await response.json();
      
      
      if (result.success) {
        // Refresh data after successful update
        await fetchHomepageContent();
        return { 
          success: true, 
          message: result.message || 'Homepage content updated successfully'
        };
      } else {
        throw new Error(result.message || 'Failed to update homepage content');
      }
    } catch (err) {
      console.error('🚨 Homepage content update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update homepage content';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  return {
    homepageContent,
    loading,
    error,
    refetch: fetchHomepageContent,
    updateHomepageContent
  };
};
